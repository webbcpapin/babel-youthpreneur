# Login and monitoring review

Repository baseline: `26913e9` on `webbcpapin/babel-youthpreneur`.
Review date: 17 October 2026 (Asia/Jakarta).

The requested first stage is stable Google login and reliably stored reports.
The public program model, course redesign, attendance, scoring, and review
workflows remain separate work.

## Confirmed architecture

The deployed app is React 19 with Vite and HashRouter. Google Identity Services
provides an ID token. Apps Script verifies audience, issuer, expiry, and verified
email, looks up the active `AppUsers` row, then issues an opaque eight-hour
session. The `Sessions` sheet stores a hash rather than the raw token. Private
actions resolve their actor from that session. Sheets holds monitoring records;
Drive is used by photo/export functions.

The `supabase` directory and older README/audit statements describe earlier
designs. Supabase is not the active login path. The frontend's previous `email:
profile.name` field did not let a caller choose the backend actor: the backend
already used `profile.email` from the verified session. Server-side team scoping
already existed and remains authoritative.

## Changes in this patch

1. Google script loading has a shared promise, a bounded wait, failed-script
   cleanup, and retry. Login callbacks remain stable across renders and duplicate
   login submissions are blocked while verification is in flight.
2. Stored sessions reject invalid expiry dates. Session restoration ignores
   obsolete responses, logout clears the browser immediately, and expiry returns
   users to login. API session errors identify which token was rejected, so an
   older request cannot invalidate a newer login.
3. Requests time out after 30 seconds. No automatic write retry is performed.
4. Monitoring connection state is based on authenticated `getData`, not a separate
   health check that could succeed while data loading failed. A retry control is
   available and normal local development no longer starts with named demo teams.
5. Forms retain their values after failed saves and add rows only after a server
   acknowledgement with a valid row ID and matching team. Inputs are locked while
   saving, and unchanged retries within the mounted form retain a request ID.
6. Apps Script deduplicates report/output requests per actor under a script lock.
   Missing assignments cannot match blank team/campus/UMKM IDs, and even admins
   must target an existing team. Reports validate week, activity, and progress.
7. Normal requests no longer run database bootstrap, restyle every sheet, access
   Drive, seed program data, or log a bootstrap event before authentication.
   Setup and optional demo seeding remain deliberate editor actions.
8. Report and output totals are derived from the stored records. Report evidence,
   obstacles and next steps are returned by `getData` for refresh consistency.

## Verification and remaining boundaries

Automated tests exercise the actual Apps Script functions in a mocked Google
runtime and actual frontend helpers transpiled in isolation. They cover session
validation, pending users, authorization, request replay, mismatched replay,
server acknowledgements, script loader failure/retry, and network timeout.

The production build and targeted lint check pass. The 23 regression tests pass.
Full-repository lint still reports eight existing errors in unrelated UI
scaffolding (mixed component exports and an impure sidebar skeleton).

Browser verification used Kimi WebBridge against localhost. An unauthenticated
monitoring route redirected to login, and the real Google button rendered. A
mock identity/API, restricted to localhost, then exercised login, a failed report
submission, form retention, successful retry with the same request ID, refresh,
session restoration, saved report rendering, and logout. The two submit attempts
produced one saved mock row; after refresh the app requested getSession/getData
and showed that same report. All mocks and test session storage were removed
after this check. A screenshot is retained locally outside the repository.

These tests do not log in to a real Google account or write to the production
spreadsheet. The Google OAuth origins and backend Script Properties still need
verification in the account that owns those services. Production acceptance must
use a dedicated test account/team after Apps Script and frontend deployments.

The Vercel connector returned 403 for `webbcpapin-s-projects/babelyouthpreneur`;
the current machine has no installed Vercel CLI fallback. This patch does not
claim to verify Vercel project settings or to change the live site.

Residual work: course and phase figures remain static; attendance and scoring
buttons are incomplete; there is no report/output review UI; curation still has
its separate `no-cors` submission; assignment and approval are managed in Sheets.
The current `dosen` scope is campus-wide, not a dedicated many-to-many mentor/team
assignment. A future redesign should address these deliberately.
