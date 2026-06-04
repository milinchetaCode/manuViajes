create extension if not exists "uuid-ossp";

create table if not exists packages (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  ticket_price text,
  flight_info text,
  hotel_info text,
  description text,
  availability_dates text,
  photo_url text,
  visible boolean default true
);
