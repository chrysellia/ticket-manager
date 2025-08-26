import { useState } from 'react';
import { Member } from '../../types/member';
import { MemberModal } from './MemberModal';
import { Button } from '@/components/ui/button';

interface MemberListProps {
  members: Member[];
  onMemberCreated: () => void;
  onMemberUpdated: () => void;
  onMemberDeleted: () => void;
}

export function MemberList({ 
  members, 
  onMemberCreated, 
  onMemberUpdated, 
  onMemberDeleted 
}: MemberListProps) {
  const [isDeleteLoading, setIsDeleteLoading] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        setIsDeleteLoading(id);
        await onMemberDeleted();
      } catch (error) {
        console.error('Error deleting member:', error);
      } finally {
        setIsDeleteLoading(null);
      }
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Members</h1>
        <p className="text-gray-600 mt-2">A list of all team members including their name, email and team.</p>
      </div>

      <div className="">
        <MemberModal onSuccess={onMemberCreated}>
          <Button>+ Create Member</Button>
        </MemberModal>
      </div>
      
      <div className="flex flex-col">
        <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Team
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Skills
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-center">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {member.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {member.team?.name || 'No team'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-md truncate" title={member.skills || ''}>
                          {member.skills || '-'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <MemberModal member={member} onSuccess={onMemberUpdated}>
                              <Button 
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                style={{ background: 'none', color: 'inherit' }}
                              >
                                Edit
                              </Button>
                            </MemberModal>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(member.id);
                              }}
                              disabled={isDeleteLoading === member.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {isDeleteLoading === member.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
