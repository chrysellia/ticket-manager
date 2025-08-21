import { useState, useEffect } from 'react';
import { BoardColumn } from './BoardColumn';
import { Ticket, Priority } from './types';

const API_URL = '/api/tickets';

export function TicketBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setTickets([...tickets, createdTicket]);
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
      setTickets(tickets.map(t => t.id === data.id ? data : t));
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

      setTickets(tickets.filter(t => t.id !== ticketId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
    }
  };

  const getTicketsByStatus = (status: Ticket['status']) => 
    tickets.filter(ticket => ticket.status === status);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Board</h1>
        <p className="text-gray-600">Manage your tasks and track progress</p>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-6">
        <BoardColumn
          status="todo"
          tickets={getTicketsByStatus('todo')}
          onAddTicket={handleAddTicket}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
        <BoardColumn
          status="in-progress"
          tickets={getTicketsByStatus('in-progress')}
          onAddTicket={handleAddTicket}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
        <BoardColumn
          status="done"
          tickets={getTicketsByStatus('done')}
          onAddTicket={handleAddTicket}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      </div>
    </div>
  );
}
