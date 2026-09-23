// app/api/public/lab-shares/[token]/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: share, error: shareError } = await supabaseAdmin
    .from("lab_shares")
    .select("user_id, expires_at, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (shareError) {
    console.error("Error fetching share:", shareError);

    return NextResponse.json(
      { error: "Failed to load share" },
      { status: 500 }
    );
  }

  if (!share) {
    return NextResponse.json(
      { error: "Share not found" },
      { status: 404 }
    );
  }

  if (share.revoked_at) {
    return NextResponse.json(
      { error: "This share has been revoked" },
      { status: 410 }
    );
  }

  if (
    share.expires_at &&
    new Date(share.expires_at) <= new Date()
  ) {
    return NextResponse.json(
      { error: "This share has expired" },
      { status: 410 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("lab_results")
    .select(`
      id,
      value,
      measured_at,
      lab_tests (
        id,
        name,
        abbreviation,
        category,
        specimen,
        unit,
        reference_range_min,
        reference_range_max
      ),
      healthcare_providers (
        id,
        name
      )
    `)
    .eq("user_id", share.user_id)
    .order("measured_at", { ascending: false });

  if (error) {
    console.error("Error fetching shared results:", error);

    return NextResponse.json(
      { error: "Failed to load lab results" },
      { status: 500 }
    );
  }

  //transform data for the frontend

  const categories = new Map<
    string,
    {
      category: string;
      tests: {
        id: string;
        name: string;
        abbreviation: string | null;
        specimen: string | null;
        unit: string | null;
        reference_range_min: number | null;
        reference_range_max: number | null;
        measurements: {
          id: string;
          value: number;
          measured_at: string;
        }[];
      }[];
    }
  >();

  for (const result of data) {
    const test = Array.isArray(result.lab_tests)
      ? result.lab_tests[0]
      : result.lab_tests;

    if (!test) continue;

    let category = categories.get(test.category);

    if (!category) {
      category = {
        category: test.category,
        tests: [],
      };

      categories.set(test.category, category);
    }

    let existingTest = category.tests.find(
      (item) => item.id === test.id,
    );

    if (!existingTest) {
      existingTest = {
        id: test.id,
        name: test.name,
        abbreviation: test.abbreviation,
        specimen: test.specimen,
        unit: test.unit,
        reference_range_min: test.reference_range_min,
        reference_range_max: test.reference_range_max,
        measurements: [],
      };

      category.tests.push(existingTest);
    }

    existingTest.measurements.push({
      id: result.id,
      value: result.value,
      measured_at: result.measured_at,
    });
  }

  return NextResponse.json(
    Array.from(categories.values())
  );
}