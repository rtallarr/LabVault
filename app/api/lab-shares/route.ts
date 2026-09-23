import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("lab_shares")
    .insert({
      user_id: user.id,
      //expires_at: customDate.toISOString(),
    })
    .select("id, token, created_at, expires_at, revoked_at")
    .single();

  if (error) {
    console.error("Error creating lab share:", error);

    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("lab_shares")
    .select("id, token, created_at, expires_at, revoked_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lab shares:", error);

    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}