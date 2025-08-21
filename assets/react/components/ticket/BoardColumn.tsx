import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TicketCard } from './TicketCard';
import { Ticket, Priority } from './types';
import { TicketModal } from './TicketModal';

type Status = 'todo' | 'in-progress' | 'done';

const statusTitles = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const statusColors = {
  'todo': 'bg-gray-100',
  'in-progress': 'bg-blue-50',
  'done': 'bg-green-50',
};

type BoardColumnProps = {
  status: Status;
  tickets: Ticket[];
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
};

export function BoardColumn({
  status,
  tickets,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket,
}: BoardColumnProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  
  const handleAddClick = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data: Omit<Ticket, 'id' | 'createdAt'>) => {
    if (editingTicket) {
      onUpdateTicket({ ...data, id: editingTicket.id, createdAt: editingTicket.createdAt } as Ticket);
    } else {
      onAddTicket(data);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  return (
    <div className="w-80 flex-shrink-0">
      <Card className={`h-full flex flex-col ${statusColors[status]}`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              {statusTitles[status]}
            </CardTitle>
            {/* <span className="text-sm text-gray-500">{tickets.length}</span> */}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={handleEditClick}
                onDelete={onDeleteTicket}
              />
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-gray-900"
              onClick={handleAddClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a ticket
            </Button>
            <TicketModal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onSave={handleModalSubmit}
              ticket={editingTicket || {
                title: '',
                description: '',
                status,
                priority: 3,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
