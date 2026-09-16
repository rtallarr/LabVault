import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();

  const { lab_test_id, value, measured_at } = body;

  if (!lab_test_id || value === undefined || !measured_at) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("lab_results")
    .insert({
      user_id: user.id,
      lab_test_id,
      value,
      measured_at,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("lab_results")
    .select(`
      id,
      value,
      measured_at,
      lab_tests (
        id,
        name,
        code,
        category,
        specimen,
        unit,
        reference_range_min,
        reference_range_max
      )
    `)
    .eq("user_id", user.id)
    .order("measured_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json(data);
}