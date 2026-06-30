import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Champion } from "@/types";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse optional role filter from query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let query = supabase
      .from("champions")
      .select("*")
      .order("name");

    if (role) {
      // Filter champions that include this role in their roles array
      query = query.contains("roles", [role]);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json<ApiResponse<Champion[]>>(
      { data: data as Champion[], error: null },
      {
        headers: {
          // Cache for 5 minutes — champions don't change often
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/champions]", err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch champions" },
      { status: 500 }
    );
  }
}
