"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LabTest = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  specimen: string | null;
  unit: string | null;
  reference_range_min: number | null;
  reference_range_max: number | null;
};

type LabResult = {
  id: string;
  value: number;
  measured_at: string;
  lab_tests: LabTest;
};

export default function LabResultsPage() {
  const [results, setResults] = useState<LabResult[]>([]);
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
            <div className="h-24 bg-neutral-950" />
            <div className="border-t border-neutral-800 h-24 bg-neutral-950" />
            <div className="border-t border-neutral-800 h-24 bg-neutral-950" />
          </div>
        </div>
      </main>
    );
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
            Add your first laboratory result to start tracking your health data.
          </p>

          <Link
            href="/lab-results/new"
            className="mt-5 inline-block rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Add your first result
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
          <div className="divide-y divide-neutral-800">
            {results.map((result) => {
              const test = result.lab_tests;

              return (
                <article
                  key={result.id}
                  className="flex items-center justify-between px-6 py-5 transition hover:bg-neutral-900"
                >
                  <div className="min-w-0">
                    <h2 className="font-medium text-white">
                      {test.name}
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      {test.code && `${test.code} · `}
                      {new Date(
                        result.measured_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="ml-6 shrink-0 text-right">
                    <p className="text-lg font-semibold tabular-nums text-white">
                      {result.value}
                    </p>

                    {test.unit && (
                      <p className="text-sm text-neutral-500">
                        {test.unit}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}