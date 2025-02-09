export function sanitizeNumber(input: number): number {
    return isNaN(input) ? 0 : input;
}