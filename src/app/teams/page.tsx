'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  Mail, 
  User, 
  Briefcase, 
  Building, 
  Check, 
  AlertCircle,
  Users,
  UserPlus,
  Edit3
} from 'lucide-react';

const STORAGE_KEY = 'teamMemberFormDraft';

const ProgressBar = ({ currentStep, totalSteps }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="flex-1 h-2 bg-gray-200 rounded-full">
      <div 
        className="h-full bg-blue-600 rounded-full transition-all" 
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
    <span className="text-sm font-medium text-gray-600">
      Step {currentStep} of {totalSteps}
    </span>
  </div>
);

const FormSection = ({ title, description, children }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-6">
      {children}
    </CardContent>
  </Card>
);

const FormField = ({ label, children, error, required }) => (
  <div>
    <Label className="font-medium text-gray-800">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="mt-1">{children}</div>
    {error && (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    editor: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleStyles[role] || roleStyles.viewer}`}>
      {role}
    </span>
  );
};

export function EnhancedTeamMemberForm({ initialData = null, onSuccess, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'viewer',
    department: 'general',
    permissions: [],
    sendInvite: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft && confirm('Resume editing a draft?')) {
        setFormData(JSON.parse(draft));
      }
    }
  }, [initialData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (step: number) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Full name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2)) {
      onSuccess(formData);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // Potentially show a toast or alert
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permission, checked) => {
    handleFieldChange('permissions', 
      checked 
        ? [...formData.permissions, permission]
        : formData.permissions.filter(p => p !== permission)
    );
  };
  
  const roles = ['admin', 'manager', 'editor', 'viewer'];
  const departments = ['engineering', 'sales', 'marketing', 'support', 'general'];
  const allPermissions = {
    inventory: ['view:inventory', 'edit:inventory', 'delete:inventory'],
    sales: ['view:sales', 'edit:sales', 'delete:sales'],
    billing: ['view:billing', 'manage:billing']
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      {currentStep === 1 && (
        <FormSection title="Personal Information" description="Basic details of the team member.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" required error={errors.fullName}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="e.g., Sarah Johnson" 
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>
            
            <FormField label="Email Address" required error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="email"
                  placeholder="e.g., sarah@company.com" 
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField label="Phone Number" error={errors.phone}>
              <Input 
                type="tel"
                placeholder="e.g., +1 (555) 123-4567" 
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </FormField>

            <FormField label="Department" error={errors.department}>
              <Select value={formData.department} onValueChange={(val) => handleFieldChange('department', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dep => <SelectItem key={dep} value={dep} className="capitalize">{dep}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </FormSection>
      )}

      {currentStep === 2 && (
        <FormSection title="Roles & Permissions" description="Assign a role or set custom permissions.">
          <FormField label="Role">
            <RadioGroup value={formData.role} onValueChange={(val) => handleFieldChange('role', val)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.map(role => (
                <div key={role}>
                  <RadioGroupItem value={role} id={role} className="sr-only" />
                  <Label htmlFor={role} className={`
                    flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer
                    ${formData.role === role ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                  `}>
                    <Briefcase className="w-6 h-6 mb-2" />
                    <span className="font-semibold capitalize">{role}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormField>
          
          <div className="text-center my-4 text-gray-500">OR</div>

          <FormField label="Custom Permissions">
            <div className="space-y-4">
              {Object.entries(allPermissions).map(([group, perms]) => (
                <div key={group}>
                  <h4 className="font-medium capitalize text-gray-800 mb-2">{group}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {perms.map(perm => (
                      <div key={perm} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Checkbox 
                          id={perm} 
                          checked={formData.permissions.includes(perm)}
                          onCheckedChange={(checked) => handlePermissionChange(perm, checked)}
                        />
                        <Label htmlFor={perm} className="text-sm">{perm.split(':')[0]}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FormField>
        </FormSection>
      )}

      {currentStep === 3 && (
        <FormSection title="Review & Finish" description="Review the details before adding the team member.">
          <div className="space-y-4 text-sm">
            <p><strong>Full Name:</strong> {formData.fullName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phone || 'N/A'}</p>
            <p><strong>Role:</strong> <RoleBadge role={formData.role} /></p>
            <p><strong>Department:</strong> <span className="capitalize">{formData.department}</span></p>
            <p><strong>Custom Permissions:</strong> {formData.permissions.join(', ') || 'None'}</p>
          </div>
          
          <FormField label="Send Invitation Email">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="sendInvite"
                checked={formData.sendInvite}
                onCheckedChange={(checked) => handleFieldChange('sendInvite', checked)}
              />
              <Label htmlFor="sendInvite">
                Send an invitation email to {formData.email} to set up their account.
              </Label>
            </div>
          </FormField>
        </FormSection>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button variant="ghost" onClick={() => setCurrentStep(s => s - 1)}>Back</Button>
          )}
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 to-green-700 shadow-md"
>
  <Check className="mr-2 h-4 w-4" />
  {initialData ? 'Update Member' : 'Add Team Member'}
</Button>
          )}
        </div>
      </div>
<div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
</div>
  );
}

// Additional utility components for the form system
export const TeamMemberList = ({ members, onEdit, onDelete }) => {
const [searchTerm, setSearchTerm] = useState('');
const [filterRole, setFilterRole] = useState('all');

const filteredMembers = members.filter(member => {
const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         member.email.toLowerCase().includes(searchTerm.toLowerCase());
const matchesRole = filterRole === 'all' || member.role === filterRole;
return matchesSearch && matchesRole;
});

return (
<Card className="border-0 shadow-xl">
<CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
<div className="flex justify-between items-center">
<div>
<CardTitle className="text-2xl flex items-center gap-2">
<Users className="w-6 h-6 text-blue-600" />
Team Members ({members.length})
</CardTitle>
<p className="text-sm text-gray-600 mt-1">
Manage your team members and their permissions
</p>
</div>
<Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
<UserPlus className="mr-2 h-4 w-4" />
Add Member
</Button>
</div>

<div className="flex gap-4 mt-4">
<div className="flex-1">
<Input
placeholder="Search team members..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="max-w-md"
/>
</div>
<Select value={filterRole} onValueChange={setFilterRole}>
<SelectTrigger className="w-40">
<SelectValue placeholder="Filter by role" />
</SelectTrigger>
<SelectContent>
<SelectItem value="all">All Roles</SelectItem>
<SelectItem value="admin">Administrator</SelectItem>
<SelectItem value="manager">Manager</SelectItem>
<SelectItem value="editor">Editor</SelectItem>
<SelectItem value="viewer">Viewer</SelectItem>
</SelectContent>
</Select>
</div>
</CardHeader>

<CardContent className="p-0">
<div className="divide-y">
{filteredMembers.map((member, index) => (
<div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
<div className="flex items-center justify-between">
<div className="flex items-center space-x-4">
  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
    {member.fullName.split(' ').map(n => n[0]).join('')}
  </div>
  <div>
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
      <RoleBadge role={member.role} />
    </div>
    <p className="text-sm text-gray-500">{member.email}</p>
    <div className="flex items-center gap-4 mt-1">
      {member.department && (
        <span className="text-xs text-gray-400 capitalize">
          {member.department}
        </span>
      )}
      {member.phone && (
        <span className="text-xs text-gray-400">{member.phone}</span>
      )}
    </div>
  </div>
</div>

<div className="flex items-center gap-2">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => onEdit(member)}
    className="text-blue-600 hover:text-blue-700"
  >
    <Edit3 className="w-4 h-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => onDelete(member)}
    className="text-red-600 hover:text-red-700"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
</div>
</div>
))}
</div>

{filteredMembers.length === 0 && (
<div className="text-center py-12">
<Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
<h3 className="text-lg font-semibold text-gray-500 mb-2">
No team members found
</h3>
<p className="text-gray-400 text-sm">
{searchTerm || filterRole !== 'all' 
? 'Try adjusting your search or filters'
: 'Get started by inviting your first team member'
}
</p>
</div>
)}
</CardContent>
</Card>
);
};

// Enhanced confirmation dialog component
export const ConfirmationDialog = ({ 
isOpen, 
onClose, 
onConfirm, 
title, 
message, 
confirmText = "Delete",
cancelText = "Cancel",
variant = "destructive" 
}) => {
if (!isOpen) return null;

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<Card className="max-w-md w-full border-0 shadow-2xl animate-in zoom-in duration-200">
<CardContent className="p-6 text-center">
<div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
variant === 'destructive' 
? 'bg-red-100 text-red-600' 
: 'bg-blue-100 text-blue-600'
}`}>
<AlertCircle className="w-6 h-6" />
</div>

<h3 className="text-lg font-semibold text-gray-900 mb-2">
{title}
</h3>
<p className="text-gray-500 text-sm mb-6">
{message}
</p>

<div className="flex gap-3 justify-center">
<Button
variant="outline"
onClick={onClose}
className="flex-1"
>
{cancelText}
</Button>
<Button
onClick={onConfirm}
className={`flex-1 ${
variant === 'destructive' 
  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
}`}
>
{confirmText}
</Button>
</div>
</CardContent>
</Card>
</div>
);
};

