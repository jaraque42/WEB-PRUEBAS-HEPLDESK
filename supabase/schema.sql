-- Helpdesk schema for Supabase (PostgreSQL)
-- Apply in Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'user')),
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  category text,
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages (chat by ticket)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  file_url text,
  file_type text check (file_type in ('pdf', 'image', null)),
  file_name text,
  created_at timestamptz default now()
);

-- Ticket history
create table if not exists public.ticket_history (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  field_changed text not null,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);

-- Keep tickets.updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.tickets;
create trigger set_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

-- Auto-create profile on signup (basic users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'Usuario'),
    new.email,
    'user',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;
alter table public.ticket_history enable row level security;

-- Helper: check admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin' and p.is_active = true
  );
$$;

-- Profiles policies
drop policy if exists "Profiles read own" on public.profiles;
create policy "Profiles read own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Profiles read all for admins" on public.profiles;
create policy "Profiles read all for admins"
on public.profiles
for select
using (public.is_admin(auth.uid()));

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles update all for admins" on public.profiles;
create policy "Profiles update all for admins"
on public.profiles
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Tickets policies
drop policy if exists "Tickets insert own" on public.tickets;
create policy "Tickets insert own"
on public.tickets
for insert
with check (auth.uid() = created_by);

drop policy if exists "Tickets select own or assigned or admin" on public.tickets;
create policy "Tickets select own or assigned or admin"
on public.tickets
for select
using (
  public.is_admin(auth.uid())
  or auth.uid() = created_by
  or auth.uid() = assigned_to
);

drop policy if exists "Tickets update admin" on public.tickets;
create policy "Tickets update admin"
on public.tickets
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Messages policies
drop policy if exists "Messages select by participants" on public.messages;
create policy "Messages select by participants"
on public.messages
for select
using (
  exists (
    select 1 from public.tickets t
    where t.id = messages.ticket_id
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

drop policy if exists "Messages insert by participants" on public.messages;
create policy "Messages insert by participants"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.tickets t
    where t.id = messages.ticket_id
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

-- Ticket history policies
drop policy if exists "History select by participants" on public.ticket_history;
create policy "History select by participants"
on public.ticket_history
for select
using (
  exists (
    select 1 from public.tickets t
    where t.id = ticket_history.ticket_id
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

drop policy if exists "History insert admin" on public.ticket_history;
create policy "History insert admin"
on public.ticket_history
for insert
with check (public.is_admin(auth.uid()));

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('ticket-attachments', 'ticket-attachments', false)
on conflict (id) do nothing;

create or replace function public.storage_ticket_id(object_name text)
returns uuid
language sql
immutable
as $$
  select case
    when split_part(object_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(object_name, '/', 2)::uuid
    else null
  end;
$$;

-- Storage policies for attachments
drop policy if exists "Attachments read" on storage.objects;
create policy "Attachments read"
on storage.objects
for select
using (
  bucket_id = 'ticket-attachments'
  and exists (
    select 1 from public.tickets t
    where t.id = public.storage_ticket_id(name)
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

drop policy if exists "Attachments insert" on storage.objects;
create policy "Attachments insert"
on storage.objects
for insert
with check (
  bucket_id = 'ticket-attachments'
  and exists (
    select 1 from public.tickets t
    where t.id = public.storage_ticket_id(name)
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

drop policy if exists "Attachments update" on storage.objects;
create policy "Attachments update"
on storage.objects
for update
using (
  bucket_id = 'ticket-attachments'
  and exists (
    select 1 from public.tickets t
    where t.id = public.storage_ticket_id(name)
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
)
with check (
  bucket_id = 'ticket-attachments'
  and exists (
    select 1 from public.tickets t
    where t.id = public.storage_ticket_id(name)
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

drop policy if exists "Attachments delete" on storage.objects;
create policy "Attachments delete"
on storage.objects
for delete
using (
  bucket_id = 'ticket-attachments'
  and exists (
    select 1 from public.tickets t
    where t.id = public.storage_ticket_id(name)
      and (
        public.is_admin(auth.uid())
        or auth.uid() = t.created_by
        or auth.uid() = t.assigned_to
      )
  )
);

