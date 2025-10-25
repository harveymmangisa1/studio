
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AttendanceTable = ({ attendance }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.employees.first_name} {record.employees.last_name}</TableCell>
            <TableCell>{record.date}</TableCell>
            <TableCell>{record.check_in_time}</TableCell>
            <TableCell>{record.check_out_time}</TableCell>
            <TableCell>{record.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
