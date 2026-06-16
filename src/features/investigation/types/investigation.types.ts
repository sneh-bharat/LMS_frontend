export interface Investigation {
  id: number;
  category: string;
  subCategory: string;
  name: string;
  container?: string;
  tat: string;
  cost: number;
  point: number;
  mrp: number;
  status: 'Active' | 'Inactive';
}
