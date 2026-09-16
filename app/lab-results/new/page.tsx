"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LabTest = {
  id: string;
  name: string;
  unit: string | null;
};

export default function NewLabResultPage() {
  const router = useRouter();

  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [labTestId, setLabTestId] = useState("");
  const [value, setValue] = useState("");
  const [measuredAt, setMeasuredAt] = useState("");

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/lab-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lab_test_id: labTestId,
          value: Number(value),
          measured_at: measuredAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to create lab result",
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

          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="space-y-6">
              <div>
                <div className="h-4 w-20 rounded bg-neutral-800" />
                <div className="mt-2 h-10 rounded-lg bg-neutral-900" />
              </div>

              <div>
                <div className="h-4 w-16 rounded bg-neutral-800" />
                <div className="mt-2 h-10 rounded-lg bg-neutral-900" />
              </div>

              <div>
                <div className="h-4 w-28 rounded bg-neutral-800" />
                <div className="mt-2 h-10 rounded-lg bg-neutral-900" />
              </div>
            </div>
          </div>
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
          Add lab result
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Record a laboratory test result.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
      >
        <div className="space-y-6">
          <div>
            <label
              htmlFor="lab-test"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Lab test
            </label>

            <select
              id="lab-test"
              value={labTestId}
              onChange={(event) =>
                setLabTestId(event.target.value)
              }
              required
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
            >
              <option value="" className="bg-neutral-900">
                Select a test
              </option>

              {labTests.map((test) => (
                <option
                  key={test.id}
                  value={test.id}
                  className="bg-neutral-900"
                >
                  {test.name}
                  {test.unit ? ` (${test.unit})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="value"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Result
            </label>

            <input
              id="value"
              type="number"
              step="any"
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              placeholder="Enter the result"
              required
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
            />
          </div>

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
              disabled={submitting}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add result"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
