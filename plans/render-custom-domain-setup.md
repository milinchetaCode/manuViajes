# Render.com – Custom Domain & Reverse‑Proxy Setup for Multi‑Tenant ManuViajes

## 1. Overview
Render hosts your Node/Express app behind its own load balancer. To serve **different custom domains** (e.g., `juan.com`, `pedro.com`) that all point to the same service, you need to:
1. **Add each domain** in the Render dashboard so Render knows to accept traffic for it.
2. **Configure DNS** at the domain registrar to point to Render’s load‑balancer IP.
3. **Let the app resolve the tenant** from the incoming `Host` header (already handled by the `resolveTenant` middleware).
4. (Optional) **Enable HTTPS** – Render automatically provisions TLS certificates for every custom domain you add.

## 2. Adding Domains in Render
1. Open your service (the web service that runs `app.js`).
2. Click **Settings → Custom Domains**.
3. For each client domain:
   - Press **Add Custom Domain**.
   - Enter the full domain (e.g., `juan.com`).
   - Render will display a **CNAME** target like `your‑service.onrender.com` **or** an **A‑record** IP address (e.g., `34.102.123.45`).
4. Click **Save**. Render will start a verification process (see DNS step).

## 3. DNS Configuration at the Registrar
| Record Type | Value (Render) | TTL | Notes |
|------------|----------------|-----|-------|
| **CNAME** (preferred) | `your‑service.onrender.com` | 300 | Use for sub‑domains (`www.juan.com`). For apex domains (`juan.com`) many registrars support **ALIAS** or **ANAME** pointing to the same target. |
| **A** (if CNAME not possible) | Render‑provided IP (e.g., `34.102.123.45`) | 300 | Only for apex domains. |

After adding the record, wait for propagation (usually < 5 min). Render will show the domain as **Verified** once the DNS resolves correctly.

## 4. Automatic HTTPS
Render automatically issues a **Let’s Encrypt** certificate for every verified custom domain. No extra steps are required – the service will serve traffic over HTTPS as soon as verification succeeds.

## 5. How the App Handles the Request
1. The client browser sends a request to `https://juan.com`.
2. Render’s load balancer forwards the request to your Node process **preserving the original `Host` header**.
3. The `resolveTenant` middleware (see `middleware/resolveTenant.js` in the plan) reads `req.headers.host` (`juan.com`).
4. It queries the `domains` table in Supabase to obtain the `user_id` (tenant ID) and stores it on `req.tenantId`.
5. All subsequent route handlers can use `req.tenantId` to fetch the correct profile, enforce RLS, etc.

> **Important:** Do **not** enable any host‑based routing in Render’s UI – the routing is performed entirely by your application.

## 6. Scaling Considerations
- **Rate limiting** should be scoped by `req.tenantId` + IP (already in the plan).
- If you use multiple Render services (e.g., a separate worker), make sure they also include the `resolveTenant` logic for any HTTP calls that need tenant context.
- Render’s free tier limits the number of custom domains (usually 5). For more domains, upgrade to a paid plan.

## 7. Troubleshooting Checklist
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 404 from Render (domain not found) | DNS not pointing to Render or not yet propagated | Verify CNAME/A record, run `dig juan.com` and ensure it resolves to Render’s target. |
| SSL error (certificate mismatch) | Domain not verified yet | Wait for verification; check Render dashboard for status. |
| `req.tenantId` is `undefined` | Domain not present in `domains` table or typo in domain entry | Insert the correct domain row in Supabase (`INSERT INTO domains (user_id, domain) VALUES (…)`). |
| Rate‑limit too aggressive across tenants | Middleware uses global key instead of tenant‑scoped key | Update `rateLimiter` to include `req.tenantId` in the key (e.g., `${req.tenantId}:${ip}`). |

## 8. Example Commands (optional CLI via Render)
If you prefer the Render CLI:
```bash
# Add a custom domain (replace placeholders)
render services add-domain <service-id> --domain juan.com
```
Render will output the DNS target you need to configure.

---

### TL;DR Steps
1. **Render Dashboard → Settings → Custom Domains → Add** each client domain.
2. **Update DNS** at the registrar (CNAME or A record) to point to Render’s target.
3. **Wait for verification** (Render shows a green check).
4. **Render auto‑creates HTTPS** certs.
5. **App resolves tenant** from `Host` header via `resolveTenant` middleware (already in code plan).
6. **Test** by visiting the domain; the correct profile data should appear.

You can now onboard new travel‑agents simply by inserting a row into the `domains` table and pointing their DNS to Render.
