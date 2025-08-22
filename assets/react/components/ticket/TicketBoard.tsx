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

type Status = 'todo' | 'in_progress' | 'done';

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
  const [originalTicketStatus, setOriginalTicketStatus] = useState<Status | null>(null);

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
    console.log('Updating ticket:', ticket);
    
    if (!ticket) return;

    // Store original ticket for rollback
    const originalTicket = { ...ticket };
    
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
      // Create clean payload without id and createdAt
      const { id, createdAt, ...updatePayload } = updatedTicket;
      
      console.log('Sending update request:', updatePayload);
      
      const response = await fetch(`${API_URL}/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `Failed to update ticket status (${response.status})`);
      }

      const data = await response.json();
      console.log('Update successful:', data);
      
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
        t.id === ticketId ? originalTicket : t
      ));
      
      throw err;
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find(t => t.id === active.id);
    setActiveTicket(ticket || null);
    
    // Store the original status before any drag operations
    if (ticket) {
      setOriginalTicketStatus(ticket.status);
      console.log('Drag started - original status:', ticket.status);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    console.log('Drag over:', { activeId, overId, overData: over.data?.current });
    
    const activeTicket = tickets.find(t => t.id === activeId);
    if (!activeTicket) return;
    
    // Check if we're hovering over a column area (not a ticket)
    const overData = over.data?.current;
    const isOverColumn = ['todo', 'in_progress', 'done'].includes(overId) || 
                        (overData?.type === 'column');
    
    console.log('Is over column:', isOverColumn, 'Over data:', overData);
    
    // If dropping on a column (status), handle it
    if (isOverColumn) {
      const newStatus = (overId as Status) || (overData?.status as Status);
      console.log('Hovering over column:', newStatus, 'Current status:', activeTicket.status);
      
      if (newStatus && activeTicket.status !== newStatus) {
        console.log('Updating ticket status during drag over');
        // Update tickets state optimistically for smooth visual feedback
        setTickets(prev => prev.map(ticket => 
          ticket.id === activeId 
            ? { ...ticket, status: newStatus }
            : ticket
        ));
      }
      return;
    }
    
    // If dropping on another ticket, check if it's in a different column
    const overTicket = tickets.find(t => t.id === overId);
    if (!overTicket) return;
    
    console.log('Hovering over ticket:', overTicket.id, 'in column:', overTicket.status);
    
    // If the tickets are in different columns, move to the target column
    if (activeTicket.status !== overTicket.status) {
      console.log('Cross-column hover detected, moving to:', overTicket.status);
      setTickets(prev => prev.map(ticket => 
        ticket.id === activeId 
          ? { ...ticket, status: overTicket.status }
          : ticket
      ));
      return;
    }
    
    // Handle reordering within the same column
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
    
    console.log('Drag ended:', { 
      activeId: active.id, 
      overId: over?.id,
      overData: over?.data?.current
    });
    
    if (!over) {
      console.log('No over target, canceling drag');
      setActiveTicket(null);
      setOriginalTicketStatus(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTicket = tickets.find(t => t.id === activeId);
    if (!activeTicket) {
      console.log('Active ticket not found');
      setActiveTicket(null);
      setOriginalTicketStatus(null);
      return;
    }
    
    console.log('Active ticket current state:', activeTicket);
    console.log('Original ticket status:', originalTicketStatus);
    
    const overData = over.data?.current;
    const isOverColumn = ['todo', 'in_progress', 'done'].includes(overId) || 
                        (overData?.type === 'column');
    
    let targetStatus: Status | null = null;
    
    // Determine the target status
    if (isOverColumn) {
      targetStatus = (overId as Status) || (overData?.status as Status);
      console.log('Dropped on column, target status:', targetStatus);
    } else {
      // Dropped on a ticket - get the ticket's current status
      const overTicket = tickets.find(t => t.id === overId);
      if (overTicket) {
        targetStatus = overTicket.status;
        console.log('Dropped on ticket in column:', targetStatus);
      }
    }
    
    // Check if the status actually changed from the original
    if (targetStatus && originalTicketStatus && originalTicketStatus !== targetStatus) {
      console.log(`Status change detected: ${originalTicketStatus} -> ${targetStatus}`);
      console.log(`Making API call to update ticket ${activeId}`);
      
      try {
        await updateTicketStatus(activeId, targetStatus);
        console.log('API call successful');
      } catch (error) {
        console.error('Failed to update ticket status:', error);
      }
    } else {
      console.log('No status change needed', { 
        originalStatus: originalTicketStatus, 
        targetStatus,
        reason: !targetStatus ? 'No target status' : 'Same status'
      });
    }
    
    setActiveTicket(null);
    setOriginalTicketStatus(null);
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
              onClick={() => {
                setError(null);
                fetchTickets();
              }}
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
    'in_progress': tickets.filter(t => t.status === 'in_progress'),
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
            {(['todo', 'in_progress', 'done'] as Status[]).map((status) => (
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