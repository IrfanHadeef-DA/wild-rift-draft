import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, HeroPoolEntry } from "@/types";

// GET /api/hero-pool — fetch user's hero pool
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("hero_pools")
      .select("*, champion:champions(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json<ApiResponse<HeroPoolEntry[]>>({
      data: data as HeroPoolEntry[],
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/hero-pool]", err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch hero pool" },
      { status: 500 }
    );
  }
}

// POST /api/hero-pool — add a champion to hero pool
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { champion_id, role, proficiency = 3 } = body;

    if (!champion_id || !role) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "champion_id and role are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("hero_pools")
      .insert({
        user_id: user.id,
        champion_id,
        role,
        proficiency,
      })
      .select("*, champion:champions(*)")
      .single();

    if (error) {
      // Unique constraint violation — already in pool
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: "Champion already in your pool for this role" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json<ApiResponse<HeroPoolEntry>>(
      { data: data as HeroPoolEntry, error: null },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/hero-pool]", err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to add champion to pool" },
      { status: 500 }
    );
  }
}

// DELETE /api/hero-pool?id=:id — remove a champion from hero pool
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Pool entry id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("hero_pools")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLS double-check

    if (error) throw error;

    return NextResponse.json<ApiResponse<{ deleted: true }>>(
      { data: { deleted: true }, error: null }
    );
  } catch (err) {
    console.error("[DELETE /api/hero-pool]", err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to remove champion from pool" },
      { status: 500 }
    );
  }
}
