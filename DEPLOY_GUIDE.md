# 🚀 GOLDENPAYS LTD - Production Deployment Guide

## Stack: Vercel + Render + MongoDB Atlas + SendGrid (100% FREE)

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)
- SendGrid account (free)

---

## STEP 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create Database

1. Go to https://cloud.mongodb.com/
2. Sign up / Log in
3. Click **"Build a Database"**
4. Select **"M0 FREE"** tier
5. Choose **AWS** provider, **eu-west-2 (London)** region
6. Cluster Name: `goldenpays-cluster`
7. Click **"Create Cluster"**

### 1.2 Create Database User

1. Go to **Database Access** (left menu)
2. Click **"Add New Database User"**
3. Username: `goldenpays`
4. Password: **Generate secure password** (save it!)
5. Database User Privileges: **Read and write to any database**
6. Click **"Add User"**

### 1.3 Whitelist IP Addresses

1. Go to **Network Access** (left menu)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy connection string:
   ```
   mongodb+srv://goldenpays:<password>@goldenpays-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password
6. Add database name after `.net/`: `goldenpays`
7. Final string:
   ```
   mongodb+srv://goldenpays:YOUR_PASSWORD@goldenpays-cluster.xxxxx.mongodb.net/goldenpays?retryWrites=true&w=majority
   ```

**✅ Save this connection string - you'll need it for Render!**

---

## STEP 2: SendGrid Setup (3 minutes)

### 2.1 Create Account

1. Go to https://sendgrid.com/
2. Sign up for **Free Plan** (100 emails/day)
3. Verify email address

### 2.2 Create API Key

1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: `goldenpays-production`
4. Permissions: **Full Access**
5. Click **"Create & View"**
6. **Copy the API key** (starts with `SG.`)
   - ⚠️ You can only see this ONCE!
   - Save it securely

### 2.3 Verify Sender Identity

1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in:
   - From Name: `GOLDENPAYS LTD`
   - From Email: `admin@goldenpays.uk` (or your domain email)
   - Reply To: Same as above
   - Company Address: Office 12, Initial Business Centre, Wilson Business Park, Manchester, M40 8WN, UK
4. Click **"Create"**
5. Check email and verify

**✅ Save your SendGrid API key!**

---

## STEP 3: Generate JWT Secret (1 minute)

Open Terminal and run:
```bash
openssl rand -base64 32
```

**✅ Save the output - this is your JWT_SECRET!**

---

## STEP 4: Deploy Backend to Render (10 minutes)

### 4.1 Prepare Repository

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

### 4.2 Create Render Service

1. Go to https://render.com/
2. Sign up / Log in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository: `goldenpays-ltd-|-corporate-tech-boutique`
5. Click **"Connect"**

### 4.3 Configure Service

**Basic Settings:**
- Name: `goldenpays-api`
- Region: **Frankfurt (EU Central)** or **London**
- Branch: `main`
- Root Directory: `server`
- Runtime: **Node**
- Build Command: `npm install`
- Start Command: `npm start`

**Plan:**
- Select **Free** plan

### 4.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables (one by one):

```env
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://goldenpays.vercel.app
MONGODB_URI=mongodb+srv://goldenpays:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/goldenpays?retryWrites=true&w=majority
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_FROM_STEP_3
JWT_EXPIRES_IN=24h
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=admin@goldenpays.uk
SENDGRID_FROM_NAME=GOLDENPAYS LTD
ADMIN_EMAIL=admin@goldenpays.uk
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 4.5 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your backend URL will be: `https://goldenpays-api.onrender.com`

**✅ Save your Render backend URL!**

### 4.6 Test Backend

Open browser:
```
https://goldenpays-api.onrender.com/api/health
```

Should return: `{"status":"ok"}`

---

## STEP 5: Deploy Frontend to Vercel (5 minutes)

### 5.1 Update Frontend Environment

1. Edit `.env.production` file
2. Update `VITE_API_BASE_URL`:
   ```env
   VITE_API_BASE_URL=https://goldenpays-api.onrender.com/api
   ```
