
-- Function to create a new tenant and link the owner
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a new tenant for the new user
  insert into public.tenants (id, company_name)
  values (new.id, new.raw_user_meta_data->>'business_name');

  -- Create default tenant settings
  insert into public.tenant_settings (tenant_id, business_email)
  values (new.id, new.email);
  
  -- Link the new user to the new tenant as 'owner'
  insert into public.tenant_users (tenant_id, user_id, role, is_active)
  values (new.id, new.id, 'owner', true);
  
  return new;
end;
$$;

-- Trigger to call the function when a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
