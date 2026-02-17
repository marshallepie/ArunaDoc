# ArunaDoc Rails API + React SPA Setup Plan

## Context

Setting up a greenfield Rails + React application for ArunaDoc - a secure clinical automation platform for UK private practice consultants. The system handles sensitive patient health information (PHI) and must comply with GDPR and NHS data security standards.

**User Requirements:**
- Rails API + React SPA (separate services)
- PostgreSQL database
- Vite + TypeScript for React
- Docker configuration included
- Focus on MVP (Phase 1) features

## Architecture Overview

**Monorepo Structure:**
```
/Users/marshallepie/Desktop/dev/ArunaDoc/
├── backend/              # Rails 7.1 API-only mode
├── frontend/             # React 18 + Vite + TypeScript SPA
├── docker-compose.yml    # Multi-container orchestration
├── FRD.md               # Functional requirements
└── SETUP_PLAN.md        # This document
```

**Technology Stack:**
- **Backend:** Rails 7.1 (API-only), PostgreSQL 16, Redis 7, Sidekiq
- **Frontend:** React 18, Vite, TypeScript, Zustand, TanStack Query, Radix UI + Tailwind
- **Infrastructure:** Docker Compose, nginx (production)
- **Security:** Devise + JWT, Pundit, Lockbox encryption, Paper Trail auditing

## Implementation Steps

### 1. Install Rails & Create Backend

**Install Rails:**
```bash
gem install rails -v '~> 7.1.0'
```

**Create Rails API:**
```bash
cd /Users/marshallepie/Desktop/dev/ArunaDoc
rails new backend --api --database=postgresql --skip-test --skip-bundle
cd backend
```

**Add Critical Gems to Gemfile:**
- `rack-cors` - CORS for React SPA
- `devise` - User authentication
- `devise-jwt` - JWT tokens for API
- `pundit` - Authorization policies
- `lockbox` & `blind_index` - PHI encryption
- `paper_trail` - Audit trail
- `sidekiq` - Background jobs
- `faraday` - HTTP client for Egress/Healthcode APIs
- `aws-sdk-s3` & `shrine` - Audio file storage
- `rack-attack` - Rate limiting
- `rspec-rails`, `factory_bot_rails`, `faker` - Testing

**Run bundle install:**
```bash
bundle install
```

### 2. Configure Rails API

**Enable CORS (`config/initializers/cors.rb`):**
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('FRONTEND_URL', 'http://localhost:5173')
    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization'],
      max_age: 600
  end
end
```

**Configure API-only mode (`config/application.rb`):**
```ruby
config.api_only = true
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore
```

**Setup database (`config/database.yml`):**
Use PostgreSQL with connection pooling, environment-based configuration.

### 3. Setup Authentication (Devise + JWT)

**Install Devise:**
```bash
rails generate devise:install
rails generate devise User
```

**Configure Devise for JWT (`config/initializers/devise.rb`):**
```ruby
config.jwt do |jwt|
  jwt.secret = Rails.application.credentials.dig(:jwt_secret_key)
  jwt.dispatch_requests = [['POST', %r{^/api/v1/auth/sign_in$}]]
  jwt.revocation_requests = [['DELETE', %r{^/api/v1/auth/sign_out$}]]
  jwt.expiration_time = 15.minutes.to_i
