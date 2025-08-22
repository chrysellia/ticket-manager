import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

type Priority = 1 | 2 | 3 | 4 | 5;

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: Priority;
  createdAt: string;
};

type TicketCardProps = {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
};

const priorityColors = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800',
  4: 'bg-red-100 text-red-800',
  5: 'bg-red-100 text-red-800',
};

export function TicketCard({ ticket, onEdit, onDelete }: TicketCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const priorityLabels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Urgent'
  };

  return (
    <div className="group relative">
      <Card className="mb-1 overflow-hidden transition-all duration-200 hover:shadow-md py-0">
        <div className="px-4 py-1">
          <div className="flex items-center w-full">
            <div className="flex items-center w-full">
              <div className="flex flex-auto justify-start items-center">
                <div className="text-sm font-medium truncate">{ticket.title}</div>
                <div className="flex-auto"></div>
                <div
                  className={`items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}
                  title={`Priority: ${priorityLabels[ticket.priority]}`}
                >
                  {priorityLabels[ticket.priority]}
                </div>
              </div>


              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(ticket)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{ticket.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(ticket.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
