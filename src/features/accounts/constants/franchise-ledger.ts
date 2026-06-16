import type { FranchiseLedgerRecord } from '../types/accounts.types';

export const B2B_OPTIONS = [
  'HO(IP)',
  'Cash',
  'Credit',
  'Credit Franchise',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_LEDGER_RECORDS: Record<string, FranchiseLedgerRecord[]> = {
  'HO(IP)': [
    { sl: 1, date: '2026-03-02', inv: 'TL-INV-101', doctor: 'Dr. Sharma', patientName: 'Ramesh Kumar', investigation: 'CBC + LFT', price: 1200, oChrg: 150, paid: 1000, dis: 100, due: 250 },
    { sl: 2, date: '2026-03-02', inv: 'TL-INV-102', doctor: 'Dr. Patel', patientName: 'Sunita Devi', investigation: 'Thyroid Profile', price: 800, oChrg: 0, paid: 800, dis: 0, due: 0 },
    { sl: 3, date: '2026-03-02', inv: 'TL-INV-103', doctor: 'Dr. Verma', patientName: 'Mohammed Ali', investigation: 'Lipid Profile + HbA1c', price: 1500, oChrg: 200, paid: 1200, dis: 150, due: 350 },
  ],
  Cash: [
    { sl: 1, date: '2026-03-02', inv: 'TL-INV-201', doctor: 'Dr. Singh', patientName: 'Priya Mehta', investigation: 'Urine Routine', price: 300, oChrg: 0, paid: 300, dis: 0, due: 0 },
  ],
  Credit: [],
};

export function calcLedgerTotals(records: FranchiseLedgerRecord[]) {
  return records.reduce(
    (acc, r) => ({
      price: acc.price + r.price,
      oChrg: acc.oChrg + r.oChrg,
      paid: acc.paid + r.paid,
      dis: acc.dis + r.dis,
      due: acc.due + r.due,
    }),
    { price: 0, oChrg: 0, paid: 0, dis: 0, due: 0 },
  );
}
