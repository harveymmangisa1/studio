'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EmployeeDashboard } from '@/components/hr/EmployeeDashboard';
import { ProgressiveEmployeeForm, EmployeeFormData } from '@/components/hr/employee-form/ProgressiveEmployeeForm';
import { Employee } from '@/lib/hr/types';

const UPLOAD_KEY = 'employee-documents';

const uploadFile = async (file: File, employeeId: string) => {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
  const filePath = `${employeeId}/${fileName}`;
  const { error } = await supabase.storage.from(UPLOAD_KEY).upload(filePath, file);
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  const { data } = supabase.storage.from(UPLOAD_KEY).getPublicUrl(filePath);
  return data.publicUrl;
};

// Main HR Page Component
export default function HRPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: Employee[] = (data || []).map((e: any) => ({
          id: e.id,
          firstName: e.first_name,
          lastName: e.last_name,
          email: e.email,
          phone: e.phone,
          jobTitle: e.job_title,
          department: e.department,
          employmentType: e.employment_type,
          startDate: e.start_date,
          status: (e.status as Employee['status']) || 'active',
          dateOfBirth: e.date_of_birth,
          gender: e.gender,
          nationalId: e.national_id,
          maritalStatus: e.marital_status,
          address: e.address,
          city: e.city,
          state: e.state,
          postalCode: e.postal_code,
          country: e.country,
          emergencyContactName: e.emergency_contact_name,
          emergencyContactPhone: e.emergency_contact_phone,
          emergencyContactRelationship: e.emergency_contact_relationship,
          employeeNumber: e.employee_number,
          reportingManager: e.reporting_manager,
          workLocation: e.work_location,
          baseSalary: e.base_salary,
          currency: e.currency,
          paymentFrequency: e.payment_frequency,
          paymentMethod: e.payment_method,
          bankName: e.bank_name,
          accountNumber: e.account_number,
          routingNumber: e.routing_number,
          taxId: e.tax_id,
          notes: e.notes,
          contract_url: e.contract_url,
          id_document_url: e.id_document_url,
          resume_url: e.resume_url,
        }));
        setEmployees(mapped);
      } catch (e) {
        console.error('Failed to load employees', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setCurrentView('form');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setCurrentView('form');
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) return;
    try {
      const { error } = await supabase.from('employees').delete().eq('id', employee.id);
      if (error) throw error;
      setEmployees(employees.filter(emp => emp.id !== employee.id));
    } catch (e) {
      console.error('Failed to delete employee', e);
    }
  };

  const handleFormSuccess = async (formData: EmployeeFormData) => {
    try {
      const employeeData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        job_title: formData.jobTitle,
        department: formData.department,
        employment_type: formData.employmentType,
        start_date: formData.startDate,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        national_id: formData.nationalId,
        marital_status: formData.maritalStatus,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_relationship: formData.emergencyContactRelationship,
        employee_number: formData.employeeNumber,
        reporting_manager: formData.reportingManager,
        work_location: formData.workLocation,
        base_salary: formData.baseSalary,
        currency: formData.currency,
        payment_frequency: formData.paymentFrequency,
        payment_method: formData.paymentMethod,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        routing_number: formData.routingNumber,
        tax_id: formData.taxId,
        notes: formData.notes,
      };

      if (editingEmployee) {
        const { data, error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id)
          .select()
          .single();
        if (error) throw error;
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? data : emp));
      } else {
        const { data, error } = await supabase
          .from('employees')
          .insert({ ...employeeData, status: 'pending' })
          .select()
          .single();
        if (error) throw error;

        const employeeId = data.id;
        const contractUrl = formData.contractFile ? await uploadFile(formData.contractFile, employeeId) : null;
        const idDocumentUrl = formData.idDocumentFile ? await uploadFile(formData.idDocumentFile, employeeId) : null;
        const resumeUrl = formData.resumeFile ? await uploadFile(formData.resumeFile, employeeId) : null;

        if (contractUrl || idDocumentUrl || resumeUrl) {
          const { data: updatedData, error: updateError } = await supabase
            .from('employees')
            .update({
              contract_url: contractUrl,
              id_document_url: idDocumentUrl,
              resume_url: resumeUrl,
            })
            .eq('id', employeeId)
            .select()
            .single();
          if (updateError) throw updateError;
          setEmployees([...employees, updatedData]);
        } else {
          setEmployees([...employees, data]);
        }
      }
    } catch (e) {
      console.error('Failed to save employee', e);
    } finally {
      setCurrentView('dashboard');
      setEditingEmployee(null);
    }
  };

  const handleFormCancel = () => {
    setCurrentView('dashboard');
    setEditingEmployee(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === 'dashboard' ? (
          <EmployeeDashboard
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        ) : (
          <ProgressiveEmployeeForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            initialData={editingEmployee ? {
              // Convert Employee to EmployeeFormData
              firstName: editingEmployee.firstName,
              lastName: editingEmployee.lastName,
              email: editingEmployee.email,
              phone: editingEmployee.phone,
              dateOfBirth: editingEmployee.dateOfBirth,
              gender: editingEmployee.gender,
              nationalId: editingEmployee.nationalId,
              maritalStatus: editingEmployee.maritalStatus,
              address: editingEmployee.address,
              city: editingEmployee.city,
              state: editingEmployee.state,
              postalCode: editingEmployee.postalCode,
              country: editingEmployee.country,
              emergencyContactName: editingEmployee.emergencyContactName,
              emergencyContactPhone: editingEmployee.emergencyContactPhone,
              emergencyContactRelationship: editingEmployee.emergencyContactRelationship,
              employeeNumber: editingEmployee.employeeNumber,
              jobTitle: editingEmployee.jobTitle,
              department: editingEmployee.department,
              employmentType: editingEmployee.employmentType,
              startDate: editingEmployee.startDate,
              reportingManager: editingEmployee.reportingManager,
              workLocation: editingEmployee.workLocation,
              baseSalary: editingEmployee.baseSalary,
              currency: editingEmployee.currency,
              paymentFrequency: editingEmployee.paymentFrequency,
              paymentMethod: editingEmployee.paymentMethod,
              bankName: editingEmployee.bankName,
              accountNumber: editingEmployee.accountNumber,
              routingNumber: editingEmployee.routingNumber,
              taxId: editingEmployee.taxId,
              notes: editingEmployee.notes,
              contractFile: null,
              idDocumentFile: null,
              resumeFile: null,
              certificatesFiles: [],
            } : null}
          />
        )}
      </div>
    </div>
  );
}
