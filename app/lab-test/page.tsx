import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LabTestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: labTests, error } = await supabase
    .from("lab_tests")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main>
      <h1>Lab Tests</h1>

      {labTests.length === 0 ? (
        <p>No lab tests found.</p>
      ) : (
        <ul>
          {labTests.map((test) => (
            <li key={test.id}>
              <strong>{test.name}</strong>
              {" — "}
              {test.category} / {test.specimen}
              {test.unit && ` / ${test.unit}`}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}