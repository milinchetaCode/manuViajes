# Simplified Multi‑Tenant Plan for ManuViajes

## Goal
Convert the single‑user travel‑package catalog into a multi‑user platform where each travel agent gets their own custom domain (e.g., `juan.com`, `pedro.com`) showing their personal contact info while sharing the same package catalog.

---

## 1. Database Schema (Supabase / PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1️⃣ Users (tenants)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2️⃣ Profiles – editable personal info
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  about_us TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3️⃣ Domains – maps custom domains to a tenant
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4️⃣ Packages – unchanged, stays shared
-- (existing table from supabase_schema.sql)

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains  ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see/edit their own rows
CREATE POLICY "own_profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_domains" ON domains
  FOR ALL USING (auth.uid() = user_id);

-- Packages keep existing public‑read policy
```

**Admin actions (via SQL):**
```sql
-- Add a new travel agent
INSERT INTO users DEFAULT VALUES RETURNING id;  -- note the returned UUID
INSERT INTO profiles (user_id, phone, email, about_us)
VALUES ('<uuid>', '+34 600 000 000', 'juan@juan.com', 'About Juan…');

-- Add a custom domain
INSERT INTO domains (user_id, domain) VALUES ('<uuid>', 'juan.com');
```

---

## 2. Custom‑Domain Serving

| Layer | Setup |
|-------|-------|
| **DNS** | Each agent creates an `A` record (or `CNAME`) pointing their domain to your server / Vercel / Netlify endpoint. |
| **Reverse Proxy (NGINX example)** | ```nginx\nserver {\n  listen 80;\n  server_name ~^(?<domain>.+)$;\n  location / {\n    proxy_pass http://app;\n    proxy_set_header X-Tenant-Domain $domain;\n  }\n}\n``` |
| **Vercel / Netlify** | Add each custom domain in the dashboard; a serverless function reads `req.headers.host`, queries `domains` table, and attaches `tenantId` to the request. |
| **SSL** | Let’s Encrypt wildcard (`*.yourapp.com`) + DNS‑01 challenge for extra domains, or rely on platform‑managed SSL. |

---

## 3. Middleware – Tenant Resolution

```js
// middleware/resolveTenant.js
const { supabase } = require('../services/supabaseStorage');

async function resolveTenant(req, res, next) {
  const host = req.headers.host?.replace(/:\d+$/, ''); // strip port
  if (!host) return next();

  const { data, error } = await supabase
    .from('domains')
    .select('user_id')
    .eq('domain', host)
    .single();

  if (!error && data) {
    req.tenantId = data.user_id;
  }
  next();
}

module.exports = resolveTenant;
```

Add early in `app.js`:
```js
const resolveTenant = require('./middleware/resolveTenant');
app.use(resolveTenant);
```

Update `requireLogin.js` to check `req.tenantId` if you later add per‑tenant auth.

---

## 4. Profile API (minimal)

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/profile` | Returns `{ phone, email, about_us }` for `req.tenantId` |
| `PUT`  | `/api/profile` | Updates the same fields (simple token or session auth) |

Implementation sketch (`src/routes/profile.js`):
```js
router.get('/api/profile', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('phone, email, about_us')
    .eq('user_id', req.tenantId)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

router.put('/api/profile', async (req, res) => {
  const { phone, email, about_us } = req.body;
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: req.tenantId, phone, email, about_us });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});
```

---

## 5. Front‑End Integration

- In `views/partials/header.ejs` (or layout), fetch `/api/profile` on load and inject phone/email/about‑us into the template.
- Packages remain fetched from the shared `packages` table – no changes needed.

---

## 6. Testing Strategy

1. **Unit** – Test `resolveTenant` with mocked Supabase responses.
2. **Integration** – Spin up a test DB, insert two users + domains, hit endpoints with different `Host` headers, verify isolation.
3. **E2E** – Deploy to staging, configure `test1.example.com` and `test2.example.com`, confirm each shows correct contact info and identical package list.

---

## 7. Deployment & Rollout

| Phase | Steps |
|-------|-------|
| **Staging** | Run SQL migrations, add `resolveTenant` middleware, deploy profile API, test with two dummy domains. |
| **Beta** | Invite 1‑2 agents, give them DNS instructions, monitor logs for domain resolution errors. |
| **Production** | Apply migrations to prod, enable custom‑domain SSL, announce to all agents. |

---

## 8. Open Questions / Assumptions

- **Auth** – Currently a single admin login; per‑tenant login can be added later (email/password or magic link).
- **SSL** – Platform must support wildcard + custom domains (Vercel/Netlify/NGINX + certbot).
- **Rate limiting** – Scope by `tenantId` + IP if needed.
- **Backups** – Ensure Supabase point‑in‑time recovery covers new tables.

---

## 9. Next Steps (when ready to implement)

1. Run the SQL migrations in Supabase.
2. Add `resolveTenant` middleware and profile routes.
3. Update header/footer partials to consume `/api/profile`.
4. Configure reverse proxy / platform for custom domains.
5. Test end‑to‑end with a couple of real domains.

---

*This plan keeps everything SQL‑adminable, avoids building an admin UI, and focuses on the minimal code changes needed to support custom domains and per‑tenant contact info.*