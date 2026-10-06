# Deploying the USAII LMS

## Why Netlify shows the page but nobody can sign in

This LMS is **not a static website**. It has two halves:

1. A React front end, which Vite builds into `dist/`
2. An **Express server** that handles `/api/...` — sign-in, courses, progress, questions, feedback — and stores everything in `data/db.json`

Netlify (and GitHub Pages, and any "static site" host) only serves the first half. The uploaded files appear, the sign-in page renders, and then every `/api/auth/login` request returns the `index.html` page instead of a token — so the sign-in never completes. Nothing is wrong with your credentials or the build; the back end simply is not running there.

**A Node host is required.** Render, Railway, Fly.io, Heroku, or any VPS will work. Render is the quickest.

## Option A — Render (recommended)

1. Push this folder to a GitHub repository.
2. On https://render.com choose **New → Web Service** and pick the repository.
3. Render reads `render.yaml` and fills everything in. If you prefer to type it:
   - **Runtime:** Node
   - **Build command:** `npm install --include=dev && npm run build`
   - **Start command:** `npx tsx server/index.ts`
   - **Environment:** `NODE_ENV=production`, `NODE_VERSION=22`, `AUTH_SECRET` set to a long random string (the older name `SESSION_SECRET` also works), and `UPLOAD_DIR=/opt/render/project/src/data/uploads` so uploads live on the persistent disk
4. Deploy. The live URL works for anyone you share it with.

`--include=dev` matters: the build needs Vite and TypeScript, which are development dependencies.

## Option B — Railway

New Project → Deploy from GitHub. Railway detects Node. Set the same start command and `NODE_ENV=production`. Railway supplies `PORT` automatically and the server uses it.

## About the data

Learner progress lives in `data/db.json` on the server's disk.

- **With a persistent disk** (the `disk:` block in `render.yaml`, or a Railway volume) everything survives restarts and redeploys.
- **Without one**, the file system is wiped on every restart and the demo data is re-seeded. That is fine for a preview you are showing people; it is not fine for real learners.

Uploaded files (activity submissions, study plan PDFs, course media, and the "How to Navigate the USAII® LMS?" video) are stored the same way and need the same disk. `render.yaml` sets `UPLOAD_DIR` to a folder on that disk; on other hosts, point `UPLOAD_DIR` at your volume.

## Sign-in accounts on the deployed site

The seeded accounts work exactly as they do locally:

| Role | Email | Password |
|---|---|---|
| Learner | alex.rivera@enterprise.com | Learner@2026 |
| Instructor | instructor@usaii.org | Instructor@2026 |

**Change these before sharing the link widely.** Each person can change their own password from the profile menu (top right). Instructors can set a new password for any learner on **Learners & Access**.

## If you must stay on Netlify

The API would have to be rewritten as Netlify Functions and the JSON database replaced with a hosted database, because serverless functions cannot keep a writable file. That is a re-architecture, not a setting. Pointing Netlify's DNS at a Render service is far less work if you want to keep a Netlify-managed domain.
