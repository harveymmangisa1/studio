
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
  subdomain_slug text;
  slug_base text;
  tenant_name text;
  business_name_from_meta text;
begin
  -- Get business name from metadata
  business_name_from_meta := new.raw_user_meta_data->>'business_name';

  -- If business name is empty or null, create a default one from the email
  IF business_name_from_meta IS NULL OR business_name_from_meta = '' THEN
    tenant_name := split_part(new.email, '@', 1) || '''s Team';
  ELSE
    tenant_name := business_name_from_meta;
  END IF;

  -- Generate a URL-safe slug from the tenant name and add a random suffix
  slug_base := lower(regexp_replace(tenant_name, '[^a-z0-9]+', '-', 'g'));
  slug_base := trim(BOTH '-' FROM slug_base);
  IF slug_base = '' THEN
    slug_base := 'tenant';
  END IF;
  subdomain_slug := slug_base || '-' || substr(md5(gen_random_uuid()::text), 1, 6);

  -- Create a new tenant for the new user
  insert into public.tenants (company_name, subdomain)
  values (tenant_name, subdomain_slug)
  returning id into new_tenant_id;

  -- Link the new user to the new tenant
  insert into public.tenant_users (tenant_id, user_id, role)
  values (new_tenant_id, new.id, 'OWNER_ADMIN');

  return new;
end;
$$;

-- Trigger to call the function after a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
