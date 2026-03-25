# EVV Logger — Electronic Visit Verification Frontend

A modern single-page application for caregivers to manage home-visit schedules, clock in/out with GPS verification, and track care activities in real time. Built with React 19, TypeScript, and Tailwind CSS 4.

## Quick Start

### Prerequisites

- **Node.js** >= 18 and **npm** >= 9
- **Go backend** running at `http://localhost:8080` ([bluehorn-test](../bluehorn-test) repo)

### 1. Start the backend first

The frontend depends on the Go backend for all data. Start it before the frontend:

```bash
cd ../bluehorn-test    # or wherever the backend repo is
cp .env.example .env   # if first time
go run ./cmd/http
```

The backend runs at `http://localhost:8080`. Verify with: `curl http://localhost:8080/api/v1/health`

> **Note:** If the backend has `API_KEY` or `HMAC_SECRET` set in its `.env`, you must use the same values in the frontend `.env` (step 2).

### 2. Set up and run the frontend

```bash
git clone <repository-url>
cd bluehorn-test-fe
npm install
cp .env.example .env
```

Edit `.env` to match your backend credentials:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_API_KEY=<same as backend API_KEY>
VITE_HMAC_SECRET=<same as backend HMAC_SECRET>
```

> If the backend `.env` has `API_KEY` and `HMAC_SECRET` empty, leave them empty here too.

Then start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the dashboard with "Connected" in the header.

### Alternative: Run without backend (Mock Mode)

If you just want to explore the UI without setting up the backend, leave `.env` values empty:

```env
VITE_API_BASE_URL=
VITE_API_KEY=
VITE_HMAC_SECRET=
```

```bash
npm run dev
```

The app uses localStorage with seeded sample data. A "Reset" button in the header lets you restore the sample data.

### Alternative: Run with Docker

```bash
# Build (pass backend credentials as build args)
docker build \
  --build-arg VITE_API_BASE_URL=http://host.docker.internal:8080/api/v1 \
  --build-arg VITE_API_KEY=your-api-key \
  --build-arg VITE_HMAC_SECRET=your-hmac-secret \
  -t evv-logger-fe .

# Run
docker run -p 3000:80 evv-logger-fe
```

Open `http://localhost:3000`. Use `host.docker.internal` instead of `localhost` so the container can reach the backend on your host machine.

> The Docker image is multi-arch (amd64/arm64), runs nginx as non-root, and includes a healthcheck.

### Available Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR                   |
| `npm run build`   | Type-check with `tsc` then build for production  |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Run ESLint across the project                    |

---

## Tech Stack

| Category        | Technology                                               |
| --------------- | -------------------------------------------------------- |
| Framework       | React 19 with functional components and hooks            |
| Language        | TypeScript 5.9                                           |
| Build Tool      | Vite 8                                                   |
| Styling         | Tailwind CSS 4 (Vite plugin, custom theme tokens)        |
| HTTP Client     | Axios with request interceptors                          |
| Routing         | React Router 7 (BrowserRouter, nested routes)            |
| Icons           | Lucide React                                             |
| Linting         | ESLint 9 with react-hooks and react-refresh plugins      |

## Features

### Dashboard
- **Stats cards** — Total, Missed, Upcoming, In Progress, and Completed counts for the current date filter. Each card is clickable to filter the schedule list by status.
- **Date toggle** — Switch between "Today" and "All" schedules with a segmented control.
- **Refresh button** — Manually reload schedule data with a spinning indicator.
- **Empty state** — Illustrated placeholder with a call-to-action when no schedules exist.
- **Skeleton loading** — Animated placeholder cards while data is being fetched.

### Schedule Management
- **Create schedule modal** — Form with Employee ID, Caregiver Name, Patient Name, Date, Start/End Time, and Location fields. Includes inline validation error display for structured backend errors.
- **Location picker** — Type an address manually or click "My Location" to auto-detect GPS coordinates with reverse geocoding (OpenStreetMap Nominatim).
- **Schedule detail page** — Full view of a single schedule with caregiver info, employee ID, time range, location, and status.
- **Delete schedule** — Overflow menu (three-dot icon) with confirmation dialog before deletion.
- **Breadcrumb navigation** — "Back to Schedules" link on detail pages.

