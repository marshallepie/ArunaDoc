# ArunaDoc

**Secure private-practice clinical automation platform for UK consultants**

ArunaDoc enables consultation recording, AI transcription, structured clinical note generation, automated letter drafting, secure clinical communication, insurance billing via Healthcode, secure patient messaging, and full audit logging & compliance.

## 🏗️ Architecture

- **Backend:** Rails 7.1 API (Ruby 3.2.2)
- **Frontend:** React 18 + Vite + TypeScript
- **Database:** PostgreSQL 16
- **Cache/Jobs:** Redis 7 + Sidekiq
- **Infrastructure:** Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/marshallepie/ArunaDoc.git
   cd ArunaDoc
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Verify health**
   ```bash
   curl http://localhost:3004/health
   ```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T...",
  "database": "connected",
  "redis": "connected"
}
```

## 📋 Services

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3004
- **PostgreSQL:** localhost:5433
- **Redis:** localhost:6379

## 🛠️ Development Commands

### View logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f sidekiq
```

### Rails console
```bash
docker-compose exec backend rails console
```

### Run migrations
```bash
docker-compose exec backend rails db:migrate
```

### Run tests
```bash
docker-compose exec backend rspec
```

### Stop services
```bash
docker-compose down
```

## 📚 Documentation

- **[FRD.md](FRD.md)** - Functional Requirements Document
- **[SETUP_PLAN.md](SETUP_PLAN.md)** - Detailed implementation plan
- **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** - Current development status and next steps
- **[AUTH_SOLUTION.md](AUTH_SOLUTION.md)** - Authentication implementation details

## 🔑 Authentication

### Test Users

The system comes with pre-seeded test users:

- **Consultant:** consultant@arunadoc.com / Password123!
- **Secretary:** secretary@arunadoc.com / Password123!

### Using the Application

1. **Access the frontend:**
   ```bash
   open http://localhost:5173
   ```

2. **Login with test credentials**
   - Email: consultant@arunadoc.com
   - Password: Password123!

3. **JWT tokens:**
   - Automatically managed by the frontend
   - 15-minute expiration
   - Stored in localStorage
   - Revoked on logout

### API Authentication

```bash
# Login
curl -i -X POST http://localhost:3004/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"consultant@arunadoc.com","password":"Password123!"}}'

# Use the token from Authorization header
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:3004/api/v1/some_endpoint

# Logout
curl -X DELETE http://localhost:3004/api/v1/auth/sign_out \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 🔐 Security

- PHI encryption with Lockbox
- JWT authentication with Devise
- Role-based authorization with Pundit
- Full audit trail with Paper Trail
- CORS protection
- Rate limiting with Rack::Attack

## 📦 Tech Stack

### Backend
- Rails 7.1 (API-only mode)
- PostgreSQL 16
- Redis 7
- Sidekiq 7.2

### Key Gems
- **Auth:** devise, devise-jwt
- **Authorization:** pundit
- **Encryption:** lockbox, blind_index
- **Audit:** paper_trail
- **API:** rack-cors, faraday
- **Testing:** rspec-rails, factory_bot_rails, faker

### Frontend
- React 18
- Vite 7
- TypeScript
- React Router DOM (routing)
- Zustand (state management)
- TanStack Query (data fetching)
- React Hook Form + Zod (form validation)
- Axios (API client)
- Radix UI + Tailwind CSS (UI components)

## 🗺️ Project Status

✅ **Phase 1a - Foundation (Completed)**
- Docker environment setup
- Rails API generated
- Core gems installed
- Database and Redis connected
- Health check endpoint

✅ **Phase 1b - Authentication (Completed)**
- User authentication (Devise + JWT)
- JWT token generation and revocation
- Login/Logout endpoints
- User roles (consultant, secretary, admin)
- User status management

✅ **Phase 1c - Frontend (Completed)**
- React + TypeScript + Vite setup
- Authentication UI (Login page)
- Protected routes
- JWT token management
- API client with interceptors
- Zustand auth store
- Dashboard page

📋 **Phase 2 - Planned**
- Core data models (consultations, patients)
- API endpoints for consultations
- Authorization policies
- Basic consultation workflow

## 📝 License

Proprietary - All rights reserved

## 👥 Contributors

- Marshall Epie (@marshallepie)

---

**Generated with [Claude Code](https://claude.com/claude-code)**