3. Commit and push:
   ```bash
   git add .env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

### 5.2 Deploy to Vercel

1. Go to https://vercel.com/
2. Sign up / Log in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import `goldenpays-ltd-|-corporate-tech-boutique`
5. Click **"Import"**

### 5.3 Configure Project

**Framework Preset:** Vite
**Root Directory:** `./` (leave as is)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 5.4 Add Environment Variables

Click **"Environment Variables"**

Add these (copy from `.env.production`):

```env
VITE_APP_ENV=production
VITE_APP_NAME=GOLDENPAYS LTD
VITE_APP_URL=https://goldenpays.vercel.app
VITE_API_BASE_URL=https://goldenpays-api.onrender.com/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_COOKIE_CONSENT=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_COMPANY_NAME=GOLDENPAYS LTD
VITE_COMPANY_NUMBER=16227513
VITE_COMPANY_EMAIL=admin@goldenpays.uk
```

### 5.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your site will be live at: `https://goldenpays.vercel.app`

**✅ Your frontend is live!**

---

## STEP 6: Configure Custom Domain (Optional, 10 minutes)

### 6.1 Add Domain to Vercel

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add domain: `goldenpays.uk`
4. Vercel will show DNS records to add

### 6.2 Update DNS Records

In your domain registrar (e.g., Namecheap, GoDaddy):

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 6.3 Update Environment Variables

After domain is verified, update in Vercel:
```env
VITE_APP_URL=https://goldenpays.uk
```

And update Render backend:
```env
FRONTEND_URL=https://goldenpays.uk
```

---

## ✅ DEPLOYMENT COMPLETE!

### Your Live URLs:

- **Website:** https://goldenpays.vercel.app (or https://goldenpays.uk)
- **API:** https://goldenpays-api.onrender.com
- **Admin Panel:** https://goldenpays.vercel.app/#/admin/login

### Admin Credentials:

- **Email:** admin@goldenpays.uk
- **Password:** GoldenPays2026!

⚠️ **CHANGE ADMIN PASSWORD IN PRODUCTION!**

---

## 🔧 Post-Deployment Tasks

### 1. Test All Features

- ✅ Homepage loads
- ✅ All navigation links work
- ✅ Contact form submits successfully
- ✅ Email notifications arrive (check spam folder)
- ✅ Admin login works
- ✅ Inquiries appear in admin panel
- ✅ Cookie consent appears
- ✅ Legal pages display correctly

### 2. Monitor Services

- **Vercel Dashboard:** Check analytics and logs
- **Render Dashboard:** Monitor backend uptime (free plan sleeps after 15min inactivity)
- **MongoDB Atlas:** Monitor database size (512MB limit on free tier)
- **SendGrid:** Track email delivery (100/day limit)

### 3. Set Up Alerts

- **Render:** Enable email notifications for deployment failures
- **Vercel:** Enable email notifications for build failures
- **MongoDB Atlas:** Set up storage alerts at 80% capacity

---

## 📊 Free Tier Limits

| Service | Limit | Impact |
|---------|-------|--------|
| Render | Sleeps after 15min inactivity | First request takes ~30s to wake |
| MongoDB Atlas | 512MB storage | ~10,000+ inquiries |
| SendGrid | 100 emails/day | ~3,000 emails/month |
| Vercel | Unlimited bandwidth | None |

---

## 🆘 Troubleshooting

### Backend returns 500 error
- Check Render logs for errors
- Verify MongoDB connection string
- Verify environment variables are set correctly

### Contact form doesn't work
- Check Render logs for CORS errors
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Test backend directly: `https://goldenpays-api.onrender.com/api/health`

### Emails not arriving
- Check SendGrid Activity Feed
- Verify sender email is verified in SendGrid
- Check spam folder
- Verify `SENDGRID_API_KEY` is correct

### Backend is slow (first request)
- Normal behavior - Render free tier sleeps after 15min
- Backend wakes in ~30 seconds on first request
- Subsequent requests are fast

---

## 🚀 Upgrade Paths (Future)

When you need more performance:

**Backend:** Render Starter ($7/mth) - No sleep, better performance
**Database:** MongoDB M10 ($57/mth) - 10GB storage, better performance
**Email:** SendGrid Essentials ($19.95/mth) - 50,000 emails/month
**Frontend:** Vercel Pro ($20/mth) - Analytics, password protection

---

## 📞 Support

For issues with:
- **Vercel:** https://vercel.com/support
- **Render:** https://render.com/docs
- **MongoDB:** https://www.mongodb.com/cloud/atlas/support
- **SendGrid:** https://support.sendgrid.com/

---

**Built with ❤️ for GOLDENPAYS LTD**
