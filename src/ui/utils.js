export const toText = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
};

export const shuffleItems = (items) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const resolveEl = (ref, fallbackSelector) => {
    if (ref instanceof Element) return ref;
    const selector = (typeof ref === 'string' && ref) || fallbackSelector;
    return selector ? document.querySelector(selector) : null;
};
