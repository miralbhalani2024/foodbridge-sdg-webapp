# 🎤 FoodBridge: Viva Preparation Guide

Read this once fully. Then each member should master **their own part** (see Section 6) and know the **demo flow** (Section 4) well.

---

## 1. Project in 30 seconds (say this first)

> "Our project is **FoodBridge**, a full-stack web app for **SDG 2 (Zero Hunger)** and **SDG 12 (Responsible Consumption)**. Restaurants and hostels waste cooked food every day while NGOs nearby need it. On FoodBridge, a **donor** posts surplus food with quantity, address and expiry time. An **NGO** claims it, collects it, and marks it picked up. The home page shows **live impact**: meals served, kg rescued, and CO₂ avoided. We built it with the **MERN stack**: **React** frontend, **Node.js/Express** REST API, and **MongoDB** database, with **JWT** login and role-based access."

**Innovation points to mention:**
1. **Atomic claim:** if two NGOs click "Claim" at the same moment, only one succeeds (no double pickup).
2. **Auto-expiry:** listings past their expiry time automatically become "expired".
3. **Live SDG impact metrics** computed with **MongoDB aggregation pipelines**.
4. **Role-based access** (donor / NGO / admin) enforced on the **backend**, not just hidden in the UI.
5. **Urgency highlighting:** food expiring within 3 hours shows in red.
6. **Privacy:** phone numbers are shown only to the donor and the NGO involved in that pickup.

---

## 2. Architecture (draw this on the board if asked)

```
 ┌────────────────────┐   HTTP (JSON)    ┌─────────────────────────┐   Mongoose   ┌──────────┐
 │  React (Vite)      │ ───────────────▶ │  Node.js + Express      │ ───────────▶ │ MongoDB  │
 │  localhost:5173    │  GET/POST/PUT/   │  localhost:5000         │   queries    │  :27017  │
 │  Axios + JWT token │  PATCH/DELETE    │  routes → middleware →  │ ◀─────────── │ users,   │
 │                    │ ◀─────────────── │  controllers → models   │  documents   │donations │
 └────────────────────┘   JSON response  └─────────────────────────┘              └──────────┘
        CLIENT                                   SERVER                           DATABASE
```

**Life of one request ("NGO clicks Claim"):**
1. `DonationCard.jsx` button → `onClaim(id)` → `Donations.jsx` calls `api.patch('/donations/:id/claim')`
2. Axios **interceptor** (`api.js`) adds the header `Authorization: Bearer <token>`
3. Vite **proxy** forwards `/api/...` from port 5173 to port 5000
4. Express: `cors` → `express.json` → `logger` → `donationRoutes`
5. Route: `protect` (verify JWT) → `authorize('ngo')` (check role) → `claimDonation` controller
6. Controller: `Donation.findOneAndUpdate({ _id, status:'available', expiresAt > now }, {status:'claimed', ...})`
7. Response `200` with JSON, or `409 Conflict` if someone else claimed it first
8. React updates **state** → component **re-renders** → card shows "Claimed"

**Donation status life-cycle:**
```
available ──(NGO claims)──▶ claimed ──(picked up)──▶ picked_up   ✅ counted in impact
    │
    └──(expiry time passes)──▶ expired   ❌ wasted
```

---

## 3. Syllabus → where it is in OUR code

### Module 1: Introduction to Web Technologies
| Concept | In our project |
|---|---|
| Client–server model | React (client, browser) ↔ Express (server) ↔ MongoDB |
| Web server | Express on port 5000; also serves static files from `backend/public` |
| HTTP request/response | Every API call; see network tab / Postman |
| Static vs dynamic | `impact.html` (static file, data loaded dynamically) vs API JSON |
| SPA | React app: one `index.html`, pages switch without reloading |

### Module 2: HTML & CSS Fundamentals
| Concept | File |
|---|---|
| Semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `footer`) | `backend/public/impact.html`, `App.jsx`, `Home.jsx` |
| Forms & input types (`email`, `password`, `number`, `datetime-local`, `tel` with `pattern`, `radio`, `select`, `textarea`) | `Register.jsx`, `AddDonation.jsx` |
| CSS variables (`:root { --green }`) | `index.css`, `impact.html` |
| Box model, `box-sizing: border-box` | `index.css` top |
| **Flexbox** | `.nav-inner`, `.hero-actions`, `.donation-card`, `.bar-row` |
| **Grid** | `.stats-grid` (4 cols), `.card-grid` (`auto-fill, minmax(290px,1fr)`), `.filters` |
| Responsive / media queries | bottom of `index.css` (860px, 560px) |
| Transitions / hover | `.btn:hover`, `.bar-fill { transition }` |

