/**
 * Formatiert ein Datum im deutschen Format
 * @param dateString - ISO Date String oder Date Objekt
 * @param includeTime - Ob die Zeit angezeigt werden soll (Standard: true)
 * @returns Formatiertes Datum als String (DD.MM.YYYY HH:mm oder DD.MM.YYYY)
 */
export function formatGermanDate(dateString: string | Date | null | undefined, includeTime: boolean = true): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) return '-';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    if (!includeTime) {
        return `${day}.${month}.${year}`;
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Formatiert nur das Datum ohne Zeit
 */
export function formatGermanDateOnly(dateString: string | Date | null | undefined): string {
    return formatGermanDate(dateString, false);
}

/**
 * Formatiert nur die Zeit
 */
export function formatGermanTime(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) return '-';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}