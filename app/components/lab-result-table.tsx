"use client";

import { Fragment } from "react";
import type { LabCategory, LabSpecimen } from "@/app/types/labs";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-CL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type LabResultsTableProps = {
  results: LabCategory[];
};

export function LabResultsTable({
  results,
}: LabResultsTableProps) {
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
    <div className="space-y-8">
      {specimens.map((specimen) => (
        <section key={specimen.specimen}>
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
                      <tr className="border-y border-neutral-800 bg-neutral-900/30">
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
  );
}