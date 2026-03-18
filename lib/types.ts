export type Role = "admin" | "user";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_type: "pdf" | "image" | null;
  file_name: string | null;
  created_at: string;
};

