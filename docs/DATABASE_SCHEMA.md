# LifeLink — Database Schema

Complete table/collection design derived from the frontend models and every
service call. Written for **PostgreSQL** (recommended for the PostGIS spatial
support) but works with MySQL or MongoDB with the noted swaps.

---

## 1. Users & Auth

### `users`
Primary account table. One row per registered person.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `full_name` | `VARCHAR(120)` NOT NULL | |
| `email` | `VARCHAR(255)` NOT NULL UNIQUE | index |
| `phone` | `VARCHAR(20)` NOT NULL UNIQUE | E.164 |
| `password_hash` | `VARCHAR(255)` NOT NULL | bcrypt/argon2 |
| `role` | `ENUM('donor','requester','admin','hospital_staff')` NOT NULL | |
| `blood_group` | `ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-')` NULL | |
| `date_of_birth` | `DATE` NULL | |
| `gender` | `ENUM('male','female','other')` NULL | |
| `avatar_url` | `TEXT` NULL | |
| `is_verified` | `BOOLEAN` NOT NULL DEFAULT false | |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` NOT NULL | trigger to auto-update |

**Indexes:** `email`, `phone`, `(role, is_verified)`.

### `refresh_tokens`
For rotating JWTs (the frontend's `RefreshCoordinator` calls `/auth/refresh`).

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `user_id` | `UUID` FK → `users.id` ON DELETE CASCADE | |
| `token_hash` | `VARCHAR(255)` NOT NULL | hash the token, never store raw |
| `expires_at` | `TIMESTAMPTZ` NOT NULL | ~7 days |
| `revoked_at` | `TIMESTAMPTZ` NULL | | 
| `user_agent` | `TEXT` NULL | audit |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

**Indexes:** `(user_id, revoked_at)`, `token_hash`.

### `push_subscriptions`
For browser push notifications (Phase 6).

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `user_id` | `UUID` FK → `users.id` ON DELETE CASCADE | |
| `endpoint` | `TEXT` NOT NULL UNIQUE | Web Push endpoint URL |
| `p256dh_key` | `TEXT` NOT NULL | encryption key |
| `auth_key` | `TEXT` NOT NULL | auth secret |
| `user_agent` | `TEXT` NULL | |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

---

## 2. Donor Profiles

### `donors`
Extended profile — one row per user with `role='donor'`.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `user_id` | `UUID` FK UNIQUE → `users.id` ON DELETE CASCADE | |
| `location` | `GEOGRAPHY(POINT, 4326)` NOT NULL | PostGIS point |
| `address_line1` | `VARCHAR(200)` NULL | |
| `city` | `VARCHAR(80)` NULL | |
| `state` | `VARCHAR(80)` NULL | |
| `postal_code` | `VARCHAR(20)` NULL | |
| `country` | `CHAR(2)` NULL | ISO |
| `availability` | `ENUM('available','unavailable','recovering')` NOT NULL DEFAULT 'available' | |
| `last_donation_date` | `DATE` NULL | drives 56-day rule |
| `total_donations` | `INTEGER` NOT NULL DEFAULT 0 | |
| `is_eligible` | `BOOLEAN` NOT NULL DEFAULT true | computed nightly |
| `weight_kg` | `DECIMAL(5,2)` NULL | |
| `hemoglobin` | `DECIMAL(4,2)` NULL | g/dL |
| `chronic_conditions` | `TEXT[]` NULL | |
| `rating_avg` | `DECIMAL(3,2)` NULL | 0..5 |
| `response_rate_avg` | `DECIMAL(4,3)` NULL | 0..1 |
| `updated_at` | `TIMESTAMPTZ` NOT NULL | |

**Indexes:**
- `GIST(location)` — spatial radius search (this is the main hot query)
- `(blood_group_from_user, availability, is_eligible)` — filter before ranking
- `user_id` (unique)

**Non-Postgres swap:** replace `GEOGRAPHY` with two `DECIMAL(10,7)` columns for
lat/lng and do Haversine in app code (what the frontend does).

---

## 3. Hospitals & Blood Banks

### `hospitals`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `name` | `VARCHAR(200)` NOT NULL | |
| `phone` | `VARCHAR(20)` NOT NULL | |
| `email` | `VARCHAR(255)` NULL | |
| `website` | `TEXT` NULL | |
| `location` | `GEOGRAPHY(POINT, 4326)` NOT NULL | |
| `address_line1` `city` `state` `postal_code` `country` | same as donors | |
| `emergency_24x7` | `BOOLEAN` NOT NULL DEFAULT false | |
| `has_blood_bank` | `BOOLEAN` NOT NULL DEFAULT false | |
| `specialties` | `TEXT[]` NULL | |
| `rating_avg` | `DECIMAL(3,2)` NULL | |
| `created_at` `updated_at` | `TIMESTAMPTZ` | |

**Indexes:** `GIST(location)`, `(emergency_24x7)`, `(has_blood_bank)`.

### `blood_banks`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `name` | `VARCHAR(200)` NOT NULL | |
| `phone` | `VARCHAR(20)` NOT NULL | |
| `operating_hours` | `VARCHAR(80)` NOT NULL | e.g. "24x7" |
| `location` | `GEOGRAPHY(POINT, 4326)` NOT NULL | |
| `affiliated_hospital_id` | `UUID` FK → `hospitals.id` NULL | |
| `address_line1` `city` `state` `postal_code` `country` | | |
| `created_at` `updated_at` | | |

### `blood_stock`
One row per (bank, blood group) pair — the units count changes constantly.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `blood_bank_id` | `UUID` FK → `blood_banks.id` ON DELETE CASCADE | |
| `blood_group` | `ENUM(...)` NOT NULL | |
| `units_available` | `INTEGER` NOT NULL DEFAULT 0 | |
| `level` | `ENUM('critical','low','moderate','high')` NOT NULL | derived, but stored for fast filtering |
| `last_updated` | `TIMESTAMPTZ` NOT NULL | |

**Constraint:** `UNIQUE (blood_bank_id, blood_group)`.
**Indexes:** `(blood_group, units_available)` for "any bank with A+ in stock" queries.

---

## 4. Blood Requests

### `blood_requests`
Every "New Request" form submission creates a row.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `requester_id` | `UUID` FK → `users.id` | |
| `patient_name` | `VARCHAR(120)` NULL | |
| `blood_group` | `ENUM(...)` NOT NULL | |
| `units_needed` | `SMALLINT` NOT NULL CHECK (1..20) | |
| `urgency` | `ENUM('routine','urgent','emergency')` NOT NULL | |
| `status` | `ENUM('open','matched','fulfilled','cancelled','expired')` NOT NULL DEFAULT 'open' | |
| `hospital_id` | `UUID` FK → `hospitals.id` NULL | |
| `hospital_name` | `VARCHAR(200)` NULL | denormalized if hospital not in db |
| `location` | `GEOGRAPHY(POINT, 4326)` NOT NULL | |
| `needed_by` | `TIMESTAMPTZ` NOT NULL | |
| `notes` | `TEXT` NULL | |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` NOT NULL | |

