import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TicketCard } from './TicketCard';
import { Ticket, Priority } from './types';
import { TicketModal } from './TicketModal';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

type Status = 'backlog' | 'todo' | 'in_progress' | 'done';

const statusTitles = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'done': 'Done',
};

const statusColors = {
  'backlog': 'bg-gray-100',
  'todo': 'bg-purple-50',
  'in_progress': 'bg-blue-50',
  'done': 'bg-green-50',
};

type BoardColumnProps = {
  status: Status;
  tickets: Ticket[];
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
};

function SortableTicketCard({ 
  ticket, 
  onEdit, 
  onDelete 
}: { 
  ticket: Ticket; 
  onEdit: (ticket: Ticket) => void; 
  onDelete: (id: string) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: ticket.id,
    transition: {
      duration: 150, // Faster transitions
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style: React.CSSProperties = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 9999 : 'auto',
    willChange: 'transform', // Optimize for animations
  }), [transform, transition, isDragging]);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="touch-none select-none" // Prevent text selection during drag
    >
      <TicketCard 
        ticket={ticket} 
        onEdit={onEdit} 
        onDelete={onDelete} 
      />
    </div>
  );
}

export function BoardColumn({
  status,
  tickets,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket,
}: BoardColumnProps) {
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  
  // Make the column a droppable zone
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status: status,
    },
  });

  // Memoize ticket IDs to prevent unnecessary re-renders
  const ticketIds = useMemo(() => tickets.map(t => t.id), [tickets]);

  const handleAddClick = () => {
    setEditingTicket(null);
    setShowAddTicket(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setShowAddTicket(true);
  };

  const handleModalClose = () => {
    setShowAddTicket(false);
    setEditingTicket(null);
  };

  const handleModalSubmit = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    if (editingTicket) {
      onUpdateTicket({ ...editingTicket, ...ticketData });
    } else {
      onAddTicket({ ...ticketData, status });
    }
    setShowAddTicket(false);
    setEditingTicket(null);
  };

  return (
    <div className="w-80 flex-shrink-0">
      <Card 
        className={`flex flex-col ${statusColors[status]} h-full transition-all duration-200 ${
          isOver ? 'ring-2 ring-blue-400 ring-opacity-50 scale-[1.02]' : ''
        }`}
      >
        <CardHeader className="p-3 pb-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg font-semibold">
                {statusTitles[status]}
              </CardTitle>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {tickets.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-7 w-7 text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 transition-colors duration-150"
              onClick={handleAddClick}
              title="Add a card"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <div 
          ref={setNodeRef}
          className={`p-2 space-y-2 overflow-y-auto flex-1 transition-all duration-200 ${
            isOver ? 'bg-blue-50/50' : ''
          }`} 
          style={{ minHeight: '200px' }}
        >
          <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
            {tickets.map((ticket) => (
              <SortableTicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={handleEditTicket}
                onDelete={onDeleteTicket}
              />
            ))}
          </SortableContext>
          
          {tickets.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">Drop tickets here</p>
            </div>
          )}
        </div>
      </Card>

      <TicketModal
        isOpen={showAddTicket}
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
  );
}