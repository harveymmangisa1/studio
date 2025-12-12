export interface Department {
  id: string;
  name: string;
  parent_department_id: string | null;
  manager_id: string | null;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  employmentType: string;
  startDate: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  employeeNumber?: string;
  reportingManager?: string;
  workLocation?: string;
  baseSalary?: number;
  currency?: string;
  paymentFrequency?: string;
  paymentMethod?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  taxId?: string;
  notes?: string;
  contract_url?: string;
  id_document_url?: string;
  resume_url?: string;
  avatarUrl?: string;
  contactEmail?: string;
  phoneNumber?: string;
}
