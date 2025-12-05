CREATE POLICY "Allow users to add themselves to a tenant" ON tenant_users FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