end
```

**Add role enum to User model:**
```ruby
enum role: { consultant: 0, secretary: 1, admin: 2 }
enum status: { active: 0, inactive: 1, suspended: 2 }
```

**Create JWT denylist model:**
```bash
rails g model JwtDenylist jti:string exp:datetime
rails db:migrate
```

### 4. Create Core Models (MVP Phase 1)

**Priority order:**
1. `Patient` - Core patient records (encrypted PHI)
2. `Consultation` - Consultation sessions with status state machine
3. `Transcript` - Audio transcription storage
4. `StructuredExtraction` - AI-extracted clinical data (JSONB)
5. `ClinicalDocument` - Generated documents (SOAP notes, letters)
6. `Invoice` - Invoice records
7. `BillingSubmission` - Healthcode submissions
8. `SecureMessage` - Egress-sent messages
9. `PatientMessage` - Patient portal messages
10. `AuditEntry` - Audit logging

**Key model features:**
- **Patient:** Lockbox encryption for `first_name`, `last_name`, `date_of_birth`, `nhs_number`, `email`, `phone`
- **Consultation:** State machine (recording → transcribing → extracting → drafting → review → approved → completed)
- **ClinicalDocument:** Versioning with approval workflow
- **All models:** Paper Trail for audit tracking

**Generate models:**
```bash
rails g model Patient first_name:string last_name:string date_of_birth:date nhs_number:string email:string phone:string consultant:references
rails g model Consultation patient:references consultant:references consultation_date:datetime consultation_type:integer status:integer
rails g model Transcript consultation:references full_text:text speaker_segments:jsonb
rails g model StructuredExtraction consultation:references data:jsonb
rails g model ClinicalDocument consultation:references patient:references document_type:integer status:integer content:text created_by:references approved_by:references approved_at:datetime
rails g model Invoice consultation:references patient:references consultant:references total_amount:decimal status:integer insurance_membership_number:string authorization_number:string
rails g model BillingSubmission invoice:references healthcode_submission_id:string status:integer healthcode_response:jsonb
rails g model SecureMessage consultation:references patient:references sender:references recipient_email:string subject:string body:text status:integer egress_message_id:string
rails g model PatientMessage patient:references consultant:references category:integer status:integer subject:string body:text parent_message:references
rails g model AuditEntry user:references auditable:references{polymorphic} action:integer metadata:jsonb
rails db:migrate
```

### 5. Setup API Routes with Versioning

**Configure routes (`config/routes.rb`):**
```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth routes
      devise_for :users, controllers: {
        sessions: 'api/v1/auth/sessions',
        registrations: 'api/v1/auth/registrations'
      }

      # Resource routes
      resources :patients
      resources :consultations do
        resources :transcripts
        resources :clinical_documents
      end
      resources :invoices
      resources :billing_submissions
      resources :patient_messages
      resources :secure_messages
      resources :audit_entries, only: [:index, :show]
    end
  end

  get '/health', to: 'health#index'
end
```

### 6. Create Controllers with Authorization

**Create base controller with authentication:**
```ruby
# app/controllers/api/v1/base_controller.rb
module Api
  module V1
    class BaseController < ApplicationController
      include Pundit::Authorization
      before_action :authenticate_user!
      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: :index
    end
  end
end
```

**Create resource controllers:**
- `Api::V1::PatientsController`
- `Api::V1::ConsultationsController`
- `Api::V1::ClinicalDocumentsController`
- `Api::V1::InvoicesController`
- `Api::V1::PatientMessagesController`

### 7. Setup Security & Encryption

**Configure Lockbox (`config/initializers/lockbox.rb`):**
```ruby
Lockbox.master_key = Rails.application.credentials.dig(:lockbox, :master_key)
```

**Add encryption to models:**
```ruby
# app/models/patient.rb
encrypts :first_name, :last_name, :date_of_birth, :nhs_number, :email, :phone
blind_index :nhs_number, :email
```

**Configure Rack::Attack for rate limiting (`config/initializers/rack_attack.rb`):**
```ruby
Rack::Attack.throttle('api/ip', limit: 300, period: 5.minutes) do |req|
  req.ip if req.path.start_with?('/api')
end
```

**Setup Pundit policies:**
```ruby
# app/policies/clinical_document_policy.rb
class ClinicalDocumentPolicy < ApplicationPolicy
  def approve?
    user.consultant? && record.consultation.consultant == user
  end
end
```

### 8. Create Frontend with Vite

**Create React app:**
```bash
cd /Users/marshallepie/Desktop/dev/ArunaDoc
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**Install dependencies:**
```bash
npm install react-router-dom zustand @tanstack/react-query axios date-fns zod react-hook-form @hookform/resolvers
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-tabs
npm install tailwindcss clsx tailwind-merge
npm install -D @types/node vitest @testing-library/react @testing-library/jest-dom
```

**Initialize Tailwind:**
```bash
npx tailwindcss init -p
```

### 9. Configure React Frontend

**Setup Vite config (`vite.config.ts`):**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

**Create folder structure:**
```
src/
├── components/
│   ├── common/
│   ├── auth/
│   ├── consultation/
│   ├── documents/
│   └── layout/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── consultations/
│   └── patients/
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   └── consultation.service.ts
├── stores/
│   └── authStore.ts
├── hooks/
├── types/
└── utils/
```

### 10. Setup API Client & Authentication

