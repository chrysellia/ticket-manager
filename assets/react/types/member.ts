export interface Member {
  id: number;
  name: string;
  email: string;
  jobPosition?: string | null;
  jobDescription?: string | null;
  team?: {
    id: number;
    name: string;
  };
}

export interface CreateMemberDto {
  name: string;
  email: string;
  jobPosition?: string | null;
  jobDescription?: string | null;
  teamId?: number;
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {}

export interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

export interface MemberFormProps {
  initialValues?: Partial<Member>;
  onSubmit: (data: CreateMemberDto | UpdateMemberDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
