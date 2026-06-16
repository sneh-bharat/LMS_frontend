/**
 * Collector service seam over the legacy Apis layer. Feature code imports collector
 * data access from here; swap the internals onto `@/lib/api` later without touching UI.
 */
export * from '@/app/Apis/collector/CollectorsApi';
export * from '@/app/Apis/collector/useCollectors';
