import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Calendar, AlignLeft } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Ticket, Priority } from './types';

 

type TicketCardProps = {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
};

const priorityColors = {
  1: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  2: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  3: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  4: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  5: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
} as const;

export function TicketCard({ ticket, onEdit, onDelete }: TicketCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const priorityLabels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Urgent'
  };

  const dueInfo = (() => {
    if (!ticket.dueDate) return null;
    const due = new Date(ticket.dueDate);
    const today = new Date();
    // Zero time for comparison
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    const fmt = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const state = diffDays < 0 ? 'overdue' : diffDays <= 3 ? 'soon' : 'future';
    return { fmt, state } as const;
  })();

  return (
    <div className="group relative">
      <Card className="mb-1 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] border border-gray-200/60 rounded-xl py-0 bg-white/90">
        <div className="px-3 sm:px-4 py-2">
          <div className="flex items-start w-full gap-2">
            <div className="flex flex-col flex-1 min-w-0">
              {/* Title */}
              <div
                className="text-sm font-medium text-gray-900 pr-2 leading-snug"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {ticket.title}
              </div>

              {/* Badges row */}
              <div className="mt-4 flex items-center gap-1.5">
                {/* Priority chip */}
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${priorityColors[ticket.priority]}`}
                  title={`Priority: ${priorityLabels[ticket.priority]}`}
                  style={{whiteSpace: 'nowrap'}}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                  {priorityLabels[ticket.priority]}
                </div>

                {/* Description indicator */}
                {ticket.description && ticket.description.trim().length > 0 && (
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-gray-600 bg-gray-100 ring-1 ring-gray-200 rounded-full">
                    <AlignLeft className="h-3 w-3" />
                    Desc
                  </div>
                )}

                {/* Due date chip */}
                {dueInfo && (
                  <div
                    className={`flex items-center px-1.5 py-0.5 text-[10px] rounded-full ring-1 ${
                      dueInfo.state === 'overdue'
                        ? 'bg-rose-100 text-rose-700 ring-rose-200'
                        : dueInfo.state === 'soon'
                        ? 'bg-amber-100 text-amber-700 ring-amber-200'
                        : 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                    }`}
                    style={{whiteSpace: 'nowrap'}}
                    title={`Due ${dueInfo.state === 'overdue' ? 'date passed' : 'on'} ${dueInfo.fmt}`}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {dueInfo.fmt}
                  </div>
                )}
              </div>
            </div>

            {/* Right-side: assignee avatar + menu */}
            <div className="flex items-center gap-1 ml-2">
              {ticket.assignedTo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="h-7 w-7 rounded-full bg-gray-100 ring-1 ring-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-semibold uppercase"
                      aria-label={`Assignee: ${ticket.assignedTo.name}`}
                    >
                      {ticket.assignedTo.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((w) => w[0] ?? '')
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    {ticket.assignedTo.name}
                  </TooltipContent>
                </Tooltip>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 transition-opacity hover:bg-gray-100"
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