### Module 3: JavaScript Fundamentals
| Concept | File |
|---|---|
| DOM manipulation (`getElementById`, `textContent`, `createElement`, `appendChild`) | `backend/public/impact.html` |
| Events (`addEventListener('click')`, `onChange`, `onSubmit`, `preventDefault`) | `impact.html`, all forms |
| **Async JS: Promises, `async/await`, `fetch`** | `impact.html` (`fetch`), all pages (`await api.get`) |
| ES6: arrow functions, destructuring, spread `{...form}`, template literals, optional chaining `?.` | everywhere, e.g. `DonationCard.jsx` |
| Array methods `map / filter / reduce` | `Dashboard.jsx` (filter), `donationController.js` (reduce), lists (map) |
| `try/catch` error handling | every page's submit handler |
| `localStorage` | `AuthContext.jsx` (saves the JWT) |
| Debounce with `setTimeout`/`clearTimeout` | `Donations.jsx` filters |

### Module 4: APIs & HTTP Communication
| Concept | In our project |
|---|---|
| REST API design | table in `README.md` (resource = `/donations`) |
| **CRUD ↔ HTTP methods** | Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE (`donationRoutes.js`) |
| PUT vs PATCH | PUT edits listing fields; PATCH changes one thing (status) |
| Status codes | 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 |
| Headers | `Content-Type: application/json`, `Authorization: Bearer …` |
| Query params vs URL params | `?city=Vadodara` (filter) vs `/:id` (which resource) |
| JSON | all request/response bodies |
| CORS | `app.use(cors())` in `app.js` |
| Testing APIs with Postman | `docs/FoodBridge.postman_collection.json` |
| Fetch vs Axios | `impact.html` uses fetch; React uses Axios (`api.js`) |

### Module 5: Backend Development with Node.js
| Concept | File |
|---|---|
| Node.js, npm, `package.json`, dependencies vs devDependencies | `backend/package.json` |
| npm scripts | `start`, `dev` (nodemon), `seed`, `test` |
| Modules (`require` / `module.exports`) | every backend file |
| **Express** app, routing, `express.Router()` | `app.js`, `routes/` |
| **Middleware** (built-in, third-party, custom, error) | `express.json`, `cors`, `middleware/logger.js`, `middleware/errorHandler.js` |
| MVC-style structure | models / controllers / routes |
| Environment variables (`dotenv`) | `.env`, `server.js` |
| **Database: MongoDB + Mongoose** (schema, validation, `ref` + `populate`, index, hooks) | `models/User.js`, `models/Donation.js` |
| Aggregation pipeline | `controllers/statsController.js` |
| Authentication: **bcrypt** hashing + **JWT** | `models/User.js`, `authController.js`, `middleware/auth.js` |
| **Testing** (unit + API) | `tests/impact.test.js` (Jest), `tests/api.test.js` (Supertest) |

### Module 6: Frontend Development with React.js
| Concept | File |
|---|---|
| **Functional components** & **JSX** | all `.jsx` files |
| **Props** | `StatCard`, `DonationCard` (data + callback props) |
| **Hooks:** `useState`, `useEffect` (with dependency array + cleanup), `useContext`, custom hook `useAuth` | `Donations.jsx`, `Home.jsx`, `AuthContext.jsx` |
| Context API (global state) | `context/AuthContext.jsx` |
| Conditional rendering | `Navbar.jsx` (`user ? … : …`), `DonationCard.jsx` (buttons by role) |
| Lists & `key` | `donations.map(d => <DonationCard key={d._id} …/>)` |
| Controlled forms | `AddDonation.jsx`, `Register.jsx` |
| React Router (`Routes`, `Route`, `Link`, `NavLink`, `useNavigate`, `Navigate`) | `App.jsx`, `ProtectedRoute.jsx` |
| **Axios** + interceptors | `api.js` |
| Vite (dev server, proxy, build) | `vite.config.js` |

### Module 7: Deployment & Modern Web Concepts
| Concept | In our project |
|---|---|
| Hosting: frontend (Vercel/Netlify), backend (Render), DB (Atlas) | README → Deployment |
| Production build | `npm run build` → `frontend/dist` (minified bundle) |
| Express serving React in production | `app.js` (`NODE_ENV === 'production'`) |
| Environment configuration | `.env`, `VITE_API_URL` |
| **Docker** & containers | `Dockerfile` (multi-stage), `docker-compose.yml` (app + mongo) |
| Version control | `.gitignore` (node_modules, .env never committed) |
| Security basics | hashed passwords, JWT, role checks, `select:false`, field whitelisting |

