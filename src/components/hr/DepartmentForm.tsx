'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department } from '@/lib/hr/types';

interface DepartmentFormProps {
  department: Department | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DepartmentForm = ({ department, onSuccess, onCancel }: DepartmentFormProps) => {
  const [name, setName] = useState('');
  const [parentDepartmentId, setParentDepartmentId] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); // You should define an Employee type

  useEffect(() => {
    if (department) {
      setName(department.name);
      setParentDepartmentId(department.parent_department_id);
      setManagerId(department.manager_id);
    }
  }, [department]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('id, name');
      setDepartments(data || []);
    };
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('id, first_name, last_name');
      setEmployees(data || []);
    };
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const departmentData = {
      name,
      parent_department_id: parentDepartmentId,
      manager_id: managerId,
    };

    if (department) {
      const { error } = await supabase.from('departments').update(departmentData).eq('id', department.id);
      if (error) console.error('Error updating department:', error);
      else onSuccess();
    } else {
      const { error } = await supabase.from('departments').insert(departmentData);
      if (error) console.error('Error creating department:', error);
      else onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{department ? 'Edit Department' : 'Add Department'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="parent">Parent Department</Label>
            <Select value={parentDepartmentId || ''} onValueChange={(value) => setParentDepartmentId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Select value={managerId || ''} onValueChange={(value) => setManagerId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{department ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
