create table if not exists contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null,
  county     text not null,
  website    text,
  created_at timestamptz default now()
);

alter table contacts enable row level security;

create policy "Public insert"
  on contacts for insert
  with check (true);

create policy "Auth read"
  on contacts for select
  using (auth.role() = 'authenticated');
