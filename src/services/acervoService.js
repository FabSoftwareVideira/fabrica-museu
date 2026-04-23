const { toSlug, toLabel } = require('../utils/slug');
const { buildPublicPath } = require('../utils/publicPath');

const toThumbPath = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
        return imagePath;
    }

    const withoutExt = imagePath.replace(/\.[^/.]+$/, '');
    return `${withoutExt}_thumb.webp`;
};

const mapCollectionItems = (rawItems) => rawItems.map((item, index) => {
    const categories = Array.isArray(item.categories)
        ? item.categories.map((category) => toSlug(category)).filter(Boolean)
        : [];

    const originalImagePath = item.path;
    const thumbImagePath = toThumbPath(originalImagePath);

    return {
        id: item.file_hash || `${index}`,
        filename: item.filename,
        imagePath: originalImagePath,
        imageUrl: buildPublicPath(thumbImagePath),
        originalImageUrl: buildPublicPath(originalImagePath),
        fileSize: item.file_size,
        description: item.description,
        tags: Array.isArray(item.tags) ? item.tags : [],
        categories,
        categoriesLabel: categories.map(toLabel),
        peopleCount: item.people_count,
        historicalPeriod: item.historical_period,
        estimatedYear: item.estimated_year,
        sceneType: item.scene_type,
        documentType: item.document_type,
        title: item.filename,
    };
});

const buildCollectionCategories = (collectionItems) => {
    const categoryCounts = collectionItems.reduce((acc, item) => {
        item.categories.forEach((category) => {
            acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
    }, {});

    return [
        { slug: 'todos', label: 'Todos', count: collectionItems.length },
        ...Object.keys(categoryCounts)
            .sort((a, b) => a.localeCompare(b))
            .map((slug) => ({
                slug,
                label: toLabel(slug),
                count: categoryCounts[slug],
            })),
    ];
};

const resolveCategory = (selectedCategory, categories) => {
    const normalized = String(selectedCategory || 'todos').toLowerCase();
    const isValid = categories.some((category) => category.slug === normalized);
    return isValid ? normalized : 'todos';
};

const filterItemsByCategory = (items, activeCategory) => {
    if (activeCategory === 'todos') {
        return items;
    }
    return items.filter((item) => item.categories.includes(activeCategory));
};

const toPositiveInteger = (value, fallback) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
};

const paginateItems = (items, page, limit) => {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;

    return {
        items: items.slice(start, start + limit),
        page: currentPage,
        totalItems,
        totalPages,
    };
};

const createAcervoService = (rawItems) => {
    const collectionItems = mapCollectionItems(rawItems);
    const collectionCategories = buildCollectionCategories(collectionItems);

    const getCollectionCategories = () => collectionCategories;

    const getAcervoPageData = ({ categoria, pageSize = 24 } = {}) => {
        const activeCategory = resolveCategory(categoria, collectionCategories);
        const filteredItems = filterItemsByCategory(collectionItems, activeCategory);
        const pagination = paginateItems(filteredItems, 1, pageSize);

        return {
            pageTitle: 'Explorar o Acervo',
            activeCategory,
            categories: collectionCategories.map((category) => ({
                ...category,
                isActive: category.slug === activeCategory,
            })),
            items: pagination.items,
            hasItems: pagination.items.length > 0,
            acervoCurrentPage: String(pagination.page),
            acervoTotalPages: String(pagination.totalPages),
            acervoHasNext: pagination.totalPages > 1 ? 'true' : 'false',
            acervoNextPage: '2',
            acervoTotalItems: String(pagination.totalItems),
            acervoPageSize: String(pageSize),
            imagesFolder: 'src/public/photos',
        };
    };

    const getAcervoApiData = ({ categoria, page = 1, limit = 24 } = {}) => {
        const activeCategory = resolveCategory(categoria, collectionCategories);
        const safePage = toPositiveInteger(page, 1);
        const safeLimit = Math.min(toPositiveInteger(limit, 24), 100);

        const filteredItems = filterItemsByCategory(collectionItems, activeCategory);
        const pagination = paginateItems(filteredItems, safePage, safeLimit);

        return {
            category: activeCategory,
            pagination: {
                page: pagination.page,
                limit: safeLimit,
                totalItems: pagination.totalItems,
                totalPages: pagination.totalPages,
            },
            categories: collectionCategories,
            items: pagination.items,
        };
    };

    const getItemById = (id) => collectionItems.find((item) => item.id === id) || null;

    return {
        getCollectionCategories,
        getAcervoPageData,
        getAcervoApiData,
        getItemById,
    };
};

module.exports = {
    mapCollectionItems,
    buildCollectionCategories,
    resolveCategory,
    filterItemsByCategory,
    paginateItems,
    createAcervoService,
};
