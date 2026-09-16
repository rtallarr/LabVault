import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <main>
        <h1>Medical App</h1>

        <p>Personal medical information tracker.</p>
      </main>
    </>
  );
}