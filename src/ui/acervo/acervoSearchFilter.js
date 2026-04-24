import { resolveEl } from '../utils.js';

export const createSearchFilter = (config = {}) => {
    const input = resolveEl(config.input, '#acervo-description-filter');

    if (!input || typeof config.onSearch !== 'function') return null;

    const delay = Number(config.debounce || 350);
    let debounceTimer = null;

    const onInput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => config.onSearch(e.target.value), delay);
    };

    input.addEventListener('input', onInput);

    const destroy = () => {
        clearTimeout(debounceTimer);
        input.removeEventListener('input', onInput);
    };

    return { destroy };
};
