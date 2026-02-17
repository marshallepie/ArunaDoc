# ArunaDoc Port Allocation

## Ports in Use

| Port | Service | Status | Notes |
|------|---------|--------|-------|
| **3004** | Backend API | ✅ | Changed from 3003 to avoid Grafana conflict |
| **5433** | PostgreSQL | ✅ | Changed from 5432 to avoid other project's DB |
| **6379** | Redis | ✅ | No conflict |

## Avoided Conflicts With Other Project

The following ports are used by your other project and are **avoided**:

| Port | Service (Other Project) |
|------|------------------------|
| 3000 | Coordinator (Main API) |
| 3001 | Portal (Client app) |
| 3002 | Admin (Contractor dashboard) |
| 3003 | Grafana |
| 3200 | Tempo (Tracing backend) |
| 4222 | NATS (Event bus) |
| 4317 | Tempo (gRPC - OTLP traces) |
| 4318 | Tempo (HTTP - OTLP traces) |
| 5432 | PostgreSQL (Database) |
| 8222 | NATS Monitor |

## Future Frontend Port

When the React frontend is added, we'll use:
- **5173** - Vite dev server (default, no known conflicts)

## Summary

✅ **No port conflicts** - ArunaDoc uses ports 3004, 5433, and 6379
