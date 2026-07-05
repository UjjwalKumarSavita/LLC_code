import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log in — LLC_code",
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthShell mode="login" />
    </Suspense>
  );
}
