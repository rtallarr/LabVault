"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LabResultsTable } from "@/app/components/lab-result-table";
import type { LabCategory, LabSpecimen } from "@/app/types/labs";

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
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

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

  async function createShareLink() {
    setSharing(true);
    setShareCopied(false);

    try {
      const response = await fetch("/api/lab-shares", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      setShareUrl(`${window.location.origin}/share/${data.token}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create share link",
      );
    } finally {
      setSharing(false);
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
  }

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
            Resultados de laboratorio
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Tu historial de resultados de laboratorio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={createShareLink}
            disabled={sharing || results.length === 0}
            className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sharing ? "Creando link..." : "Compartir"}
          </button>
          <Link
            href="/lab-results/new"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Agregar
          </Link>
        </div>
      </div>

      {shareUrl && (
        <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={shareUrl}
              aria-label="Share link"
              className="min-w-0 flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 outline-none"
            />
            <button
              type="button"
              onClick={copyShareLink}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              {shareCopied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Este link expira en 7 dias</p>
        </div>
      )}

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
        <LabResultsTable results={results} />
      )}
    </main>
  );
}