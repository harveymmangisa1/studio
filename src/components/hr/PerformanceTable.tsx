
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const PerformanceTable = ({ reviews }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Reviewer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Rating</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews.map((review) => (
          <TableRow key={review.id}>
            <TableCell>{review.employees.first_name} {review.employees.last_name}</TableCell>
            <TableCell>{review.reviewer.first_name} {review.reviewer.last_name}</TableCell>
            <TableCell>{review.review_date}</TableCell>
            <TableCell>{review.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
