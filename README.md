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

Select a comparison card to view its top 25. Change weak-heart points to 3 to rescore the records while leaving kidney points and patient measurements fixed. The dashboard shows overlap, entering/leaving patients, and rank movements. Patient IDs link to the corresponding record details.

With these tie rules, the historical death counts are 18/25 for oldest-first, 20/25 for original scoring, and 18/25 for revised scoring. The original and revised lists share 20 patients. Increasing a weight does not necessarily improve the outcome measure.

Nurse-confirmed phone follow-ups call allowlisted demo participants through ElevenLabs and Twilio. Call history, transcripts, and explicitly reviewed notes are shared in Supabase. Manual demo outcomes and ranking changes remain in the browser-local audit log, which also contains fictional sample events. Ranking works without configuring phone calls.

Run `npm test` for scoring and comparison checks, and `npm run build` to verify the production build. These scores are hackathon rules, not a validated clinical tool.

Dataset: Chicco & Jurman, *Heart Failure Clinical Records* (2020), [UCI DOI 10.24432/C5Z89R](https://doi.org/10.24432/C5Z89R), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

### Ranking experiments

Challenge Demo changes only heart points from 2 to 3. Explore Settings adds heart/kidney weights and thresholds plus call capacity (10, 15, 25, or 50). Historical evaluation and before/after overlap always use 25 records, regardless of queue capacity. Reset restores the challenge defaults. Mode switching starts from defaults.

Patient links preserve the scoring settings. A patient profile includes a temporary what-if simulation for heart and kidney measurements, showing the simulated position against all 299 patients. Simulation never changes the source dataset, queue, or historical evaluation. Settings and simulations are temporary page state.

## Phone follow-ups

Start a confirmed follow-up call from the ranked queue or a patient profile. The
**Calls & Review** page tracks attempts and transcripts and lets the nurse explicitly
save a reviewed note. One active demo call is permitted; no bulk dialing or automatic
retries. Browser navigation does not end a phone call. Dataset patients have no real
contact details, so calls go only to configured, verified demo participants.

Follow [the setup guide](docs/phone-follow-ups.md) to run [the Supabase schema](supabase/schema.sql),
configure ElevenLabs webhooks, and add [.env.example](.env.example) variables to Vercel.
All keys remain server-side. The browser voice SDK and signed-session endpoint have
been replaced by phone-call endpoints. Passcode protection and demo staff names are
for fictional testing, not actual patient care.
