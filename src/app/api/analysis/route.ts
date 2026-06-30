import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAnalysis, parseAnalysisResponse, checkRateLimit } from "@/lib/ai/claude";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { generateDraftHash } from "@/lib/utils";
import type { ApiResponse } from "@/types";

export const maxDuration = 60; // seconds — Vercel function timeout

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // ── Auth check ──────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Rate limit ──────────────────────────────────────────
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      const resetMins = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: `Analysis limit reached. Resets in ${resetMins} minute${resetMins !== 1 ? "s" : ""}.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        }
      );
    }

    // ── Parse body ──────────────────────────────────────────
    const body = await request.json();
    const { ally_picks = [], enemy_picks = [], user_role = "support" } = body;

    if (!Array.isArray(ally_picks) || !Array.isArray(enemy_picks)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "ally_picks and enemy_picks must be arrays" },
        { status: 400 }
      );
    }

    // ── Fetch hero pool from DB ─────────────────────────────
    const { data: poolEntries, error: poolError } = await supabase
      .from("hero_pools")
      .select("*, champion:champions(*)")
      .eq("user_id", user.id)
      .eq("role", user_role);

    if (poolError) throw poolError;

    if (!poolEntries || poolEntries.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: `No champions saved for ${user_role}. Add some to your hero pool first.`,
        },
        { status: 400 }
      );
    }

    // ── Fetch ally champion details ─────────────────────────
    const allySlugs: string[] = ally_picks.map((p: { slug?: string; champion_id?: string }) =>
      p.slug ?? p.champion_id ?? ""
    ).filter(Boolean);

    const enemySlugs: string[] = enemy_picks.map((p: { slug?: string; champion_id?: string }) =>
      p.slug ?? p.champion_id ?? ""
    ).filter(Boolean);

    const allSlugs = [...allySlugs, ...enemySlugs];

    let allyDetails: Array<{ name: string; slug: string; tags: string[]; engageType: string[] }> = [];
    let enemyDetails: Array<{ name: string; slug: string; tags: string[]; engageType: string[] }> = [];

    if (allSlugs.length > 0) {
      const { data: champData } = await supabase
        .from("champions")
        .select("slug, name, engage_type, metadata")
        .in("slug", allSlugs);

      const champMap = new Map(
        (champData ?? []).map((c: { slug: string; name: string; engage_type: string[]; metadata: { tags?: string[] } }) => [
          c.slug,
          {
            name: c.name,
            slug: c.slug,
            tags: c.metadata?.tags ?? [],
            engageType: c.engage_type ?? [],
          },
        ])
      );

      allyDetails = allySlugs
        .map((slug) => champMap.get(slug))
        .filter((c): c is NonNullable<typeof c> => !!c);

      enemyDetails = enemySlugs
        .map((slug) => champMap.get(slug))
        .filter((c): c is NonNullable<typeof c> => !!c);
    }

    // ── Shape hero pool for prompt ──────────────────────────
    const heroPool = poolEntries.map((entry: {
      proficiency: number;
      role: string;
      champion: { name: string; slug: string; engage_type: string[]; metadata: { tags?: string[] } } | null;
    }) => ({
      name: entry.champion?.name ?? "Unknown",
      slug: entry.champion?.slug ?? "",
      proficiency: entry.proficiency,
      role: entry.role as "support" | "jungle" | "mid" | "baron" | "dragon",
      tags: entry.champion?.metadata?.tags ?? [],
      engageType: entry.champion?.engage_type ?? [],
    }));

    // ── Check analysis cache ────────────────────────────────
    const poolSlugs = heroPool.map((e: { slug: string }) => e.slug);
    const draftHash = generateDraftHash(allySlugs, enemySlugs, poolSlugs);

    const { data: cached } = await supabase
      .from("analysis_cache")
      .select("*")
      .eq("draft_hash", draftHash)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (cached) {
      return NextResponse.json({
        data: {
          recommendation: cached.recommendation,
          coaching_panel: cached.coaching_panel,
          cached: true,
        },
        error: null,
      });
    }

    // ── Build prompts ───────────────────────────────────────
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      allyPicks: allyDetails,
      enemyPicks: enemyDetails,
      userRole: user_role,
      heroPool,
    });

    // ── Call Claude ─────────────────────────────────────────
    const { content, inputTokens, outputTokens } = await runAnalysis({
      systemPrompt,
      userPrompt,
      maxTokens: 3000,
    });

    // ── Parse response ──────────────────────────────────────
    let parsed: Record<string, unknown>;
    try {
      parsed = parseAnalysisResponse(content);
    } catch (parseError) {
      console.error("[Analysis] JSON parse error:", parseError);
      console.error("[Analysis] Raw response:", content.slice(0, 500));
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "The coach response was malformed. Please try again." },
        { status: 502 }
      );
    }

    const recommendation = parsed.recommendation as Record<string, unknown>;
    const coaching_panel = parsed.coaching_panel as Record<string, unknown>;

    // ── Cache result ────────────────────────────────────────
    await supabase.from("analysis_cache").upsert({
      draft_hash: draftHash,
      recommendation,
      coaching_panel,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // ── Log token usage (for cost tracking) ────────────────
    console.info(
      `[Analysis] user=${user.id} role=${user_role} ` +
      `allies=${allyDetails.length} enemies=${enemyDetails.length} ` +
      `tokens=${inputTokens}in/${outputTokens}out`
    );

    return NextResponse.json({
      data: { recommendation, coaching_panel, cached: false },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/analysis]", err);

    const message = err instanceof Error ? err.message : "Analysis failed";

    // Surface Anthropic API errors clearly
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "AI service not configured. Contact support." },
        { status: 503 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
