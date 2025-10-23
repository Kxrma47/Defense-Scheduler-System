BEGIN;

-- ==========================================================
-- DEFENSE SCHEDULER DATABASE INITIALIZATION
-- ==========================================================
-- 
-- This script creates the complete database schema for the Defense Scheduler system.
-- It supports three main user roles: manager, assistant, and professor.
-- 
-- System Features:
-- - User management with role-based access control
-- - Defense window creation and management
-- - Professor assignment and offer system
-- - Time slot management with granular control
-- - Poll system for scheduling preferences
-- - Professor notes and comments
-- 
-- ==========================================================

-- ==========================================================
-- CLEANUP: DROP EXISTING TABLES (in dependency order)
-- ==========================================================
-- Drop tables in reverse dependency order to avoid foreign key constraint issues
DROP TABLE IF EXISTS poll_votes        CASCADE;
DROP TABLE IF EXISTS poll_options      CASCADE;
DROP TABLE IF EXISTS polls             CASCADE;
DROP TABLE IF EXISTS professor_notes   CASCADE;
DROP TABLE IF EXISTS defense_slots     CASCADE;
DROP TABLE IF EXISTS window_offers     CASCADE;
DROP TABLE IF EXISTS manager_windows   CASCADE;
DROP TABLE IF EXISTS professor_limits  CASCADE;
DROP TABLE IF EXISTS app_users         CASCADE;

-- ==========================================================
-- DEFENSE SCHEDULER — DATABASE SCHEMA
-- ==========================================================

-- ==========================================================
-- 1. USER MANAGEMENT & ROLE-BASED ACCESS CONTROL
-- ==========================================================

/**
 * Main user table for the Defense Scheduler system
 * Supports three roles: manager, assistant, professor
 * Each user has a unique authentication token for API access
 */
