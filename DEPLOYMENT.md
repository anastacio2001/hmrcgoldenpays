# GOLDENPAYS LTD - Production Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the GOLDENPAYS corporate platform to production using:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Express)
- **Database**: MongoDB Atlas (optional - currently using in-memory storage)

---

## 📦 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - GOLDENPAYS LTD production ready"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: **Vite**
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   
3. **Set Environment Variables** (Vercel Dashboard → Settings → Environment Variables)
   ```
   VITE_APP_ENV=production
   VITE_APP_URL=https://goldenpays.uk
   VITE_API_BASE_URL=https://api.goldenpays.uk/api
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_ENABLE_ANALYTICS=true
   ```

4. **Custom Domain**
   - Go to Vercel Dashboard → Settings → Domains
   - Add `goldenpays.uk` and `www.goldenpays.uk`
   - Update DNS records with your domain provider

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - SSL certificate is provisioned automatically

---

## 🖥️ Backend Deployment (Railway)

### Prerequisites
- Railway account (https://railway.app)
- MongoDB Atlas account (optional)

### Steps

1. **Create new Railway project**
   - Go to https://railway.app/new
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to `server/`

2. **Set Environment Variables** (Railway Dashboard → Variables)
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://goldenpays.uk
   JWT_SECRET=<generate-secure-random-string>
   SENDGRID_API_KEY=<your-sendgrid-api-key>
   EMAIL_FROM=noreply@goldenpays.uk
   ADMIN_EMAIL=admin@goldenpays.uk
   MONGODB_URI=<optional-mongodb-atlas-uri>
   ```

3. **Generate JWT Secret**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Railway will auto-deploy on push to main branch
   - Get your Railway URL: `https://<project-name>.railway.app`

5. **Custom Domain (Optional)**
   - Go to Railway Dashboard → Settings → Domains
   - Add custom domain: `api.goldenpays.uk`
   - Update DNS with CNAME record

---

## 📧 Email Configuration (SendGrid)

### Setup SendGrid

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Verify sender email: `noreply@goldenpays.uk`

2. **Create API Key**
   - Dashboard → Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy API key to Railway environment variables

3. **Verify Domain** (Optional but recommended)
   - Dashboard → Settings → Sender Authentication
   - Authenticate your domain `goldenpays.uk`
   - Add DNS records (SPF, DKIM)

---

## 🗄️ Database Setup (Optional - MongoDB Atlas)

### If you want to replace in-memory storage

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster

2. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password

3. **Update Railway Environment**
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/goldenpays?retryWrites=true&w=majority
   ```

4. **Create Mongoose Models** (Future Implementation)
   - Replace in-memory arrays in `server/src/routes/admin.js`
   - Create models in `server/src/models/`

---

## 🔐 Security Checklist

- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS only (handled by Vercel/Railway)
- [ ] Configure CORS to specific domain
- [ ] Set rate limiting (already configured)
- [ ] Enable SendGrid email verification
- [ ] Store sensitive data in environment variables (not in code)
- [ ] Enable 2FA on deployment platforms
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)

---

## 📊 Post-Deployment

### 1. Test All Functionality
- [ ] Visit https://goldenpays.uk
- [ ] Test contact form submission
- [ ] Login to admin panel: https://goldenpays.uk/#/admin/login
- [ ] Check email delivery (admin + auto-response)
- [ ] Verify analytics tracking (Google Analytics)
- [ ] Test all legal pages

### 2. Setup Monitoring
- **Vercel**: Built-in analytics in dashboard
- **Railway**: Logs available in dashboard
- **UptimeRobot**: Monitor uptime (https://uptimerobot.com)

### 3. Google Analytics
- Create GA4 property: https://analytics.google.com
- Copy Measurement ID
- Update `VITE_GA_MEASUREMENT_ID` in Vercel

### 4. DNS Configuration
Update DNS records with your domain provider:

```
# Root domain
A     @        76.76.21.21 (Vercel IP - check Vercel docs)
CNAME www      cname.vercel-dns.com

# API subdomain (if using Railway custom domain)
CNAME api      <your-project>.railway.app
```

---

## 🔧 Local Development

### Frontend
```bash
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your local settings
npm run dev
# Runs on http://localhost:5000
```

---

## 📝 Build Commands

### Frontend Build
```bash
npm run build
npm run preview  # Preview production build locally
```

### Backend (Production)
```bash
cd server
npm start
```

---

## 🆘 Troubleshooting

### Frontend not loading
- Check Vercel build logs
- Verify environment variables are set
- Check browser console for errors

### Contact form not working
- Verify SENDGRID_API_KEY is set in Railway
- Check Railway logs for errors
- Ensure CORS is configured correctly

### Admin login not working
- Check FRONTEND_URL matches your Vercel domain
- Verify JWT_SECRET is set
- Clear browser localStorage and try again

---

## 📞 Support

For deployment issues specific to GOLDENPAYS LTD:
- Email: admin@goldenpays.uk
- Company No: 16227513

---

**Last Updated**: February 2026
**Platform**: GOLDENPAYS LTD Corporate Tech Boutique
