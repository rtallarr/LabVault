import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const logout = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  };

  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-white transition hover:text-neutral-300"
        >
          Lab Vault
        </Link>

        <div className="flex items-center gap-5">
          {user ? (
            <>
              <span className="hidden text-sm text-neutral-500 sm:block">
                {user.email}
              </span>

              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm font-medium text-neutral-400 transition hover:text-white"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-400 transition hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}