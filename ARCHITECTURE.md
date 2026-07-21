# Babel Youthpreneur - Architecture and Migration Plan

## Purpose

Babel Youthpreneur will evolve from a public program website with a monitoring prototype into a Google Powered Learning Management System (LMS). The evolution must preserve the public website, the UMKM curation form, and monitoring records already stored in Google Sheets.

The target stack remains deliberately low-cost and institution-friendly:

```text
React + Vite on Vercel
        |
Google Identity Services (Google OAuth)
        |
Google Apps Script API
        |
Google Sheets database + Google Drive storage + Google Forms + Google Docs
```

## Existing Architecture

### Frontend

- React 19, TypeScript, Vite, Tailwind CSS, React Router, Radix UI, and Lucide are available.
- `HashRouter` owns five routes: public pages plus `/monitoring`.
- The public program site is componentized into `src/sections` and `src/pages`.
- The complete monitoring application, including login, data access, dashboard, learning, attendance, progress, output, challenge, and reports, is concentrated in `src/monitoring/MonitoringPage.tsx`.
- Monitoring configuration is loaded by a global script at `public/monitoring/config.js`.
- Development fallback data is embedded in the monitoring page. It includes program-like records and must never be mistaken for production data.

### Backend and Data

- A single Google Apps Script web app supports the older UMKM curation form and monitoring actions using an `action` parameter.
- One Google Spreadsheet stores operational tabs such as `AppUsers`, `Teams`, `UMKM`, `LearningModules`, `WeeklyReports`, `Outputs`, `ChallengeScores`, `Registrations`, and `AuditLogs`.
- Google Drive is used as the intended storage destination for photo evidence and exported CSV files.
- The backend bootstraps tabs and seeds data when the `Teams` tab is empty.

### Current Authentication

- The frontend contains a Supabase client for Google OAuth, but the active monitoring configuration intentionally has no Supabase URL or anonymous key because the previous project URL could not resolve.
- When OAuth is not configured, the monitoring screen exposes role-selection buttons for demo use. This is not an authentication mechanism.
- The Apps Script backend only verifies a Supabase access token when Supabase constants are filled. With the active blank constants, a submitted email can be used to look up a user. This is unsafe for real data.

## Audit Summary

| Area | Condition | Main risk | Priority |
| --- | --- | --- | --- |
| Login and role access | Google login is unavailable; demo role selection remains available | A visitor can view role-specific demo screens and backend email lookup is not identity proof | P0 |
| Route protection | `/monitoring` is one page, not protected routes | Direct navigation does not enforce authenticated session or role | P0 |
| Backend authorization | Some action-level role checks exist, but depend on email when OAuth is disabled | A caller can impersonate an email for protected actions | P0 |
| Monitoring code | One large component combines UI, domain logic, API calls, and mock data | Hard to test, extend, and review safely | P1 |
| Learning model | Courses and modules exist as monitoring fields only | No enrollment, materials, per-student progress, assignment, or certificate lifecycle | P1 |
| Data model | Sheets work for an MVP but use free-form records and one broad bootstrap seed | Data consistency, auditability, and multi-year reporting will degrade | P1 |
| Evidence storage | Links and a photo field exist | No standard Drive folder policy, file validation, sharing policy, or verification queue | P1 |
| Testing | No first-party automated tests detected | Login, permission, and data regressions can reach production unnoticed | P1 |
| Build/deploy | Vite builds and Vercel hosts the static frontend | Build success does not prove authentication or Apps Script behavior | P1 |

## Target Architecture

### Application Structure

```text
src/
  app/                 App shell, providers, route configuration
  auth/                Google Identity, session, protected and role routes
  components/          Shared UI components only
  layouts/             Public, dashboard, and role layouts
  features/
    admin/             Users, course management, analytics
    student/           Learning dashboard, progress, submissions
    instructor/        Course authoring, review, learner monitoring
    monitoring/        Teams, UMKM, weekly progress, evidence
    courses/           Course catalogue, modules, materials, enrollment
    assignments/       Google Forms assignments and review state
    certificates/      Certificate state and download links
    reports/           Role-scoped exports
  services/            Typed Apps Script API client and Drive URL helpers
  hooks/               Reusable application hooks
  types/               Domain types and API contracts
  data/                Explicitly labelled development fixtures only
  utils/               Validation, dates, formatting
```

