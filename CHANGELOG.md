# Changelog

Date: 2025-09-03

## What changed
- Centralized environment validation in `config/env.js`.
- Hardened security: added `helmet`, `compression`, `morgan`, `express-rate-limit`.
- Improved session cookie security (`httpOnly`, `sameSite`, `secure` in production).
- Global error handler rendering `views/500.ejs` (added if missing).
- Added `/healthz` route for uptime checks.
- Static assets served with cache hints.
- Cloudinary pulls credentials from env and errors bubble to error handler.
- `.env.example` added with all required variables.
- Added ESLint/Prettier configs; updated README with production notes.
- Dockerfile and .dockerignore for containerized deployments.

## Compatibility
- All routes and views kept intact; existing endpoints and templates remain.
- No breaking changes expected. Ensure env vars are provided before start.

## Next steps (optional)
- Swap default MemoryStore for a production session store (Redis/Mongo).
- Add CSRF protection to admin forms after wiring templates.
- Add integration tests with supertest.
