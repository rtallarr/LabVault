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
    .from("lab_tests")
    .select(`
      id,
      name,
      code,
      category,
      specimen,
      unit,
      reference_range_min,
      reference_range_max,
      lab_results (
        id,
        user_id,
        value,
        measured_at
      )
    `)
    .order("name");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  const results = data.map((test) => ({
    id: test.id,
    name: test.name,
    code: test.code,
    category: test.category,
    specimen: test.specimen,
    unit: test.unit,
    reference_range_min: test.reference_range_min,
    reference_range_max: test.reference_range_max,

    measurements: test.lab_results
      .filter((result) => result.user_id === user.id)
      .sort(
        (a, b) =>
          new Date(b.measured_at).getTime() -
          new Date(a.measured_at).getTime(),
      )
      .slice(0, 3)
      .map((result) => ({
        id: result.id,
        value: Number(result.value),
        measured_at: result.measured_at,
      })),
  }));

  return NextResponse.json(results);
}