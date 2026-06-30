import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

// GET /api/draft-sessions — fetch user's past sessions
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json<ApiResponse<null>>({ data: null, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

    const { data, error } = await supabase
      .from("draft_sessions")
      .select(`
        id, ally_picks, enemy_picks, outcome, created_at,
        picked_champion:champions!picked_champion_id(id, slug, name, metadata)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json<ApiResponse<typeof data>>({ data, error: null });
  } catch (err) {
    console.error("[GET /api/draft-sessions]", err);
    return NextResponse.json<ApiResponse<null>>({ data: null, error: "Failed to fetch history" }, { status: 500 });
  }
}

// POST /api/draft-sessions — save a new draft session
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json<ApiResponse<null>>({ data: null, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { ally_picks, enemy_picks, picked_champion_id, outcome } = body;

    const { data, error } = await supabase
      .from("draft_sessions")
      .insert({
        user_id: user.id,
        ally_picks: ally_picks ?? [],
        enemy_picks: enemy_picks ?? [],
        picked_champion_id: picked_champion_id ?? null,
        outcome: outcome ?? "unknown",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<typeof data>>({ data, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/draft-sessions]", err);
    return NextResponse.json<ApiResponse<null>>({ data: null, error: "Failed to save session" }, { status: 500 });
  }
}

// PATCH /api/draft-sessions — update outcome (win/loss)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json<ApiResponse<null>>({ data: null, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, outcome } = body;

    if (!id || !outcome) {
      return NextResponse.json<ApiResponse<null>>({ data: null, error: "id and outcome required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("draft_sessions")
      .update({ outcome })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<typeof data>>({ data, error: null });
  } catch (err) {
    console.error("[PATCH /api/draft-sessions]", err);
    return NextResponse.json<ApiResponse<null>>({ data: null, error: "Failed to update session" }, { status: 500 });
  }
}
