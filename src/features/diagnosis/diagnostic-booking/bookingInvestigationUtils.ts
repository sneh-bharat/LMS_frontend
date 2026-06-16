import type { BookingInvestigation } from '@/app/Apis/booking/mapBookingToTestOrder';
import type { Test } from '@/app/Apis/lab/TestApis';

export type { BookingInvestigation };

export function testToInvestigation(test: Test): BookingInvestigation {
  return {
    id: test.id,
    name: test.testName,
    mrp: test.price,
    category: test.categoryName || test.departmentName || 'General',
  };
}

export function filterTestsForBranch(tests: Test[], branchId: number): Test[] {
  const activeTests = tests.filter((t) => t.isActive);
  const branchMatched = activeTests.filter((t) => t.branchId === branchId);
  return branchMatched.length > 0 ? branchMatched : activeTests;
}

export function sortInvestigationsByName(
  items: BookingInvestigation[]
): BookingInvestigation[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}