Public program pages remain outside the dashboard layout. The LMS and monitoring routes will be split by role:

```text
/
/login
/student/dashboard
/student/courses/:courseId
/student/courses/:courseId/modules/:moduleId
/instructor/dashboard
/admin/dashboard
/admin/users
/admin/courses
/monitoring
/unauthorized
```

`ProtectedRoute` will require a valid server session. `RoleBasedRoute` will enforce allowed roles for every private route. Sidebar visibility is only a usability feature; the API remains the authorization authority.

### Google-First Authentication

Supabase is removed from the required authentication path. Google Identity Services becomes the only login provider for this MVP.

1. The user selects **Continue with Google**.
2. Google Identity Services returns a Google ID token for the configured OAuth client ID.
3. The browser sends that ID token only in a POST body to Apps Script action `loginWithGoogle`.
4. Apps Script verifies the token with Google, validates issuer, expiration, and audience against `GOOGLE_OAUTH_CLIENT_ID`, then reads `AppUsers`.
5. Only an `active` user with an allowed role receives a random, short-lived application session.
6. The browser stores only the opaque session identifier in `sessionStorage`; user profile data is refreshed from the API. No password is ever stored by the application.
7. Each private Apps Script action resolves the session server-side and checks the role and relevant team/course scope.
8. Logout revokes the server session and clears `sessionStorage`. Expired or invalid sessions redirect to `/login`.

The Google OAuth client ID is public configuration. Client secrets, spreadsheet IDs intended to remain private, Drive folder IDs, and administrator credentials must never be shipped to the browser. Apps Script Script Properties will hold backend-only configuration.

### API Boundaries

Apps Script remains one web app initially, but becomes modular internally:

```text
backend/
  Api.gs                doGet/doPost and response helpers
  AuthService.gs        Google token verification and sessions
  UserService.gs        user and role management
  CourseService.gs      courses, modules, materials, enrollment
  ProgressService.gs    learning and weekly monitoring progress
  AssignmentService.gs  assignment and Google Forms integration
  DriveService.gs       folder and file policy
  CertificateService.gs Docs template and PDF generation
  ReportService.gs      scoped CSV exports
  Validation.gs         input validation and authorization guards
  Repository.gs         Sheet read/write helpers
  Bootstrap.gs          initial schema creation only
```

There will still be exactly one `doGet` and one `doPost` in the Apps Script project.

## Target Google Sheet Schema

The current spreadsheet can be retained. Existing tabs are preserved and migrated with identifiers, not overwritten.

| Existing tab | Target tab / decision |
| --- | --- |
| `AppUsers` | Retain as `USERS` compatible source; add `photo`, `updated_at`, and migration marker when needed |
| `Courses` | Retain and normalize as `COURSES` |
| `LearningModules` | Migrate to `MODULES` with deterministic module order |
| none | Add `MATERIALS`, `ENROLLMENTS`, `MODULE_PROGRESS`, `ASSIGNMENTS`, `ASSIGNMENT_SUBMISSIONS`, `CERTIFICATES`, and `SESSIONS` |
| `Teams`, `TeamMembers`, `UMKM`, `Campuses` | Retain for program-monitoring scope |
| `WeeklyReports`, `Outputs`, `ChallengeScores`, attendance tabs | Retain, add ownership, verification, and update timestamps where absent |
| `Registrations` | Retain as the registration and approval queue |
| `AuditLogs` | Retain; capture actor, action, target, outcome, and safe metadata |

Core LMS records:

```text
USERS: user_id, email, name, photo, role, status, campus_id, team_id, umkm_id, created_at, updated_at
COURSES: course_id, title, description, thumbnail_drive_file_id, instructor_id, drive_folder_id, status, created_at
MODULES: module_id, course_id, title, module_order, description, created_at
MATERIALS: material_id, module_id, type, title, drive_file_id, url, duration_minutes, visibility, created_at
ENROLLMENTS: enrollment_id, course_id, user_id, status, enrolled_at
MODULE_PROGRESS: progress_id, user_id, course_id, module_id, status, opened_at, completed_at
ASSIGNMENTS: assignment_id, course_id, title, google_form_url, due_at, status
ASSIGNMENT_SUBMISSIONS: submission_id, assignment_id, user_id, response_id, status, submitted_at, reviewer_note
CERTIFICATES: certificate_id, user_id, course_id, drive_file_id, certificate_url, issued_at
SESSIONS: session_id, user_id, token_hash, expires_at, revoked_at, created_at
```

