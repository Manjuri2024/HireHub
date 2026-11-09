# Architecture
Browser (Next.js, Vercel) → REST + Socket.IO → Express API (Render) → MongoDB Atlas.
AI calls and Cloudinary uploads happen only in the API. JWT (7 days) in Authorization header; role checks in middleware.
Models: User, Job, Application (pipeline status), Interview, Notification.
