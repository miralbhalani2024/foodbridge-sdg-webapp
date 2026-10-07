# 🍲 FoodBridge: Rescue Surplus Food, Feed People

**PBL Activity 3: Complex Problem Solving (CPS), Web Application Development**
An SDG-oriented full-stack (MERN) web application.

| | |
|---|---|
| **SDG 2: Zero Hunger** | Surplus food reaches people who need it |
| **SDG 12: Responsible Consumption** (target 12.3: halve food waste) | Less edible food is thrown away |
| **SDG 13: Climate Action** (side benefit) | Wasted food rots and emits greenhouse gases |

**Problem:** Restaurants, hostels, caterers and weddings throw away cooked food every day, while NGOs nearby struggle to find food. The two sides have no quick way to connect within the few hours the food stays fresh.

**Solution:** Donors list surplus food with quantity, pickup address and expiry time. NGOs see listings, **claim** one (only one NGO can claim it), collect it, and mark it **picked up**. A live dashboard shows meals served, kg rescued, and CO₂ avoided.

---

## 🧱 Tech Stack

| Layer | Technology | Folder |
|---|---|---|
| Frontend | React 18 + Vite, React Router, Axios, plain CSS (Flexbox/Grid) | `frontend/` |
| Backend | Node.js + Express 4 (REST API), JWT auth, bcrypt | `backend/` |
| Database | MongoDB + Mongoose | `backend/src/models/` |
| Vanilla page | HTML5 + CSS3 + JavaScript (fetch / DOM) | `backend/public/impact.html` |
| Testing | Jest + Supertest | `backend/tests/` |
| API testing | Postman collection | `docs/FoodBridge.postman_collection.json` |
| Deployment | Dockerfile, docker-compose, Render/Vercel steps | root |

---

## ▶️ How to Run (step by step)

### 1. Install the requirements (one time)
- **Node.js 18 or newer:** https://nodejs.org (check with `node -v`)
- **MongoDB**, choose ONE:
  - **Option A (local):** install *MongoDB Community Server* (tick "Install MongoDB Compass" too) from https://www.mongodb.com/try/download/community. On Windows it runs automatically as a service.
  - **Option B (cloud, no install):** free cluster on https://www.mongodb.com/atlas. Create a database user, allow your IP (Network Access → `0.0.0.0/0` for demo), copy the connection string, and put it in `backend/.env` as `MONGO_URI=...`

### 2. Install packages (one time)
Open a terminal **in the `foodbridge` folder**:
```bash
npm run install-all
```

### 3. Load demo data (recommended before the viva)
```bash
npm run seed
```
This creates demo users and 10 sample donations.

### 4. Start frontend + backend together
```bash
npm run dev
```
| Open this | What it is |
|---|---|
| http://localhost:5173 | **React website (main app)** |
| http://localhost:5000/api/health | Backend health check (JSON) |
| http://localhost:5000/api/stats | Raw JSON from the API |
| http://localhost:5000/impact.html | Plain HTML/CSS/JS page |

### Demo logins (password for all: `password123`)
| Email | Role | Can do |
|---|---|---|
| `donor@foodbridge.in` | Donor (Hotel Surya Palace) | Post / edit / delete food, mark picked up |
| `ngo@foodbridge.in` | NGO (Asha Food Bank) | Claim food, mark picked up |
| `admin@foodbridge.in` | Admin | Delete any listing |

The login page has buttons that fill these in for you.

### Other commands
```bash
npm test          # run the 8 automated backend tests (no database needed)
npm run build     # production build of React → frontend/dist
```

