# Smart Rent - Development Guide

## Cursor Cloud specific instructions

### Architecture Overview

Two-tier application: InterSystems IRIS (backend/DB) + Next.js 14 frontend.

- **IRIS container** (`smartrent-iris`): ObjectScript REST API at `http://localhost:52773/api/smartrent/v1`
- **Frontend** (`/workspace/frontend`): Next.js 14 App Router, proxies `/api/iris/*` to IRIS via rewrites

### Starting Services

1. Start Docker daemon: `dockerd &>/var/log/dockerd.log &`
2. Start IRIS backend: `cd /workspace && docker compose up -d --build iris`
   - IRIS takes ~60-90s to initialize on first start. Wait for healthcheck to pass: `docker compose logs -f iris` (look for "Smart Rent: setup complete")
   - Health endpoint: `curl http://localhost:52773/api/smartrent/v1/health`
3. Start frontend dev server: `cd /workspace/frontend && IRIS_API_BASE=http://localhost:52773/api/smartrent/v1 npm run dev`
   - Runs on port 3000
   - The Docker `smartrent-frontend` container also uses port 3000 (production mode). Stop it first if running: `docker stop smartrent-frontend`

### Key Commands

| Task | Command |
|------|---------|
| Lint | `cd frontend && npm run lint` |
| Build | `cd frontend && npm run build` |
| Dev server | `cd frontend && IRIS_API_BASE=http://localhost:52773/api/smartrent/v1 npm run dev` |
| IRIS logs | `docker compose logs -f iris` |
| Full reset | `docker compose down -v && docker compose up -d --build iris` |

### Demo Accounts (auto-seeded by fixtures)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartrent.local | Admin12345! |
| Landlord | landlord@smartrent.local | Land12345! |
| Tenant | tenant@smartrent.local | Tenant12345! |

### Gotchas

- The ESLint config (`.eslintrc.json`) must exist in `frontend/` for `npm run lint` to work non-interactively. If missing, `next lint` prompts interactively and fails in CI.
- The IRIS Community Edition image (`intersystemsdc/iris-community:latest`) does NOT have `$system.Encryption.SHA512Hash()`. Use `$system.Encryption.SHAHash(512, data)` instead.
- Docker in this VM requires `fuse-overlayfs` storage driver and `iptables-legacy`. The daemon config is at `/etc/docker/daemon.json`.
- The frontend's `IRIS_API_BASE` env var must point to the IRIS REST endpoint for the Next.js rewrite proxy to work correctly in dev mode.
