"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BrandMark } from "@/components/brand-mark";
import type { SessionUser } from "@/lib/auth-types";

type AuthMode = "login" | "register";

export function AuthShell({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: form.get("email"),
            password: form.get("password"),
          }
        : {
            fullName: form.get("fullName"),
            username: form.get("username"),
            email: form.get("email"),
            password: form.get("password"),
          };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        user?: SessionUser;
        message?: string | string[];
      };
      if (!response.ok || !data.user) {
        const message = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setError(message ?? "Unable to continue");
        return;
      }

      const requested = searchParams.get("next");
      const destination =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : data.user.role === "STUDENT"
            ? "/problems"
            : "/admin/problems";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Authentication service is unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link className="brand auth-brand" href="/">
          <BrandMark />
          <span>LLC_code</span>
        </Link>
        <div className="auth-grid" aria-hidden="true" />
        <div className="auth-message">
          <span>SECURE ACCESS / 01</span>
          <h1>
            Enter the lab.
            <em>Keep your momentum.</em>
          </h1>
          <p>
            Your solved problems, drafts, streaks, and learning path stay
            synchronized across every session.
          </p>
        </div>
        <div className="auth-trace" aria-hidden="true">
          <i /><i /><i /><i /><span>AUTHENTICATED</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span>{mode === "login" ? "WELCOME BACK" : "CREATE YOUR PROFILE"}</span>
            <h2>{mode === "login" ? "Log in to LLC_code" : "Start learning visually"}</h2>
            <p>
              {mode === "login" ? "New to the lab? " : "Already have an account? "}
              <Link href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create an account" : "Log in"}
              </Link>
            </p>
          </div>

          <form className="auth-form" method="post" onSubmit={submit}>
            {mode === "register" && (
              <div className="auth-form-row">
                <label>
                  <span>FULL NAME</span>
                  <input autoComplete="name" name="fullName" placeholder="Your name" required />
                </label>
                <label>
                  <span>USERNAME</span>
                  <input
                    autoComplete="username"
                    minLength={3}
                    name="username"
                    pattern="[A-Za-z0-9_]+"
                    placeholder="logic_builder"
                    required
                  />
                </label>
              </div>
            )}
            <label>
              <span>EMAIL ADDRESS</span>
              <input
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label>
              <span>PASSWORD</span>
              <div className="password-field">
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={mode === "login" ? 1 : 10}
                  name="password"
                  placeholder={mode === "login" ? "Enter your password" : "At least 10 characters"}
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button onClick={() => setShowPassword((value) => !value)} type="button">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </label>
            {error && <div className="auth-error" role="alert">× {error}</div>}
            <button className="auth-submit" disabled={loading || !hydrated} type="submit">
              <span>{loading ? "VERIFYING..." : !hydrated ? "CONNECTING..." : mode === "login" ? "ENTER THE LAB" : "CREATE ACCOUNT"}</span>
              <i>→</i>
            </button>
          </form>

          <div className="auth-security">
            <span>●</span>
            Passwords are Argon2id hashed. Session tokens remain HttpOnly.
          </div>
        </div>
      </section>
    </main>
  );
}
