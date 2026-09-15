import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <h1>Medical App</h1>

      <p>Personal medical information tracker.</p>

      <p>Logged in as {user?.email}</p>

      <form
        action={async () => {
          "use server";

          const supabase = await createClient();
          await supabase.auth.signOut();

          redirect("/login");
        }}
      >
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}