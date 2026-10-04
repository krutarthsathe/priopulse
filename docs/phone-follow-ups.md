# Set up nurse-controlled phone follow-ups

The app places real phone calls to configured demo participants. It associates each
call with a fictional dataset patient locally in Supabase. Patient measurements,
priority scores, historical outcomes, and patient IDs are not sent to ElevenLabs.

## 1. Set up Supabase

### Already prepared for this workspace

The call schema has been installed in project `etxcebrrltvylwknzseu`. Its two tables
have row-level security enabled; browser roles cannot read them, and the server role can.
The existing ElevenLabs Main agent is configured for the demonstration greeting and a
300-second maximum. A signed webhook named **PrioPulse phone follow-ups** targets
`https://priopulse.vercel.app/api/elevenlabs/webhook` and is attached to the agent for
transcripts and initiation failures. It is **paused until the new app is deployed**.

Local `.env.local` contains the setup values, including the selected verified demo
recipient. Copy the required values privately into Vercel's environment settings.
Do not create another webhook for this workspace. After deploying this change and
adding the variables, enable the prepared webhook in ElevenLabs. Confirm the deployed
endpoint responds to a valid signed event before relying on delivery with no browser open.

The steps below also explain how to reproduce the setup in another project.

1. Open your project in the [Supabase dashboard](https://supabase.com/dashboard).
   For the project supplied in this chat, the project ID is `etxcebrrltvylwknzseu`.
2. Open **SQL Editor**, create a query, paste `supabase/schema.sql`, and run it.
   This creates the call table, a durable event inbox, and the functions used by the app.
   The file can be run again without deleting call history.
3. Copy your **Project URL** from the Connect dialog or API settings. It should look
   like `https://etxcebrrltvylwknzseu.supabase.co`, not a `postgresql://` connection string.
4. In **API Keys**, create/copy a server **secret key** (`sb_secret_…`). Set it as
   `SUPABASE_SECRET_KEY`. A legacy `service_role` key also works. Never use the
   publishable/anon key for this server integration, and never put the secret in chat.
5. Leave row-level security enabled on both tables. Do not add public access policies.
   Only Vercel's server key can read transcripts or run the call functions.

The ranking dataset stays in its existing JSON file. You do not need to import all
299 patients into Supabase. Supabase stores only phone-call attempts and notes.

## 2. Set up the ElevenLabs agent

Use the existing **PrioPulse Follow Up Demo** agent and its Main branch.

Set the language to **English** and the maximum conversation duration to **300 seconds**.
The server checks these settings before dialing. The five-minute limit is enforced by
ElevenLabs, so closing the browser does not remove it.

Use this first message:

> Hello. I’m PrioPulse’s automated demonstration follow-up assistant. Please use fictional answers. Is now a good time for a short conversation?

Use these agent instructions:

> Run a fictional follow-up conversation. Ask one question at a time: whether the
> person has a follow-up appointment, whether anything makes attending difficult,
> and whether they want a nurse callback. Do not invent appointments, diagnose
> conditions, recommend treatments, or claim a nurse has been notified. Finish by
> repeating what the person said and explaining that a nurse must review it. If
> the person declines, thank them and finish. If you reach voicemail, do not leave
> patient information; finish the demonstration. Use English and keep the conversation brief.

Publish/save these settings to the branch used for calls. The ElevenLabs Main branch
is separate from your Git main branch. The server resolves Main before dialing,
unless you explicitly set `ELEVENLABS_BRANCH_ID` to another agent branch ID.

In **Phone Numbers**, use your already working Twilio integration and copy its
ElevenLabs phone-number ID (`phnum_…`) as `ELEVENLABS_PHONE_NUMBER_ID`. This is the
**sending** number identifier, not the receiving mobile number or Twilio Account SID.
Twilio credentials remain in ElevenLabs; this app does not need them.

Use an ElevenLabs API key with permission to read the agent, initiate outbound
conversations, and read/list conversations. Keep the key server-side.

## 3. Configure receiving demo numbers

The app never accepts an arbitrary receiving number from the browser. Configure
`CALL_DEMO_DESTINATIONS` with up to ten participant-approved demo numbers:

```dotenv
CALL_DEMO_DESTINATIONS='[{"id":"my-mobile","label":"My demo phone","number":"+1YOUR10DIGITNUMBER"}]'
```

Replace the placeholder with the real number. Include `+` and country code, with no
spaces or punctuation. IDs must be unique. In Vercel's value field, paste just the
JSON array, without the surrounding single quotes.

If Twilio is on a trial account, verify every receiving number under **Verified
Caller IDs** using its SMS/voice verification process. This is separate from importing
the sending number into ElevenLabs. Testers must agree to the demonstration call.

## 4. Configure Vercel and the webhook

Copy `.env.example` to `.env.local` for local development, preserving your existing
ElevenLabs key, agent ID, and passcode. Add the same variables in Vercel's project
**Settings → Environment Variables** for the environments where you want calls enabled:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | HTTPS Supabase project URL |
| `SUPABASE_SECRET_KEY` | Server secret key or legacy service_role key |
| `ELEVENLABS_API_KEY` | Private ElevenLabs API key |
| `ELEVENLABS_AGENT_ID` | Existing agent ID |
| `ELEVENLABS_PHONE_NUMBER_ID` | Imported sending phone number's `phnum_…` ID |
| `ELEVENLABS_BRANCH_ID` | Optional agent branch ID; Main is the default |
| `ELEVENLABS_WEBHOOK_SECRET` | HMAC secret supplied when creating the webhook |
| `VOICE_DEMO_PASSCODE` | Shared demo access password |
| `CALL_DEMO_DESTINATIONS` | JSON allowlist of verified demo recipients |

Do **not** prefix any of these with `NEXT_PUBLIC_`. Redeploy after changing variables.
Production and Preview use separate environment scopes. Preview and Production
sharing the same Supabase project also share the one-active-call reservation.

In ElevenLabs' webhook/settings area:

1. Create an HMAC-signed webhook targeting
   `https://YOUR-VERCEL-DOMAIN/api/elevenlabs/webhook`.
2. Enable **post_call_transcription** and **call_initiation_failure** events.
3. Copy the generated HMAC secret to `ELEVENLABS_WEBHOOK_SECRET` and redeploy.
4. Ensure the webhook is enabled for this agent. Disable audio events for this endpoint.
5. The endpoint must be publicly reachable by ElevenLabs. If Vercel Deployment
   Protection is enabled, configure the webhook's protection bypass using Vercel's
   documented mechanism, or use an accessible production domain.

The webhook verifies the exact raw request body, its HMAC signature, and timestamp.
It returns 200 only after normalized data is durably stored. Raw provider errors,
analysis summaries, and recordings are not saved by this app. Twilio recording is
disabled in the outbound request; ElevenLabs retention follows your account settings.

## 5. Use the app

1. Open **Calls & Review** directly to view activity without a passcode. Public activity omits phone numbers, transcripts, note content, and provider identifiers. Open **Patients** or a patient profile to unlock protected details and actions.
2. Enter the shared passcode. It creates an eight-hour HttpOnly access cookie; the
   passcode is not saved to browser storage.
3. Choose a patient from the ranked queue and select a receiving demo phone.
4. Confirm that the participant agreed, then click **Start follow-up call** once.
5. Answer on the phone and play the fictional patient. Browser microphone access
   is unnecessary. Leaving the page or locking app access does **not** hang up.
6. Open **Calls & Review**. Status refreshes every ten seconds while the page is visible.
   Refreshing only reads/reconciles provider state; it never redials.
7. After completion, open **Review transcript**, edit the note, check the review box,
   and click **Save reviewed note**. The note is shared and shown under that patient.
8. Use **Discard draft edits** to reset unsaved edits. It keeps the shared transcript.

No reviewed note is saved automatically. Unsaved edits are kept in the current
browser tab's session storage so page reloads preserve them. Reviewed notes are saved
once in Supabase. A second save cannot overwrite another nurse's saved note.
User names are existing fictional demo identities, not verified staff authentication.
All passcode holders share demo access; do not use this version for actual patient care.

## Status and recovery

- **Call requested** means the provider accepted initiation; it does not prove the
  recipient answered. **Completed** means the conversation ended, not that care was delivered.
- **No answer**, **Busy**, and **Failed** come from provider events or confirmed
  rejection. An answered voicemail can look completed; inspect its transcript.
  If a failed conversation has received transcript messages, those messages remain
  available for explicit nurse review.
- **Status uncertain** means dialing may have succeeded despite an interrupted
  response. The database reservation stays active and blocks new calls.
- The app checks provider conversation state at most every 15 seconds per active
  attempt during authorized history requests. Webhooks complete records even with
  no browser open. The Calls page displays the most recent 100 attempts; patient
  profiles display the most recent 100 attempts for that patient.
- If the browser loses the initiation response, **Recover original request** requires
  a fresh explicit confirmation and reuses the same unique request ID. It returns the
  existing attempt if reserved; if the original request never reached the server, it
  can place the originally confirmed call. It is never an automatic retry.
- If no conversation identifier can ever be recovered, the app intentionally does
  not assume failure and release the lock. Check ElevenLabs and Twilio logs. After
  confirming there is no active call, a project administrator may set that attempt
  to `failed` in Supabase's Table Editor and enter a reason in `failure_message`.
  Do not do this while a call could still be ringing or connected.

## Checks before demonstrating

Run `npm test` and `npm run build`. The test suite executes the actual schema in an
embedded PostgreSQL engine and verifies access restrictions, one-call reservations,
webhook races, duplicate delivery, interrupted requests, reconciliation, and note review.
No test initiates a real call.

On deployed HTTPS, verify one participant-approved call: phone rings, conversation
finishes, transcript appears under the correct patient, and an explicitly saved note
survives a page refresh. Also check a wrong passcode, a declined/unanswered call,
two rapid clicks, and browser navigation during a call. There are no bulk calls,
automatic retries, scheduling integrations, transfers, or automatic nurse notifications.

## Official references

- [ElevenLabs outbound-call API](https://elevenlabs.io/docs/eleven-agents/api-reference/integrations/twilio/outbound-call)
- [ElevenLabs signed post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks)
- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
