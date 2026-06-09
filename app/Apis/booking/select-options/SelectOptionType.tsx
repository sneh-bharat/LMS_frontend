/**
 * Type definition for backend select-option entities.
 *
 * Endpoint: GET /api/v1/select-options
 *
 * Each row represents a single dropdown option grouped by `type`
 * (e.g. "GENDER", "BLOOD_GROUP", "PATIENT_CATEGORY").
 */
export interface SelectOption {
    id: number;
    code: string;
    name: string;
    type: string;
    isActive: boolean;
    isDeleted: boolean;
}

