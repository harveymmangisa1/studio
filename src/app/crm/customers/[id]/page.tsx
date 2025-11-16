"use client";
import React, { useState } from 'react';
import CustomerCard from '@/components/crm/CustomerCard';
import InteractionForm from '@/components/crm/InteractionForm';
import Timeline from '@/components/crm/Timeline';

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
  const customer: Customer = {
    id: params.id,
    tenant_id: 'tenant-123',
    name: 'Acme Corporation',
    email: 'contact@acme.example',
  };

  const [events, setEvents] = useState<Event[]>([
    { id: 'e1', date: '2025-11-01', type: 'call', detail: 'Introductory call' },
    { id: 'e2', date: '2025-11-08', type: 'email', detail: 'Sent product brochure' },
  ]);

  function addInteraction(payload: any) {
    const newEvent: Event = {
      id: 'ev-' + (events.length + 1),
      date: new Date().toISOString().split('T')[0],
      type: payload.type,
      detail: payload.note,
    };
    setEvents([newEvent, ...events]);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">CRM - Customer {customer.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <CustomerCard customer={customer} />
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Interactions</h2>
            <Timeline events={events} />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">Add Interaction</h2>
          <InteractionForm customerId={customer.id} onSubmit={addInteraction} />
        </section>
      </div>
    </div>
  );
}
