-- =============================================
-- FIFA World Cup 2026 Scheduler — Database Schema
-- Supabase (PostgreSQL)
-- =============================================

-- Roles table
CREATE TABLE role (
    roleid      SERIAL PRIMARY KEY,
    rolename    VARCHAR(50) NOT NULL,
    permissions TEXT,
    description TEXT
);

INSERT INTO role (rolename, permissions, description) VALUES
    ('admin', 'all', 'Full system access — can create and manage users'),
    ('user',  'read,write', 'Standard user — can browse, favorite, and create watchlists');

-- User table
CREATE TABLE "User" (
    userid            SERIAL PRIMARY KEY,
    username          VARCHAR(255) UNIQUE NOT NULL,
    email             VARCHAR(255) UNIQUE NOT NULL,
    password          VARCHAR(255) NOT NULL,  -- bcrypt hashed
    firstname         VARCHAR(255),
    lastname          VARCHAR(255),
    registrationdate  DATE DEFAULT CURRENT_DATE,
    roleid            INT REFERENCES role(roleid)
);

-- City table
CREATE TABLE city (
    cityid   SERIAL PRIMARY KEY,
    cityname VARCHAR(100) NOT NULL,
    country  VARCHAR(100),
    stadium  TEXT
);

-- Venue (Stadium) table
CREATE TABLE venue (
    venueid   SERIAL PRIMARY KEY,
    venuename VARCHAR(255) NOT NULL,
    capacity  INT,
    location  TEXT,
    cityid    INT REFERENCES city(cityid)
);

-- Tournament Stage table
CREATE TABLE tournamentstage (
    stageid     SERIAL PRIMARY KEY,
    stagename   VARCHAR(100) NOT NULL,
    startdate   DATE,
    enddate     DATE,
    description TEXT
);

-- Group table
CREATE TABLE "Group" (
    groupid     SERIAL PRIMARY KEY,
    groupname   VARCHAR(50) NOT NULL,
    stageid     INT REFERENCES tournamentstage(stageid),
    description TEXT
);

-- Team table
CREATE TABLE team (
    team_id          SERIAL PRIMARY KEY,
    team_name        VARCHAR(255) NOT NULL,
    country          VARCHAR(100),
    coach            VARCHAR(255),
    group_id         INT REFERENCES "Group"(groupid),
    ranking          INT,
    favorite         BOOLEAN DEFAULT FALSE,
    alpha_iso_2_code TEXT
);

-- Match table
CREATE TABLE match (
    matchid   SERIAL PRIMARY KEY,
    team1id   INT REFERENCES team(team_id),
    team2id   INT REFERENCES team(team_id),
    venueid   INT REFERENCES venue(venueid),
    stageid   INT REFERENCES tournamentstage(stageid),
    matchdate DATE,
    matchtime TIME
);

-- Itinerary (per-user watchlist container)
CREATE TABLE itinerary (
    itineraryid   SERIAL PRIMARY KEY,
    userid        INT REFERENCES "User"(userid) ON DELETE CASCADE,
    createddate   DATE DEFAULT CURRENT_DATE,
    lastmodified  TIMESTAMP DEFAULT NOW(),
    description   TEXT
);

-- Itinerary Items (individual watchlist entries)
CREATE TABLE itineraryitem (
    itineraryitemid SERIAL PRIMARY KEY,
    itineraryid     INT REFERENCES itinerary(itineraryid) ON DELETE CASCADE,
    matchid         INT REFERENCES match(matchid) ON DELETE CASCADE,
    addeddate       DATE DEFAULT CURRENT_DATE,
    notes           TEXT
);

-- User Favorite Team (per-user, max one favorite)
CREATE TABLE userfavorite (
    userid INT PRIMARY KEY REFERENCES "User"(userid) ON DELETE CASCADE,
    teamid INT REFERENCES team(team_id) ON DELETE CASCADE
);

-- Legacy Watchlist (kept for reference)
CREATE TABLE "Watchlist" (
    "Match" TEXT,
    "Date"  DATE,
    "City"  TEXT
);
