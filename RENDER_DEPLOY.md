# Deploy to Render - Simple Method 🚀

Render is like Netlify but supports full-stack apps. **Much simpler than Railway!**

## ✅ One-Click Deployment

Your repo now has a `render.yaml` file that makes deployment **automatic**.

### Step 1: Click This Button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/marshallepie/ArunaDoc)

**Or manually:**

1. Go to **https://render.com**
2. Sign up with GitHub (free)
3. Click **"New +"** → **"Blueprint"**
4. Connect **`marshallepie/ArunaDoc`** repo
5. Click **"Apply"**

Render will automatically:
- ✅ Create PostgreSQL database
- ✅ Create Redis cache
- ✅ Deploy backend (Rails API)
- ✅ Deploy frontend (React)
- ✅ Link everything together
- ✅ Set up environment variables
- ✅ Generate SSL certificates

**Time: 5 minutes**

---

## 🔐 Only One Thing You Need to Add

After deployment, add `RAILS_MASTER_KEY`:

### Generate RAILS_MASTER_KEY (if you don't have it)

```bash
cd backend

# Generate credentials
EDITOR=nano rails credentials:edit
# Save and exit (Ctrl+X, Y, Enter)

# Get the key
cat config/master.key
```

### Add to Render

1. Go to Render Dashboard
2. Click **"arunadoc-backend"** service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - Key: `RAILS_MASTER_KEY`
   - Value: `<paste from config/master.key>`
6. Click **"Save Changes"**

Backend will auto-redeploy with the new variable.

---

## 🎯 Initialize Database

After backend is deployed and running:

1. Go to **arunadoc-backend** service in Render
2. Click **"Shell"** tab
3. Run these commands:

```bash
rails db:migrate
rails db:seed
```

Or use Render CLI:
```bash
# Install Render CLI
brew install render

# Login
render login

# Run migrations
render shell arunadoc-backend
# Then in the shell:
rails db:migrate
rails db:seed
```

---

## 🌐 Your App URLs

After deployment completes:

- **Frontend**: `https://arunadoc-frontend.onrender.com`
- **Backend API**: `https://arunadoc-backend.onrender.com`

Login with:
- Email: `consultant@arunadoc.com`
- Password: `Password123!`

---

## 📊 What Gets Deployed

### 4 Services Created Automatically:

1. **arunadoc-db** (PostgreSQL)
   - Free tier: 1GB storage
   - Auto-backup enabled

2. **arunadoc-redis** (Redis)
   - Free tier: 25MB
   - Perfect for cache

3. **arunadoc-backend** (Rails API)
   - Free tier: 512MB RAM
   - Auto SSL/HTTPS
   - Health checks enabled

4. **arunadoc-frontend** (React)
   - Free tier: 512MB RAM
   - CDN included
   - Auto SSL/HTTPS

---

## 💰 Pricing

**Free Tier:**
- ✅ Perfect for development/MVP
- ✅ 750 hours/month per service
- ✅ Auto sleep after 15 min inactivity
- ✅ Wakes up on request (~30 seconds)

**Paid Tier ($7/month per service):**
- Always on (no sleep)
- More resources
- Faster builds

**Total free tier: $0/month** ✅

---

## 🔄 Auto-Deploy

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render detects the push and redeploys automatically!

---

## 🐛 Troubleshooting

### Backend Build Fails

1. Go to **arunadoc-backend** service
2. Click **"Logs"** tab
3. Look for error message
4. Common issues:
   - Missing `RAILS_MASTER_KEY` → Add it in Environment tab
   - Bundler error → Check `Gemfile.lock`

### Frontend Build Fails

1. Go to **arunadoc-frontend** service
2. Click **"Logs"** tab
3. Common issues:
   - Node version mismatch
   - Missing dependencies

### Database Connection Issues

1. Check `DATABASE_URL` is set correctly
2. In backend service → Environment tab
3. Should auto-populate from database service

### App Not Loading

**Free tier apps sleep after 15 minutes of inactivity.**

First request wakes it up (~30 seconds). Subsequent requests are instant.

To prevent sleep: Upgrade to paid tier ($7/month).

---

## 🚀 Custom Domain (Optional)

To use your own domain:

1. Go to frontend service
2. Click **"Settings"**
3. Scroll to **"Custom Domain"**
4. Add your domain (e.g., `arunadoc.com`)
5. Update your DNS records as instructed
6. Render handles SSL automatically

---

## 📈 Benefits of Render

✅ **Simpler than Railway** - One-click Blueprint deployment
✅ **Free tier** - Perfect for MVP
✅ **Auto-scaling** - Handles traffic spikes
✅ **Built-in SSL** - HTTPS automatic
✅ **GitHub integration** - Auto-deploy on push
✅ **Shell access** - Run migrations easily
✅ **Great UI** - Easy to navigate
✅ **Reliable** - 99.9% uptime SLA

---

## ✨ Summary

1. Click "Deploy to Render" button (or use Blueprint)
2. Wait 5 minutes for deployment
3. Add `RAILS_MASTER_KEY` to backend
4. Run database migrations
5. Your app is live! 🎉

**Way simpler than Railway. As easy as Netlify.** ✅

---

Need help? Render has great docs: https://render.com/docs
