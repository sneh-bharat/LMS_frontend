/** Lab service seam over the legacy Apis layer (lab-domain modules). */
export * from '@/app/Apis/lab/TestApis';
export * from '@/app/Apis/lab/departmentApi';
export * from '@/app/Apis/lab/departmentHooks';
export * from '@/app/Apis/lab/TestCategories';
export * from '@/app/Apis/lab/ReflexRules';
export * from '@/app/Apis/lab/useReflexRules';
export * from '@/app/Apis/lab/TestPackage';
export * from '@/app/Apis/lab/TemplateMgmt/TemplateMgmtApi';
export * from '@/app/Apis/lab/TemplateMgmt/useReportTemplates';
export * from '@/app/Apis/lab/reportTemplateApi';

// Resolve `export *` ambiguity for shared names (identical wrappers across modules).
export type { ApiResponse, PaginatedResponse } from '@/app/Apis/lab/TestApis';
export type { ReportTemplate } from '@/app/Apis/lab/TemplateMgmt/TemplateMgmtApi';
