import { notFound } from "next/navigation";
import { LabResultsTable } from "@/app/components/lab-result-table";
import type { LabCategory } from "@/app/types/labs";

interface SharePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function SharePage({
  params,
}: SharePageProps) {
  const { token } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public/lab-shares/${token}`,
    {
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    notFound();
  }

  const data = await response.json();

  if (!response.ok) {
    return (
      <main>
        <h1>Shared results unavailable</h1>
        <p>{data.error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Resultados de laboratorio
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Laboratorios compartidos por el paciente
        </p>
      </div>

      <LabResultsTable results={data as LabCategory[]} />
    </main>
  );
}