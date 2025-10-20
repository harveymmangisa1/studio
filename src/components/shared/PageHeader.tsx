import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  children 
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-headline font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
    {children && (
      <div className="flex items-center gap-3">
        {children}
      </div>
    )}
  </div>
);