---

## 4. Demo script (5 minutes, practise this!)

**Before the viva:** start MongoDB → `npm run seed` → `npm run dev` → open http://localhost:5173

1. **Home page:** "These live numbers come from `GET /api/stats` using MongoDB aggregation." Point at meals, kg, CO₂, and the category bars.
2. **Find Food:** filter city = Vadodara, category = cooked. "These are query params sent to the API."
3. **Login as Donor** (demo button) → **+ Donate Food** → fill the form (show the "≈ meals" live calculation) → Post → Dashboard shows it as *available*.
4. **Logout → Login as NGO** → Find Food → **Claim** the new listing → the donor's phone number appears. "This is an atomic update, so two NGOs can't claim the same food."
5. NGO **Dashboard** → *claimed* tab → **Mark picked up** → impact numbers go up. Go back to Home and show the counters increased.
6. **Security demo:** in Postman, call `POST /api/donations` **without** a token → `401`. With the NGO token → `403` (only donors can post).
7. Open **http://localhost:5000/impact.html**: "Same data, plain HTML/CSS/JavaScript using fetch and DOM."
8. Terminal: `npm test` → 8 tests pass.

---

## 5. Likely viva questions with short answers

### General / SDG
1. **Which SDG and why?** SDG 2 (Zero Hunger) and SDG 12, target 12.3 (halve food waste by 2030). We reduce waste and hunger at the same time; CO₂ reduction also touches SDG 13.
2. **Who are the users?** Donors (restaurants, hostels, caterers), NGOs/food banks, and an admin.
3. **How do you calculate impact?** Only *picked-up* food counts. Meals = kg ÷ 0.4; CO₂e = kg × 2.5 (FAO 2013 estimate). Code: `utils/impact.js`.
4. **What is MERN?** MongoDB, Express, React, Node.js, with JavaScript throughout the stack.

### Module 1–2
5. **Client vs server?** The client (browser running React) requests; the server (Express) processes and responds; the DB stores data.
6. **What is an SPA?** Single Page Application: one HTML page. JavaScript swaps the content when the URL changes, with no full reload.
7. **Semantic HTML?** Tags that describe meaning (`header`, `nav`, `article`). They help accessibility and SEO.
8. **Flexbox vs Grid?** Flexbox is one-dimensional (a row OR a column; we use it for the navbar). Grid is two-dimensional (rows AND columns; we use it for the stats and card grid).
9. **How is the site responsive?** Media queries change grid columns at 860px and 560px; `minmax()` with `auto-fill` adapts the card grid automatically.
10. **What is `box-sizing: border-box`?** Width includes padding and border, which makes layouts predictable.

### Module 3
11. **What does `async/await` do?** It waits for a Promise without blocking; the code reads like synchronous code. `await` only works inside an `async` function.
12. **Promise states?** Pending, fulfilled, rejected.
13. **`fetch` vs Axios?** Fetch is built into the browser; you must call `.json()` and check `response.ok`. Axios parses JSON automatically, throws on 4xx/5xx, and supports interceptors.
14. **What is the DOM?** The tree of HTML elements that JavaScript can read and change (see `impact.html`).
15. **`==` vs `===`?** `===` checks value AND type, with no type coercion. We use `===`.
16. **Why `e.preventDefault()` in forms?** It stops the browser's default page reload on submit.

### Module 4
17. **What is REST?** An API style where URLs name resources (`/donations`) and HTTP methods name actions; it is stateless and uses JSON.
18. **401 vs 403?** 401 means not logged in or the token is invalid. 403 means logged in but the role is not allowed.
19. **Why 409 for claim?** It means Conflict: the resource's state changed (already claimed).
20. **201 vs 200?** 201 Created is for a successful POST that created something.
21. **PUT vs PATCH?** PUT updates/replaces a resource's fields; PATCH is a partial change. We use PATCH for status actions.
22. **What is CORS?** A browser security rule that blocks requests to a different origin (port 5173 → 5000) unless the server allows it. `cors()` sends the allow headers.
23. **Query params vs route params?** `?city=X` filters a list; `/:id` identifies one resource.

