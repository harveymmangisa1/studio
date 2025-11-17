'use client'
import React, { useState } from 'react';
import { DepartmentList } from '@/components/hr/DepartmentList';
import { DepartmentForm } from '@/components/hr/DepartmentForm';
import { Department } from '@/lib/hr/types';
import { supabase } from '@/lib/supabase';

export default function DepartmentsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setView('form');
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setView('form');
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (window.confirm(`Are you sure you want to delete the "${department.name}" department?`)) {
      const { error } = await supabase.from('departments').delete().eq('id', department.id);
      if (error) {
        console.error('Error deleting department:', error);
      } else {
        // In a real app, you'd probably want to refetch the list or update the state
        window.location.reload();
      }
    }
  };

  const handleSuccess = () => {
    setView('list');
    setEditingDepartment(null);
    // In a real app, you'd probably want to refetch the list or update the state
    window.location.reload();
  };

  const handleCancel = () => {
    setView('list');
    setEditingDepartment(null);
  };

  return (
    <div className="p-6">
      {view === 'list' ? (
        <DepartmentList
          onAddDepartment={handleAddDepartment}
          onEditDepartment={handleEditDepartment}
          onDeleteDepartment={handleDeleteDepartment}
        />
      ) : (
        <DepartmentForm
          department={editingDepartment}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
