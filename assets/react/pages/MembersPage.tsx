import { useState, useEffect } from 'react';
import { MemberList } from '../components/member/MemberList';
import { Member } from '../types/member';
import { MemberService } from '../services/memberService';

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MemberService.getMembers();
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleMemberCreated = () => {
    fetchMembers();
  };

  const handleMemberUpdated = () => {
    fetchMembers();
  };

  const handleMemberDeleted = () => {
    fetchMembers();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-6">
      <MemberList 
        members={members} 
        onMemberCreated={handleMemberCreated}
        onMemberUpdated={handleMemberUpdated}
        onMemberDeleted={handleMemberDeleted}
      />
    </div>
  );
}
