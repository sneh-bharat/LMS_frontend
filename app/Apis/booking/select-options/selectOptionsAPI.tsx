/**
 * Select Options API – fetches dropdown option entities from the booking service.
 *
 * Endpoint: GET /api/v1/select-options
 *
 * The backend returns a flat list of options grouped by `type`
 * (e.g. "GENDER", "BLOOD_GROUP", "PATIENT_CATEGORY").
 * The frontend filters by `type` to populate individual <select> elements.
 */
import { bookingAxios } from '../axios';
import type { SelectOption } from './SelectOptionType';

/** Standard API envelope returned by the booking service. */
export interface SelectOptionsApiResponse {
    data: SelectOption[];
    message: string;
    response: boolean;
    status: string;
    timestamp: string;
}

/**
 * Fetch **all** select-option rows from the backend (single call).
 *
 * Usage:
 * ```ts
 * const all = await fetchSelectOptions();
 * const genders = all.filter(o => o.type === 'GENDER' && o.isActive && !o.isDeleted);
 * ```
 */
export async function fetchSelectOptions(): Promise<SelectOption[]> {
    try {
        const res = (await bookingAxios.get('/select-options')) as unknown as SelectOptionsApiResponse;

        if (res.response === false) {
            throw new Error(res.message?.trim() || 'Failed to load select options.');
        }

        return res.data ?? [];
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to fetch select options';
        console.error('[select-options] fetch error:', message);
        throw new Error(message);
    }
}

/**
 * Convenience helper – filters the full list by `type` and returns only
 * active, non-deleted options.
 *
 * ```ts
 * const genders = await fetchSelectOptionsByType('GENDER');
 * ```
 */
export async function fetchSelectOptionsByType(
    type: string
): Promise<SelectOption[]> {
    const all = await fetchSelectOptions();
    const upper = type.toUpperCase();
    return all.filter(
        (o) =>
            o.type === upper &&
            o.isActive === true &&
            o.isDeleted === false
    );
}
