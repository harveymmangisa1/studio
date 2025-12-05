-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  business_name text
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry for a new user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  -- Create a new tenant for the new user
  insert into public.tenants (company_name)
  values (new.raw_user_meta_data->>'business_name')
  returning id into new_tenant_id;

  -- Create a new tenant user entry
  insert into public.tenant_users (tenant_id, user_id, role)
  values (new_tenant_id, new.id, 'OWNER_ADMIN');
  
  -- Create a new profile for the new user
  insert into public.profiles (id, full_name, avatar_url, business_name)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'business_name');
  
  return new;
end;
$$;


-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
