
'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/shared/PageHeader';
import { AttendanceTable } from '@/components/hr/AttendanceTable';
import AppLayout from '@/components/AppLayout';

const AttendancePage = () => {
  const { tenant } = useTenant();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!tenant) return;
    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/hr/attendance', {
          headers: {
            'x-tenant-id': tenant.id,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch attendance');
        }
        const data = await response.json();
        setAttendance(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [tenant]);

  return (
    <AppLayout>
      <div>
        <PageHeader title="Attendance" description="Track employee attendance and leave." />
        <div className="mt-8">
          <AttendanceTable attendance={attendance} />
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendancePage;
