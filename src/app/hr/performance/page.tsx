
'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/shared/PageHeader';
import { PerformanceTable } from '@/components/hr/PerformanceTable';

const PerformancePage = () => {
  const { tenant } = useTenant();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!tenant) return;
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/hr/performance', {
          headers: {
            'x-tenant-id': tenant.id,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch performance reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching performance reviews:', error);
      }
    };

    fetchReviews();
  }, [tenant]);

  return (
    <div>
      <PageHeader title="Performance" description="Manage employee performance reviews." />
      <div className="mt-8">
        <PerformanceTable reviews={reviews} />
      </div>
    </div>
  );
};

export default PerformancePage;
