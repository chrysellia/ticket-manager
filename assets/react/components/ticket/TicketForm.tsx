import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket, Priority } from './types';

type TicketFormData = Omit<Ticket, 'id' | 'createdAt'>;

type TicketFormProps = {
  initialValues: TicketFormData;
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
};

export function TicketForm({ initialValues, onSubmit, onCancel }: TicketFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<TicketFormData>({
    defaultValues: initialValues,
  });

  const status = watch('status');
  const priority = watch('priority');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter ticket title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter ticket description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as Ticket['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select
            value={priority.toString()}
            onValueChange={(value: any) => setValue('priority', value as Priority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Low (1)</SelectItem>
              <SelectItem value="2">Low-Medium (2)</SelectItem>
              <SelectItem value="3">Medium (3)</SelectItem>
              <SelectItem value="4">Medium-High (4)</SelectItem>
              <SelectItem value="5">High (5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
