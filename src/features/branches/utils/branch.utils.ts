import type { Branch } from '../services/branch.service';

/** A branch is active if its `status` says so, else falls back to the `isActive` flag. */
export function isBranchActive(branch: Branch): boolean {
  const status = branch.status?.trim().toUpperCase();
  if (status) return status === 'ACTIVE';
  return Boolean(branch.isActive);
}

/** Display label for a branch's status. */
export function branchStatusLabel(branch: Branch): string {
  if (branch.status?.trim()) return branch.status.trim().toUpperCase();
  return branch.isActive ? 'ACTIVE' : 'INACTIVE';
}

/** Free-text client-side search over a branch's key fields. */
export function branchMatchesSearch(branch: Branch, term: string): boolean {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return [
    branch.branchName,
    branch.branchCode,
    branch.city,
    branch.state,
    branch.contactEmail,
    branch.contactPhone,
    branch.address,
    branch.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q);
}
