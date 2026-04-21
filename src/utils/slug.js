const categoryLabelMap = {
    architecture: 'Arquitetura',
    event: 'Evento',
    sport: 'Esporte',
    documento: 'Documento',
    fotografia: 'Fotografia',
};

const toSlug = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toLabel = (slug) => categoryLabelMap[slug]
    || slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

module.exports = {
    categoryLabelMap,
    toSlug,
    toLabel,
};
