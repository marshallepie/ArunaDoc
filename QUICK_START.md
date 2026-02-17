# ArunaDoc - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Start the Application
```bash
docker-compose up -d
```

This will start all services:
- ✅ Frontend (React + TypeScript)
- ✅ Backend (Rails API)
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Sidekiq background jobs

### 2. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 3. Login

Use one of these test accounts:

**Consultant Account:**
- Email: `consultant@arunadoc.com`
- Password: `Password123!`

**Secretary Account:**
- Email: `secretary@arunadoc.com`
- Password: `Password123!`

## ✅ What You Should See

1. **Login Page** - Clean, responsive login form
2. **After Login** - Dashboard showing your user information
3. **Navigation Bar** - User info and logout button
4. **User Details** - Email, role, status, GMC number (for consultants)

## 🔍 Verify Everything is Working

### Check All Services
```bash
docker-compose ps
```

Expected output:
```
NAME                  STATUS
arunadoc-backend-1    Up
arunadoc-db-1         Up (healthy)
arunadoc-frontend-1   Up
arunadoc-redis-1      Up (healthy)
arunadoc-sidekiq-1    Up
```

### Check Backend Health
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

### Check Frontend
```bash
curl -I http://localhost:5173
```

Expected: `HTTP/1.1 200 OK`

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart frontend
```

### Stop Everything
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose up -d --build frontend

# Rebuild all services
docker-compose up -d --build
```

## 📱 Testing the Full Authentication Flow

### 1. Login Test
1. Go to http://localhost:5173
2. You should see the login page
3. Enter: `consultant@arunadoc.com` / `Password123!`
4. Click "Sign in"
5. Should redirect to dashboard with user info

### 2. Protected Route Test
1. While logged out, try to access: http://localhost:5173/dashboard
2. Should redirect to login page
3. After login, dashboard should be accessible

### 3. Logout Test
1. Click "Logout" button in the navigation bar
2. Should redirect to login page
3. Try accessing dashboard again - should redirect to login

### 4. JWT Token Test (API)
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3004/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"consultant@arunadoc.com","password":"Password123!"}}' \
  | grep -i "authorization" | cut -d' ' -f2)

# 2. Use token for authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3004/api/v1/some_endpoint

# 3. Logout (revoke token)
curl -X DELETE http://localhost:3004/api/v1/auth/sign_out \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Troubleshooting

### Frontend not accessible
```bash
# Check if frontend is running
docker-compose logs frontend --tail=20

# Rebuild frontend
docker-compose up -d --build frontend
```

### Backend not responding
```bash
# Check backend logs
docker-compose logs backend --tail=50

# Restart backend
docker-compose restart backend
```

### Database connection issues
```bash
# Check database status
docker-compose ps db

# Check database logs
docker-compose logs db --tail=20

# Recreate database
docker-compose down
docker-compose up -d
```

### Port conflicts
If you get port conflict errors:
1. Check what's using the ports:
   ```bash
   lsof -i :5173  # Frontend
   lsof -i :3004  # Backend
   lsof -i :5433  # PostgreSQL
   lsof -i :6379  # Redis
   ```
2. Stop the conflicting service or change ports in `docker-compose.yml`

## 📂 Project Structure

```
ArunaDoc/
├── frontend/           # React + TypeScript app
│   ├── src/
│   │   ├── api/       # API client
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── stores/    # Zustand stores
│   │   └── types/     # TypeScript types
│   ├── .env           # Environment variables
│   └── Dockerfile.dev # Frontend Docker config
├── backend/           # Rails API
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── serializers/
│   ├── config/
│   └── db/
├── docker-compose.yml # Orchestration
└── README.md         # Full documentation
```

## 📚 Next Steps

Now that your app is running, you can:

1. **Explore the Code**
   - Check `frontend/src/pages/LoginPage.tsx` for the login UI
   - Check `frontend/src/stores/authStore.ts` for auth state
   - Check `backend/app/controllers/api/v1/auth/sessions_controller.rb` for auth logic

2. **Add New Features**
   - Create new pages in `frontend/src/pages/`
   - Add new API endpoints in `backend/app/controllers/api/v1/`
   - Create new models in `backend/app/models/`

3. **Read Documentation**
   - `AUTH_SOLUTION.md` - Authentication implementation details
   - `FRONTEND_SETUP.md` - Frontend architecture and features
   - `DEVELOPMENT_STATUS.md` - Current development status

## 🎯 What's Working

✅ **Authentication System**
- User login with email/password
- JWT token generation (15-minute expiration)
- Automatic token management
- Secure logout with token revocation
- Protected routes
- Role-based access (consultant, secretary, admin)

✅ **Frontend**
- React 19 + TypeScript
- Vite dev server with hot reload
- Tailwind CSS styling
- Zustand state management
- React Router routing
- Form validation with React Hook Form + Zod

✅ **Backend**
- Rails 7.1 API
- Devise + JWT authentication
- PostgreSQL database
- Redis cache
- Sidekiq background jobs
- Health check endpoint

✅ **Infrastructure**
- Docker containerization
- Docker Compose orchestration
- Hot reload for development
- Persistent volumes for data

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f`
2. Read the error messages carefully
3. Check `AUTH_SOLUTION.md` for authentication troubleshooting
4. Check `FRONTEND_SETUP.md` for frontend issues
5. Verify all services are healthy: `docker-compose ps`

---

**You're all set! Happy coding! 🎉**
