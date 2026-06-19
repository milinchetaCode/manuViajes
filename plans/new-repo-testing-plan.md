# New Repo Testing Plan for ManuViajes

## Why This Approach
Creating a new repository for testing ensures your live site remains stable while you implement custom domains and multi-user features. This is a safe way to validate changes before DNS updates.

---

## Steps to Execute
1. **Create a new repository**
   - Initialize a fresh Git repo (e.g., `manuViajes-test`).
   - Copy all files from your current project (`/home/bon/Documents/manuViajes`) into this repo.
   - Ensure critical files like `supabase_schema.sql`, `middleware/resolveTenant.js`, and `app.js` are included.

2. **Set up environment variables**
   - In the new repo, configure environment variables for test clients (e.g., `CLIENT_NAME=Juan`, `CLIENT_PHONE=+34...`).
   - Update `app.js` to read these variables for profile data.

3. **Deploy to Render (test environment)**
   - Push the new repo to Render as a **new Web Service**.
   - Add test domains (e.g., `test-juan.com`, `test-pedro.com`) in Render's *Custom Domains* settings.
   - Verify DNS propagation (use `dig test-juan.com` to check).

4. **Test thoroughly**
   - Confirm profile editing works via `/api/profile`.
   - Ensure package data is shared across domains.
   - Test middleware resolves `tenantId` correctly from `Host` header.

5. **Move DNS only after success**
   - Once testing is complete, update DNS records for client domains to point to Render's new service.
   - Monitor logs for errors during DNS cutover.

---

## Cost & Risk Considerations
- **Cost**: Only one Render service (free tier or $7/mo) for testing.
- **Risk**: Zero impact on live site during testing.
- **Time**: Allows iterative testing without pressure.

---

## Tools to Use
- `write_to_file` for creating config files in the new repo.
- `list_files` to verify all assets are copied.
- `read_file` to check middleware or schema logic.

This plan ensures you validate everything in isolation before affecting your live site.