**Create Axios instance (`src/services/api.ts`):**
```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      // Attempt token refresh
      const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
      useAuthStore.getState().setAccessToken(data.access_token)
      return api(originalRequest)
    }
    return Promise.reject(error)
  }
)

export default api
```

**Create auth store (`src/stores/authStore.ts`):**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
```

**Create protected route:**
```typescript
// components/auth/ProtectedRoute.tsx
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}
```

### 11. Setup Docker Configuration

**Create `docker-compose.yml` in root:**
```yaml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: arunadoc_development
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: rails server -b 0.0.0.0
    volumes:
      - ./backend:/app
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/arunadoc_development
      REDIS_URL: redis://redis:6379/0

  sidekiq:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: bundle exec sidekiq
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/arunadoc_development
      REDIS_URL: redis://redis:6379/0

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:3000

volumes:
  postgres_data:
```

**Create backend Dockerfile (`backend/Dockerfile.dev`):**
```dockerfile
FROM ruby:3.2.2-alpine

RUN apk add --no-cache build-base postgresql-dev tzdata nodejs yarn

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]
```

**Create frontend Dockerfile (`frontend/Dockerfile.dev`):**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### 12. Environment Variables

**Create `.env.example` in root:**
```
# Backend
DATABASE_URL=postgres://postgres:postgres@localhost:5432/arunadoc_development
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your_jwt_secret_here
LOCKBOX_MASTER_KEY=your_lockbox_master_key_here
EGRESS_API_KEY=your_egress_api_key
HEALTHCODE_API_KEY=your_healthcode_api_key
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

**Generate master keys:**
```bash
cd backend
rails credentials:edit  # Set jwt_secret_key and lockbox:master_key
```

### 13. Initialize Database

```bash
cd backend
rails db:create
rails db:migrate
rails db:seed  # Create sample consultant user
```

### 14. Create Sample Seed Data

**Create seed data (`db/seeds.rb`):**
```ruby
# Create consultant user
User.create!(
  email: 'consultant@arunadoc.com',
  password: 'password123',
  role: :consultant,
  status: :active
)

puts "Created consultant user: consultant@arunadoc.com / password123"
```

## Critical Files Created

1. **`backend/Gemfile`** - All backend dependencies
2. **`backend/config/routes.rb`** - API endpoint structure
3. **`backend/app/models/user.rb`** - Authentication foundation
4. **`frontend/src/services/api.ts`** - API client with JWT handling
5. **`docker-compose.yml`** - Development infrastructure

## Verification Steps

1. **Backend health check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Database connectivity:**
   ```bash
   cd backend
   rails console
   > User.count
   ```

3. **Authentication flow:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/sign_in \
     -H "Content-Type: application/json" \
     -d '{"user":{"email":"consultant@arunadoc.com","password":"password123"}}'
   ```

4. **Frontend loads:**
   - Open http://localhost:5173
   - Login page renders
   - Login redirects to dashboard

5. **Docker services:**
   ```bash
   docker-compose up -d
   docker-compose ps  # All services healthy
   ```

6. **Run tests:**
   ```bash
   cd backend && bundle exec rspec
   cd frontend && npm run test
   ```

## Security Checklist

- [ ] JWT secret configured via Rails credentials
- [ ] Lockbox master key configured
- [ ] CORS restricted to frontend URL only
- [ ] Rate limiting enabled (Rack::Attack)
- [ ] HTTPS forced in production (SSL config)
- [ ] Patient PHI fields encrypted (Lockbox)
- [ ] All models have Paper Trail audit logging
- [ ] Pundit authorization on all controllers
- [ ] Session timeout configured (15 minutes)
- [ ] No credentials in `.env` files (use `.env.example`)

## Next Phase After Setup

Once the foundation is working:
1. Implement audio recording frontend component
2. Integrate AI transcription service (OpenAI Whisper API)
3. Build document generation with approval workflow
4. Integrate Egress API for secure messaging
5. Integrate Healthcode API for billing
6. Build patient portal login and messaging

## Estimated Timeline

- **Initial setup:** 2-3 days
- **Core models & migrations:** 2 days
- **Authentication & authorization:** 2 days
- **Frontend foundation:** 2-3 days
- **Docker configuration:** 1 day
- **Testing & verification:** 1 day

**Total:** ~2 weeks for complete foundation
