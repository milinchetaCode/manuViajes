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
