"use client";

import Link from "next/link";
import { useState, type SubmitEventHandler } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handleResendConfirmation = async () => {
    setError("");
    setConfirmationMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setError(
        error.message === "email rate limit exceeded"
          ? "Error. Please try again later."
          : error.message,
      );

      return;
    }

    setConfirmationMessage("Confirmation email sent.");
  };

  const handleLogin: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setError("");
    setConfirmationMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        setConfirmationMessage(
          "Your email has not been confirmed yet.",
        );
      } else {
        setError(error.message);
      }

      return;
    }

    window.location.href = "/";
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
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

        <button type="submit">Login</button>

        {error && <p>{error}</p>}
      </form>
      {confirmationMessage && (
        <div>
          <p>{confirmationMessage}</p>

          <button type="button" onClick={handleResendConfirmation}>
            Resend confirmation email
          </button>
        </div>
      )}
      <p>
        Don't have an account? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}