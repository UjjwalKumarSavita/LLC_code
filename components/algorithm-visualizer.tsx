"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { problemVisualizers } from "@/lib/problem-visualizers";

export function AlgorithmVisualizer({
  problemSlug,
  problemTitle,
  step,
  setStep,
}: {
  problemSlug: string;
  problemTitle: string;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
}) {
  const spec = problemVisualizers[problemSlug];
  if (!spec) {
    return (
      <div className="workspace-visualizer visualizer-unavailable">
        <span className="panel-kicker">VISUAL LAB / QUEUED</span>
        <h2>This pattern is next on the board.</h2>
        <p>The judge is ready for {problemTitle}. Its hand-authored state visualizer is still being reviewed.</p>
      </div>
    );
  }

  const safeStep = Math.min(step, spec.frames.length - 1);
  const frame = spec.frames[safeStep];
  const columns = spec.columns ?? frame.values.length;

  return (
    <div className={`workspace-visualizer visualizer-pattern-${spec.pattern}`}>
      <div className="visualizer-heading">
        <span className="panel-kicker">LIVE TRACE / {spec.title.toUpperCase()}</span>
        <h2>{frame.title}</h2>
      </div>
      <div
        className="visual-array"
        style={{ "--visual-columns": columns } as CSSProperties}
      >
        {frame.values.map((value, index) => {
          const className = [
            frame.active.includes(index) ? "is-active" : "",
            frame.settled?.includes(index) ? "is-settled" : "",
          ].filter(Boolean).join(" ");
          return (
            <div className={className} key={`${index}-${value}`}>
              <small>{index}</small><strong>{value}</strong>
            </div>
          );
        })}
      </div>
      <div className="visual-map"><span>{frame.stateLabel}</span><code>{frame.stateValue}</code></div>
      <div className="visual-explanation" aria-live="polite">
        <span>STEP {safeStep + 1} / {spec.frames.length}</span>
        <p>{frame.description}</p>
      </div>
      <div className="visual-controls">
        <button aria-label="Previous visualizer step" disabled={safeStep === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button">←</button>
        <div><i style={{ width: `${((safeStep + 1) / spec.frames.length) * 100}%` }} /></div>
        <button aria-label="Next visualizer step" disabled={safeStep === spec.frames.length - 1} onClick={() => setStep((current) => Math.min(spec.frames.length - 1, current + 1))} type="button">→</button>
      </div>
    </div>
  );
}
