import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Member, CreateMemberDto, UpdateMemberDto } from '../../types/member';
import { TeamService } from '../../services/teamService';
import { MemberService } from '../../services/memberService';
import { Team } from '../../types/team';

// Simple button component
const Button = ({ onClick, children, className = '', style = {}, ...props }: any) => (
  <button 
    onClick={onClick} 
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </button>
);

// Simple modal component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        width: '100%',
        maxWidth: '32rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Form field component
const FormField = ({ label, children, error }: any) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      fontSize: '0.875rem'
    }}>
      {label}
    </label>
    {children}
    {error && (
      <p style={{
        marginTop: '0.25rem',
        color: '#ef4444',
        fontSize: '0.75rem'
      }}>
        {error.message}
      </p>
    )}
  </div>
);

type MemberFormData = {
  name: string;
  email: string;
  teamId?: number;
};

type MemberModalProps = {
  member?: Member;
  onSuccess: () => void;
  children: React.ReactNode;
};

export function MemberModal({ member, onSuccess, children }: MemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MemberFormData>();

  const fetchTeams = async () => {
    try {
      const data = await TeamService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      if (member) {
        reset({
          name: member.name,
          email: member.email,
          teamId: member.team?.id
        });
      } else {
        reset({
          name: '',
          email: '',
          teamId: undefined
        });
      }
    }
  }, [isOpen, member, reset]);

  const onSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    try {
      if (member) {
        await MemberService.updateMember(member.id, data as UpdateMemberDto);
      } else {
        await MemberService.createMember(data as CreateMemberDto);
      }
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title={member ? 'Edit Member' : 'Add New Member'}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label="Name" error={errors.name}>
            <input
              id="name"
              {...register('name', { required: 'Name is required' })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                fontSize: '0.875rem'
              }}
            />
          </FormField>

          <FormField label="Email" error={errors.email}>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                fontSize: '0.875rem'
              }}
            />
          </FormField>

          <FormField label="Team">
            <select
              value={watch('teamId')?.toString() || ''}
              onChange={(e) => setValue('teamId', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id.toString()}>
                  {team.name}
                </option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              style={{
                backgroundColor: 'white',
                color: '#4b5563',
                border: '1px solid #d1d5db'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
