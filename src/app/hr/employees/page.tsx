
'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmployeeForm } from '@/components/hr/EmployeeForm';
import { EmployeeCard } from '@/components/hr/EmployeeCard';

const EmployeesPage = () => {
  const { tenant } = useTenant();
  const [employees, setEmployees] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/hr', {
          headers: {
            'x-tenant-id': tenant.id,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [tenant]);

  const handleFormSubmit = async (data) => {
    if (!tenant) return;
    try {
      const response = await fetch('/api/hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant.id,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create employee');
      }

      const newEmployee = await response.json();
      setEmployees([...employees, newEmployee]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  return (
    <div>
      <PageHeader title="Employees" description="Manage your company's employees.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Employee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm onSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;
