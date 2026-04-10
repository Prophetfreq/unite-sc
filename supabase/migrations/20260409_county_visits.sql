create table if not exists county_visits (
  id                uuid primary key default gen_random_uuid(),
  county_name       text not null unique,
  visited           boolean default false,
  visit_date        text,
  gatekeeper_name   text,
  gatekeeper_public boolean default true,
  summary           text,
  photos            text[] default '{}',
  created_at        timestamptz default now()
);

alter table county_visits enable row level security;

create policy "Public read"
  on county_visits for select
  using (true);

create policy "Auth write"
  on county_visits for all
  using (auth.role() = 'authenticated');
