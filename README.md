# PrioPulse

PrioPulse is a web application built with Next.js and React.

## Requirements

Install Node.js 22 LTS and npm before starting. npm is included with Node.js.

Check that both are installed:

```bash
node --version
npm --version
```

## Start the project locally

1. Open Terminal and go to your project folder:

   ```bash
   cd /Users/krutarthsathe/Documents/krutarth-sathe/industry-hackathon/priopulse
   ```

   If you saved the project somewhere else, use that folder's path instead.

2. Install the project dependencies:

   ```bash
   npm ci
   ```

   Wait for the installation to finish. You only need to repeat this step when dependencies change or after downloading a fresh copy of the project.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. If Terminal shows a different port, open the address shown there.

Keep Terminal open while using the application. Saved code changes appear automatically in the browser. Press **Control + C** in Terminal to stop the server.

## Run a production build locally

Build the application first:

```bash
npm run build
```

After the build succeeds, start it:

```bash
npm start
```

Open the local address shown in Terminal. Rebuild after changing code to see those changes in production mode.

## Common startup issues

- **Node.js or npm command not found:** Install Node.js and reopen Terminal.
- **Missing dependencies:** Run `npm ci` from the project folder.
- **Port 3000 is already in use:** Use the address printed by the development server, or run `npm run dev -- --port 3001` and open `http://localhost:3001`.
- **The server stops with an error:** Read the error in Terminal and resolve it before restarting.

## Heart-failure ranking demo

The home and Patients pages load 299 anonymous records bundled in `data/heart-failure-patients.json`. No database, Python runtime, or AI API is required. This JSON is a numeric conversion of the challenge CSV; patient IDs follow the original row order. No rows were missing values.

The queue scores weak heart measurements (ejection fraction below 35%) at 2 points, kidney measurements (serum creatinine above 1.5 mg/dL) at 2 points, and anaemia, diabetes, high blood pressure, and age 70 or older at 1 point each. Equal scores use age descending, then patient ID ascending. Outcomes and follow-up duration never affect ranking.

The dashboard opens on today's call list with four views: **To call**, **Call back** (everyone marked No answer or Unreachable today), **Completed** (reached today) and **All patients** (the full ranked list, with patients below today's cut-off labelled). Every outcome has **Undo** for mistaken clicks and the day's call progress, ranked by the follow-up agent's current scoring. **Scoring & agent tests** opens a panel with five tabs: **How patients are scored** (an editable points table: change any point value or cut-off and the call list re-ranks at once, with a plain-language summary of who joins or leaves the top 25 and how many at-risk patients the new list would have reached), **Tests the agent ran**, **Safety checks** and **What the terms mean**. Hand edits override the agent's scoring until you go back to it, and are logged as weight changes. **Compare with oldest first** (in the panel) shows the call list against oldest-first. Click a patient for a quick view and a link to the full profile.

With these tie rules, the historical death counts are 18/25 for oldest-first, 20/25 for original scoring, and 18/25 for revised scoring. The original and revised lists share 20 patients. Increasing a weight does not necessarily improve the outcome measure.

Call controls record demo outcomes in the existing browser-local audit log. They do not place calls; the audit page also contains pre-existing fictional sample events. Logs are not shared across browsers. Vercel deployment requires no database configuration for this version.

Run `npm test` for scoring and comparison checks, and `npm run build` to verify the production build. These scores are hackathon rules, not a validated clinical tool.

Dataset: Chicco & Jurman, *Heart Failure Clinical Records* (2020), [UCI DOI 10.24432/C5Z89R](https://doi.org/10.24432/C5Z89R), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

### Ranking experiments

Every point value and cut-off the scoring engine supports can be edited: weak-heart points and cut-off, weak-kidney points and cut-off, extra points for age 80 or older, and points and cut-off for low blood sodium. Anaemia, diabetes, high blood pressure and age 70 or older stay at 1 point each. The effect summary always compares the top 25 against the agent's scoring. **Start from standard scoring** loads the original points so you can, for example, give a weak heart 3 points instead of 2.

### Follow-up agent

The agent (`lib/agent/`) reviews its own scoring rule each time the dashboard loads; **Replay agent tests** (in the panel) shows the same run step by step, starting with a test of calling the oldest patients first, (Pause, Step, Skip, speed) for presenting. The loop:

1. Grade the starting rule (v1, the challenge rule) against oldest-first.
2. Round 1 always tests the clinic suggestion (weak-heart points 2 → 3).
3. Each later idea comes from the current rule's own mistakes on the learning set: traits over-represented among at-risk patients just missing the list (or among survivors on it), plus at-risk patients the last rejected change pushed out. Ideas and the decision rule live in `lib/agent/rules.json`.
4. The decision rule is fixed in advance: promote only if more at-risk patients are reached among held-back patients, the learning set is not worse, **and** the change wins on all 4 seeded learn/held-back splits (199 / 100). Stop after 3 failures in a row or 12 rounds.

Result on the bundled data (locked by `npm test`): weak-heart 3 is **rejected** (18 vs 20 of 25; held-back 17 vs 19), kidney cut-off 1.8 is rejected, **+1 point for age 80 or older is promoted** (held-back 19 → 20, every split), and three further ideas are rejected, giving rule **v1.1**. It still reaches 20/25 on all records and 60 vs 48 for oldest-first with 100 calls.

Trap safeguards, each re-checked live in the **Data safety checks** panel: outcomes (`DEATH_EVENT`) are read only by `lib/agent/evaluate.js` to grade rules and follow-up time is never read; ties use a fixed order (shuffled input gives the same list); changes are judged on held-back patients across 4 splits; the clinic suggestion is tested rather than assumed.

**Add patient** (a single-patient form with validation) scores a new record, marks it NEW and re-runs the agent. New patients have no outcome, so they are ranked but never graded, have no full profile page, and exist only until the page reloads. Agent replays log each decision to the audit log as "Rule reviewed". Today's call outcomes are read back from the audit log, so they survive a reload.

Patient links preserve the scoring settings. A patient profile includes a temporary what-if simulation for heart and kidney measurements, showing the simulated position against all 299 patients. Simulation never changes the source dataset, queue, or historical evaluation. Settings and simulations are temporary page state.
