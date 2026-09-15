import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type NavbarProps = {
  email?: string;
};

export function Navbar({ email }: NavbarProps) {
  const logout = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  };

  return (
    <nav>
      <Link href="/">Medical App</Link>

      <div>
        {email ? (
          <>
            <span>{email}</span>

            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}