"use client";

import Link from "next/link";
import { useState, SubmitEventHandler } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      window.location.href = "/";
      return;
    }

    setMessage("Check your email to confirm your account.");
  };

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">Register</button>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
      </form>
      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </main>
  );
}