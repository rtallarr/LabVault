"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LabTest = {
  id: string;
  name: string;
  abbreviation: string | null;
  unit: string | null;
  is_calculated: boolean;
};

type ResultRow = {
  id: string;
  labTestId: string;
  value: string;
};

export default function NewLabResultPage() {
  const router = useRouter();

  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [rows, setRows] = useState<ResultRow[]>([
    {
      id: crypto.randomUUID(),
      labTestId: "",
      value: "",
    },
  ]);

  const [measuredAt, setMeasuredAt] = useState("");
  const [healthcareProvider, setHealthcareProvider] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLabTests() {
      try {
        const response = await fetch("/api/lab-tests");

        if (!response.ok) {
          throw new Error("Failed to load lab tests");
        }

        const data = await response.json();

        setLabTests(data);
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

    loadLabTests();
  }, []);

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        labTestId: "",
        value: "",
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((row) => row.id !== id);
    });
  }

  function updateRow(
    id: string,
    field: "labTestId" | "value",
    value: string,
  ) {
    setRows((current) => {
      const updatedRows = current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      );

      // When a test is selected, automatically add a new empty row.
      if (field === "labTestId" && value) {
        const currentRow = current.find((row) => row.id === id);

        // Only add a row when this was previously an empty row.
        if (currentRow?.labTestId === "") {
          updatedRows.push({
            id: crypto.randomUUID(),
            labTestId: "",
            value: "",
          });
        }
      }

      return updatedRows;
    });
  }

  function getLabTest(labTestId: string) {
    return labTests.find((test) => test.id === labTestId);
  }

  const completedRows = rows.filter(
    (row) => row.labTestId && row.value !== "",
  );

  function getSubmitLabel() {
    const count = rows.filter(
      (row) => row.labTestId && row.value !== "",
    ).length;

    if (submitting) {
      return "Adding...";
    }

    if (count === 0) {
      return "Add results";
    }

    return `Add ${count} result${count === 1 ? "" : "s"}`;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const completedRows = rows.filter(
      (row) => row.labTestId && row.value !== "",
    );

    if (completedRows.length === 0) {
      setError("Please add at least one test result.");
      return;
    }

    const incompleteRow = rows.some(
      (row) =>
        (row.labTestId && row.value === "") ||
        (!row.labTestId && row.value !== ""),
    );

    if (incompleteRow) {
      setError("Please complete all test results.");
      return;
    }

    const duplicateTests = new Set(
      completedRows.map((row) => row.labTestId),
    );

    if (duplicateTests.size !== completedRows.length) {
      setError("The same lab test cannot be added twice.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/lab-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          measured_at: measuredAt,
          healthcare_provider: healthcareProvider || null,
          results: completedRows.map((row) => ({
            lab_test_id: row.labTestId,
            value: Number(row.value),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to create lab results",
        );
      }

      router.push("/lab-results");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-8 py-10">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-neutral-800" />

          <div className="mt-8 h-7 w-48 rounded bg-neutral-800" />
          <div className="mt-2 h-4 w-64 rounded bg-neutral-900" />

          <div className="mt-8 h-96 rounded-xl border border-neutral-800 bg-neutral-950" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-10">
      <div className="mb-8">
        <Link
          href="/lab-results"
          className="text-sm text-neutral-500 transition hover:text-white"
        >
          ← Back to lab results
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          Add lab results
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Add multiple laboratory results from the same report.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
      >
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="measured-at"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Date measured
              </label>

              <input
                id="measured-at"
                type="date"
                value={measuredAt}
                onChange={(event) =>
                  setMeasuredAt(event.target.value)
                }
                required
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label
                htmlFor="healthcare-provider"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Healthcare provider
              </label>

              <input
                id="healthcare-provider"
                type="text"
                value={healthcareProvider}
                onChange={(event) =>
                  setHealthcareProvider(event.target.value)
                }
                placeholder="Optional"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-neutral-300">
                  Results
                </h2>

                <p className="mt-1 text-xs text-neutral-600">
                  Add the measured values from your report.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-800">
              <div className="hidden grid-cols-[1fr_220px_40px] gap-3 border-b border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs font-medium text-neutral-500 sm:grid">
                <span>Lab test</span>
                <span>Result</span>
                <span />
              </div>

              <div className="divide-y divide-neutral-800">
                {rows.map((row) => {
                  const selectedTest = getLabTest(row.labTestId);

                  return (
                    <div
                      key={row.id}
                      className="grid gap-3 p-4 sm:grid-cols-[1fr_220px_40px] sm:items-center"
                    >
                      <div>
                        <label className="mb-2 block text-xs text-neutral-600 sm:hidden">
                          Lab test
                        </label>

                        <select
                          value={row.labTestId}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "labTestId",
                              event.target.value,
                            )
                          }
                          required
                          className="w-full appearance-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                        >
                          <option value="">
                            Select a test
                          </option>

                          {labTests
                            .filter((test) => {
                              if (test.is_calculated) {
                                return false;
                              }

                              // Keep the currently selected test visible
                              if (test.id === row.labTestId) {
                                return true;
                              }

                              // Hide tests selected in another row
                              return !rows.some(
                                (otherRow) =>
                                  otherRow.id !== row.id &&
                                  otherRow.labTestId === test.id,
                              );
                            })
                            .map((test) => (
                              <option
                                key={test.id}
                                value={test.id}
                              >
                                {test.name}{" "}
                                {test.abbreviation ? `(${test.abbreviation})` : ""}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-neutral-600 sm:hidden">
                          Result
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={row.value}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "value",
                                event.target.value,
                              )
                            }
                            placeholder="Value"
                            required
                            className="w-32 shrink-0 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-right text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />

                          {selectedTest?.unit && (
                            <span className="shrink-0 text-sm text-neutral-500">
                              {selectedTest.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        aria-label="Remove test"
                        className="rounded-lg px-2 py-2 text-neutral-600 transition hover:bg-neutral-900 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={addRow}
                className="mt-3 w-full rounded-lg border border-dashed border-neutral-800 px-3 py-2.5 text-left text-sm text-neutral-500 transition hover:border-neutral-700 hover:bg-neutral-900/50 hover:text-neutral-300"
              >
                + Add test
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-6">
            <Link
              href="/lab-results"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || completedRows.length === 0}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {getSubmitLabel()}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}