import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create account — LLC_code",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthShell mode="register" />
    </Suspense>
  );
}
