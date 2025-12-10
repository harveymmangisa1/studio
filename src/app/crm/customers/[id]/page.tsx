"use client";
import React, { useEffect, useState } from 'react';
import CustomerCard from '@/components/crm/CustomerCard';
import InteractionForm from '@/components/crm/InteractionForm';
import Timeline from '@/components/crm/Timeline';
import { useTenant } from '@/lib/tenant';

type Customer = {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
};

type Event = {
  id: string;
  date: string;
  type: string;
  detail: string;
};

export default function CRMCustomerPage({ params }: { params: { id: string } }) {
  const { tenant } = useTenant();
  const tenantId = tenant?.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load customer data
  useEffect(() => {
    let mounted = true;
    if (!tenantId) return;

    (async () => {
      try {
        const res = await fetch(`/api/crm/customers/${params.id}`, {
          headers: { 'X-Tenant-Id': tenantId },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Failed to load customer');
        if (mounted) {
          setCustomer(data as Customer);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Error loading customer');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id, tenantId]);

  // Load interactions for the customer
  useEffect(() => {
    let mounted = true;
    if (!customer?.id || !tenantId) {
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/crm/customers/interactions?customerId=${customer.id}`, {
          headers: { 'X-Tenant-Id': tenantId },
        });
        const data = await res.json();
        if (!Array.isArray(data)) return;
        if (mounted) {
          const filtered = data.filter((ev: any) => ev.customer_id === customer.id).map((ev: any) => ({
            id: ev.id,
            date: ev.interaction_date ?? ev.date ?? ev.created_at ?? '',
            type: ev.type ?? '',
            detail: ev.detail ?? ev.note ?? '',
          }));
          setEvents(filtered as Event[]);
        }
      } catch {
        // ignore interactions load errors
      }
    })();
    return () => {
      mounted = false;
    };
  }, [customer?.id, tenantId]);

  function addInteraction(payload: any) {
    if (!customer?.id || !tenantId) return;
    const newEvent: Event = {
      id: 'ev-' + (events.length + 1),
      date: payload.date ?? new Date().toISOString().split('T')[0],
      type: payload.type,
      detail: payload.note,
    };

    // Persist via API
    (async () => {
      try {
        const res = await fetch('/api/crm/customers/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': tenantId,
          },
          body: JSON.stringify({ customer_id: customer.id, type: payload.type, detail: payload.note, interaction_date: payload.date }),
        });
        const data = await res.json();
        if (!res.ok) {
          // ignore UI failure for simplicity
          return;
        }
        // Prepend new interaction from server response if available
        setEvents((e) => [
          {
            id: data?.id ?? newEvent.id,
            date: (data?.interaction_date ?? newEvent.date) as string,
            type: data?.type ?? payload.type,
            detail: data?.detail ?? payload.note,
          },
          ...e,
        ]);
      } catch {
        // ignore network errors for now
      }
    })();
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">CRM - Customer {customer?.name ?? ''}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          {customer && <CustomerCard customer={customer} />}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Interactions</h2>
            <Timeline events={events} />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">Add Interaction</h2>
          <InteractionForm customerId={customer?.id ?? ''} onSubmit={addInteraction} />
        </section>
      </div>
      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
    </div>
  );
}
