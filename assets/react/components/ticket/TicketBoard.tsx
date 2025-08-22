import { useState, useEffect } from 'react';
import { BoardColumn } from './BoardColumn';
import { Ticket, Priority } from './types';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  arrayMove 
} from '@dnd-kit/sortable';
import { TicketCard } from './TicketCard';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

const API_URL = '/api/tickets';

type Status = 'todo' | 'in-progress' | 'done';

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export function TicketBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTicket = async (newTicket: Omit<Ticket, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error('Failed to add ticket');
      }

      const createdTicket = await response.json();
      setTickets(prev => [...prev, createdTicket]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ticket');
    }
  };

  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    try {
      const response = await fetch(`${API_URL}/${updatedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTicket),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      const data = await response.json();
      setTickets(prev => prev.map(ticket => 
        ticket.id === data.id ? data : ticket
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`${API_URL}/${ticketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }

      setTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: Status) => {
    const ticket = tickets.find(t => t.id === ticketId);
    console.log(ticket)
    if (!ticket) return;

    const updatedTicket = { 
      ...ticket, 
      status: newStatus,
      updatedAt: new Date().toISOString() 
    };
    
    // Optimistically update the UI
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? updatedTicket : t
    ));

    try {
      const response = await fetch(`${API_URL}/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...updatedTicket,
          // Make sure we're only sending the fields the API expects
          id: undefined,
          createdAt: undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update ticket status');
      }

      const data = await response.json();
      
      // Update with server response to ensure consistency
      setTickets(prev => prev.map(t => 
        t.id === data.id ? { ...data } : t
      ));
      
      return data;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to move ticket';
      setError(errorMessage);
      
      // Revert the optimistic update
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? ticket : t
      ));
      
      throw err; // Re-throw to allow handling in the calling function
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find(t => t.id === active.id);
    setActiveTicket(ticket || null);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTicket = tickets.find(t => t.id === activeId);
    if (!activeTicket) return;
    
    // If dropping on a column (status), handle it
    if (['todo', 'in-progress', 'done'].includes(overId)) {
      const newStatus = overId as Status;
      
      if (activeTicket.status !== newStatus) {
        // Update tickets state optimistically for smooth visual feedback
        setTickets(prev => prev.map(ticket => 
          ticket.id === activeId 
            ? { ...ticket, status: newStatus }
            : ticket
        ));
      }
      return;
    }
    
    // If dropping on another ticket, handle reordering within the same column
    const overTicket = tickets.find(t => t.id === overId);
    if (!overTicket) return;
    
    if (activeTicket.status === overTicket.status) {
      const sameStatusTickets = tickets.filter(t => t.status === activeTicket.status);
      const activeIndex = sameStatusTickets.findIndex(t => t.id === activeId);
      const overIndex = sameStatusTickets.findIndex(t => t.id === overId);
      
      if (activeIndex !== overIndex) {
        const reorderedTickets = arrayMove(sameStatusTickets, activeIndex, overIndex);
        
        // Update the full tickets array with reordered tickets
        setTickets(prev => {
          const otherTickets = prev.filter(t => t.status !== activeTicket.status);
          return [...otherTickets, ...reorderedTickets];
        });
      }
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTicket(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // If dropped in the same position, do nothing
    if (activeId === overId) {
      setActiveTicket(null);
      return;
    }
    
    const activeTicket = tickets.find(t => t.id === activeId);
    if (!activeTicket) {
      setActiveTicket(null);
      return;
    }
    
    // Handle dropping on columns (status change)
    if (['todo', 'in-progress', 'done'].includes(overId)) {
      const newStatus = overId as Status;
      if (activeTicket.status !== newStatus) {
        await updateTicketStatus(activeId, newStatus);
      }
    } 
    // Handle reordering within the same column
    else {
      const overTicket = tickets.find(t => t.id === overId);
      if (overTicket && activeTicket.status === overTicket.status) {
        // The reordering was already handled in onDragOver
        // Here we can persist the new order if needed
        try {
          const reorderedTickets = [...tickets];
          const oldIndex = reorderedTickets.findIndex(t => t.id === activeId);
          const newIndex = reorderedTickets.findIndex(t => t.id === overId);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            const [movedTicket] = reorderedTickets.splice(oldIndex, 1);
            reorderedTickets.splice(newIndex, 0, movedTicket);
            
            // Update the order in the database if needed
            // await updateTicketOrder(reorderedTickets);
          }
        } catch (error) {
          console.error('Error reordering tickets:', error);
        }
      }
    }
    
    setActiveTicket(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
        <div className="flex">
          <div className="text-red-700">
            <p className="font-medium">Error loading tickets</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchTickets}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ticketIds = tickets.map(ticket => ticket.id);

  // Group tickets by status for better performance
  const ticketsByStatus = {
    'todo': tickets.filter(t => t.status === 'todo'),
    'in-progress': tickets.filter(t => t.status === 'in-progress'),
    'done': tickets.filter(t => t.status === 'done')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ticket Board</h1>
        <p className="text-gray-600 mt-2">Manage your tasks and track progress</p>
      </div>

      <div className="px-6 pb-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="flex gap-6 overflow-x-auto pb-2">
            {(['todo', 'in-progress', 'done'] as Status[]).map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tickets={ticketsByStatus[status]}
                onAddTicket={handleAddTicket}
                onUpdateTicket={handleUpdateTicket}
                onDeleteTicket={handleDeleteTicket}
              />
            ))}
          </div>
          
          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeTicket ? (
              <div className="rotate-3 opacity-90">
                <TicketCard 
                  ticket={activeTicket} 
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}