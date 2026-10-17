# Google OAuth and Apps Script Session Setup

Phase 2 uses Google Identity Services directly. Supabase is no longer part of the login path.

## 1. Create the Google OAuth client

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** with application type **Web application**.

Add these JavaScript origins:

```text
https://babelyouthpreneur.id
https://www.babelyouthpreneur.id
https://babelyouthpreneur.vercel.app
http://localhost:3000
```

Google Identity Services returns an ID token in a popup, so this implementation does not require a redirect URI. Copy only the **Client ID**. Do not use or publish a Client Secret in this static React app.

## 2. Configure Apps Script

1. Open the spreadsheet's Apps Script project.
2. Replace the monitoring backend with the current `apps-script/monitoring-backend.gs` from this repository. Keep only one `doGet` and one `doPost` function in the entire Apps Script project.
3. Open **Project Settings** -> **Script Properties**.
4. Add:

```text
GOOGLE_OAUTH_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

5. Run `bootstrap_` once from the editor and authorize Spreadsheet and Drive access.
6. Deploy a **new version** as a Web App with **Execute as: Me** and **Who has access: Anyone**. The public endpoint is acceptable because every private action now requires a server-validated session.
7. Keep the Web App URL and use it as `appsScriptUrl` in `public/monitoring/config.js`.

## 3. Configure the frontend

Set the same Client ID in `public/monitoring/config.js`:

```js
window.MONITORING_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec',
  googleOAuthClientId: 'your-client-id.apps.googleusercontent.com',
}
```

The Client ID is expected to be browser-visible. Never place the Client Secret, Script Properties, Google Drive credentials, or administrator credentials in this file.

## 4. Activate a user

After a user registers, the administrator must review `Registrations`, then set the matching `AppUsers` row to:

```text
role: mahasiswa | ketua_tim | dosen | umkm | juri | admin_panitia | super_admin | kampus_viewer | pimpinan_viewer
status: active
```

For scoped access, also set `team_id`, `campus_id`, or `umkm_id` as appropriate. Login is rejected until both `status=active` and a valid role are present.

## 5. Verification checklist

1. Visit `/#/monitoring` in an incognito window. It must redirect to `/#/login`.
2. Register a test account. It should enter `Registrations` and create a pending `AppUsers` record.
3. Attempt Google login before approval. It must be rejected.
4. Activate the account and assign a role in `AppUsers`.
5. Sign in with the same Google account. The requested Google ID token is verified by Apps Script and an 8-hour opaque session is created.
6. Refresh the monitoring page. The valid session should restore.
7. Sign out, then use the browser Back button. The private page must redirect to login because the server session has been revoked.
8. Change a `team_id` in the request through browser tools. The backend must reject out-of-scope writes.

## Deployment order

1. Deploy Apps Script.
2. Set the Client ID in `public/monitoring/config.js`.
3. Run `npm run build`.
4. Deploy to Vercel.
5. Complete the verification checklist on `https://babelyouthpreneur.id`.

## Login and monitoring reliability update

The 17 October 2026 update keeps Google Identity Services and the existing
spreadsheet. Deploy the Apps Script changes **before** deploying the frontend.

- Normal login, session restoration, monitoring reads, and submissions no longer
  call `bootstrap_`. Run `setupMonitoring` from the Apps Script editor if the
  spreadsheet has not been initialized.
- Setup creates missing tabs and appends missing headers; existing records are
  retained. It inserts demo records only when the Script Property
  `ENABLE_DEMO_SEED` is explicitly `true`. Leave that property absent in production.
- The `WeeklyReports` and `Outputs` schemas add `request_id`. Setup appends this
  column without rewriting existing data. Repeating an unchanged request with the
  same identifier and user returns the original row under a script lock.
- Private API actions use POST. `?action=test` remains a public, read-only health
  check. The old GET examples for private endpoints are obsolete.
- Sessions rejected by the backend have a `code` of `SESSION_REQUIRED`,
  `SESSION_EXPIRED`, or `ACCOUNT_DISABLED`. The frontend clears only the session
  corresponding to the failed request. Network errors do not masquerade as expiry.
- Report and output counters now count stored records rather than the older
  manually seeded `Teams.reports` and `Teams.outputs` values.
- The report form has an explicit week, activity, progress, obstacles, next plan,
  and evidence link. An unsuccessful save leaves the form contents on screen.
  Confirmed rows use the server's ID. These are not offline drafts: navigating
  away from an unsaved form or refreshing can still discard its contents.

Local regression verification is `npm test`; type checking and bundling are
`npm run build`. Run the production checklist with a dedicated test account and
test team after both deployments. Include a failed connection, unchanged retry,
refresh, expired session, and out-of-scope team submission.
