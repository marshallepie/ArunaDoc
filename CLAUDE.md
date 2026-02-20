# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArunaDoc is a secure clinical automation platform for UK private practice consultants. It handles Protected Health Information (PHI) and must comply with GDPR and NHS data security standards. The system enables:

- Audio recording and AI transcription of consultations
- AI-generated clinical documentation (SOAP notes, letters)
- Approval workflow for all AI-generated content
- Secure communication via Egress API
- Insurance billing via Healthcode API
- Patient portal for secure messaging

**Critical:** All AI-generated content must be approved by a consultant before being sent. No automatic sending is allowed.

## Architecture

**Monorepo Structure:**
- `/backend` - Rails 7.1 API-only application
- `/frontend` - React 19 + Vite + TypeScript SPA
- `docker-compose.yml` - Multi-container orchestration at root

**Technology Stack:**
- **Backend:** Rails 7.1, PostgreSQL 16, Redis 7, Sidekiq
- **Frontend:** React 19, Vite, TypeScript, Zustand (state), TanStack Query (data fetching), Radix UI + Tailwind CSS
- **Authentication:** Devise + JWT with token revocation
- **Security:** Lockbox (PHI encryption), Paper Trail (audit logging), Rack::Attack (rate limiting), Pundit (authorization)
- **AI Integration:** OpenAI API (Whisper for transcription), Anthropic API (document generation)
- **External APIs:** Egress (secure messaging), Healthcode (billing)

## Development Commands

### Docker Operations
```bash
# Start all services (PostgreSQL, Redis, Rails backend, Sidekiq, React frontend)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f sidekiq
docker-compose logs -f frontend
```

### Backend (Rails)
```bash
# Rails console
docker-compose exec backend rails console

# Run migrations
docker-compose exec backend rails db:migrate

# Create/reset database
docker-compose exec backend rails db:create
docker-compose exec backend rails db:reset

# Generate a model
docker-compose exec backend rails generate model ModelName field:type

# Generate a controller
docker-compose exec backend rails generate controller api/v1/ModelName

# View routes
docker-compose exec backend rails routes

# Run RSpec tests
docker-compose exec backend rspec

# Run specific test file
docker-compose exec backend rspec spec/models/user_spec.rb

# Run Sidekiq jobs manually (already running in container)
docker-compose exec backend bundle exec sidekiq
```

