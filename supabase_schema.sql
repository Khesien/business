-- 1. Profiles Table (RBAC)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'viewer')) default 'viewer',
  full_name text,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- 2. Sensor Types (Metadata)
create table sensor_types (
  id uuid default gen_random_uuid() primary key,
  name text not null unique, -- e.g. "Temperature"
  unit text not null, -- e.g. "°C"
  description text,
  icon text, -- lucide icon name
  created_at timestamp with time zone default now()
);

alter table sensor_types enable row level security;

create policy "Sensor types are viewable by everyone" on sensor_types for select using (true);
create policy "Admins can manage sensor types" on sensor_types for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 3. Sensors
create table sensors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type_id uuid references sensor_types(id) on delete cascade,
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

alter table sensors enable row level security;

-- 4. Readings (Time-series data)
create table readings (
  id bigserial primary key,
  sensor_id uuid references sensors(id) on delete cascade,
  value float8 not null,
  timestamp timestamp with time zone default now()
);

create index idx_readings_sensor_timestamp on readings(sensor_id, timestamp desc);
alter table readings enable row level security;

-- 5. Alert Rules
create table alert_rules (
  id uuid default gen_random_uuid() primary key,
  sensor_id uuid references sensors(id) on delete cascade,
  condition text check (condition in ('>', '<', '=', '>=', '<=')),
  threshold float8 not null,
  email_notify boolean default true,
  on_screen_notify boolean default true,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table alert_rules enable row level security;

-- 6. Alerts History
create table alerts (
  id uuid default gen_random_uuid() primary key,
  rule_id uuid references alert_rules(id) on delete cascade,
  reading_id bigint references readings(id) on delete cascade,
  triggered_at timestamp with time zone default now(),
  resolved boolean default false,
  resolved_at timestamp with time zone
);

alter table alerts enable row level security;

-- 7. Predictions (Placeholder for ML insights)
create table predictions (
  id uuid default gen_random_uuid() primary key,
  sensor_id uuid references sensors(id) on delete cascade,
  predicted_outcome text not null, -- e.g. "Likely pump failure"
  probability float8, -- 0.0 to 1.0
  estimated_time_to_event interval, -- e.g. "3 days"
  confidence_level text check (confidence_level in ('low', 'medium', 'high')),
  created_at timestamp with time zone default now()
);

alter table predictions enable row level security;

-- RLS Policies

-- Profiles: Users can view all profiles, but only edit their own
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Sensors: Viewable by everyone, editable by admins
create policy "Sensors are viewable by everyone" on sensors for select using (true);
create policy "Admins can manage sensors" on sensors for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Readings: Viewable by everyone, insertable by authenticated users (or service role)
create policy "Readings are viewable by everyone" on readings for select using (true);
create policy "Authenticated users can insert readings" on readings for insert with check (auth.role() = 'authenticated');

-- Alert Rules: Admins manage, Viewers see
create policy "Alert rules are viewable by everyone" on alert_rules for select using (true);
create policy "Admins can manage alert rules" on alert_rules for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Alerts: Viewable by everyone
create policy "Alerts are viewable by everyone" on alerts for select using (true);

-- Predictions: Viewable by everyone
create policy "Predictions are viewable by everyone" on predictions for select using (true);

-- Functions & Triggers (Example for auto-creating profile)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed some default sensor types
insert into sensor_types (name, unit, icon) values 
('Temperature', '°C', 'Thermometer'),
('Humidity', '%', 'Droplets'),
('Pressure', 'hPa', 'Gauge'),
('Power', 'W', 'Zap');
