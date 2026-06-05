# JSON Storage Cleanup Plan

## Executive Summary

Remove all legacy JSON file storage code and destacados functionality. The application already uses the `packages` table in Supabase correctly - this is purely a code cleanup task.

**Important**: No data migration needed. The packages table already contains all current data.

## Files to Modify

### 1. [`src/services/supabaseStorage.js`](../src/services/supabaseStorage.js)

**Remove these lines:**
- Lines 8-9: `fs` and `path` imports
- Lines 30-37: Local directory and file path setup
- Lines 38-60: `loadJSONFile()` and `saveJSONFile()` functions
- Lines 99-126: All destacados functions

**Keep:**
- Supabase client initialization
- Field mapping functions (`dbRowToPackage`, `packageToDbRow`)
- Package CRUD functions (`getPackages`, `createPackage`, `updatePackage`, `deletePackage`)

**Update module.exports to:**
```javascript
module.exports = {
  supabase,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
```

### 2. [`src/routes/admin.js`](../src/routes/admin.js)

**Changes:**
- Line 15: Remove `saveDestacadosJSON` from imports
- Lines 62-63: Remove `loadDestacadosJSON` import and call
- Line 64: Change to `res.render('admin/panel', { paquetes, user: req.session.user });`
- Lines 122-124: Remove destacados saving block

### 3. [`src/routes/index.js`](../src/routes/index.js)

**Changes:**
- Line 6: Remove `getDestacados` from imports
- Line 20: Remove `const events = await getDestacados();`
- Lines 43-48: Change to `res.render("index", { packages, heroImages, currentPage: "home" });`

### 4. [`views/admin/panel.ejs`](../views/admin/panel.ejs)

**No changes needed** - Already only handles packages

### 5. [`views/index.ejs`](../views/index.ejs)

**No changes needed** - Already only displays packages

## Files to Delete

1. **`/temp`** directory - Old JSON-based implementation
2. **`/data`** directory - Empty, previously held JSON files
3. **`scripts/create_packages_table.sql`** - Duplicate schema

## Files to Update

### [`supabase_schema.sql`](../supabase_schema.sql)

Replace with clean packages-only schema:

```sql
-- =====================================================================
-- SUPABASE / POSTGRESQL SCHEMA FOR MANUVIAJES
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- PACKAGES TABLE - Main storage for travel packages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  ticket_price TEXT,
  flight_info TEXT,
  hotel_info TEXT,
  description TEXT,
  availability_dates TEXT,
  photo_url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create access policies:
-- 1. Allow public read access for visible packages
CREATE POLICY "Allow public read for visible packages" ON packages
    FOR SELECT USING (visible = true);

-- 2. Allow full control for service_role (admin operations)
CREATE POLICY "Allow full control for service role" ON packages
    FOR ALL USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_visible ON packages(visible);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);
```

### [`docs/json_data_flow.md`](../docs/json_data_flow.md)

Replace with new architecture documentation:

```markdown
# Data Storage Architecture

## Overview

ManuViajes uses **Supabase PostgreSQL** as the single source of truth for all application data.

## Database Schema

### Packages Table

**Table Name**: `packages`

**Schema**:
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  ticket_price TEXT,
  flight_info TEXT,
  hotel_info TEXT,
  description TEXT,
  availability_dates TEXT,
  photo_url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Field Mapping**:
- Database uses `snake_case` (PostgreSQL convention)
- Application uses `camelCase` (JavaScript convention)
- Automatic conversion in [`supabaseStorage.js`](../src/services/supabaseStorage.js)

| Database Field | Application Field | Type | Description |
|---------------|-------------------|------|-------------|
| `id` | `id` | UUID | Unique identifier |
| `event_name` | `eventName` | String | Package name |
| `ticket_price` | `ticketPrice` | String | Price |
| `flight_info` | `flightInfo` | String | Flight details |
| `hotel_info` | `hotelInfo` | String | Hotel information |
| `description` | `description` | String | Package description |
| `availability_dates` | `availabilityDates` | String | Available dates |
| `photo_url` | `photoUrl` | String | Image URL |
| `visible` | `visible` | Boolean | Display on site |

## Data Access Layer

### Service: [`src/services/supabaseStorage.js`](../src/services/supabaseStorage.js)

**Functions**:

1. **`getPackages()`** - Retrieve all packages
2. **`createPackage(pkg)`** - Create new package
3. **`updatePackage(id, pkg)`** - Update existing package
4. **`deletePackage(id)`** - Delete package

## Security

### Row Level Security (RLS)

- **Public**: Read-only access to visible packages
- **Admin**: Full CRUD via service_role key

### Environment Variables

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
```
```

## Implementation Checklist

- [ ] Update [`src/services/supabaseStorage.js`](../src/services/supabaseStorage.js) - Remove fs operations and destacados
- [ ] Update [`src/routes/admin.js`](../src/routes/admin.js) - Remove destacados handling
- [ ] Update [`src/routes/index.js`](../src/routes/index.js) - Remove events loading
- [ ] Update [`supabase_schema.sql`](../supabase_schema.sql) - Clean packages-only schema
- [ ] Update [`docs/json_data_flow.md`](../docs/json_data_flow.md) - New documentation
- [ ] Delete `/temp` directory
- [ ] Delete `/data` directory
- [ ] Delete `scripts/create_packages_table.sql`
- [ ] Test admin panel CRUD operations
- [ ] Test public site package display
- [ ] Deploy to production

## Summary

This is a straightforward cleanup task:
- **Remove**: Unused JSON file operations and destacados code
- **Keep**: All working Supabase packages table functionality
- **Result**: Cleaner, more maintainable codebase

**No data migration needed** - packages table already has all data.
