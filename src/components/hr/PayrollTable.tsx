
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const PayrollTable = ({ payrolls }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Pay Period</TableHead>
          <TableHead>Gross Salary</TableHead>
          <TableHead>Deductions</TableHead>
          <TableHead>Net Salary</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payrolls.map((payroll) => (
          <TableRow key={payroll.id}>
            <TableCell>{payroll.employee.firstName} {payroll.employee.lastName}</TableCell>
            <TableCell>{payroll.payPeriodStart} - {payroll.payPeriodEnd}</TableCell>
            <TableCell>{payroll.grossSalary}</TableCell>
            <TableCell>{payroll.deductions}</TableCell>
            <TableCell>{payroll.netSalary}</TableCell>
            <TableCell>{payroll.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
