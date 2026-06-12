export interface Invoice {
  id: number;
  invoiceBarcode: string;
  patientName: string;
  patientId: number;
  patientCode?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  address: string;
  tests: string[];
  collectionCentre: string;
  refDoctor: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  balanceAmount: number;
  receptionDate: string;
  paymentLink?: string;
  orderStatus?: string;
  priority?: string;
  paymentStatus?: string;
  srfId?: string;
  branchId?: number;
}

export interface InvoiceFilter {
  searchBy: string;
  searchText: string;
  centre: string;
  dateRange: {
    from: string;
    to: string;
  };
  status: string;
}
