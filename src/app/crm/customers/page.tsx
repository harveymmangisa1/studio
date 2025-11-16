"use client";
import React, { useEffect, useState } from 'react';

type Customer = {
  id: string;
  tenant_id: string;
  name: string;
  email?: string | null;
};

const TENANT_ID = 'default-tenant'; // Replace with dynamic tenant extraction in real app

export default function CRMCustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/crm/customers', {
      headers: { 'X-Tenant-Id': TENANT_ID },
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': TENANT_ID,
        },
        body: JSON.stringify({ name: name.trim(), email: email?.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to create');
        return;
      }
      // Prepend new customer to list
      const newCustomer: Customer = data as Customer;
      setCustomers((c) => [newCustomer, ...c]);
      setName('');
      setEmail('');
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">CRM — Customers</h1>
      <form onSubmit={createCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        <input
          className="border rounded px-3 py-2"
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Email (optional)"
          value={email ?? ''}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Add Customer</button>
      </form>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="border rounded p-4">
              <div className="font-semibold text-lg">{c.name}</div>
              {c.email && <div className="text-sm text-gray-600">{c.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