### Clock In / Clock Out with GPS
- **Start Visit** — Captures the caregiver's GPS coordinates via the browser Geolocation API and records clock-in time. Gracefully falls back to (0, 0) if location is denied or unavailable.
- **End Visit** — Captures GPS for clock-out. The backend enforces that all tasks must be completed or skipped before a visit can end.
- **Clock timestamps** — Displayed with relative time ("2h 15m ago") and visit duration calculation.
- **Map links** — Clock-in/out coordinates link to OpenStreetMap for quick location verification.

### Task (Care Activity) Management
- **Task list** with progress bar showing completed/total count.
- **Complete or Skip** — Mark tasks as "Done" or "Skip" (with required reason input).
- **Add task** — Inline form to add new care activities to a schedule.
- **Delete task** — Per-task delete with confirmation dialog.
- Tasks are only actionable during an in-progress visit.

### Dark Mode
- System preference detection on first visit (`prefers-color-scheme: dark`).
- Manual toggle via sun/moon icon in the header.
- Preference persisted in `localStorage` under the key `evv-theme`.
- Implemented via `ThemeContext` provider that toggles a `dark` class on `<html>`.

### Toast Notifications (Snackbar)
- Bottom-centered snackbar with animated entrance, progress bar, and auto-dismiss after 3.5 seconds.
- Three types: `success` (green), `error` (red), `info` (blue).
- Manual dismiss via close button.
- Managed by `ToastContext` provider accessible from any component via `useToast()`.

### Inline Error Handling
- Structured backend errors (field-level validation) are parsed and displayed as bullet lists.
- Conflict errors (e.g., "pending tasks remain") are rewritten into human-readable sentences.
- Network errors, 401, and 429 responses have dedicated user-friendly messages.
- Errors appear inline within the action context (not just as toasts) so users can see exactly what went wrong.

### Keyboard Shortcuts
| Key     | Action                        | Context            |
| ------- | ----------------------------- | ------------------ |
| `N`     | Open the "New Schedule" modal | Dashboard (not in input fields) |
| `Escape`| Close any open modal/dialog   | Global             |
| `Enter` | Submit reason when skipping a task | Reason input field |

### Additional UI Details
- **API health indicator** — Header shows a Wi-Fi icon with "Connected" or "Offline" status when using a real backend, with 30-second polling.
- **API Docs link** — Auto-derived from the API base URL (replaces `/api/v1` with `/docs`).
- **Mock data reset** — "Reset" button in the header when running in mock mode clears localStorage and reloads.
- **Responsive layout** — Mobile-first design with `max-w-4xl` centered container. Stats grid collapses from 5 columns to 2 on small screens.
- **Page transitions** — Fade-in animation on route changes.
- **Custom theme tokens** — Primary (blue), success (green), warning (amber), and danger (red) color palettes defined in CSS via `@theme`.

## Architecture Overview

### Adapter Pattern (Backend to Frontend)

The Go backend uses `snake_case` field names and envelope responses. The frontend uses `camelCase` TypeScript interfaces. An adapter layer in `src/api/adapters.ts` handles the translation:

```
Backend Response                    Adapter                     Frontend Types
─────────────────                   ───────                     ──────────────
{ success, data, error }     →    unwrap()               →    raw data
{ employee_id, ... }         →    adaptSchedule()        →    { employeeId, ... }
{ in_progress }              →    mapScheduleStatus()    →    "in-progress"
{ not_completed }            →    mapTaskStatus()        →    "not-completed"
```

### Mock Mode vs Real Backend

| Mode           | Condition                          | Behavior                                              |
| -------------- | ---------------------------------- | ----------------------------------------------------- |
| **Mock mode**  | `VITE_API_BASE_URL` is empty       | All data is stored in `localStorage`. No HTTP calls.  |
| **Real backend** | `VITE_API_BASE_URL` is set       | All operations go through Axios to the Go backend.    |

### Context Providers

