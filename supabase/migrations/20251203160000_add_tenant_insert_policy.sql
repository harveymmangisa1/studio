CREATE POLICY "Allow authenticated users to create tenants" ON tenants
FOR INSERT TO authenticated WITH CHECK (true);
