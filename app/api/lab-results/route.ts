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

  const {
    results,
    measured_at,
    healthcare_provider,
  } = body;

  if (
    !Array.isArray(results) ||
    results.length === 0 ||
    !measured_at
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const invalidResult = results.some(
    (result) =>
      !result.lab_test_id ||
      result.value === undefined ||
      typeof result.value !== "number" ||
      Number.isNaN(result.value),
  );

  if (invalidResult) {
    return NextResponse.json(
      { error: "Invalid lab result" },
      { status: 400 },
    );
  }

  const labTestIds = results.map(
    (result) => result.lab_test_id,
  );

  const uniqueLabTestIds = new Set(labTestIds);

  if (uniqueLabTestIds.size !== labTestIds.length) {
    return NextResponse.json(
      { error: "The same lab test cannot be included more than once" },
      { status: 400 },
    );
  }

  const { data: labTests, error: labTestsError } = await supabase
    .from("lab_tests")
    .select("id, is_calculated")
    .in("id", labTestIds);

  if (labTestsError) {
    return NextResponse.json(
      { error: labTestsError.message },
      { status: 400 },
    );
  }

  if (labTests.length !== labTestIds.length) {
    return NextResponse.json(
      { error: "One or more lab tests do not exist" },
      { status: 400 },
    );
  }

  const hasCalculatedTest = labTests.some(
    (test) => test.is_calculated,
  );

  if (hasCalculatedTest) {
    return NextResponse.json(
      {
        error:
          "Calculated lab tests cannot be entered manually",
      },
      { status: 400 },
    );
  }

  let healthcareProviderId: string | null = null;

  if (healthcare_provider) {
    const { data: provider, error: providerError } = await supabase
      .from("healthcare_providers")
      .select("id")
      .eq("name", healthcare_provider)
      .maybeSingle();

    if (providerError) {
      return NextResponse.json(
        { error: providerError.message },
        { status: 400 },
      );
    }

    if (provider) {
      healthcareProviderId = provider.id;
    } else {
      const { data: newProvider, error: createProviderError } =
        await supabase
          .from("healthcare_providers")
          .insert({
            name: healthcare_provider,
          })
          .select("id")
          .single();

      if (createProviderError) {
        return NextResponse.json(
          { error: createProviderError.message },
          { status: 400 },
        );
      }

      healthcareProviderId = newProvider.id;
    }
  }

  const labResults = results.map((result) => ({
    user_id: user.id,
    lab_test_id: result.lab_test_id,
    value: result.value,
    measured_at,
    healthcare_provider_id: healthcareProviderId || null,
  }));

  const { data, error } = await supabase
    .from("lab_results")
    .insert(labResults)
    .select();

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
      abbreviation,
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

  const groupedResults = new Map<
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

  for (const test of data) {
    const category = test.category ?? "Other";

    const measurements = test.lab_results
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
      }));

    if (!groupedResults.has(category)) {
      groupedResults.set(category, {
        category,
        tests: [],
      });
    }

    groupedResults.get(category)!.tests.push({
      id: test.id,
      name: test.name,
      abbreviation: test.abbreviation,
      specimen: test.specimen,
      unit: test.unit,
      reference_range_min: test.reference_range_min,
      reference_range_max: test.reference_range_max,
      measurements,
    });
  }

  return NextResponse.json(
    Array.from(groupedResults.values()),
  );
}