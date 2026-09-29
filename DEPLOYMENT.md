# Production Deployment Guide — Catalog Builder Pro

This document provides step-by-step instructions for deploying **Catalog Builder Pro** to GitHub, Supabase (PostgreSQL Cloud Database), and Vercel (Frontend Hosting).

---

## 📋 Prerequisites & Required Tools

- Node.js `v18.0.0` or higher
- Git installed on your local machine
- A free [GitHub Account](https://github.com)
- A free [Supabase Account](https://supabase.com)
- A free [Vercel Account](https://vercel.com)

---

## 🛠️ Step 1: GitHub Repository Setup

1. Initialize Git repository in the project root:
   ```bash
   cd C:\Users\LENOVO\.gemini\antigravity\scratch\catalog-builder-pro
   git init
   ```
2. Commit all source files:
   ```bash
   git add .
   git commit -m "feat: initial release of Catalog Builder Pro SaaS"
   ```
3. Create a new public or private repository on GitHub named `catalog-builder-pro`.
4. Link local repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/catalog-builder-pro.git
   git branch -M main
   git push -u origin main
   ```

---

## 🗄️ Step 2: Supabase Database & Auth Setup

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and click **"New Project"**.
2. Set your Project Name (e.g., `catalog-builder-pro`) and Database Password. Choose a region closest to your target users (e.g., Singapore).
3. Once the database is provisioned, go to **SQL Editor** in the left menu.
4. Click **"New Query"**, copy the entire contents of [`supabase/migrations/001_initial_schema.sql`](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/catalog-builder-pro/supabase/migrations/001_initial_schema.sql), paste it into the editor, and click **RUN**.
5. Verify that the tables `catalogs`, `profiles`, and `media` are created with Row Level Security (RLS) enabled.
6. Retrieve API credentials:
   - Navigate to **Project Settings** -> **API**.
   - Copy **Project URL** (`https://your-ref.supabase.co`).
   - Copy **anon public key** (`eyJhbGci...`).
   - *Note: NEVER use or expose the `service_role` key in frontend code.*

---

## ⚡ Step 3: Vercel Deployment

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select your `catalog-builder-pro` GitHub repository and click **Import**.
3. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = `https://your-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
5. Click **Deploy**. Vercel will build and launch your production web app.

---

## 💻 Step 4: Local Development

To run the application locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/catalog-builder-pro.git
   cd catalog-builder-pro
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` (optional for local mode):
   ```bash
   cp .env.example .env
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/`.

---

## 🧪 Verification Commands

Before deploying updates, always run verification:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Test Suite
npx vitest run

# 3. Production Build
npm run build
```

---

## 🔍 Troubleshooting & FAQ

### 1. Hard refreshes on `/catalog/:slug` give 404 on Vercel
The included `vercel.json` file contains a rewrite rule (`"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`) which handles SPA routing automatically. Ensure `vercel.json` is committed to GitHub.

### 2. Can the app run without Supabase?
Yes! If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set, the app automatically runs using the built-in LocalStorage & IndexedDB repository fallback with zero errors.

### 3. Are AI API keys needed for Gemini or ChatGPT?
No. The application strictly follows a zero-AI-API copy/paste workflow. Users copy structured prompts containing `data-cb-*` markers to external Gemini/ChatGPT and paste the generated HTML back into Catalog Builder Pro.