CREATE TABLE app_users (
    id         SERIAL PRIMARY KEY,
    fullname   TEXT NOT NULL,                    -- User's full name
    email      TEXT,                             -- Optional email address
    role       TEXT NOT NULL CHECK (role IN ('manager','assistant','professor')),
    active     BOOLEAN NOT NULL DEFAULT TRUE,    -- Account status (active/inactive)
    auth_token TEXT UNIQUE NOT NULL,             -- Bearer token for API authentication
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_users_role ON app_users(role);
CREATE INDEX idx_users_active ON app_users(active);
CREATE INDEX idx_users_auth_token ON app_users(auth_token);

/**
 * Default manager account for system initialization
 * Token: 'devtoken' (used for development and testing)
 */
INSERT INTO app_users (fullname, email, role, auth_token)
VALUES ('Default Manager', 'manager@example.com', 'manager', 'devtoken');

/**
 * Professor daily limits configuration
 * Optional table to set maximum defenses per day for professors
 * Currently not actively used but available for future features
 */
CREATE TABLE professor_limits (
    professor_id INT PRIMARY KEY,                -- References app_users.id
    max_per_day  INT NOT NULL CHECK (max_per_day >= 0)  -- Maximum defenses per day
);

-- ==========================================================
-- 2. DEFENSE WINDOW MANAGEMENT
-- ==========================================================

/**
 * Defense windows created by managers or assistants
 * Each window defines a time period for scheduling defenses
 * Windows can be offered to professors for assignment
 */
CREATE TABLE manager_windows (
    id              SERIAL PRIMARY KEY,
    created_by      INT NOT NULL,                  -- References app_users.id (manager/assistant)
    title           TEXT,                          -- Window title/description
    start_ts        TIMESTAMPTZ NOT NULL,          -- Window start time
    end_ts          TIMESTAMPTZ NOT NULL,          -- Window end time
    defense_minutes INT NOT NULL CHECK (defense_minutes > 0),    -- Duration of each defense
    buffer_minutes  INT NOT NULL CHECK (buffer_minutes >= 0),    -- Buffer time between defenses
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for window queries
CREATE INDEX idx_windows_start ON manager_windows(start_ts);
CREATE INDEX idx_windows_end   ON manager_windows(end_ts);
CREATE INDEX idx_windows_created_by ON manager_windows(created_by);

-- ==========================================================
-- 3. WINDOW OFFER SYSTEM
-- ==========================================================

/**
 * Offers made by managers/assistants to professors for defense windows
 * Tracks the status of each offer through the assignment process
 * Supports change requests and time modifications
 */
CREATE TABLE window_offers (
    id              SERIAL PRIMARY KEY,
    window_id       INT NOT NULL,                  -- References manager_windows.id
    professor_id    INT NOT NULL,                  -- References app_users.id (professor)
    status          TEXT NOT NULL CHECK (status IN ('offered','accepted','rejected','change_requested','finalized')),
    comment         TEXT,                          -- Optional comment from manager/professor
    requested_start TIMESTAMPTZ,                   -- Professor's requested start time (for changes)
    requested_end   TIMESTAMPTZ,                   -- Professor's requested end time (for changes)
    requested_window_id INT,                       -- For change requests to different windows
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_offer_window_prof UNIQUE (window_id, professor_id)  -- One offer per window-professor pair
);

-- Performance indexes for offer queries
CREATE INDEX idx_offers_professor ON window_offers(professor_id);
CREATE INDEX idx_offers_window    ON window_offers(window_id);
CREATE INDEX idx_offers_status    ON window_offers(status);
CREATE INDEX idx_offers_requested_window ON window_offers(requested_window_id);

-- ==========================================================
-- 3.1. GRANULAR SLOT OFFERS
-- ==========================================================

/**
 * Individual time slots within defense windows
 * Allows managers/assistants to offer specific time slots to professors
 * Provides granular control over defense scheduling
 */
CREATE TABLE offer_slots (
    id              SERIAL PRIMARY KEY,
    offer_id        INT NOT NULL,                  -- References window_offers.id
    slot_index      INT NOT NULL,                  -- 0-based slot index within window
    slot_start_ts   TIMESTAMPTZ NOT NULL,          -- Calculated start time for this slot
    slot_end_ts     TIMESTAMPTZ NOT NULL,          -- Calculated end time for this slot
    is_selected     BOOLEAN NOT NULL DEFAULT FALSE, -- Whether this slot is offered to professor
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_offer_slots_offer FOREIGN KEY (offer_id) REFERENCES window_offers(id) ON DELETE CASCADE
);

-- Performance indexes for slot queries
CREATE INDEX idx_offer_slots_offer ON offer_slots(offer_id);
CREATE INDEX idx_offer_slots_selected ON offer_slots(is_selected);
CREATE UNIQUE INDEX idx_offer_slots_unique ON offer_slots(offer_id, slot_index);

-- ==========================================================
-- 4. DEFENSE SLOT MANAGEMENT
-- ==========================================================

/**
 * Final defense slots assigned to professors
 * Can be generated automatically from offers or created manually
 * Represents the actual scheduled defense times
 */
CREATE TABLE defense_slots (
    id         SERIAL PRIMARY KEY,
    userid     INT,                               -- References app_users.id (professor)
    name       TEXT NOT NULL,                     -- Display name (usually professor name)
    timeslot   TIMESTAMPTZ NOT NULL,              -- Actual defense time
    approved   BOOLEAN NOT NULL DEFAULT FALSE,    -- True for finalized/generated slots
    window_id  INT,                               -- References manager_windows.id (if from window)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for defense slot queries
CREATE INDEX idx_defense_slots_timeslot ON defense_slots (timeslot);
CREATE INDEX idx_defense_slots_userid   ON defense_slots (userid);
CREATE INDEX idx_defense_slots_window   ON defense_slots (window_id);
CREATE INDEX idx_defense_slots_approved ON defense_slots (approved);

-- ==========================================================
-- 5. PROFESSOR NOTES & COMMENTS
-- ==========================================================

/**
 * Private notes and comments from professors
 * Allows professors to add notes to their defense slots
 * Supports note creation and updates with timestamps
 */
CREATE TABLE professor_notes (
    id           SERIAL PRIMARY KEY,
    professor_id INT NOT NULL,                     -- References app_users.id (professor)
    slot_id      INT NOT NULL,                     -- References defense_slots.id
    note         TEXT NOT NULL,                    -- Professor's note/comment
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for professor notes
CREATE INDEX idx_prof_notes_prof ON professor_notes(professor_id);
CREATE INDEX idx_prof_notes_slot ON professor_notes(slot_id);
CREATE INDEX idx_prof_notes_updated ON professor_notes(updated_at);

-- ==========================================================
-- 6. OPTIONAL FOREIGN KEY CONSTRAINTS
-- ==========================================================
-- 
-- These foreign key constraints are commented out for flexibility during development.
-- Uncomment them when you want stricter referential integrity.
-- 
-- Note: Some constraints use ON DELETE SET NULL to allow deletion of referenced records
-- while preserving the main record with a NULL reference.

-- ALTER TABLE manager_windows
--   ADD CONSTRAINT fk_windows_manager
--   FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;

-- ALTER TABLE window_offers
--   ADD CONSTRAINT fk_offers_window
--   FOREIGN KEY (window_id) REFERENCES manager_windows(id) ON DELETE CASCADE;
-- ALTER TABLE window_offers
--   ADD CONSTRAINT fk_offers_professor
--   FOREIGN KEY (professor_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- ALTER TABLE defense_slots
--   ADD CONSTRAINT fk_slots_user
--   FOREIGN KEY (userid) REFERENCES app_users(id) ON DELETE SET NULL;
-- ALTER TABLE defense_slots
--   ADD CONSTRAINT fk_slots_window
--   FOREIGN KEY (window_id) REFERENCES manager_windows(id) ON DELETE SET NULL;

-- ==========================================================
-- 7. POLL SYSTEM FOR SCHEDULING PREFERENCES
-- ==========================================================

/**
 * Polls for collecting scheduling preferences from professors
 * Supports two modes: text-based polls and time-slot polls
 * Allows managers/assistants to gather input before creating windows
 */
CREATE TABLE polls (
    id              SERIAL PRIMARY KEY,
    created_by      INT NOT NULL,                  -- References app_users.id (manager/assistant)
    title           TEXT NOT NULL,                 -- Poll title
    description     TEXT,                          -- Poll description
    allow_multi     BOOLEAN NOT NULL DEFAULT FALSE, -- Allow multiple selections per voter
    require_names   BOOLEAN NOT NULL DEFAULT FALSE, -- Require voter names to be displayed
    mode            TEXT NOT NULL DEFAULT 'text' CHECK (mode IN ('text','timeslots')),
    
    -- Time-slot mode fields (nullable for text polls)
    start_ts        TIMESTAMPTZ,                   -- Poll start time (for time-slot polls)
    end_ts          TIMESTAMPTZ,                   -- Poll end time (for time-slot polls)
    defense_minutes INT CHECK (defense_minutes > 0), -- Defense duration (for time-slot polls)
    buffer_minutes  INT CHECK (buffer_minutes >= 0), -- Buffer time (for time-slot polls)
    breaks_count    INT CHECK (breaks_count >= 0),   -- Number of breaks (for time-slot polls)
    break_minutes   INT CHECK (break_minutes >= 0),  -- Break duration (for time-slot polls)
    per_slot_note   TEXT,                          -- Note to display with each slot
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for poll queries
CREATE INDEX idx_polls_created ON polls(created_at DESC);
CREATE INDEX idx_polls_mode  ON polls(mode);
CREATE INDEX idx_polls_start ON polls(start_ts);
CREATE INDEX idx_polls_end   ON polls(end_ts);
CREATE INDEX idx_polls_created_by ON polls(created_by);

/**
 * Poll options/choices for each poll
 * For text polls: custom text options
 * For time-slot polls: automatically generated time slots
 */
CREATE TABLE poll_options (
    id      SERIAL PRIMARY KEY,
    poll_id INT  NOT NULL,                         -- References polls.id
    label   TEXT NOT NULL,                         -- Option text or time slot label
    ord     INT  NOT NULL DEFAULT 0                -- Display order
);

-- Performance indexes for poll options
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id, ord);

/**
 * Individual votes cast by professors on polls
 * Tracks who voted for what option
 * Supports anonymous voting (voter_id can be NULL)
 */
CREATE TABLE poll_votes (
    id         SERIAL PRIMARY KEY,
    poll_id    INT NOT NULL,                       -- References polls.id
    option_id  INT NOT NULL,                       -- References poll_options.id
    voter_id   INT,                                -- References app_users.id (professor)
    voter_name TEXT,                               -- Display name (for anonymous polls)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for poll votes
CREATE INDEX idx_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_votes_option ON poll_votes(option_id);
CREATE INDEX idx_votes_voter ON poll_votes(voter_id);

-- Ensure one vote per voter per option (UI handles updates by delete/reinsert)
CREATE UNIQUE INDEX uq_vote_once ON poll_votes(poll_id, option_id, voter_id);

-- ==========================================================
-- 8. FOREIGN KEY CONSTRAINTS FOR POLL SYSTEM
-- ==========================================================

/**
 * Foreign key constraints for the poll system
 * Ensures referential integrity between polls, options, and votes
 */

-- Poll options must reference a valid poll
ALTER TABLE poll_options
    ADD CONSTRAINT fk_poll_options_poll
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;

-- Poll votes must reference a valid poll
ALTER TABLE poll_votes
    ADD CONSTRAINT fk_poll_votes_poll
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE;

-- Poll votes must reference a valid option
ALTER TABLE poll_votes
    ADD CONSTRAINT fk_poll_votes_option
        FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE;

-- Poll votes can reference a valid user (optional for anonymous polls)
ALTER TABLE poll_votes
    ADD CONSTRAINT fk_poll_votes_user
        FOREIGN KEY (voter_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- Polls must be created by a valid user (RESTRICT prevents deletion of users who created polls)
ALTER TABLE polls
    ADD CONSTRAINT fk_polls_user
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE RESTRICT;

-- ==========================================================
-- DATABASE INITIALIZATION COMPLETE
-- ==========================================================
-- 
-- The Defense Scheduler database schema has been successfully created.
-- The system is now ready for use with the following features:
-- 
-- ✓ User management with role-based access control
-- ✓ Defense window creation and management
-- ✓ Professor assignment and offer system
-- ✓ Granular time slot management
-- ✓ Poll system for scheduling preferences
-- ✓ Professor notes and comments
-- ✓ Comprehensive indexing for performance
-- ✓ Foreign key constraints for data integrity
-- 
-- Default manager account created with token: 'devtoken'
-- 
-- ==========================================================

COMMIT;