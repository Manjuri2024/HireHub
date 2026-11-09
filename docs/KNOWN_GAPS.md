# Known gaps and unverified items
- Not verified: dependency install, `next build`, backend `tsc`, `vitest` (no network in build sandbox).
- Resume text is auto-extracted from PDFs only (pdf-parse); Word files need pasted text.
- UI components are hand-written Tailwind (shadcn-style), not generated via the shadcn CLI.
- AI results render as formatted JSON rather than designed result cards.
- No password reset, email verification, rate limiting, or refresh tokens.
- Admin placement drives/eligibility rules and the full pipeline kanban board are simplified (status dropdown, per-job list).
- Placement analytics are scoped to the admin's college name (exact match); the Placement Command Center is the admin overview + analytics.
- Real-time: notifications push via Socket.IO; other pages refetch on action.
- Landing page omits marketing statistics deliberately (no real data to support them).