**Indexes:** `(status, urgency, created_at)`, `GIST(location)`, `requester_id`.

### `request_matches`
Which donors were matched to a request, and how they responded. This backs the
"matched_donor_ids" field on the frontend `BloodRequest` model.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `request_id` | `UUID` FK → `blood_requests.id` ON DELETE CASCADE | |
| `donor_id` | `UUID` FK → `donors.id` ON DELETE CASCADE | |
| `score` | `DECIMAL(4,3)` NOT NULL | the 0..1 ranking score |
| `distance_km` | `DECIMAL(6,2)` NOT NULL | |
| `reasons` | `TEXT[]` NOT NULL | mirrors `RankedDonor.reasons` |
| `notified_at` | `TIMESTAMPTZ` NULL | |
| `response` | `ENUM('pending','accepted','declined','expired')` NOT NULL DEFAULT 'pending' | |
| `responded_at` | `TIMESTAMPTZ` NULL | drives response_rate_avg |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

**Constraint:** `UNIQUE (request_id, donor_id)`.
**Indexes:** `(donor_id, response)` for "my open matches", `(request_id, score DESC)`.

---

## 5. Donations (History)

### `donations`
Populates the History page.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `donor_id` | `UUID` FK → `donors.id` | |
| `request_id` | `UUID` FK → `blood_requests.id` NULL | may be walk-in |
| `blood_group` | `ENUM(...)` NOT NULL | |
| `units` | `SMALLINT` NOT NULL | |
| `status` | `ENUM('scheduled','completed','cancelled','deferred')` NOT NULL | |
| `blood_bank_id` | `UUID` FK NULL | |
| `hospital_name` | `VARCHAR(200)` NULL | |
| `donated_at` | `TIMESTAMPTZ` NOT NULL | |
| `certificate_url` | `TEXT` NULL | S3 pre-signed link |
| `notes` | `TEXT` NULL | |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

**Indexes:** `(donor_id, donated_at DESC)`, `(status, donated_at)`.

**Business rule:** on `INSERT` with `status='completed'`, trigger updates
`donors.total_donations += units` and `donors.last_donation_date`.

---

## 6. Notifications

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `user_id` | `UUID` FK → `users.id` ON DELETE CASCADE | |
| `type` | `ENUM('donor_match','blood_request','emergency_alert','eligibility_reminder','donation_confirmed','system')` NOT NULL | |
| `severity` | `ENUM('info','success','warning','critical')` NOT NULL | |
| `title` | `VARCHAR(200)` NOT NULL | |
| `body` | `TEXT` NOT NULL | |
| `action_url` | `TEXT` NULL | e.g. `/requests/req-…` |
| `metadata` | `JSONB` NULL | flexible fields per type |
| `read` | `BOOLEAN` NOT NULL DEFAULT false | |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

**Indexes:** `(user_id, read, created_at DESC)` — feeds the bell badge count.

---

## 7. AI Chat History (optional but recommended)

