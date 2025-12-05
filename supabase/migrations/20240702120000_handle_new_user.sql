
-- Grant usage on the auth schema to the postgres role
GRANT USAGE ON SCHEMA auth TO postgres;

-- Function to be called by the trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  -- Create a new tenant for the new user
  insert into public.tenants (name)
  values (new.raw_user_meta_data->>'business_name')
  returning id into new_tenant_id;

  -- Link the new user to the new tenant
  insert into public.tenant_users (tenant_id, user_id, role)
  values (new_tenant_id, new.id, 'OWNER_ADMIN');

  -- Create a public user profile
  insert into public.users (id, name, email, role, tenant_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'OWNER_ADMIN',
    new_tenant_id
  );

  return new;
end;
$$;

-- Trigger to call the function after a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
