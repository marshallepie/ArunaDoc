# ArunaDoc

**Secure private-practice clinical automation platform for UK consultants**

ArunaDoc enables consultation recording, AI transcription, structured clinical note generation, automated letter drafting, secure clinical communication, insurance billing via Healthcode, secure patient messaging, and full audit logging & compliance.

## 🏗️ Architecture

- **Backend:** Rails 7.1 API (Ruby 3.2.2)
- **Frontend:** React 18 + Vite + TypeScript (planned)
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

- **Backend API:** http://localhost:3004
- **PostgreSQL:** localhost:5433
- **Redis:** localhost:6379

## 🛠️ Development Commands

### View logs
```bash
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

### Frontend (Planned)
- React 18
- Vite
- TypeScript
- Zustand (state management)
- TanStack Query
- Radix UI + Tailwind CSS

## 🗺️ Project Status

✅ **Phase 1a - Foundation (Completed)**
- Docker environment setup
- Rails API generated
- Core gems installed
- Database and Redis connected
- Health check endpoint

🔄 **Phase 1b - In Progress**
- User authentication (Devise + JWT)
- Core data models
- API endpoints
- Authorization policies

📋 **Phase 1c - Planned**
- Frontend setup
- Authentication UI
- Basic consultation workflow

## 📝 License

Proprietary - All rights reserved

## 👥 Contributors

- Marshall Epie (@marshallepie)

---

**Generated with [Claude Code](https://claude.com/claude-code)**
