"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { canAccessCms, type SessionUser } from "@/lib/auth-types";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return (await response.json()) as SessionUser;
      })
      .then((sessionUser) => {
        if (!active) return;
        if (!canAccessCms(sessionUser.role)) {
          router.replace("/problems");
          return;
        }
        setUser(sessionUser);
      })
      .catch(() => router.replace(`/login?next=${encodeURIComponent(pathname)}`))
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, [pathname, router]);

  const toggleTheme = () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      localStorage.setItem("llc-theme", next);
    };
    if ("startViewTransition" in document) {
      (
        document as Document & {
          startViewTransition: (callback: () => void) => void;
        }
      ).startViewTransition(apply);
    } else {
      apply();
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  if (checking || !user) {
    return (
      <main className="admin-gate">
        <BrandMark />
        <span>VERIFYING CMS ACCESS</span>
        <i />
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <BrandMark />
          <span>LLC_code</span>
        </Link>
        <div className="admin-workspace-label">CONTENT STUDIO</div>
        <nav aria-label="CMS navigation">
          <Link className={pathname.startsWith("/admin/problems") ? "is-active" : ""} href="/admin/problems">
            <span>01</span> Problems
          </Link>
          <span className="is-disabled"><span>02</span> Collections <small>SOON</small></span>
          <Link className={pathname.startsWith("/admin/editorials") ? "is-active" : ""} href="/admin/editorials">
            <span>03</span> Editorials
          </Link>
          <span className="is-disabled"><span>04</span> Audit log <small>SOON</small></span>
        </nav>
        <div className="admin-sidebar-foot">
          <span>LLC CMS / V0.1</span>
          <Link href="/problems">View learner app -&gt;</Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div><i /> SYSTEM ONLINE</div>
          <div className="admin-user">
            <button aria-label="Toggle color theme" onClick={toggleTheme} type="button">THEME</button>
            <span><strong>{user.fullName ?? user.username}</strong><small>{user.role.replace("_", " ")}</small></span>
            <button onClick={logout} type="button">LOG OUT</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
