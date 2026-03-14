# Nischal Bhandari — Portfolio + Admin Panel

Full-stack portfolio with a Node.js/MongoDB backend and a protected admin panel.

---

## Project Structure

```
portfolio/
├── index.html          ← Your portfolio (frontend)
├── admin.html          ← Admin panel (frontend)
├── server.js           ← Node.js + Express backend
├── package.json        ← Dependencies
├── .env.example        ← Environment variable template
├── .gitignore          ← Keeps .env out of GitHub
├── README.md
├── Images/             ← Project images
├── assets/             ← CV PDF
└── favicon.svg
```

---

## Local Development Setup

### 1. Clone your repo
```bash
git clone https://github.com/nis6hal/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your .env file
```bash
cp .env.example .env
```
Then open `.env` and fill in:
```env
MONGODB_URI=mongodb+srv://nis6hal:YOUR_NEW_MONGO_PASSWORD@nischal.a0rdrqh.mongodb.net/portfolio?appName=Nischal
JWT_SECRET=any_long_random_string_like_this_abc123xyz789
ADMIN_USERNAME=Nis6hal
ADMIN_PASSWORD=your_chosen_admin_password
PORT=3000
FRONTEND_URL=https://nis6hal.github.io
```

### 4. Run locally
```bash
npm run dev
```
- Backend: http://localhost:3000
- Portfolio: open index.html in browser (use Live Server in VS Code)
- Admin: open admin.html in browser

---

## Deployment

### STEP 1 — Push to GitHub

```bash
git init                          # if not already a git repo
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/nis6hal/portfolio.git
git push -u origin main
```

> ✅ Check that `.env` does NOT appear in your GitHub repo. If it does, you forgot to create `.gitignore`.

---

### STEP 2 — Deploy Backend on Render.com

1. Go to **render.com** → Log in with GitHub
2. Click **New** → **Web Service**
3. Connect your `portfolio` GitHub repo
4. Fill in settings:
   - **Name:** `nischal-portfolio-api`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Scroll to **Environment Variables** → Add these one by one:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | your MongoDB connection string |
| `JWT_SECRET` | any long random string |
| `ADMIN_USERNAME` | `Nis6hal` |
| `ADMIN_PASSWORD` | your chosen password |
| `FRONTEND_URL` | `https://nis6hal.github.io` |

6. Click **Create Web Service**
7. Wait ~2 minutes → Render gives you a URL like:
   `https://nischal-portfolio-api.onrender.com`

---

### STEP 3 — Update API URL in admin.html

Open `admin.html`, find this line near the top of the script:
```javascript
const API = localStorage.getItem('adminApiUrl') || 'http://localhost:3000';
```
Change it to your Render URL:
```javascript
const API = localStorage.getItem('adminApiUrl') || 'https://nischal-portfolio-api.onrender.com';
```

Also update `index.html` if you've wired it to fetch from the API — find:
```javascript
const API_URL = 'http://localhost:3000';
```
And replace with your Render URL.

---

### STEP 4 — Deploy Frontend on GitHub Pages

1. Go to your GitHub repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` → folder: `/ (root)`
4. Click **Save**
5. Your portfolio is live at:
   `https://nis6hal.github.io/portfolio`

---

## Accessing the Admin Panel

Once deployed, go to:
```
https://nis6hal.github.io/portfolio/admin.html
```
Login with your `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`.

---

## What You Can Edit via Admin

| Section | What's editable |
|---------|----------------|
| Projects | Add / edit / delete / hide projects |
| Skills | Add / edit / delete skills + percentages |
| Hero | Name, tagline, description |
| About | All 3 bio paragraphs |
| Contact | Email, location, all social links |
| Settings | Toggle sections on/off |

---

## Security Notes

- `.env` is in `.gitignore` — it is NEVER pushed to GitHub ✅
- JWT tokens expire after 24 hours ✅
- Admin routes are all protected by `authMiddleware` ✅
- CORS is restricted to your frontend URL ✅
- Never share your `ADMIN_PASSWORD` or `JWT_SECRET` ✅

---

## Free Tier Limitations

| Service | Limit | Notes |
|---------|-------|-------|
| Render.com | 750 hrs/month | Free, spins down after 15min inactivity — first load may take ~30s |
| MongoDB Atlas | 512MB storage | More than enough for a portfolio |
| GitHub Pages | Unlimited | Always free for public repos |
