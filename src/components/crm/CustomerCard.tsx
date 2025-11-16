"use client";
import React from 'react';

type Customer = {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
};

const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
  return (
    <div className="bg-white border rounded shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="font-semibold text-lg">{customer.name}</div>
      {customer.email && (
        <div className="text-sm text-gray-600">{customer.email}</div>
      )}
    </div>
  );
};

export default CustomerCard;
