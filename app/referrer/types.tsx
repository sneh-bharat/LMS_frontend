export interface Referrer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  centre: string;
  marketingAssociate: string;
  status: 'Active' | 'Inactive';
  showOnPrint: 'Hide All' | 'Show All';
}