### Module 5
24. **What is middleware?** A function `(req, res, next)` that runs during the request; `next()` passes control on. Ours: `logger`, `protect`, `authorize`, `errorHandler`.
25. **Why is `errorHandler` last, with 4 params?** Express identifies error middleware by its 4 arguments `(err, req, res, next)`; it must come after all routes to catch their errors.
26. **What is `asyncHandler`?** A wrapper that catches rejected promises from async controllers and forwards them to `next(err)`, so we don't need try/catch everywhere.
27. **Why MongoDB?** It is flexible JSON-like documents, fits JavaScript naturally, and is easy to scale. **Mongoose** adds schemas, validation and relationships.
28. **SQL vs NoSQL terms?** Table = collection, row = document, column = field, JOIN ≈ `populate()`.
29. **What is `populate()`?** It replaces a stored ObjectId (`donor`) with the actual user document, like a JOIN.
30. **What is an aggregation pipeline?** Stages that process documents inside the DB: `$match` (filter) → `$group` (sum/count) → `$sort` → `$limit`. Used in `statsController.js`.
31. **How are passwords stored?** Hashed with **bcrypt** (salt + 10 rounds) in a `pre('save')` hook, never as plain text. `select:false` hides the hash from queries.
32. **What is JWT?** JSON Web Token = header.payload.signature. The server signs `{id}` with `JWT_SECRET`; the client sends it on each request; the server verifies the signature. It is stateless (no session stored on the server).
33. **Where is the token stored?** In `localStorage`; Axios interceptor adds it to every request.
34. **How do you prevent two NGOs claiming the same food?** `findOneAndUpdate` with the condition `status:'available'` is **atomic** in MongoDB, so the second request finds no match and gets 409.
35. **What does `.env` contain and why isn't it on GitHub?** It holds secrets (DB URL, JWT secret). It is in `.gitignore`.
36. **Why is `app.js` separate from `server.js`?** So tests can import the app without starting a server or connecting to the DB.
37. **What tests do you have?** Unit tests for the impact maths (Jest) and API tests for health, 404, 401 without a token, 401 with an invalid token, and the static page (Supertest).
38. **What is nodemon?** A dev tool that restarts Node automatically when files change.

### Module 6
39. **What is JSX?** HTML-like syntax inside JavaScript that compiles to `React.createElement` calls.
40. **State vs props?** State is a component's own changeable data (`useState`); props are read-only data passed from the parent.
41. **`useEffect` dependency array?** `[]` runs once after the first render; `[filters]` runs whenever `filters` changes; no array runs after every render. The return function is **cleanup** (we clear the debounce timer).
42. **Why `key` in lists?** It lets React identify which item changed, added or removed, so re-rendering is efficient.
43. **What is Context API?** It shares global data (the logged-in user) without passing props through every level. `useAuth()` is our custom hook.
44. **Controlled component?** The input's value comes from React state, and `onChange` updates that state.
45. **Is `ProtectedRoute` real security?** No, it is UX only. Real security is the backend `protect`/`authorize` middleware, because the client can be modified.
46. **What is Vite?** A fast dev server and build tool. Its proxy forwards `/api` to the backend; `build` creates an optimised bundle.
47. **Virtual DOM?** React keeps a lightweight copy of the UI, compares (diffs) it after a state change, and updates only the changed real DOM nodes.

### Module 7
48. **How would you deploy?** Atlas (DB), Render (backend), Vercel (frontend with `VITE_API_URL`). Or Docker: `docker compose up`.
49. **What is Docker?** It packages the app with its runtime into a container that runs the same everywhere. Our Dockerfile is multi-stage: build React, then run Express.
50. **Future scope?** A map with distance sorting (geolocation), SMS/WhatsApp alerts to nearby NGOs, photo upload, volunteer-driver role, food-safety checklist, PWA/mobile app, analytics by month.

---

## 6. Suggested split for 3 members

| Member | Owns | Must explain in viva |
|---|---|---|
| **Member 1: Frontend** | `frontend/src/` (pages, components, CSS), `impact.html` | Modules 2, 3, 6: React hooks, routing, forms, Flexbox/Grid, fetch/DOM |
| **Member 2: Backend & API** | `backend/src/routes`, `controllers`, `middleware`, Postman | Modules 4, 5: REST, status codes, middleware, JWT, bcrypt, roles |
| **Member 3: Database, Testing, Deployment** | `models/`, `seed.js`, `statsController.js`, `tests/`, Docker, README | Modules 1, 5, 7: schemas, populate, aggregation, testing, deployment, SDG impact |

Everyone should be able to give the 30-second pitch, run the demo, and explain the request flow in Section 2.

---

## 7. Last-minute checklist
- [ ] MongoDB running (or Atlas URI in `backend/.env`)
- [ ] `npm run seed` done, so demo data is present
- [ ] `npm run dev` running, and http://localhost:5173 opens
- [ ] Postman collection imported
- [ ] `npm test` shows 8 passed
- [ ] Each member has read their own files at least once
