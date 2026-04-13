# Deployment Guide - GL Assessment Analytics

This guide will help you deploy your application to a public URL you can share with colleagues.

## 🚀 Quick Deploy Options

### Option 1: Deploy to Render (Recommended - Easiest)

**Render** is free, simple, and great for Node.js apps.

#### Step 1: Prepare Your Code

```bash
# Navigate to your project directory
cd C:\Users\MBARNETT1\claude.curric.gaps

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - GL Assessment Analytics"
```

#### Step 2: Push to GitHub

1. Go to https://github.com/new
2. Create a new repository (name it `gl-assessment-analytics`)
3. **Don't** initialize with README (you already have code)
4. Copy the commands shown and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gl-assessment-analytics.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Render

1. Go to https://render.com and sign up (free account)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your `gl-assessment-analytics` repository
5. Render will auto-detect the `render.yaml` file ✅
6. Click **"Create Web Service"**

**Configuration (auto-filled from render.yaml):**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: Node

#### Step 4: Add Environment Variables (Optional)

If you're using Claude API:
1. In Render dashboard, go to **Environment** tab
2. Add variable:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key
3. Save changes (will auto-redeploy)

#### Step 5: Access Your Site

Your app will be live at:
```
https://gl-assessment-analytics.onrender.com
```

**⏱️ First deploy takes 2-3 minutes**

---

### Option 2: Deploy to Railway

**Railway** is another great option with a generous free tier.

#### Steps:

1. Push your code to GitHub (see Option 1, Steps 1-2)
2. Go to https://railway.app and sign up
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will auto-detect Node.js ✅
6. Add environment variables:
   - `NODE_ENV` = `production`
   - `ANTHROPIC_API_KEY` = your API key (if using)
7. Click **"Deploy"**

Your site will be at: `https://your-project.up.railway.app`

---

### Option 3: Deploy to Vercel

**Vercel** is best known for Next.js but works with Express too.

#### Steps:

1. Push your code to GitHub (see Option 1, Steps 1-2)
2. Go to https://vercel.com and sign up
3. Click **"Add New..." → "Project"**
4. Import your GitHub repository
5. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add environment variables:
   - `ANTHROPIC_API_KEY` (if using)
7. Click **"Deploy"**

Your site will be at: `https://your-project.vercel.app`

---

## 🔧 Troubleshooting

### Build fails with "Cannot find module"
- Make sure all dependencies are in `package.json`
- Run `npm install` locally first to test

### CSS not loading
- Already fixed! The server now serves static files from the server directory

### API endpoints not working
- Check that `PORT` environment variable is set correctly
- Render uses port `10000` by default

### TypeScript errors during build
- Run `npm run build` locally first
- Fix any TypeScript errors before deploying

---

## 📧 Sharing with Colleagues

Once deployed, share the URL:

**Example URLs:**
- Render: `https://gl-assessment-analytics.onrender.com`
- Railway: `https://gl-assessment-analytics.up.railway.app`
- Vercel: `https://gl-assessment-analytics.vercel.app`

### Main Pages to Share:

- **Home/Landing**: `https://your-url.com/`
- **Demo Dashboard**: `https://your-url.com/demo`
- **GL Assessment**: `https://your-url.com/gl`
- **MAT Overview**: `https://your-url.com/mat`
- **Visual Dashboard**: `https://your-url.com/dashboard`

---

## 🔒 Security Notes

- Never commit your `.env` file or API keys to GitHub
- Already in `.gitignore` ✅
- Set `ANTHROPIC_API_KEY` in hosting platform's environment variables
- The app works without API key (uses mock data)

---

## 🔄 Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Render/Railway/Vercel will **automatically redeploy** when you push to GitHub!

---

## 💰 Pricing

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Render** | ✅ 750 hrs/month | $7/month |
| **Railway** | ✅ $5 credit/month | Pay as you go |
| **Vercel** | ✅ Unlimited | $20/month |

**Recommendation**: Start with Render (easiest) or Railway (most generous)

---

## Need Help?

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

Good luck! 🚀
