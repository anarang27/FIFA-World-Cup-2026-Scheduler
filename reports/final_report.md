# Final Report — FIFA World Cup 2026 Scheduler

## 1. Project Overview

The FIFA World Cup 2026 Scheduler (WCS) is a full-stack web application that allows users to browse the complete World Cup 2026 tournament — explore teams, stadiums, and match schedules — and build a personalized watchlist of matches they want to follow.

### Key Features
- **User Authentication:** Secure signup/login with bcrypt-hashed passwords and JWT tokens
- **Teams Browser:** View all 48 qualified teams with rankings, coaches, and country flags
- **Stadium Explorer:** Browse all 16 host venues with capacity and match count data
- **Match Schedule:** Full 104-match schedule with stage and team filtering
- **Personal Watchlist:** Add/remove matches from a per-user watchlist
- **Reports Dashboard:** Aggregated analytics with Chart.js visualizations
- **Admin Panel:** Admin users can create and manage other accounts

---

## 2. Database Connection & Setup

### Technology Stack
- **Database:** Supabase (hosted PostgreSQL)
- **Backend:** Node.js with Express.js
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Auth:** bcryptjs (password hashing) + jsonwebtoken (JWT sessions)

### How We Set It Up
1. Created a Supabase project and defined tables via the SQL editor
2. Built an Express.js server that connects using `@supabase/supabase-js` with the service role key
3. The frontend makes API calls to our Express backend (never directly to Supabase)
4. Environment variables are stored in `.env` (gitignored) for security

### Issues Faced & Lessons Learned
- [Add specific issues your team encountered]
- [Add lessons learned]

---

## 3. System Functionality

All database operations are performed through the Express.js API layer. Users interact with data exclusively through the web interface — no direct table access is needed.

### Core Workflows
1. **Signup → Login → Browse → Favorite → Watchlist → Reports**
2. **Admin → Create Users → View Users → Manage**

---

## 4. Reporting

The Reports page provides aggregated data visualizations:
- **Matches by Stage:** Doughnut chart showing match distribution across tournament stages
- **Matches by Venue:** Bar chart showing how many matches each stadium hosts
- **Stadium Capacity:** Bar chart comparing venue capacities
- **Match Timeline:** Line chart showing matches per day across the tournament
- **Teams by Group:** Grid showing team composition of each group with rankings

---

## 5. GUI / Interface

The interface uses a consistent dark theme with FIFA World Cup 2026 official colors (lime, green, blue, orange, gold). Key design decisions:
- Custom "Ultimate" font for headers and navigation
- Animated radial-gradient background on the home page matching the WC 2026 brand
- Card-based layouts with glassmorphism effects
- Responsive design for mobile and desktop
- Loading spinners and error states for all data-dependent views

---

## 6. Reflection

[Add your team's reflection here — key decisions, what went well, what you'd do differently]
