/**
 * Branches service seam.
 *
 * Strangler step: the feature talks to this module instead of reaching into
 * `@/app/Apis/branch/branchApi` directly. The implementation still lives in the
 * legacy Apis layer for now; when it is ported onto a `branchClient` in
 * `@/lib/api`, only this file changes — no feature component is touched.
 */
export * from '@/app/Apis/branch/branchApi';