### Frontend (React)
```bash
# Development server (runs automatically in Docker, or locally)
cd frontend && npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Core Data Model

**Consultation Processing Pipeline:**
1. `Consultation` created with `processing_status: pending`
2. Audio uploaded → `processing_status: transcribing` → `TranscriptionJob` enqueued
3. Transcript created → `processing_status: extracting` → `ExtractionJob` enqueued
4. Structured data extracted → `processing_status: generating_documents` → `DocumentGenerationJob` enqueued
5. Documents generated → `processing_status: ready_for_review`
6. Consultant reviews/edits/approves → `processing_status: approved`

**Key Models:**
- `User` - Consultants, secretaries, admins (roles: `consultant`, `secretary`, `admin`)
- `Patient` - PHI encrypted using Lockbox (`first_name`, `last_name`, `date_of_birth`, `nhs_number`, `email`, `phone`)
- `Consultation` - Central entity linking patient, consultant, transcript, and documents
- `Transcript` - Audio transcription with speaker segments (JSONB)
- `ClinicalDocument` - Generated documents (SOAP notes, letters) with approval workflow
- `AuditEntry` - Paper Trail audit logs for all model changes

**State Machines:**
- `Consultation.status`: `scheduled`, `in_progress`, `completed`, `cancelled`
- `Consultation.processing_status`: `pending`, `transcribing`, `extracting`, `generating_documents`, `ready_for_review`, `approved`, `failed`
- `ClinicalDocument.status`: `draft`, `pending_approval`, `approved`, `rejected`

## API Structure

All API endpoints are versioned under `/api/v1`.

**Authentication:**
- `POST /api/v1/auth/sign_in` - Login (returns JWT in Authorization header)
- `DELETE /api/v1/auth/sign_out` - Logout (adds JWT to denylist)
- `POST /api/v1/auth/sign_up` - Register (disabled in production)

**Resources:**
- `/api/v1/patients` - Patient CRUD
- `/api/v1/consultations` - Consultation CRUD
  - `POST /api/v1/consultations/:id/upload_audio` - Upload consultation audio
  - `/api/v1/consultations/:id/documents` - Clinical documents for consultation
  - `POST /api/v1/consultations/:id/documents/:doc_id/approve` - Approve document

**Authorization:**
- All controllers inherit from `Api::V1::BaseController` which includes Pundit
- Policies enforce consultant-only access to their own patients/consultations
- Use `authorize @resource` before actions and `policy_scope(Model)` for index actions

## Frontend Architecture

**State Management:**
- `authStore` (Zustand) - User authentication state, JWT token
- TanStack Query for server state management and caching
- React Hook Form + Zod for form validation

**API Client:**
- Axios instance in `src/lib/axios.ts` with JWT interceptor
- Automatically adds `Authorization: Bearer <token>` header
- Handles 401 responses by redirecting to login

**Routing:**
- React Router v7 with protected routes
- `/login` - Authentication page
- `/dashboard` - Main dashboard (consultant overview)
- `/consultations` - Consultation list
- `/consultations/:id` - Consultation detail with document viewer
- `/patients` - Patient list
- `/calendar` - Upcoming consultations
- `/documents` - Document library
- `/settings` - User settings

**Key Components:**
- `AudioRecorder` - Browser-based audio recording for consultations
- `AudioUploader` - File upload for pre-recorded audio
- `DocumentViewer` - Side-by-side view of transcript, structured data, and generated documents with edit/approve workflow
- `ProtectedRoute` - Auth guard for authenticated routes

## Security Requirements

**PHI Handling:**
- Patient data (`first_name`, `last_name`, `date_of_birth`, `nhs_number`, `email`, `phone`) must be encrypted using Lockbox
- Always use blind indexes for searchable encrypted fields (`nhs_number`, `email`)
- Never log PHI data

**Authentication & Authorization:**
- JWT tokens expire after 15 minutes (refresh handled by frontend)
- Revoked JWTs stored in `jwt_denylists` table
- Rate limiting via Rack::Attack (300 requests per 5 minutes per IP)
- Pundit policies enforce consultant-only access to their own data

**Audit Trail:**
- Paper Trail automatically logs all model changes
- Critical actions (approvals, sends) create explicit `AuditEntry` records
- Include user, action, timestamp, and metadata

**External API Keys:**
- Stored in Rails credentials: `rails credentials:edit`
- Never commit API keys to git
- Use environment variables in Docker: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

## Background Jobs (Sidekiq)

Jobs are enqueued automatically during consultation workflow:

- `TranscriptionJob` - Calls OpenAI Whisper API to transcribe audio
- `ExtractionJob` - Uses Anthropic API to extract structured clinical data from transcript
- `DocumentGenerationJob` - Generates clinical documents (SOAP notes, letters) using Anthropic API

**Job Monitoring:**
- Sidekiq web UI not currently enabled (add `mount Sidekiq::Web => '/sidekiq'` to routes)
- View logs: `docker-compose logs -f sidekiq`
- Retry failed jobs manually in Rails console

## External API Integration

**OpenAI (Transcription):**
- Gem: `ruby-openai`
- Model: `whisper-1` for audio transcription
- Input: Audio file uploaded by user
- Output: Full text transcript with speaker diarization

**Anthropic (Document Generation):**
- Gem: `anthropic` (via Faraday)
- Model: Claude 3.5 Sonnet for clinical document generation
- Input: Transcript + structured extraction
- Output: SOAP notes, GP letters, patient letters

**Egress (Secure Messaging):**
- Not yet implemented (Phase 2)
- All clinical communications must use Egress API (never standard email)
- Track message status: draft, sent, delivered, opened, failed, expired

**Healthcode (Billing):**
- Not yet implemented (Phase 2)
- Submit invoices with CCSD procedure codes, insurance details
- Track invoice status: draft, submitted, accepted, rejected, paid

## Testing

**Backend (RSpec):**
- Model specs: `spec/models/`
- Request specs: `spec/requests/` (API endpoint integration tests)
- Job specs: `spec/jobs/`
- Use FactoryBot for test data: `create(:user, role: :consultant)`
- Use Faker for realistic test data

**Frontend:**
- Testing framework not yet configured (Vitest recommended)

## Environment Variables

Create `.env` file in root (use `.env.example` as template):

```bash
# Backend
DATABASE_URL=postgres://arunadoc:password@postgres:5432/arunadoc_development
REDIS_URL=redis://redis:6379/0
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
VITE_API_URL=http://localhost:3000
```

**Ports:**
- Frontend: 5173
- Backend: 3000
- PostgreSQL: 5432 (internal), 5432 (external - may conflict, check `docker-compose.yml`)
- Redis: 6379

## Common Development Workflows

**Adding a new model:**
1. Generate migration: `docker-compose exec backend rails g model ModelName field:type`
2. Add associations and validations in model file
3. Add Paper Trail: `has_paper_trail` in model
4. Add Lockbox encryption if PHI: `encrypts :field_name`
5. Run migration: `docker-compose exec backend rails db:migrate`
6. Create Pundit policy: `app/policies/model_name_policy.rb`
7. Generate controller: `docker-compose exec backend rails g controller api/v1/ModelName`
8. Add routes to `config/routes.rb`

**Adding a new API endpoint:**
1. Add route to `config/routes.rb` under `namespace :api/:v1`
2. Create/update controller in `app/controllers/api/v1/`
3. Inherit from `Api::V1::BaseController` for auth and authorization
4. Use `authorize @resource` before actions
5. Render JSON responses: `render json: @resource, status: :ok`
6. Handle errors: `render json: { error: 'Message' }, status: :unprocessable_entity`

**Adding a new frontend page:**
1. Create page component in `src/pages/`
2. Add route to `src/App.tsx` inside `<ProtectedRoute>` if authenticated
3. Create API service method in `src/services/api.ts`
4. Use TanStack Query for data fetching: `useQuery`, `useMutation`
5. Update navigation in `src/components/layout/DashboardLayout.tsx`

**Debugging backend:**
1. Add `binding.pry` (requires `pry` gem) or `debugger` in code
2. Attach to container: `docker attach arunadoc-backend-1`
3. View logs: `docker-compose logs -f backend`
4. Rails console: `docker-compose exec backend rails console`

**Debugging frontend:**
1. Browser DevTools (React DevTools extension recommended)
2. Check Network tab for API calls
3. Check Console for errors
4. Use `console.log` or React DevTools for state inspection

## Project Phases

**Phase 1 (MVP - Current):**
- ✅ Basic authentication (Devise + JWT)
- ✅ Patient management
- ✅ Consultation creation
- ✅ Audio recording/upload
- ✅ AI transcription (OpenAI Whisper)
- ✅ Structured data extraction (Anthropic Claude)
- ✅ Document generation (SOAP notes, letters)
- ✅ Document approval workflow
- ⏳ Egress integration
- ⏳ Healthcode integration
- ⏳ Patient portal

**Phase 2:**
- Multiple document templates
- Secretary/admin roles with delegation
- Payment tracking
- Remote consultation billing toggle
- Advanced search

**Phase 3:**
- Multi-consultant tenancy
- Patient document vault
- Smart billing automation
- Analytics and reporting

## Code Style and Conventions

**Backend (Rails):**
- Follow Ruby style guide (use RuboCop if configured)
- Controllers are thin, models are fat
- Use service objects for complex business logic (e.g., `ConsultationProcessingService`)
- Use ActiveJob for background tasks
- Serialize responses with custom serializers (e.g., `UserSerializer`)

**Frontend (React):**
- Functional components with hooks (no class components)
- TypeScript strict mode
- File naming: PascalCase for components, camelCase for utilities
- Import aliases: `@/` for src root, `@components/`, `@services/`, etc.
- Prefer composition over prop drilling (use Zustand for global state)

**Database:**
- Use migrations for all schema changes
- Add indexes for foreign keys and frequently queried fields
- Use JSONB for flexible structured data (e.g., `speaker_segments`, `structured_data`)
- Encrypted columns have `_ciphertext` suffix (Lockbox convention)
