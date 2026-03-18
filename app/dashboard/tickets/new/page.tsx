import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketForm } from "@/components/tickets/TicketForm";

export default function NewTicketPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <TicketForm />
      </CardContent>
    </Card>
  );
}

