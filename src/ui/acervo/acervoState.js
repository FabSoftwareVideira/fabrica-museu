export const createAcervoState = (initial = {}) => ({
    category: initial.category || 'todos',
    q: '',
    page: 1,
    totalPages: 1,
    loading: false,
    hasNext: true,
});