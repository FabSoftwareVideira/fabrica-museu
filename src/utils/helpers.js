export const toText = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return String(value);
};