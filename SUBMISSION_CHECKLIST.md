# LLC_code Submission Checklist

## Ready now

- [x] 50 published judge-ready problems
- [x] Four-language isolated execution
- [x] Problem and editorial admin CMS
- [x] 50 reviewed editorials, 200 reference solutions, and 10 visualizers
- [x] Account progress and submission history
- [x] Frontend lint and production build
- [x] API lint, 25 tests, and production build
- [x] Desktop/mobile critical-path browser coverage
- [x] One-command local start, stop, and health checks
- [x] Git repository initialized with secrets and generated files ignored

## Before submitting

- [ ] Run `scripts\check-local.cmd` and confirm every line is green.
- [ ] Open `https://localhost:3000` in a fresh browser window.
- [ ] Verify the learner and administrator credentials you intend to demo.
- [ ] Push the `main` branch to your submission repository or create the final ZIP.
- [ ] Confirm `.env`, `.env.local`, `.local-runtime`, `node_modules`, and `.next`
      are not present in the uploaded source archive.
- [ ] Include `README.md` as the evaluator's starting point.

## Three-minute demo order

1. Landing page and pure-black/pure-white theme transition.
2. Fifty-problem catalogue and filters.
3. Two Sum workspace: Monaco, editorial, and visualizer.
4. Run or submit a solution and show its real verdict.
5. Submission history and progress dashboard.
6. Problem CMS review workflow.
7. Editorial CMS, 50/50 coverage, and language-specific reference solutions.

## Honest remaining scope

- Production cloud hosting is not configured; the submission is self-hosted.
- Remaining non-visualized problems use the deliberate visualizer fallback.
- Roadmaps, contests, mentor batches, AI tutoring, plagiarism detection,
  certificates, proctoring, and native mobile applications are post-MVP.
- Payments are intentionally excluded because LLC_code is free-only.