### `ai_conversations`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `user_id` | `UUID` FK → `users.id` | |
| `title` | `VARCHAR(200)` NULL | auto-generated from first message |
| `created_at` `updated_at` | | |

### `ai_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `conversation_id` | `UUID` FK ON DELETE CASCADE | |
| `role` | `ENUM('user','assistant','system','tool')` NOT NULL | |
| `content` | `TEXT` NOT NULL | |
| `tool_events` | `JSONB` NULL | array of `{ name, args, result }` |
| `token_usage` | `INTEGER` NULL | for cost tracking |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

**Indexes:** `(conversation_id, created_at)`.

---

## 8. Admin / Audit

### `audit_log`
For admin actions (verify user, force-fulfill request, etc.) — the Admin Users
and Admin Requests screens fire these.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `actor_id` | `UUID` FK → `users.id` | who did it |
| `action` | `VARCHAR(80)` NOT NULL | e.g. `user.verified`, `request.fulfilled` |
| `target_type` | `VARCHAR(40)` NOT NULL | `user`, `request`, `donor` |
| `target_id` | `UUID` NOT NULL | |
| `metadata` | `JSONB` NULL | before/after diff |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

### `analytics_events` (optional — usually a third-party like PostHog)
| Column | Type | Notes |
|---|---|---|
| `id` | `BIGSERIAL` PK | |
| `user_id` | `UUID` NULL | anon events allowed |
| `name` | `VARCHAR(80)` NOT NULL | e.g. `search.performed` |
| `props` | `JSONB` NOT NULL | matches the AnalyticsEvent union |
| `session_id` | `UUID` NULL | |
| `ip_hash` | `VARCHAR(64)` NULL | |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | |

---

## 9. Relationship map

```
users ──┬── donors  (1:1 when role='donor')
        │
        ├── blood_requests  (1:N as requester)
        │
        ├── notifications  (1:N)
        ├── ai_conversations  (1:N)
        ├── refresh_tokens  (1:N)
        ├── push_subscriptions  (1:N)
        └── audit_log (as actor)  (1:N)

donors ─┬── request_matches  (1:N)
        └── donations  (1:N)

blood_requests ─┬── request_matches  (1:N)
                ├── donations  (0..1)
                └── hospitals (0..1 optional FK)

hospitals ── blood_banks  (1:N via affiliated_hospital_id)

blood_banks ── blood_stock  (1:N, one row per blood group)

ai_conversations ── ai_messages  (1:N)
```

---

## 10. Critical indexes summary

Focus on these — they cover 90% of query load:

```sql
-- Radius searches (donors, hospitals, blood banks)
CREATE INDEX ix_donors_location    ON donors    USING GIST (location);
CREATE INDEX ix_hospitals_location ON hospitals USING GIST (location);
CREATE INDEX ix_banks_location     ON blood_banks USING GIST (location);

-- Ranking pre-filter (before we compute score in app code)
CREATE INDEX ix_donors_available
  ON donors (availability, is_eligible)
  WHERE availability = 'available' AND is_eligible = true;

-- Notification bell badge
CREATE INDEX ix_notif_unread
  ON notifications (user_id, created_at DESC)
  WHERE read = false;

-- Admin request table filters
CREATE INDEX ix_reqs_status ON blood_requests (status, urgency, created_at DESC);

-- Blood bank "who has A+ in stock nearby?"
CREATE INDEX ix_stock_group ON blood_stock (blood_group, units_available)
  WHERE units_available > 0;

-- Donation history
CREATE INDEX ix_donations_donor_date ON donations (donor_id, donated_at DESC);
```

---

## 11. Recommended tech choices

| Concern | Recommendation | Why |
|---|---|---|
| Primary DB | **PostgreSQL 15+** with PostGIS | spatial indexes make donor/hospital search fast, JSONB for flexible metadata |
| Session store / rate limiting | Redis | JWT blacklist, WS pub/sub for real-time notifications |
| Search ranking | Python (compute in app) or stored function | mirror `donor-ranking.util.ts` weights exactly |
| Files (certificates, avatars) | S3 / R2 / MinIO | store `certificate_url` as pre-signed |
| Migrations | Alembic (if FastAPI) | tied to SQLAlchemy models |
| ORM | SQLAlchemy 2.0 async or SQLModel | matches Pydantic |

---

## 12. Rough sizing (year 1 assumptions)

Assuming 50k users, 10k active donors, 500 hospitals, 100 blood banks,
200 requests/day, 50 donations/day:

| Table | Rows/year | Storage estimate |
|---|---|---|
| users | 50k | ~20 MB |
| donors | 10k | ~5 MB |
| blood_requests | 73k | ~40 MB |
| request_matches | 730k (10 matches/request avg) | ~150 MB |
| donations | 18k | ~10 MB |
| notifications | 500k | ~200 MB |
| ai_messages | 1M (heavy chat use) | ~800 MB |
| **Total** | | **~1.3 GB / year** — trivially small |

Bottleneck at 10x scale will be spatial queries, not storage. Keep the GIST
indexes healthy (VACUUM) and pre-filter aggressively before ranking.
