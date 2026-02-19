# 🚀 Local Development Setup

This guide will help you run the entire ArunaDoc stack locally with one command.

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- OpenAI API key ([Get one](https://platform.openai.com/api-keys))
- Anthropic API key ([Get one](https://console.anthropic.com/))

## Quick Start

### 1. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Start all services

```bash
docker-compose up
```

This will start:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ Rails Backend API (port 3000)
- ✅ Sidekiq Worker (background jobs)
- ✅ React Frontend (port 5173)

### 3. Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Backend Health**: http://localhost:3000/health

### 4. Create a test user

In another terminal:
```bash
docker-compose exec backend rails console
```

Then in the Rails console:
```ruby
User.create!(
  email: 'doctor@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  full_name: 'Dr. Test Doctor'
)
```

### 5. Login and test!

Go to http://localhost:5173 and login with:
- Email: `doctor@example.com`
- Password: `password123`

## Testing the AI Pipeline

1. **Create a Consultation**
   - Click "Consultations" → "New Consultation"
   - You'll need a patient first! Go to "Patients" → "Add Patient"

2. **Upload Audio**
   - Click "View" on your consultation
   - Click "Upload File" or "Record Audio"
   - Use a short audio file (under 1 minute for quick testing)

3. **Watch the Magic**
   - Page auto-refreshes every 5 seconds
   - Watch status change: Transcribing → Extracting → Generating Documents
   - Transcript appears with structured data
   - Documents appear as cards

4. **View & Approve Documents**
   - Click "View" on any document
   - Edit if needed
   - Click "Approve Document"

## Troubleshooting

### Services won't start
```bash
# Clean up and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database errors
```bash
# Reset database
docker-compose exec backend rails db:drop db:create db:migrate
```

### View logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just sidekiq
docker-compose logs -f sidekiq
```

### Backend not connecting to database
Make sure PostgreSQL is healthy:
```bash
docker-compose ps
```

Wait for postgres to show "healthy" status.

### Sidekiq jobs not processing
Check Sidekiq logs:
```bash
docker-compose logs -f sidekiq
```

Make sure Redis is running:
```bash
docker-compose ps redis
```

### Frontend can't reach backend
Check that backend is running on port 3000:
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

## Development Workflow

### Making backend changes
1. Edit files in `backend/` directory
2. Changes auto-reload (no restart needed for most changes)
3. For Gemfile changes: `docker-compose restart backend sidekiq`

### Making frontend changes
1. Edit files in `frontend/src/` directory
2. Vite hot-reloads automatically
3. For package.json changes: `docker-compose restart frontend`

### Running migrations
```bash
docker-compose exec backend rails db:migrate
```

### Accessing Rails console
```bash
docker-compose exec backend rails console
```

### Accessing database directly
```bash
docker-compose exec postgres psql -U arunadoc -d arunadoc_development
```

## Stopping Everything

```bash
# Stop services (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## What's Running Where

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 5173 | React app (Vite dev server) |
| Backend | 3000 | Rails API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Job queue |
| Sidekiq | - | Background worker (no port) |

## Next Steps

Once everything is working locally:
1. Test each feature thoroughly
2. Fix any bugs you find
3. Then we can deploy to production with confidence

## Need Help?

If something's not working:
1. Check the logs: `docker-compose logs -f`
2. Make sure all services are "healthy": `docker-compose ps`
3. Verify environment variables are set in `.env`
4. Try rebuilding: `docker-compose build --no-cache`
