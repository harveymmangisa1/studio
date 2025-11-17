export interface Department {
  id: string;
  name: string;
  parent_department_id: string | null;
  manager_id: string | null;
}
