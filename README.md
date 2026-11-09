# HireHub

### A Smart Recruitment and Placement Management Platform

A full-stack recruitment and campus placement platform connecting students, recruiters, and college placement officers through job management, application tracking, analytics, and intelligent career assistance.

Roles: **Student**, **Recruiter**, **College Placement Officer (admin)**.
Stack: Next.js 14 + TypeScript + Tailwind + TanStack Query + React Hook Form + Zod + Recharts (frontend);
Node + Express + TypeScript + MongoDB/Mongoose + JWT + bcrypt + Socket.IO (backend);
Google Gemini via the official `@google/genai` SDK (backend only); Cloudinary + Multer for resumes.

## Project Status

HireHub has successfully passed its initial development checks.

- Frontend TypeScript typecheck: Passed
- Frontend production build: Passed
- Backend TypeScript typecheck: Passed
- Backend production build: Passed
- Backend unit tests: 2/2 passed

## Prerequisites
Node 18+ (20 recommended), a MongoDB Atlas cluster (or local MongoDB).

## Install
```bash
cd backend  && npm install
cd ../frontend && npm install
```

## Configure
```bash
cp backend/.env.example backend/.env       # set MONGODB_URI and JWT_SECRET (required)
cp frontend/.env.example frontend/.env.local
```
- `GEMINI_API_KEY` (optional, get one at https://aistudio.google.com/apikey): empty means every AI feature runs in **clearly labelled DEMO MODE** (rule-based).
- `CLOUDINARY_*` (optional): empty means resume uploads save only the file name (reported to the user).

## Run locally
```bash
cd backend && npm run seed && npm run dev      # API on :5000
cd frontend && npm run dev                     # app on :3000
```
Demo accounts (password `Password@123`): `student@hirehub.demo`, `recruiter@hirehub.demo`, `admin@hirehub.demo`.
Seed data uses fictional companies marked "(Demo)".

## Checks
```bash
cd backend && npm run typecheck && npm test
cd frontend && npm run typecheck && npm run build
```

## Deploy
1. **MongoDB Atlas**: create a free cluster, add a database user, allow Render's outbound IPs (or 0.0.0.0/0 for testing), copy the connection string into `MONGODB_URI`.
2. **Render (backend)**: New → Blueprint (uses `backend/render.yaml`) or New Web Service with root dir `backend`,
   build `npm install --include=dev && npm run build`, start `npm start`. Set env vars from `.env.example`;
   set `CLIENT_URL` to your Vercel URL. Health check: `/api/health`.
3. **Vercel (frontend)**: import the repo, set Root Directory `frontend`, add `NEXT_PUBLIC_API_URL` = your Render URL. Deploy.
4. Optionally run the seed once against Atlas: `MONGODB_URI=... npm run seed` (this wipes collections; do not do it on real data).

## API overview
`/api/auth` (register, login, me), `/api/profile` (+resume upload), `/api/jobs`, `/api/applications`,
`/api/interviews`, `/api/notifications`, `/api/analytics/placement` (admin), `/api/ai/*` (resume-analyze, skill-gap,
interview-coach, screen/:id, passport, status).

## Principles
AI never changes application status; screening is advisory. No statistics are fabricated: analytics are computed
from the database, and the landing page shows no invented numbers.