```
<ThemeProvider>          — dark/light mode state + toggle
  <ToastProvider>        — toast queue + addToast/removeToast
    <BrowserRouter>
      <Layout>           — header, breadcrumb, health indicator
        <Routes>         — page routing
      </Layout>
    </BrowserRouter>
    <ToastContainer />   — renders toast stack (outside router)
  </ToastProvider>
</ThemeProvider>
```

### Security Layer (API Key + HMAC Signing)

When communicating with the real backend, the frontend applies two layers of authentication via Axios request interceptors:

1. **API Key** — Sent as `X-API-Key` header on every request. Configured via `VITE_API_KEY`.
2. **HMAC-SHA256 Signature** — Signs a canonical string of `METHOD\nPATH\nTIMESTAMP\nBODY` using the Web Crypto API. Sent as `X-Signature` header alongside `X-Timestamp`. Configured via `VITE_HMAC_SECRET`.

Both interceptors are conditionally applied only when their respective environment variables are set.

### Geolocation Handling

The `useGeolocation` hook wraps the browser's Geolocation API with `enableHighAccuracy: true` and a 10-second timeout. It always resolves (never rejects), falling back to coordinates `(0, 0)` so that clock-in/out actions are never blocked by location failures:

| Scenario                         | Behavior                                         |
| -------------------------------- | ------------------------------------------------ |
| Browser does not support geolocation | Falls back to `(0, 0)` with `location-unsupported` error code |
| User denies permission           | Falls back to `(0, 0)` with `location-denied` error code      |
| Location service unavailable     | Falls back to `(0, 0)` with `location-unavailable` error code |
| Request times out (>10s)         | Falls back to `(0, 0)` with `location-timeout` error code     |

## Backend Communication

### Authentication Headers

Every request to the backend includes:

| Header         | Value                                        | Purpose                        |
| -------------- | -------------------------------------------- | ------------------------------ |
| `X-API-Key`    | The value of `VITE_API_KEY`                  | Identifies the client          |
| `X-Timestamp`  | Unix epoch seconds (string)                  | Replay protection              |
| `X-Signature`  | HMAC-SHA256 hex digest                       | Request integrity verification |
| `Content-Type` | `application/json`                           | Payload format                 |

The HMAC signing string format is:

```
METHOD\nPATH\nTIMESTAMP\nBODY
```

where BODY is the JSON-stringified request body (empty string for GET/DELETE).

### API Endpoints

| Method   | Path                                  | Description                        |
| -------- | ------------------------------------- | ---------------------------------- |
| `GET`    | `/health`                             | Health check                       |
| `GET`    | `/schedules`                          | List all schedules                 |
| `GET`    | `/schedules?date=YYYY-MM-DD`          | List schedules for a specific date |
| `GET`    | `/schedules/stats`                    | Get schedule statistics            |
| `GET`    | `/schedules/:id`                      | Get schedule with tasks            |
| `POST`   | `/schedules`                          | Create a new schedule              |
| `PATCH`  | `/schedules/:id`                      | Update schedule (clock in/out)     |
| `DELETE` | `/schedules/:id`                      | Delete a schedule                  |
| `POST`   | `/schedules/:id/tasks`                | Add a task to a schedule           |
| `PATCH`  | `/schedules/:id/tasks/:taskId`        | Update task status                 |
| `DELETE` | `/schedules/:id/tasks/:taskId`        | Delete a task                      |

### Response Envelope

All backend responses use a standard envelope:

```json
{
  "success": true,
  "data": { "..." : "..." },
  "request_id": "uuid"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "EVV_VALIDATION_ERROR",
    "message": "validation failed",
    "fields": [
      { "field": "employee_id", "message": "must match format CGV-XXXXX" },
      { "field": "end_time", "message": "must be after start_time" }
    ]
  }
}
```

### Error Code Reference

