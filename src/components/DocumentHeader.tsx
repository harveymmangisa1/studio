'use client';

import { useTenant } from '@/lib/tenant';
import { Package } from 'lucide-react';

interface DocumentHeaderProps {
    title: string;
    documentId: string;
}

export function DocumentHeader({ title, documentId }: DocumentHeaderProps) {
  const { tenant } = useTenant();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{tenant?.name}</h1>
            <p className="text-muted-foreground">{tenant?.address}</p>
            <p className="text-muted-foreground">{tenant?.email}</p>
            <p className="text-muted-foreground">{tenant?.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-slate-800 uppercase">{title}</h2>
          <p className="text-muted-foreground">#{documentId}</p>
        </div>
      </div>
    </div>
  );
}
