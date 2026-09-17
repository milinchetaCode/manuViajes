# Frontend Look & Feel — Approved Changes

**Plan file**: `.kilo/plans/1786115326627-frontend-look-and-feel-improvements.md`
**Goal**: Apply the user-approved subset of the frontend improvement catalog: delete FAQ, SEO/perf basics, footer enrichment, rebuild 404/500, about-page cleanup, and paquete detail fixes. Keep the navy (#1A2238) + gold (#D4AF37) identity. No layout refactor, no header nav changes, no admin changes.

## Approved scope (user-confirmed)

1. Delete FAQ page and remove all links/routes to it.
2. **G** — SEO & performance (G1–G4).
3. **F** — Footer enrichment (F1, keep admin link per F2).
4. **E2** rebuild 404 on-brand, **E3** rebuild 500 on-brand, **E4** about page inline-hack removal.
5. **D2** fix related-packages markup, **D3** breadcrumb contrast.

Explicitly out of scope: A (shared layout refactor, dead-code deletion beyond FAQ), B (header nav), C (homepage changes), D1, E5, E6, H (accessibility items), admin panel.

## Key context for implementer

- Stack: Express + EJS, each page is a standalone HTML doc (no shared layout). Tailwind compiled to `public/styles/output.css`; `public/styles/theme.css` loaded separately on every real page.
- Helmet CSP (`app.js:31-51`): only `scriptSrc 'self' + googletagmanager`. Do NOT introduce any CDN scripts. All changes must be CSP-compliant.
- Fonts currently load ONLY via `@import` at top of `theme.css` (verified: `output.css` contains no font import).
- Deployment is multi-tenant on Render (multiple custom domains — see `plans/render-custom-domain-setup.md`), so OG/meta URLs must NOT hardcode a domain; derive from request host.
- `app.js:94-97` middleware already sets `res.locals.currentPage` — extend it there.
- Default site description (from `metadata.json`): "Una boutique de viajes y eventos deportivos de primer nivel, incluyendo paquetes exclusivos de Fórmula 1, Fútbol, Tenis y Básquet."
- Assets available: `/images/logo.png`, `/images/hero.jpeg` (default OG image), `/images/fav1616.png`, `/images/fav3232.png` (favicons, currently unused).
- 404 is rendered with `{ message, currentPage }` (`app.js:124`, `src/routes/paquete.js:17`); 500 with `{ message, error, currentPage }` (`app.js:136`).
- FAQ references found: `views/faq.ejs`, route at `app.js:118-120`, link at `views/layout.ejs:39` (layout.ejs is dead code but keep the file — only remove the link).

## Ordered tasks

### 1. Delete FAQ
- Delete `views/faq.ejs`.
- Remove the `/faq` route from `app.js` (lines 118-120).
- Remove the `<a href="/faq">` link from `views/layout.ejs:39`.
- Do NOT add any FAQ link in the new footer.

### 2. SEO/meta plumbing in `app.js`
- Extend the existing `res.locals.currentPage` middleware to also set:
  - `res.locals.siteUrl = req.protocol + '://' + req.get('host')`
- (Per-page titles/descriptions/og:image are set inline in each view's `<head>`.)

### 3. `theme.css` cleanup (G3 + E4 dependency)
- Remove the Google Fonts `@import url(...)` line (line 2). Fonts will be loaded via `<link>` in each page head instead.
- Add a generic rule so white cards have dark text (replaces the about.ejs inline hack):
  ```css
  .bg-white { color: var(--card-text) !important; }
  .bg-white p { color: rgba(17, 24, 39, 0.85) !important; }
  ```

### 4. Shared head snippet (copy into each page — no shared layout in scope)
For every page touched below, the `<head>` must contain:
- `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- Font link: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap`
- Favicons: `<link rel="icon" type="image/png" sizes="16x16" href="/images/fav1616.png">`, `sizes="32x32" href="/images/fav3232.png"`
- `<meta name="description" content="...">` (page-specific or default)
- OG tags: `og:title`, `og:description`, `og:type=website`, `og:url=<%= siteUrl %>`, `og:image` (default `/images/hero.jpeg` as absolute URL: `<%= siteUrl %>/images/hero.jpeg`)
- Keep existing `output.css` + `theme.css` links and GA include.

### 5. E2 — Rebuild `views/404.ejs`
- Full valid HTML doc (doctype/head/body), apply head snippet from task 4, title "404 - Página no encontrada".
- On-brand design: navy background (theme.css handles canvas), large Playfair "404", gold divider, `<%= message %>` fallback text, `btn-accent` CTA to "/".
- Include `partials/header` and `partials/footer` INSIDE `<body>` (fixes current invalid structure).

### 6. E3 — Rebuild `views/500.ejs`
- Full valid HTML doc + head snippet, title "Error del servidor".
- Readable colors on navy (light text, gold accent), show `<%= message %>`, and render `<%= error.message %>` only when `error` is truthy (dev mode).
- `btn-accent` CTA to "/". Include header/footer partials inside body.

### 7. E4 — `views/about.ejs`
- Remove the inline `<style>` block (lines 19-29) — replaced by the theme.css rule from task 3.
- Remove `<script src="https://unpkg.com/feather-icons"></script>` (line 17) and replace with local `<script src="/js/feather.min.js" defer></script>` — NOTE: this specific swap was not explicitly approved as A3, but the unpkg script is CSP-blocked and the page already calls `feather.replace()`; the local file is already used on other pages. Flag this in the completion summary so the user can revert if desired.
- Add head snippet (task 4).

### 8. D2 + D3 + SEO — `views/paquete.ejs`
- **D2**: wrap the related-packages grid `<li>` items in a `<ul>` with the same grid classes (move `grid ...` classes from the `<div>` to the `<ul>`, or restructure so `<ul class="grid ...">` contains the `<li class="card">` items).
- **D3**: breadcrumb contrast on navy — links `text-slate-300 hover:text-accent`, separators `text-slate-500`, current page `text-white`.
- Add head snippet: title already dynamic; description = first ~150 chars of `paquete.description` (truncate safely); `og:image` = package photo URL (same fallback chain already used for the `<img>`), `og:url` = `<%= siteUrl %>/paquete/<%= paquete.id %>`.
- G4: add `width`/`height` attributes (or keep fixed h-* classes; add aspect-ratio-safe attrs) on the main and related images.

### 9. G on `views/index.ejs`
- Add head snippet: default description, `og:image` = hero.jpeg, `og:url` = siteUrl.
- G4: add width/height attributes on card images (grid already uses fixed `h-48 object-cover`).
- No other homepage changes (C items out of scope).

### 10. G on `views/hoteles.ejs` and `views/login.ejs`
- Add head snippet to both (page-specific titles/descriptions). No layout changes (E5/E6 out of scope).

### 11. F1 — Enrich `views/partials/footer.ejs`
- Restructure to a 3-column grid on desktop (stacks on mobile):
  1. Brand: logo + name + existing legal/legend lines (VDV Mayorista / Tatajuba).
  2. "Navegación": links to `/` (Inicio), `/hoteles` (Buscador de Hoteles), `/about` (Sobre nosotros). NO FAQ link.
  3. "Consultas": existing email + phone block.
- Keep the "Experiencia" button and bottom bar with copyright + discreet `/admin/login` link (F2).
- Keep existing dark styling (`bg-gray-900`) — it works on the navy canvas; only polish spacing/typography.

### 12. Rebuild CSS
- Run `npm run build:css` (regenerates `output.css` from `tailwind.css` which imports `theme.css`).

## Risks & notes

- Removing the font `@import` (task 3) without adding `<link>` tags (task 4) would break typography on every page — do tasks 3+4 together and verify visually.
- `layout.ejs` stays (dead code, deletion not approved) — only the FAQ link inside it is removed.
- OG absolute URLs depend on `req.get('host')` + `trust proxy` (already set in `app.js:72`) — correct behind Render's proxy.
- The about.ejs unpkg→local feather swap is a pragmatic CSP fix bundled with E4; call it out in the final summary.

## Validation

1. `npm run build:css` succeeds.
2. `npm run dev`; visit `/`, `/paquete/<id>`, `/about`, `/hoteles`, `/login`, a bogus URL (404). Check:
   - Fonts render (Inter/Playfair), favicons appear, no console errors, no CSP violations.
   - View-source: meta description + OG tags present; `og:url`/`og:image` are absolute URLs matching the request host.
   - `/faq` returns 404; no "Qualy Tours" or FAQ references remain (`rg -i "faq|qualy" views/ src/ app.js`).
   - 404/500 pages readable on navy, header/footer render, CTA works.
   - About page white card text is dark and readable.
   - Paquete page: related grid valid markup, breadcrumb legible.
   - Footer: nav links work, admin link intact.
3. Mobile-width spot check on home + footer.
