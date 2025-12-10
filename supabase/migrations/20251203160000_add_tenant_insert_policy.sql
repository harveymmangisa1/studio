CREATE POLICY "Allow postgres to create tenants" ON tenants
FOR INSERT TO postgres WITH CHECK (true);
