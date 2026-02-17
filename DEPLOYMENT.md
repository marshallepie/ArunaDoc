# ArunaDoc Production Deployment Guide

## 🚀 Quick Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Domain name configured (for SSL)
- Server with minimum 2GB RAM, 2 CPU cores, 20GB disk
- Ports 80 and 443 open

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/ArunaDoc.git
cd ArunaDoc

# Copy environment template
cp .env.production.example .env.production
```

### 2. Generate Secrets

```bash
# Generate Rails secrets
docker run --rm ruby:3.2.2-alpine sh -c "gem install rails && rails secret" >> secrets.txt
docker run --rm ruby:3.2.2-alpine sh -c "gem install rails && rails secret" >> secrets.txt
docker run --rm ruby:3.2.2-alpine sh -c "gem install rails && rails secret" >> secrets.txt

# Generate strong passwords
openssl rand -base64 32  # For POSTGRES_PASSWORD
openssl rand -base64 32  # For REDIS_PASSWORD
```

### 3. Configure Environment

Edit `.env.production` with your secrets:

```env
# Database
POSTGRES_PASSWORD=<paste_from_secrets>

# Redis
REDIS_PASSWORD=<paste_from_secrets>

# Rails
SECRET_KEY_BASE=<paste_first_rails_secret>
JWT_SECRET_KEY=<paste_second_rails_secret>

# IMPORTANT: Generate RAILS_MASTER_KEY separately
RAILS_MASTER_KEY=<see_below>
```

#### Generate RAILS_MASTER_KEY

```bash
# Create master key
docker-compose run --rm backend rails credentials:edit

# This creates config/master.key
# Copy the contents to RAILS_MASTER_KEY in .env.production
```

### 4. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 5. Initialize Database

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend rails db:create db:migrate

# Seed initial data (creates admin user, test users)
docker-compose -f docker-compose.prod.yml exec backend rails db:seed

# Or load from backup
docker-compose -f docker-compose.prod.yml exec backend rails db:schema:load
```

### 6. Verify Deployment

```bash
# Check backend health
curl http://your-domain.com/api/health

# Check frontend
curl http://your-domain.com/

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend
```

## 🔒 SSL/HTTPS Setup with Let's Encrypt

### 1. Install Certbot

```bash
# Create certbot directory
mkdir -p nginx/certbot/www nginx/certbot/conf

# Get initial certificate
docker run --rm \
  -v ./nginx/certbot/conf:/etc/letsencrypt \
  -v ./nginx/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.com \
  -d www.your-domain.com
```

### 2. Update Nginx Configuration

Uncomment the HTTPS server block in `nginx/conf.d/app.conf` and update:

```nginx
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

### 3. Add SSL Volumes to docker-compose.prod.yml

```yaml
nginx:
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/conf.d:/etc/nginx/conf.d:ro
    - ./nginx/certbot/conf:/etc/nginx/ssl:ro
    - ./nginx/certbot/www:/var/www/certbot:ro
```

### 4. Reload Nginx

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

### 5. Auto-Renewal

Add to crontab:

```bash
0 0 * * * docker run --rm -v ./nginx/certbot/conf:/etc/letsencrypt -v ./nginx/certbot/www:/var/www/certbot certbot/certbot renew --quiet && docker-compose -f /path/to/ArunaDoc/docker-compose.prod.yml restart nginx
```

## 📊 Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f sidekiq
```

### Database Backups

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres arunadoc_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres arunadoc_production < backup_20260217_120000.sql
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend rails db:migrate
```

### Scale Services

```bash
# Scale Sidekiq workers
docker-compose -f docker-compose.prod.yml up -d --scale sidekiq=3

# Scale backend instances (requires load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

## 🔐 Security Checklist

- [ ] All environment variables set with strong passwords
- [ ] RAILS_MASTER_KEY securely stored (not in git)
- [ ] SSL/TLS certificates installed and auto-renewing
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Rate limiting enabled (via nginx)
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Regular security updates scheduled

## 🚨 Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs <service>

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Restart service
docker-compose -f docker-compose.prod.yml restart <service>
```

### Database connection issues

```bash
# Check database is healthy
docker-compose -f docker-compose.prod.yml ps db

# Test connection
docker-compose -f docker-compose.prod.yml exec backend rails console
> ActiveRecord::Base.connection.execute("SELECT 1")
```

### Frontend not loading

```bash
# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

### 502 Bad Gateway

- Backend service may be down or unhealthy
- Check backend logs: `docker-compose -f docker-compose.prod.yml logs backend`
- Verify backend health: `curl http://backend:3000/health` from nginx container

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX index_users_on_email ON users(email);
CREATE INDEX index_consultations_on_user_id ON consultations(user_id);

-- Analyze tables
ANALYZE users;
ANALYZE consultations;
```

### Redis Configuration

For better performance, update redis command in docker-compose.prod.yml:

```yaml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Nginx Caching

Add to nginx configuration for static asset caching:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;
```

## 🌐 Deployment Platforms

### AWS EC2

1. Launch EC2 instance (t3.medium or larger)
2. Configure security groups (ports 80, 443, 22)
3. Attach Elastic IP
4. Install Docker and Docker Compose
5. Follow deployment steps above

### Digital Ocean Droplet

1. Create droplet with Docker image (2GB RAM minimum)
2. Point domain to droplet IP
3. SSH into droplet
4. Follow deployment steps above

### Google Cloud Run (Alternative)

Use separate deployment strategy for Cloud Run:
- Backend: Deploy as Cloud Run service
- Frontend: Deploy to Cloud Storage + Cloud CDN
- Database: Cloud SQL for PostgreSQL
- Redis: Memorystore

### Heroku (Simplified)

For quick deployment without Docker:

```bash
# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/ruby

# Add PostgreSQL and Redis
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Deploy
git push heroku main
```

## 📞 Support

For deployment assistance:
- Check GitHub issues: https://github.com/yourusername/ArunaDoc/issues
- Review documentation: See FRONTEND_SETUP.md, AUTH_SOLUTION.md
- Contact: support@arunadoc.com

---

**Production Checklist**: Before going live, ensure all security items are checked and backups are configured.
