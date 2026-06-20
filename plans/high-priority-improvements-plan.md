# High Priority Improvements - Implementation Plan

## Overview

This plan addresses the three high-priority improvements identified in the layout analysis of [`index.ejs`](views/index.ejs):

1. **Remove duplicate `feather.min.js` loading** (Performance)
2. **Make Tatajuba iframe responsive** (Mobile)
3. **Use responsive heights for hero slider images** (Mobile)

---

## 1. Remove Duplicate `feather.min.js` Loading

### Problem

`feather.min.js` is loaded in **two places**:
- [`views/index.ejs:16`](views/index.ejs:16) — in the `<head>` with `defer`
- [`views/partials/header.ejs:31`](views/partials/header.ejs:31) — at the end of the header partial

This causes the script to be fetched and parsed twice, wasting bandwidth and potentially causing race conditions with `feather.replace()`.

### Solution

**Keep the script in [`views/index.ejs`](views/index.ejs) `<head>` only** (line 16), and **remove it from [`views/partials/header.ejs`](views/partials/header.ejs:31)**.

The `feather.replace()` call in [`public/js/main.js:4-6`](public/js/main.js:4) already runs on `DOMContentLoaded` with `defer`, so the script will be available by then.

### Files to Change

| File | Action |
|------|--------|
| [`views/partials/header.ejs`](views/partials/header.ejs:31) | Remove line 31: `<script src="/js/feather.min.js" defer></script>` |
| [`views/index.ejs`](views/index.ejs:16) | Keep as-is (no change needed) |

### Implementation

In [`views/partials/header.ejs`](views/partials/header.ejs), change lines 30-32 from:
```html
<!-- Local Feather Icons + header initialization -->
<script src="/js/feather.min.js" defer></script>
<script src="/js/header.js" defer></script>
```

To:
```html
<!-- Header initialization (feather already loaded in head) -->
<script src="/js/header.js" defer></script>
```

---

## 2. Make Tatajuba Iframe Responsive

### Problem

The iframe at [`views/index.ejs:25`](views/index.ejs:25) uses:
```html
<div class="px-[10%] py-4">
  <iframe class="w-full h-[440px] mx-auto" ...></iframe>
</div>
```

Issues:
- **Fixed height `h-[440px]`** — too tall on mobile, may cause horizontal scroll
- **`px-[10%]`** — on very small screens (320px), this leaves only 256px of usable width
- **No aspect-ratio container** — the iframe doesn't scale proportionally

### Solution

Use a **responsive aspect-ratio container** with the CSS `aspect-ratio` property (widely supported in all modern browsers). The Tatajuba widget appears to be roughly a 16:9 or 4:3 ratio based on its 440px height.

We'll use a **container with responsive padding** and `aspect-video` (16:9) or a custom aspect ratio.

### Implementation

In [`views/index.ejs`](views/index.ejs), replace lines 24-26:

**Before:**
```html
<div class="px-[10%] py-4">
  <iframe class="w-full h-[440px] mx-auto" frameborder="0" scrolling="no" 
    src="https://www.tatajuba.travel/es/microsite/manu/engine/iframe"></iframe>
</div>
```

**After:**
```html
<!-- Tatajuba travel widget - responsive -->
<section class="px-4 md:px-[10%] py-4">
  <div class="max-w-4xl mx-auto">
    <div class="aspect-[16/9] md:aspect-[4/3]">
      <iframe 
        class="w-full h-full rounded-xl shadow-lg" 
        frameborder="0" 
        scrolling="no" 
        src="https://www.tatajuba.travel/es/microsite/manu/engine/iframe"
        title="Tatajuba travel booking widget"
        loading="lazy"
        allowfullscreen>
      </iframe>
    </div>
  </div>
</section>
```

**Key changes:**
| Change | Reason |
|--------|--------|
| `<section>` instead of `<div>` | Semantic HTML |
| `px-4 md:px-[10%]` | Smaller padding on mobile, original on desktop |
| `max-w-4xl mx-auto` | Constrain width on large screens |
| `aspect-[16/9] md:aspect-[4/3]` | Responsive aspect ratio — wider on mobile, taller on desktop |
| `h-full` on iframe | Fills the aspect-ratio container |
| `rounded-xl shadow-lg` | Visual polish |
| `title` attribute | Accessibility (screen readers) |
| `loading="lazy"` | Performance — defers loading until near viewport |

---

## 3. Use Responsive Heights for Hero Slider Images

### Problem

The hero slider images at [`views/index.ejs:42`](views/index.ejs:42) use a fixed height:
```html
<img ... class="w-full h-[500px] object-contain ..." />
```

On mobile screens (320-480px wide), a 500px tall image takes up the entire viewport, pushing content below the fold.

### Solution

Use **Tailwind responsive height utilities** to scale the image height based on screen size:
- **Mobile (default):** `h-[250px]` — compact, shows content below
- **Tablet (md: 768px):** `h-[350px]` — medium
- **Desktop (lg: 1024px):** `h-[500px]` — original size

### Implementation

In [`views/index.ejs`](views/index.ejs), replace line 42:

**Before:**
```html
<img src="<%= imgUrl %>"
  class="w-full h-[500px] object-contain object-center cursor-pointer hero-img" />
```

**After:**
```html
<img src="<%= imgUrl %>"
  class="w-full h-[250px] md:h-[350px] lg:h-[500px] object-contain object-center cursor-pointer hero-img" 
  alt="Hero image"
  loading="<%= heroImages.indexOf(imgUrl) === 0 ? 'eager' : 'lazy' %>" />
```

**Key changes:**
| Change | Reason |
|--------|--------|
| `h-[250px] md:h-[350px] lg:h-[500px]` | Responsive heights |
| `alt="Hero image"` | Accessibility |
| `loading="eager"` for first image | Prioritize LCP |
| `loading="lazy"` for subsequent images | Defer off-screen images |

> **Note:** The EJS `indexOf` check requires `heroImages` to be an array of strings. If it's an array of objects with `secure_url`, adjust accordingly: `<%= heroImages.indexOf(img) === 0 ? 'eager' : 'lazy' %>`.

---

## Additional CSS Support (if needed)

The `aspect-[16/9]` and `aspect-[4/3]` utilities require Tailwind v3.2+ with the `aspect-ratio` plugin. If not available, add to [`public/styles/theme.css`](public/styles/theme.css):

```css
/* Responsive iframe container */
.aspect-16-9 { aspect-ratio: 16 / 9; }
.aspect-4-3 { aspect-ratio: 4 / 3; }
```

Then use `class="aspect-16-9 md:aspect-4-3"` instead.

---

## Testing Checklist

After implementation, verify:

- [ ] Page loads without console errors about duplicate feather scripts
- [ ] Feather icons render correctly in header
- [ ] Tatajuba iframe scales properly on mobile (320px), tablet (768px), and desktop (1024px+)
- [ ] Hero slider images are not taller than viewport on mobile
- [ ] First hero image loads eagerly (check Network tab)
- [ ] Subsequent hero images load lazily
- [ ] No layout shift (CLS) on page load

---

## File Change Summary

| File | Lines | Change Type |
|------|-------|-------------|
| [`views/partials/header.ejs`](views/partials/header.ejs:31) | ~31 | Remove line (feather script) |
| [`views/index.ejs`](views/index.ejs:24-26) | 24-26 | Replace (iframe section) |
| [`views/index.ejs`](views/index.ejs:42) | 42 | Replace (hero image) |

Total: **2 files, 3 change locations**
