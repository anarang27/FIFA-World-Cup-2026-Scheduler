# 🏆 FIFA World Cup 2026 Scheduler (WCS)

A full-stack web application for exploring the FIFA World Cup 2026 tournament — browse teams, stadiums, and the full match schedule, and build your personalized viewing watchlist.

## Features

- **🔐 User Authentication** — Secure signup/login with hashed passwords (bcrypt) and JWT sessions
- **⚽ Teams Browser** — View all 48 qualified teams with FIFA rankings, coaches, and country flags
- **🏟 Stadium Explorer** — Browse all 16 host venues across the USA, Mexico, and Canada
- **📅 Match Schedule** — Full 104-match schedule with filtering by stage and team
- **📋 Personal Watchlist** — Build a per-user watchlist of matches to follow
- **📊 Reports Dashboard** — Analytics with Chart.js visualizations
- **👤 Admin Panel** — Admin users can create and manage other accounts
- **🎨 Premium UI** — Dark theme with FIFA WC 2026 official branding and animations

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | HTML, CSS, JavaScript   |
| Backend  | Node.js, Express.js     |
| Database | Supabase (PostgreSQL)   |
| Auth     | bcryptjs, jsonwebtoken  |
| Charts   | Chart.js                |

## Project Structure

```
wc-scheduler/
├── frontend/           # Client-side HTML, CSS, JS
│   ├── index.html      # Login / Signup
│   ├── home.html       # Landing page
│   ├── team.html       # Teams browser
│   ├── stadium.html    # Stadiums explorer
│   ├── matches.html    # Match schedule
│   ├── scheduler.html  # Add matches to watchlist
│   ├── watchlist.html  # Personal watchlist
│   ├── reports.html    # Analytics dashboard
│   ├── admin.html      # Admin panel
│   ├── css/            # Stylesheets
│   ├── js/             # Client scripts
│   └── fonts/          # Custom fonts
├── backend/            # Express.js server
│   ├── server.js       # Entry point
│   ├── supabase.js     # Database client
│   ├── middleware/      # JWT auth middleware
│   └── routes/         # API route handlers
├── db/                 # Database schema
│   └── schema.sql
├── docs/               # Documentation & diagrams
├── reports/            # Project reports
└── roles/              # Team member contributions
```

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-url>
cd wc-scheduler
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- **SUPABASE_URL** — Found in Supabase Dashboard → Settings → API → Project URL
- **SUPABASE_ANON_KEY** — Found in Settings → API → `anon` `public` key
- **SUPABASE_SERVICE_KEY** — Found in Settings → API → `service_role` key
- **JWT_SECRET** — Any random string (32+ characters)

### 4. Set up the database
Run `db/schema.sql` in the Supabase SQL editor to create all tables.

### 5. Create the `userfavorite` table
This new table is needed for per-user favorites:
```sql
CREATE TABLE userfavorite (
    userid INT PRIMARY KEY REFERENCES "User"(userid) ON DELETE CASCADE,
    teamid INT REFERENCES team(team_id) ON DELETE CASCADE
);
```

### 6. Seed an admin user
In the Supabase SQL editor:
```sql
-- Make sure role table has admin role (roleid=1)
-- Then insert admin user (password will be set via the app)
```
Or sign up through the app and manually set the user's `roleid` to the admin role ID.

### 7. Start the server
```bash
cd backend
node server.js
```

### 8. Open the app
Visit **http://localhost:3000** in your browser.

## Screenshots

[Add screenshots here]

## Team

- **Aayush** — Lead Developer & Database Architect
- **Anjay** — [Role]
- **Jack** — [Role]
- **Sidd** — [Role]
