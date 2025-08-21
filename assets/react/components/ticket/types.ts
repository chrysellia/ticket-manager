export type Priority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: Priority;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketFormData extends Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> {}

export interface BoardColumnProps {
  status: Ticket['status'];
  tickets: Ticket[];
  onAddTicket: (ticket: TicketFormData) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
}

export interface TicketFormProps {
  initialValues: TicketFormData;
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
}