| Backend Error Code           | Frontend Message                                                  |
| ---------------------------- | ----------------------------------------------------------------- |
| `EVV_VALIDATION_ERROR`       | "Please fix the following:" + bullet list of field errors         |
| `EVV_NOT_FOUND`              | "The requested item could not be found."                          |
| `EVV_CONFLICT`               | Context-specific rewrite (e.g., pending tasks, schedule conflict) |
| `EVV_BAD_REQUEST`            | "The request was invalid."                                        |
| `EVV_INVALID_REQUEST_BODY`   | "The submitted data could not be read."                           |
| `EVV_INTERNAL_ERROR`         | "An unexpected error occurred. Please try again."                 |
| HTTP 401                     | "Your session is not authorized. Please check your credentials."  |
| HTTP 429                     | "Too many requests. Please wait a moment and try again."          |
| Network error                | "Unable to reach the server. Please check your connection."       |

## Environment Variables

| Variable             | Required | Description                                                           |
| -------------------- | -------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | No       | Backend API URL with version prefix (e.g., `http://localhost:8080/api/v1`). Leave empty for mock mode. |
| `VITE_API_KEY`       | No       | API key for backend authentication. Must match the backend's `API_KEY` env var. |
| `VITE_HMAC_SECRET`   | No       | HMAC signing secret for request integrity. Must match the backend's `HMAC_SECRET` env var. |

**Important**: Vite environment variables are embedded into the JavaScript bundle at build time. They cannot be changed at runtime. For Docker deployments, pass them as `--build-arg` values during `docker build`.

## Project Structure

```
bluehorn-test-fe/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite config with React + Tailwind plugins
├── tsconfig.json                 # TypeScript project references
├── tsconfig.app.json             # App-level TS config
├── tsconfig.node.json            # Node-level TS config (Vite config)
├── eslint.config.js              # ESLint flat config
├── .env.example                  # Environment variable template
├── Dockerfile                    # Multi-stage Docker build (Node + Nginx)
├── nginx.conf                    # Nginx SPA routing config
├── .dockerignore                 # Docker build context exclusions
├── public/                       # Static assets (favicon)
└── src/
    ├── main.tsx                  # React DOM entry point
    ├── App.tsx                   # Root component with routing
    ├── index.css                 # Tailwind imports, theme tokens, animations
    ├── vite-env.d.ts             # Vite client type declarations
    ├── types/
    │   └── index.ts              # Core TypeScript interfaces (Schedule, Task, etc.)
    ├── api/
    │   ├── client.ts             # Axios instance, API Key + HMAC interceptors
    │   ├── adapters.ts           # snake_case → camelCase adapters, envelope unwrapper
    │   ├── schedules.ts          # API functions (fetch, create, update, delete)
    │   └── mockData.ts           # Seed data for mock/localStorage mode
    ├── contexts/
    │   ├── ThemeContext.tsx       # Dark/light mode provider
    │   └── ToastContext.tsx       # Toast notification provider
    ├── hooks/
    │   └── useGeolocation.ts     # Browser Geolocation API hook with fallback
    ├── utils/
    │   ├── date.ts               # Date formatting (relative time, duration, display)
    │   └── error.ts              # Backend error → user-friendly message parser
    ├── pages/
    │   ├── HomePage.tsx           # Dashboard with stats, schedule list, filters
    │   └── ScheduleDetailPage.tsx # Schedule detail, clock in/out, tasks, delete
    └── components/
        ├── Layout.tsx             # App shell: header, breadcrumb, health indicator
        ├── ScheduleCard.tsx       # Schedule list item card
        ├── StatCard.tsx           # Dashboard stat card (clickable filter)
        ├── StatusBadge.tsx        # Color-coded status pill
        ├── SkeletonCard.tsx       # Loading placeholder card
        ├── TaskItem.tsx           # Task row with complete/skip/delete actions
        ├── AddTaskForm.tsx        # Inline form to add new tasks
        ├── CreateScheduleModal.tsx# Modal form for creating schedules
        ├── LocationPicker.tsx     # GPS auto-detect + address input with map preview
        ├── ConfirmDialog.tsx      # Reusable confirmation modal (danger/warning)
        ├── ActionError.tsx        # Inline error display with dismiss
        └── ToastContainer.tsx     # Snackbar notification renderer
```