### Common problems
| Error | Fix |
|---|---|
| `MongoDB connection failed: ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Windows: open *Services* → start "MongoDB Server". Or use Atlas (Option B). |
| `Cannot reach server — is the backend running?` on the website | Backend crashed. Read the green `[API]` lines in the terminal. |
| `EADDRINUSE: port 5000` | Something else uses port 5000. Change `PORT` in `backend/.env` **and** the proxy target in `frontend/vite.config.js`. |
| Atlas `bad auth` | Wrong username/password in `MONGO_URI` (URL-encode special characters like `@` → `%40`). |
| Login says "Invalid email or password" for demo users | You haven't run `npm run seed`. |

---

## 📁 Project Structure

```
foodbridge/
├── package.json              ← root scripts: install-all, dev, seed, test
├── Dockerfile / docker-compose.yml   ← deployment
├── docs/
│   ├── VIVA_GUIDE.md         ← syllabus mapping + viva questions
│   └── FoodBridge.postman_collection.json
├── backend/
│   ├── server.js             ← entry: load .env → connect DB → listen
│   ├── .env                  ← PORT, MONGO_URI, JWT_SECRET
│   ├── public/impact.html    ← vanilla HTML/CSS/JS page
│   ├── tests/                ← Jest + Supertest
│   └── src/
│       ├── app.js            ← Express app + middleware chain
│       ├── config/db.js      ← Mongoose connection
│       ├── models/           ← User.js, Donation.js (schemas)
│       ├── routes/           ← URL → controller mapping
│       ├── controllers/      ← business logic (auth, donations, stats)
│       ├── middleware/       ← auth (JWT, roles), logger, errorHandler
│       ├── utils/            ← impact.js (meals/CO₂), asyncHandler.js
│       └── seed.js           ← demo data
└── frontend/
    ├── index.html            ← single <div id="root">
    ├── vite.config.js        ← dev server + /api proxy
    └── src/
        ├── main.jsx          ← mounts React
        ├── App.jsx           ← routes
        ├── api.js            ← Axios instance + token interceptor
        ├── context/AuthContext.jsx   ← global login state
        ├── components/       ← Navbar, DonationCard, StatCard, ProtectedRoute
        ├── pages/            ← Home, Donations, AddDonation, Dashboard, Login, Register
        └── index.css         ← all styles
```

---

## 🔌 REST API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Server status |
| POST | `/api/auth/register` | Public | Create donor / NGO account |
| POST | `/api/auth/login` | Public | Returns JWT token |
| GET | `/api/auth/me` | Logged in | Current user |
| GET | `/api/donations?status=&city=&category=&search=` | Public | Browse / filter |
| GET | `/api/donations/mine` | Logged in | Donor: my listings · NGO: my claims (+ personal impact) |
| GET | `/api/donations/:id` | Public | One listing |
| POST | `/api/donations` | Donor | Create listing |
| PUT | `/api/donations/:id` | Donor (owner) | Edit (only while available) |
| DELETE | `/api/donations/:id` | Owner / Admin | Delete |
| PATCH | `/api/donations/:id/claim` | NGO | Claim (atomic, so it can't be double-claimed) |
| PATCH | `/api/donations/:id/pickup` | Claimer / Donor | Mark picked up |
| GET | `/api/stats` | Public | SDG impact (MongoDB aggregation) |

Import `docs/FoodBridge.postman_collection.json` into Postman to try every endpoint.

---

## 🚀 Deployment (Module 7)

**Option 1: Docker (one command)**
```bash
docker compose up --build        # → http://localhost:5000
docker compose exec app node src/seed.js
```

**Option 2: Free cloud hosting**
1. Database: MongoDB **Atlas** free cluster, then copy the connection string.
2. Backend: push to GitHub, then on **Render.com** create a *New Web Service* with root dir `backend`, build `npm install`, start `node server.js`, and env vars `MONGO_URI`, `JWT_SECRET`.
3. Frontend: on **Vercel / Netlify** use root dir `frontend`, build `npm run build`, output `dist`, and env var `VITE_API_URL=https://<your-render-app>.onrender.com`.

**Option 3: Single server.** Run `npm run build`, then start the backend with `NODE_ENV=production`. Express serves the React build itself.

---

## 📐 Impact formula (assumptions)
- 1 meal ≈ **0.4 kg** of food
- 1 kg wasted food ≈ **2.5 kg CO₂e** (from FAO 2013 *Food Wastage Footprint*: ~3.3 Gt CO₂e for ~1.3 Gt of food wasted)
- Only **picked-up** food counts toward impact.
