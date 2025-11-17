"use client";
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useTenant } from '@/lib/tenant';

type Customer = {
  id: string;
  tenant_id: string;
  name: string;
  email?: string | null;
};

export default function CRMCustomerList() {
  const { tenant } = useTenant();
  const tenantId = (tenant?.id) ?? 'default-tenant';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null);

  useEffect(() => {
    fetch('/api/crm/customers', {
      headers: { 'X-Tenant-Id': tenantId },
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantId]);

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
          'X-Tenant-Id': tenantId,
        },
        body: JSON.stringify({ name: name.trim(), email: email?.trim() ?? null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to create');
        return;
      }
      const newCustomer: Customer = data as Customer;
      setCustomers((cs) => [newCustomer, ...cs]);
      setName('');
      setEmail('');
    } catch {
      setError('Network error');
    }
  }

  async function performDelete(id: string) {
    const target = customers.find((c) => c.id === id);
    const displayName = target?.name ?? id;
    try {
      const res = await fetch(`/api/crm/customers/${id}`, {
        method: 'DELETE',
        headers: { 'X-Tenant-Id': tenantId },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to delete');
        return false;
      }
      setCustomers((cs) => cs.filter((c) => c.id !== id));
      toast({ title: 'Deleted', description: `Customer ${displayName} deleted`, variant: 'destructive' });
      return true;
    } catch {
      setError('Network error');
      return false;
    }
  }

  function requestDeleteTarget(c: Customer) {
    setConfirmTarget(c);
    setConfirmOpen(true);
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
            <div key={c.id} className="border rounded p-4 flex flex-col gap-2">
              <div className="font-semibold text-lg">{c.name}</div>
              {c.email && <div className="text-sm text-gray-600">{c.email}</div>}
              <div className="mt-auto flex justify-end">
                <button
                  className="px-2 py-1 text-sm text-white bg-red-600 rounded"
                  onClick={() => requestDeleteTarget(c)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmTarget) {
                  await performDelete(confirmTarget.id);
                }
                setConfirmOpen(false);
                setConfirmTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
