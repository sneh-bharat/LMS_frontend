export interface ConcessionAuthority {
  id: number;
  name: string;
  allowedPercentage: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface ConcessionFormData {
  name: string;
  allowedPercentage: number;
}
