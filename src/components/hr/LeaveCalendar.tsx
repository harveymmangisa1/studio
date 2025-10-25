
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LeaveCalendar = ({ leaves }) => {
  // Assuming leaves is an array of objects with start and end dates
  const events = leaves.map(leave => ({
    start: new Date(leave.startDate),
    end: new Date(leave.endDate),
    title: `${leave.employee.firstName} ${leave.employee.lastName} - ${leave.leaveType}`
  }));

  // This is a simplified representation. A real implementation would require a more robust calendar component
  // that can display events.
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar />
        <div className="mt-4">
          <h3 className="font-semibold">Upcoming Leaves:</h3>
          <ul>
            {events.map((event, index) => (
              <li key={index}>{event.title} ({event.start.toDateString()} - {event.end.toDateString()})</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
