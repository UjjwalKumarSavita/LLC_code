"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { MoonIcon, SunIcon } from "./icons";

export function AppHeader({ active = "" }: { active?: string }) {
  const [open, setOpen] = useState(false);

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

  return (
    <header className="app-header">
      <Link aria-label="LLC_code home" className="brand" href="/">
        <BrandMark />
        <span>LLC_code</span>
      </Link>

      <nav className={open ? "app-nav is-open" : "app-nav"} aria-label="Application navigation">
        <Link className={active === "problems" ? "is-active" : ""} href="/problems">Problems</Link>
        <Link href="/#roadmap">Roadmaps</Link>
        <Link href="/#visualizer">Visualizer</Link>
        <Link className={active === "submissions" ? "is-active" : ""} href="/submissions">Submissions</Link>
        <Link className={active === "dashboard" ? "is-active" : ""} href="/dashboard">Dashboard</Link>
      </nav>

      <div className="app-header-actions">
        <button aria-label="Toggle color theme" className="icon-button" onClick={toggleTheme} type="button">
          <span className="theme-icon theme-icon-sun"><SunIcon /></span>
          <span className="theme-icon theme-icon-moon"><MoonIcon /></span>
        </button>
        <button className="app-profile" type="button">
          <span>UD</span>
          <small>LEVEL 01</small>
        </button>
        <button
          aria-expanded={open}
          aria-label="Toggle menu"
          className="menu-button"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}
