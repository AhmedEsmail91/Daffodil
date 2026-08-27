# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Express 5 + Sequelize/PostgreSQL API for the Daffodil Clinic telemedicine platform. This is a standalone git repository; it serves two separate frontend repos (`../Admin`, a staff dashboard, and `../Client`, a patient-facing app) but has no dependency on either — do not assume their code is reachable or importable from here.

## Commands

```bash
npm run dev              # nodemon, TZ=Africa/Cairo, requires Postgres + Redis running
npm start                 # production start
npm run migrate           # sequelize-cli db:migrate
npm run migrate:undo
npm run migrate:undo:all
npm run seed:all
npm run seed:undo:all
npm run create             # db:create
npm run drop               # db:drop
```
No test suite is configured (`npm test` is a stub). No lint script.

## Architecture

- Entry point `index.js` creates a plain `http` server around the Express `app`. There is no realtime/WebSocket layer — Socket.IO has been fully removed.
- `src/routes/index.js` is the bootstrap: authenticates the DB connection, applies `utils/serverBasicConfig.js` (helmet/cors/cookie-parser/compression), mounts role-scoped route groups, then a 404 handler and the global error handler.
- Routes are split **by role**, not by resource: `src/routes/{admin,doctor,patient,shared}/`, each with its own `index.routes.js` wiring sub-routers (appointments, chat, schedules, scope, specialty, device tokens, etc.) under that role's prefix. When adding an endpoint, decide which role(s) need it and add it to the matching route group(s) rather than a flat `/api/*` tree.
- `src/modules/<Domain>/` holds controller + Joi validation per domain: `Appointments`, `Auth`, `Doctor`, `Doctor-Schedules`, `Patient`, `QA`, `RolePermissions`, `Scope`, `Specialty`, `chat`, `user`, `DeviceToken`. Controllers hold business logic; routes stay thin.
- `database/models/` is grouped by concern (`app/`, `auth/`, `permissions/`) rather than flat. Migrations live in `database/migrations/`, seeders in `database/seeders/`.
- Auth: Passport (local + Google OAuth20) issuing JWTs stored in **httpOnly cookies** — this is the intentional, correct pattern; don't "fix" it toward header/localStorage tokens.
- Roles/permissions are cached in Redis; permission JSON is parsed from cache in `src/middlewares/auth.js`.
- `config/` holds environment-driven singletons: `dbConnection.js`, `redis.js`, `passport.js`, `logger.js` (Winston + daily rotate), `firebase.js` (Firebase Admin SDK init, guarded so placeholder env values don't crash boot).
- File uploads: Multer → Firebase Cloud Storage (no local `/uploads` disk storage or static-served uploads route anymore).
- Chat is REST, not realtime sockets: message history via REST endpoints (`src/modules/chat/`, mounted from `src/routes/admin/chat.route.js` and `src/routes/patient/chat.route.js`); new-message notification goes out via Firebase Cloud Messaging (FCM) data pushes that make the client refetch — not a live Firestore/RTDB listener. Device→token mapping lives in the `device_tokens` table (`src/modules/DeviceToken/`, `src/routes/shared/deviceToken.route.js`), supporting multiple devices per user.

## Migration status (in progress)

This repo is mid-refactor: removing Socket.IO in favor of REST + FCM, and moving uploads to Firebase Storage. Work is being driven by engineering judgment rather than a fixed spec, and the last work session was interrupted mid-verification — **check current file state before assuming anything below is finished or broken**.

Done so far:
- Deleted `socket-server.js`, `src/socket/**`, `utils/Auth-Passport/**`, `utils/passport-auth-strategies/**`, and other dead/duplicate code.
- `index.js` rewritten to a plain `http.createServer(app)`.
- `config/firebase.js` added (Admin SDK, env-driven, boot-safe against placeholder creds).
- Chat rebuilt as REST (`src/modules/chat/chat.controller.js` + `chat.validation.js`), wired into admin/patient chat routes.
- New `device_tokens` migration + model + `src/modules/DeviceToken/` + `src/routes/shared/deviceToken.route.js` for FCM registration.
- `package.json`: `socket.io` removed, `firebase-admin` added; dead deps pruned (`crypto`, `morgan`, `express-session`, `passport-facebook`, `passport-jwt`, `@turf/turf`, `body-parser`).
- `.gitignore` updated to exclude `credentials.json` (a Google OAuth client secret file, previously untracked-but-unignored).
- Various opportunistic bug fixes (role/permission gate on doctor routes, `findByPk`/`findOne` misuse, appointment FK `onDelete` consistency, cookie `secure` flag, log level) — verify the specific file before trusting this list as exhaustive or complete.

Not yet verified / possibly incomplete (the last session was stopped mid-test, right after confirming login worked with the new JWT payload shape and cookie behavior):
- Admin chat list, device-token registration, and message-pin endpoints were being exercised but not confirmed working.
- Full boot test (server starts cleanly, no leftover references to deleted socket code) should be re-run before relying on this API.

## Working conventions

- Never modify git config in this repo.
- Do not create git commits unless explicitly asked — leave work as uncommitted changes.
- `credentials.json` contains a real Google OAuth client secret and must stay out of git (already gitignored) — never print its contents or commit it.
- `.env` holds real and placeholder secrets (DB, JWT, SMS providers, Google/Facebook OAuth, Redis, Firebase) — refer to keys by name only, never log or paste values.