// Usage example with sample data
export function TeamManagementDashboard() {
const [members, setMembers] = useState([
{
id: 1,
fullName: 'Sarah Johnson',
email: 'sarah.johnson@company.com',
role: 'admin',
department: 'engineering',
phone: '+1 (555) 123-4567'
},
{
id: 2,
fullName: 'Mike Chen',
email: 'mike.chen@company.com',
role: 'manager',
department: 'sales',
phone: '+1 (555) 987-6543'
}
]);

const [showForm, setShowForm] = useState(false);
const [editingMember, setEditingMember] = useState(null);
const [deleteConfirm, setDeleteConfirm] = useState(null);

const handleSaveMember = (memberData) => {
if (editingMember) {
setMembers(members.map(m => m.id === editingMember.id 
? { ...m, ...memberData }
: m
));
} else {
setMembers([...members, { ...memberData, id: Date.now() }]);
}
setShowForm(false);
setEditingMember(null);
};

const handleEdit = (member) => {
setEditingMember(member);
setShowForm(true);
};

const handleDelete = (member) => {
setDeleteConfirm(member);
};

const confirmDelete = () => {
setMembers(members.filter(m => m.id !== deleteConfirm.id));
setDeleteConfirm(null);
};

return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
<div className="max-w-7xl mx-auto space-y-6">
{!showForm ? (
<>
<TeamMemberList 
members={members}
onEdit={handleEdit}
onDelete={handleDelete}
/>
<div className="text-center">
<Button
onClick={() => setShowForm(true)}
className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
size="lg"
>
<UserPlus className="mr-2 h-5 w-5" />
Invite Team Member
</Button>
</div>
</>
) : (
<EnhancedTeamMemberForm
initialData={editingMember}
onSuccess={handleSaveMember}
onCancel={() => {
setShowForm(false);
setEditingMember(null);
}}
/>
)}

<ConfirmationDialog
isOpen={!!deleteConfirm}
onClose={() => setDeleteConfirm(null)}
onConfirm={confirmDelete}
title="Delete Team Member"
message={`Are you sure you want to remove ${deleteConfirm?.fullName} from your team? This action cannot be undone.`}
confirmText="Delete Member"
variant="destructive"
/>
</div>
</div>
);
}

export default TeamManagementDashboard;
