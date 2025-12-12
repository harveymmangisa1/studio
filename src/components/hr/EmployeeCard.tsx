
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Employee } from '@/lib/hr/types';

export const EmployeeCard = ({ employee }: { employee: Employee }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={employee.avatarUrl} />
            <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{employee.firstName} {employee.lastName}</CardTitle>
            <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p><strong>Email:</strong> {employee.contactEmail}</p>
        <p><strong>Phone:</strong> {employee.phoneNumber}</p>
      </CardContent>
    </Card>
  );
};
