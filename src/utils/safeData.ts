/**
 * Utility functions for safe data handling
 * Prevents common errors when working with arrays that might be null/undefined
 */

/**
 * Safely filters an array, returning an empty array if the input is not an array
 */
export const safeFilter = <T>(
    array: T[] | null | undefined,
    predicate: (item: T, index: number, array: T[]) => boolean
): T[] => {
    if (!Array.isArray(array)) {
        console.warn('safeFilter: Input is not an array:', array);
        return [];
    }
    return array.filter(predicate);
};

/**
 * Safely maps over an array, returning an empty array if the input is not an array
 */
export const safeMap = <T, U>(
    array: T[] | null | undefined,
    mapper: (item: T, index: number, array: T[]) => U
): U[] => {
    if (!Array.isArray(array)) {
        console.warn('safeMap: Input is not an array:', array);
        return [];
    }
    return array.map(mapper);
};

/**
 * Safely finds an item in an array, returning undefined if the input is not an array
 */
export const safeFind = <T>(
    array: T[] | null | undefined,
    predicate: (item: T, index: number, array: T[]) => boolean
): T | undefined => {
    if (!Array.isArray(array)) {
        console.warn('safeFind: Input is not an array:', array);
        return undefined;
    }
    return array.find(predicate);
};

/**
 * Safely gets the length of an array, returning 0 if the input is not an array
 */
export const safeLength = <T>(array: T[] | null | undefined): number => {
    if (!Array.isArray(array)) {
        return 0;
    }
    return array.length;
};

/**
 * Ensures an array is always an array, converting null/undefined to empty array
 */
export const ensureArray = <T>(array: T[] | null | undefined): T[] => {
    if (!Array.isArray(array)) {
        return [];
    }
    return array;
};

/**
 * Safely sorts an array, returning an empty array if the input is not an array
 */
export const safeSort = <T>(
    array: T[] | null | undefined,
    compareFn?: (a: T, b: T) => number
): T[] => {
    if (!Array.isArray(array)) {
        console.warn('safeSort: Input is not an array:', array);
        return [];
    }
    return [...array].sort(compareFn);
}; 