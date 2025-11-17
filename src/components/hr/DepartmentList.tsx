'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

import { Department } from '@/lib/hr/types';

interface DepartmentListProps {
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  onAddDepartment: () => void;
}

export const DepartmentList = ({ onEditDepartment, onDeleteDepartment, onAddDepartment }: DepartmentListProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Departments</CardTitle>
        <Button onClick={onAddDepartment}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="divide-y">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 flex items-center justify-between group">
                <div>
                  <p className="font-semibold">{dept.name}</p>
                  {/* You can fetch and display parent department and manager names here */}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => onEditDepartment(dept)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteDepartment(dept)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
