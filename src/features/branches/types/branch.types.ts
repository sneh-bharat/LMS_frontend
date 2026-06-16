/** Branch-domain types local to the feature. Wire DTOs come from `branch.service`. */

/** Shape passed to the add/edit modal as `initialData` (from a row or details drawer). */
export interface BranchFormInitialData {
  id: string;
  branchName: string;
  branchType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactEmail: string;
  contactPhone: string;
  isActive?: boolean;
  status?: string;
}