Use UUID-style IDs generated by Apps Script. Never use sheet row numbers as identifiers.

## Drive and Forms Policy

Drive storage is organized by program year and entity:

```text
Babel Youthpreneur 2026/
  01_Peserta/
  02_Tim/[Kampus]_[Nama Tim]/Minggu_01 ... Minggu_N/Challenge/Final_Report/
  03_UMKM/
  04_Dokumentasi/
  05_Laporan/
  06_Sertifikat/
  07_LMS/[Course]/[Module]/
```

Apps Script creates folders only after the related record exists. Files are private by default, named deterministically, restricted by role, and referenced by Drive file ID in Sheets. Upload allow-lists, file-size limits, and verification status are mandatory before public sharing.

Google Forms remains the assessment surface for quizzes and assignments. The Forms response ID, not an unverified public link alone, becomes the submission reference. Google Docs templates create certificates only after server-side completion checks.

## Refactoring and Migration Plan

### Phase 1 - Baseline and safety

1. Keep public routes and existing curation form unchanged.
2. Add this architecture document and a typed domain/API contract.
3. Mark or remove demo role selection from production builds.
4. Introduce the Google Identity and Apps Script session contract before enabling private LMS routes.
5. Add a non-destructive migration function that creates only missing columns/tabs and logs changes.

### Phase 2 - Auth and routes

1. Build `AuthProvider`, `useAuth`, `ProtectedRoute`, `RoleBasedRoute`, login, logout, unauthorized, and not-found screens.
2. Replace Supabase-dependent client code with Google Identity Services.
3. Add Apps Script `loginWithGoogle`, `getSession`, and `logout` actions with server-side authorization.
4. Disable all data reads and writes unless a valid session is present.

### Phase 3 - Split monitoring and LMS features

1. Move hardcoded monitoring data into explicit development fixtures.
2. Extract typed API service, dashboard shell, team/UMKM features, learning features, and report features.
3. Implement student, instructor, and admin dashboards from real scoped API responses.
4. Add empty, loading, error, and unauthorized states to every remote-data view.

### Phase 4 - Learning and program operations

1. Build courses, modules, Drive materials, enrollment, and module progress.
2. Add weekly progress/evidence verification, assignment/Forms linking, challenges, and scoped exports.
3. Add certificate automation after completion logic is tested.

### Phase 5 - Quality and production readiness

1. Add unit tests for validation and route guards; integration tests for Apps Script actions; browser tests for the core role flows.
2. Add input limits, request throttling, audit logs, backups, and privacy review.
3. Remove seed personal-looking data from production initialization and use clearly labelled fixtures only in development.

## Security Rules

- No password authentication is implemented or stored by this product.
- Never grant a role from a query string, form field, local storage, or a frontend button.
- Every state-changing request must use a verified server session and resolve user email/role from that session.
- A student can only read or write their enrollment, assigned team, and permitted UMKM records.
- Instructors can only manage assigned courses and learners; admins manage all data; viewers remain read-only.
- Browser-visible configuration may contain only the Google OAuth client ID and public API URL.
- Apps Script configuration belongs in Script Properties; do not commit credentials into `.gs`, `.env`, or `public/config.js`.
- Validate all strings, URLs, filenames, MIME types, file sizes, IDs, dates, and numeric scores at the backend boundary.
- Keep Drive files private until an authorized workflow explicitly shares them.
- Create daily spreadsheet backup/versioning and log destructive administrative changes.

## Acceptance Criteria for the First Production Release

- A new user cannot access a dashboard until Google identity and admin approval are both valid.
- A role change in the browser cannot grant access because every backend action rechecks the session.
- A student cannot read another team's data by editing a request.
- A page refresh restores only a valid unexpired application session.
- Logout revokes the session and browser back navigation cannot reload private data.
- Course materials, weekly reports, outputs, assignments, and certificates are scoped and traceable to their owners.
- `npm run build`, lint, API contract tests, and browser role-flow tests pass before Vercel deployment.

## Current Release Decision

The current monitoring implementation is suitable only as a controlled demo. It must not be used for private participant, lecturer, UMKM, or operational data until Phase 2 authentication and server-side session authorization are complete.
