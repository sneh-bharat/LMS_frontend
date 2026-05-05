/**
 * Converts a raw base64 string into a displayable data URL.
 * 
 * @param base64Sring - The raw base64 string from the API
 * @param mimeType - Optional MIME type (defaults to image/jpeg)
 * @returns A formatted data URL string
 */
export function getBase64ImageSource(base64Sring: string, mimeType: string = 'image/jpeg'): string {
    if (!base64Sring) return '';
    return `data:${mimeType};base64,${base64Sring}`;
}
