/**
 * Organization service seam over the legacy Apis layer. Feature code imports
 * organization data access from here so the `@/app/Apis` dependency is centralized.
 */
export * from '@/app/Apis/organizations/organization';
export * from '@/app/Apis/organizations/useOrganizations';
