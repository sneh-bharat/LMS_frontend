import type { ConcessionAuthority } from '../types/concession.types';

export const PERCENTAGE_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 1);

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_CONCESSIONS: ConcessionAuthority[] = [
  { id: 1, name: 'Standard Concession', allowedPercentage: 5, createdAt: '2024-01-15', status: 'active' },
  { id: 2, name: 'Premium Concession', allowedPercentage: 10, createdAt: '2024-01-20', status: 'active' },
  { id: 3, name: 'Special Concession', allowedPercentage: 8, createdAt: '2024-02-01', status: 'active' },
];
