"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AmbientCanvas } from "./ambient-canvas";
import { BrandMark } from "./brand-mark";
import {
  ArrowIcon,
  CheckIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon,
} from "./icons";

const processSteps = [
  {
    number: "01",
    title: "Read the signal",
    text: "Decode constraints, edge cases, and the real shape of the problem.",
  },
  {
    number: "02",
    title: "See the logic",
    text: "Watch pointers, queues, trees, and state changes move in real time.",
  },
  {
    number: "03",
    title: "Shape the code",
    text: "Turn the mental model into a tested solution in one focused workspace.",
  },
  {
    number: "04",
    title: "Master the pattern",
    text: "Compare approaches, understand failures, and carry the pattern forward.",
  },
];

const roadmapItems = [
  ["01", "Programming foundations", "18 concepts · 42 problems"],
  ["02", "Data structures", "24 concepts · 96 problems"],
  ["03", "Algorithms", "31 concepts · 128 problems"],
  ["04", "Interview patterns", "16 patterns · 80 problems"],
];

function useReveal() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const button = ref.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
    button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <button
      className={`button ${className}`}
      onPointerLeave={reset}
      onPointerMove={move}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
}

function CodeStage() {
  const [running, setRunning] = useState(true);

  return (
    <div className="code-stage" data-reveal>
      <div className="stage-orbit stage-orbit-one" />
      <div className="stage-orbit stage-orbit-two" />
      <div className="code-window">
        <div className="window-bar">
          <span>two_sum.py</span>
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="code-body">
          <div className="line-number">1</div>
          <code><b>def</b> two_sum(nums, target):</code>
          <div className="line-number">2</div>
          <code>&nbsp;&nbsp;seen = {"{}"}</code>
          <div className="line-number active-line">3</div>
          <code className="active-line">&nbsp;&nbsp;<b>for</b> i, value <b>in</b> enumerate(nums):</code>
          <div className="line-number">4</div>
          <code>&nbsp;&nbsp;&nbsp;&nbsp;need = target - value</code>
          <div className="line-number">5</div>
          <code>&nbsp;&nbsp;&nbsp;&nbsp;<b>if</b> need <b>in</b> seen:</code>
          <div className="line-number">6</div>
          <code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>return</b> [seen[need], i]</code>
        </div>
        <div className="execution-row">
          <span className="execution-dot" />
          <span>Executing test 08 / 12</span>
          <span>42 ms</span>
        </div>
      </div>

      <div className="floating-card result-card">
        <span>VERDICT</span>
        <strong><CheckIcon size={16} /> Accepted</strong>
      </div>

      <div className="floating-card complexity-card">
        <span>COMPLEXITY</span>
        <strong>O(n)</strong>
      </div>

      <button
        aria-label={running ? "Pause animation" : "Play animation"}
        className="stage-control"
        onClick={() => setRunning((value) => !value)}
        type="button"
      >
        {running ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className={`array-trace ${running ? "is-running" : ""}`} aria-hidden="true">
        {[2, 7, 11, 15].map((value, index) => (
          <div className="array-cell" key={value}>
            <span>{value}</span>
            <small>{index}</small>
          </div>
        ))}
        <div className="trace-pointer">i</div>
      </div>
    </div>
  );
}

export function LandingExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal();

  const toggleTheme = () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const applyTheme = () => {
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("llc-theme", nextTheme);
    };

    if ("startViewTransition" in document) {
      (
        document as Document & {
          startViewTransition: (callback: () => void) => void;
        }
      ).startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  return (
    <main>
      <header className="site-header">
        <a aria-label="LLC_code home" className="brand" href="#top">
          <BrandMark />
          <span>LLC_code</span>
        </a>

        <nav className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
          <a href="#method">Method</a>
          <a href="#visualizer">Visualizer</a>
          <a href="#roadmap">Roadmaps</a>
          <Link href="/problems">Problems</Link>
        </nav>

        <div className="header-actions">
          <button
            aria-label="Toggle color theme"
            className="icon-button theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            <span className="theme-icon theme-icon-sun"><SunIcon /></span>
            <span className="theme-icon theme-icon-moon"><MoonIcon /></span>
          </button>
          <Link className="login-button" href="/login">Log in</Link>
          <button
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <AmbientCanvas />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span />
            A visual coding laboratory
          </div>
          <h1>
            <span>Don&apos;t memorize</span>
            <span>the answer.</span>
            <em>See the logic.</em>
          </h1>
          <p>
            Practice algorithms, trace every decision, and turn abstract code
            into a mental model you can actually keep.
          </p>
          <div className="hero-actions">
            <MagneticButton className="button-primary">
              Start solving <ArrowIcon />
            </MagneticButton>
            <MagneticButton className="button-secondary">
              Watch the system <PlayIcon />
            </MagneticButton>
          </div>
          <div className="hero-proof">
            <span>01</span>
            <p>Read. Visualize. Build. Submit.</p>
            <div className="proof-line" />
          </div>
        </div>
        <CodeStage />
        <a className="scroll-cue" href="#method">
          <span>SCROLL TO EXPLORE</span>
          <i />
        </a>
      </section>

      <div className="signal-strip" aria-label="Platform capabilities">
        <div className="signal-track">
          {[0, 1].map((group) => (
            <div className="signal-group" key={group} aria-hidden={group === 1}>
              <span>7 LANGUAGES</span><i />
              <span>LIVE EXECUTION</span><i />
              <span>HIDDEN TESTS</span><i />
              <span>VISUAL DRY RUNS</span><i />
              <span>ZERO GUESSWORK</span><i />
            </div>
          ))}
        </div>
      </div>

      <section className="section method-section" id="method">
        <div className="section-kicker" data-reveal>
          <span>01 / THE METHOD</span>
          <span>FROM CONFUSION TO CLARITY</span>
        </div>
        <div className="section-heading" data-reveal>
          <h2>One problem.<br />Four clear moves.</h2>
          <p>
            LLC_code keeps the full learning loop in one place, so every failed
            test becomes information—not friction.
          </p>
        </div>
        <div className="process-grid">
          {processSteps.map((step, index) => (
            <article
              className="process-card"
              data-reveal
              key={step.number}
              style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}
            >
              <span className="process-number">{step.number}</span>
              <div className="process-symbol" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="card-arrow"><ArrowIcon /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="visualizer-section" id="visualizer">
        <div className="visualizer-copy" data-reveal>
          <div className="section-kicker">
            <span>02 / VISUAL ENGINE</span>
          </div>
          <h2>Watch an algorithm think.</h2>
          <p>
            Step through execution at your pace. Every comparison, pointer,
            queue update, and return value stays visible.
          </p>
          <ul>
            <li><CheckIcon /> Rewind any state change</li>
            <li><CheckIcon /> Inspect live variables</li>
            <li><CheckIcon /> Match code to movement</li>
          </ul>
          <MagneticButton className="button-invert">
            Open visualizer <ArrowIcon />
          </MagneticButton>
        </div>

        <div className="visualizer-demo" data-reveal>
          <div className="demo-toolbar">
            <span>BINARY_SEARCH.LAB</span>
            <span>STEP 04 / 07</span>
          </div>
          <div className="search-array">
            {[3, 8, 12, 17, 24, 31, 46].map((value, index) => (
              <div
                className={`search-cell ${index === 4 ? "is-target" : ""} ${index < 3 ? "is-dim" : ""}`}
                key={value}
              >
                <small>{index}</small>
                <strong>{value}</strong>
              </div>
            ))}
            <span className="pointer pointer-left">L</span>
            <span className="pointer pointer-mid">MID</span>
            <span className="pointer pointer-right">R</span>
          </div>
          <div className="demo-readout">
            <div>
              <small>CURRENT CONDITION</small>
              <code>nums[mid] &lt; target</code>
            </div>
            <div>
              <small>NEXT ACTION</small>
              <code>left = mid + 1</code>
            </div>
          </div>
          <div className="demo-controls">
            <button aria-label="Previous step" type="button">←</button>
            <button aria-label="Play visualization" className="demo-play" type="button"><PlayIcon /></button>
            <button aria-label="Next step" type="button">→</button>
            <div className="timeline"><i /></div>
            <span>1.0×</span>
          </div>
        </div>
      </section>

      <section className="section roadmap-section" id="roadmap">
        <div className="section-kicker" data-reveal>
          <span>03 / GUIDED ROADMAPS</span>
          <span>YOUR NEXT MOVE, ALWAYS CLEAR</span>
        </div>
        <div className="roadmap-layout">
          <div className="roadmap-heading" data-reveal>
            <h2>Build skill<br />in sequence.</h2>
            <p>
              Structured paths connect concepts to practice, so progress feels
              deliberate instead of random.
            </p>
            <MagneticButton className="button-secondary">
              Explore roadmaps <ArrowIcon />
            </MagneticButton>
          </div>
          <div className="roadmap-list">
            {roadmapItems.map(([number, title, detail], index) => (
              <article
                className="roadmap-row"
                data-reveal
                key={number}
                style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
              >
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
                <div className="roadmap-progress">
                  <i style={{ width: `${[88, 62, 34, 8][index]}%` }} />
                </div>
                <button aria-label={`Open ${title}`} type="button"><ArrowIcon /></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="practice-section" id="practice">
        <div className="practice-sticky">
          <div className="practice-copy" data-reveal>
            <div className="section-kicker"><span>04 / PRACTICE LAB</span></div>
            <h2>A workspace built for flow.</h2>
            <p>
              Problem, editor, tests, and explanation—arranged to keep your mind
              on the solution.
            </p>
          </div>
          <div className="workspace-preview" data-reveal>
            <div className="workspace-topbar">
              <div><BrandMark size={25} /><span>LLC_code / Problems / Two Sum</span></div>
              <span>● ALL SYSTEMS READY</span>
            </div>
            <div className="workspace-columns">
              <div className="problem-pane">
                <small>PROBLEM 001 · EASY</small>
                <h3>Two Sum</h3>
                <p>Given an array of integers and a target, return the indices of the two numbers that add up to the target.</p>
                <div className="example-box">
                  <span>INPUT</span><code>nums = [2,7,11,15], target = 9</code>
                  <span>OUTPUT</span><code>[0,1]</code>
                </div>
              </div>
              <div className="editor-pane">
                <div className="editor-tabs"><span>solution.py</span><span>Python 3⌄</span></div>
                <pre><b>class</b> Solution:<br />  <b>def</b> twoSum(self, nums, target):<br />    seen = {"{}"}<br />    <b>for</b> i, n <b>in</b> enumerate(nums):<br />      diff = target - n<br />      <b>if</b> diff <b>in</b> seen:<br />        <b>return</b> [seen[diff], i]</pre>
                <div className="editor-actions">
                  <button type="button">Run</button>
                  <button type="button">Submit solution</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <AmbientCanvas />
        <div className="closing-copy" data-reveal>
          <span>READY WHEN YOU ARE.</span>
          <h2>Your next breakthrough<br />starts with one problem.</h2>
          <MagneticButton className="button-closing">
            Enter LLC_code <ArrowIcon />
          </MagneticButton>
        </div>
        <div className="closing-index">LLC / 2026</div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top"><BrandMark /><span>LLC_code</span></a>
        <p>See the logic. Shape the solution.</p>
        <div>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">GitHub</a>
        </div>
        <span>© 2026 LLC_code</span>
      </footer>
    </main>
  );
}
