CREATE POLICY "Allow postgres to link users to a tenant" ON tenant_users
FOR INSERT TO postgres WITH CHECK (true);

