import { TESTS } from '../constants/appointment';

export const getTodayStr = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getTestFee = (dept: string, testName: string): number | null => {
  const found = (TESTS[dept] ?? []).find((d) => d.name === testName);
  return found ? found.fee : null;
};
