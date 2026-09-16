"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

type Measurement = {
  id: string;
  value: number;
  measured_at: string;
};

type LabTest = {
  id: string;
  name: string;
  abbreviation: string | null;
  specimen: string | null;
  unit: string | null;
  reference_range_min: number | null;
  reference_range_max: number | null;
  measurements: Measurement[];
};

type LabCategory = {
  category: string;
  tests: LabTest[];
};

type LabSpecimen = {
  specimen: string;
  categories: LabCategory[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LabResultsPage() {
  const [results, setResults] = useState<LabCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch("/api/lab-results");

        if (!response.ok) {
          throw new Error("Failed to load lab results");
        }

        const data = await response.json();

        setResults(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-8 py-10">
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded bg-neutral-800" />
          <div className="mt-2 h-4 w-64 rounded bg-neutral-900" />

          <div className="mt-8 overflow-hidden rounded-xl border border-neutral-800">
            <div className="h-12 bg-neutral-900" />
            <div className="h-16 border-t border-neutral-800 bg-neutral-950" />
            <div className="h-16 border-t border-neutral-800 bg-neutral-950" />
            <div className="h-16 border-t border-neutral-800 bg-neutral-950" />
          </div>
        </div>
      </main>
    );
  }

  const specimens: LabSpecimen[] = [];

  for (const category of results) {
    for (const test of category.tests) {
      const specimen = test.specimen ?? "Other";

      let specimenGroup = specimens.find(
        (group) => group.specimen === specimen,
      );

      if (!specimenGroup) {
        specimenGroup = {
          specimen,
          categories: [],
        };

        specimens.push(specimenGroup);
      }

      let categoryGroup = specimenGroup.categories.find(
        (group) => group.category === category.category,
      );

      if (!categoryGroup) {
        categoryGroup = {
          category: category.category,
          tests: [],
        };

        specimenGroup.categories.push(categoryGroup);
      }

      categoryGroup.tests.push(test);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Lab Results
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Your laboratory test history
          </p>
        </div>

        <Link
          href="/lab-results/new"
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          Add result
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 px-6 py-16 text-center">
          <h2 className="text-base font-medium text-white">
            No lab results yet
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
            Add your first laboratory result to start tracking your health
            data.
          </p>

          <Link
            href="/lab-results/new"
            className="mt-5 inline-block rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Add your first result
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {specimens.map((specimen) => (
            <section key={specimen.specimen}>
              {/* Specimen separator */}
              <div className="mb-3">
                <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
                  {specimen.specimen}
                </h2>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="border-b border-neutral-800 bg-neutral-900/50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Test
                        </th>

                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Latest
                        </th>

                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Previous
                        </th>

                        <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500 lg:table-cell">
                          Older
                        </th>

                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Reference
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {specimen.categories.map((category) => (
                        <Fragment key={category.category}>
                          <tr
                            key={category.category}
                            className="border-y border-neutral-800 bg-neutral-900/30"
                          >
                            <td
                              colSpan={5}
                              className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500"
                            >
                              {category.category}
                            </td>
                          </tr>

                          {category.tests.map((test) => {
                            const hasReferenceRange =
                              test.reference_range_min !== null ||
                              test.reference_range_max !== null;

                            const referenceRange = hasReferenceRange
                              ? `${test.reference_range_min ?? "—"} – ${
                                  test.reference_range_max ?? "—"
                                }`
                              : "—";

                            return (
                              <tr
                                key={test.id}
                                className="border-b border-neutral-800 transition last:border-b-0 hover:bg-neutral-900"
                              >
                                <td className="px-4 py-3">
                                  <div className="font-medium text-white">
                                    {test.name}
                                  </div>

                                  {test.abbreviation && (
                                    <div className="mt-0.5 text-xs text-neutral-600">
                                      {test.abbreviation}
                                    </div>
                                  )}
                                </td>

                                {[0, 1, 2].map((index) => {
                                  const measurement =
                                    test.measurements[index];

                                  return (
                                    <td
                                      key={index}
                                      className={`px-4 py-3 ${
                                        index === 2
                                          ? "hidden lg:table-cell"
                                          : ""
                                      }`}
                                    >
                                      {measurement ? (
                                        <>
                                          <div className="font-medium tabular-nums text-white">
                                            {measurement.value}

                                            {test.unit && (
                                              <span className="ml-1 text-xs font-normal text-neutral-500">
                                                {test.unit}
                                              </span>
                                            )}
                                          </div>

                                          <div className="mt-0.5 text-[11px] text-neutral-600">
                                            {formatDate(
                                              measurement.measured_at,
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <span className="text-neutral-700">
                                          —
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}

                                <td className="px-4 py-3 text-sm tabular-nums text-neutral-500">
                                  {referenceRange}

                                  {test.unit && (
                                    <span className="ml-1 text-xs text-neutral-600">
                                      {test.unit}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}