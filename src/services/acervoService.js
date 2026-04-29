const fs = require('node:fs');
const path = require('node:path');
const { toSlug, toLabel } = require('../utils/slug');
const { buildPublicPath } = require('../utils/publicPath');

const LOCAL_PHOTOS_PATH = path.join(__dirname, '..', 'public', 'photos');
const CONTAINER_PHOTOS_PATH = '/app/src/public/photos';

let resolvedPhotosBasePathCache = null;
let resolvedPhotosBasePathSignature = null;

const buildPhotosBasePathCandidates = () => [
    process.env.PHOTOS_HOST_PATH,
    CONTAINER_PHOTOS_PATH,
    LOCAL_PHOTOS_PATH,
].filter(Boolean);

const resolvePhotosBasePath = () => {
    const candidates = buildPhotosBasePathCandidates();

    const signature = candidates.join('|');
    if (resolvedPhotosBasePathCache && resolvedPhotosBasePathSignature === signature) {
        return resolvedPhotosBasePathCache;
    }

    const existingPath = candidates.find((candidate) => fs.existsSync(candidate));
    const resolvedPath = existingPath || candidates[0];

    resolvedPhotosBasePathCache = resolvedPath;
    resolvedPhotosBasePathSignature = signature;
    return resolvedPhotosBasePathCache;
};

const normalizePublicRelativePath = (publicRelativePath) => String(publicRelativePath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

const stripPhotosPrefix = (publicRelativePath) => {
    const normalized = normalizePublicRelativePath(publicRelativePath);
    return normalized.startsWith('photos/') ? normalized.slice('photos/'.length) : normalized;
};

const toDiskPhotoPath = (publicRelativePath) => path.join(resolvePhotosBasePath(), stripPhotosPrefix(publicRelativePath));

const fileExists = (filePath) => fs.existsSync(filePath);

const toThumbPath = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
        return imagePath;
    }

    const withoutExt = imagePath.replace(/\.[^/.]+$/, '');
    return `${withoutExt}_thumb.webp`;
};

const toNormalizedLabel = (value, fallback) => {
    const normalized = String(value || '').trim();
    return normalized || fallback;
};

const resolveLegacyCategory = (item) => {
    if (Array.isArray(item.categories) && item.categories.length > 0) {
        return item.categories[0];
    }
    return item.category;
};

const resolveImageSources = (originalImagePath) => {
    const thumbImagePath = toThumbPath(originalImagePath);
    const thumbExists = fileExists(toDiskPhotoPath(thumbImagePath));
    const originalExists = fileExists(toDiskPhotoPath(originalImagePath));

    if (thumbExists) {
        return {
            imageUrl: buildPublicPath(thumbImagePath),
            originalImageUrl: originalExists ? buildPublicPath(originalImagePath) : null,
            hasImage: true,
        };
    }

    if (originalExists) {
        const originalUrl = buildPublicPath(originalImagePath);
        return {
            imageUrl: originalUrl,
            originalImageUrl: originalUrl,
            hasImage: true,
        };
    }

    return {
        imageUrl: null,
        originalImageUrl: null,
        hasImage: false,
    };
};

const mapCollectionItem = (item, index) => {
    const thematicCategoryLabel = toNormalizedLabel(
        item.categoria_tematica || resolveLegacyCategory(item),
        'Nao classificado',
    );
    const subcategoryLabel = toNormalizedLabel(item.subcategoria, 'Sem subcategoria');
    const description = toNormalizedLabel(item.descricao || item.description, item.filename || 'Sem descricao');
    const thematicCategory = toSlug(thematicCategoryLabel) || 'nao-classificado';
    const subcategory = toSlug(subcategoryLabel) || 'sem-subcategoria';
    const originalImagePath = item.path;
    const imageSources = resolveImageSources(originalImagePath);

    return {
        id: item.file_hash || `${index}`,
        filename: item.filename,
        imagePath: originalImagePath,
        ...imageSources,
        fileSize: item.file_size,
        description,
        tags: Array.isArray(item.tags) ? item.tags : [],
        categories: [thematicCategory],
        categoriesLabel: [thematicCategoryLabel, subcategoryLabel],
        thematicCategory,
        thematicCategoryLabel,
        subcategory,
        subcategoryLabel,
        peopleCount: item.pessoas_identificadas ?? item.people_count,
        historicalPeriod: item.periodo || item.historical_period,
        estimatedYear: item.ano_estimado ?? item.estimated_year,
        sceneType: item.scene_type,
        documentType: item.tipo_documento || item.document_type,
        title: item.filename,
    };
};

const mapCollectionItems = (rawItems) => rawItems.map(mapCollectionItem);

const buildCollectionCategories = (collectionItems) => {
    const categoryCounts = collectionItems.reduce((acc, item) => {
        const slug = item.thematicCategory;
        if (!slug) return acc;

        if (!acc[slug]) {
            acc[slug] = { count: 0, label: item.thematicCategoryLabel || toLabel(slug) };
        }

        acc[slug].count += 1;
        return acc;
    }, {});

    return [
        { slug: 'todos', label: 'Todos', count: collectionItems.length },
        ...Object.keys(categoryCounts)
            .sort((a, b) => a.localeCompare(b))
            .map((slug) => ({
                slug,
                label: categoryCounts[slug].label,
                count: categoryCounts[slug].count,
            })),
    ];
};

const buildCollectionSubcategories = (collectionItems, activeCategory = 'todos') => {
    if (activeCategory === 'todos') {
        return [];
    }

    const filteredItems = collectionItems.filter((item) => item.thematicCategory === activeCategory);

    const subcategoryCounts = filteredItems.reduce((acc, item) => {
        const slug = item.subcategory;
        if (!slug) return acc;

        if (!acc[slug]) {
            acc[slug] = { count: 0, label: item.subcategoryLabel || toLabel(slug) };
        }

        acc[slug].count += 1;
        return acc;
    }, {});

    return [
        { slug: 'todos', label: 'Todas', count: filteredItems.length },
        ...Object.keys(subcategoryCounts)
            .sort((a, b) => a.localeCompare(b))
            .map((slug) => ({
                slug,
                label: subcategoryCounts[slug].label,
                count: subcategoryCounts[slug].count,
            })),
    ];
};

const buildAcervoPageUrl = ({ categoriaTematica = 'todos', subcategoria = 'todos' } = {}) => {
    const params = new URLSearchParams();

    if (categoriaTematica && categoriaTematica !== 'todos') {
        params.set('categoria_tematica', categoriaTematica);
    }

    if (
        categoriaTematica
        && categoriaTematica !== 'todos'
        && subcategoria
        && subcategoria !== 'todos'
    ) {
        params.set('subcategoria', subcategoria);
    }

    const query = params.toString();
    return query ? `/acervo?${query}` : '/acervo';
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
    return items.filter((item) => (
        item.thematicCategory === activeCategory
        || (Array.isArray(item.categories) && item.categories.includes(activeCategory))
    ));
};

const filterItemsBySubcategory = (items, activeSubcategory) => {
    if (activeSubcategory === 'todos') {
        return items;
    }
    return items.filter((item) => item.subcategory === activeSubcategory);
};

const filterItemsByQuery = (items, q) => {
    if (!q) {
        return items;
    }
    const needle = q.toLowerCase();
    return items.filter((item) => item.description && item.description.toLowerCase().includes(needle));
};

const filterVisibleItems = (items, activeCategory, activeSubcategory) => filterItemsBySubcategory(
    filterItemsByCategory(
        items.filter((item) => item.hasImage),
        activeCategory,
    ),
    activeSubcategory,
);

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
    const visibleItems = collectionItems.filter((item) => item.hasImage);
    const collectionCategories = buildCollectionCategories(visibleItems);
    const missingItemsCount = collectionItems.length - visibleItems.length;

    const getCollectionCategories = () => collectionCategories;

    const getAcervoPageData = ({ categoria_tematica, subcategoria, categoria, pageSize = 24 } = {}) => {
        const activeCategory = resolveCategory(categoria_tematica || categoria, collectionCategories);
        const collectionSubcategories = buildCollectionSubcategories(visibleItems, activeCategory);
        const activeSubcategory = collectionSubcategories.length > 0
            ? resolveCategory(subcategoria, collectionSubcategories)
            : 'todos';
        const filteredItems = filterVisibleItems(collectionItems, activeCategory, activeSubcategory);
        const pagination = paginateItems(filteredItems, 1, pageSize);
        const hasSubcategoryFilter = activeCategory !== 'todos' && collectionSubcategories.length > 0;

        return {
            pageTitle: 'Museu do Vinho Mario Pellegrin - Acervo',
            activeCategory,
            activeSubcategory,
            clearFiltersHref: buildAcervoPageUrl(),
            categories: collectionCategories.map((category) => ({
                ...category,
                isActive: category.slug === activeCategory,
                href: buildAcervoPageUrl({ categoriaTematica: category.slug }),
            })),
            subcategories: collectionSubcategories.map((item) => ({
                ...item,
                isActive: item.slug === activeSubcategory,
                href: buildAcervoPageUrl({
                    categoriaTematica: activeCategory,
                    subcategoria: item.slug,
                }),
            })),
            hasSubcategoryFilter,
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

    const getAcervoApiData = ({ categoria_tematica, subcategoria, categoria, page = 1, limit = 24, q = '' } = {}) => {
        const activeCategory = resolveCategory(categoria_tematica || categoria, collectionCategories);
        const collectionSubcategories = buildCollectionSubcategories(visibleItems, activeCategory);
        const activeSubcategory = resolveCategory(subcategoria, collectionSubcategories);
        const safePage = toPositiveInteger(page, 1);
        const safeLimit = Math.min(toPositiveInteger(limit, 24), 100);
        const safeQ = String(q || '').trim().slice(0, 200);

        let filteredItems = filterVisibleItems(collectionItems, activeCategory, activeSubcategory);
        filteredItems = filterItemsByQuery(filteredItems, safeQ);
        const pagination = paginateItems(filteredItems, safePage, safeLimit);

        return {
            category: activeCategory,
            subcategory: activeSubcategory,
            q: safeQ,
            pagination: {
                page: pagination.page,
                limit: safeLimit,
                totalItems: pagination.totalItems,
                totalPages: pagination.totalPages,
            },
            categories: collectionCategories,
            subcategories: collectionSubcategories,
            items: pagination.items,
        };
    };

    const getItemById = (id) => collectionItems.find((item) => item.id === id) || null;

    const getDiagnostics = () => ({
        totalItemsFromJson: collectionItems.length,
        visibleItems: visibleItems.length,
        missingItems: missingItemsCount,
        categoriesVisible: collectionCategories.length,
    });

    return {
        getCollectionCategories,
        getAcervoPageData,
        getAcervoApiData,
        getItemById,
        getDiagnostics,
    };
};

const fetchAcervo = async ({ categoriaTematica = 'todos', subcategoria = 'todos', page, limit, q }) => {
    const params = new URLSearchParams({
        categoria_tematica: categoriaTematica,
        subcategoria,
        page: String(page),
        limit: String(limit),
    });

    if (q) params.set('q', q);

    const response = await fetch(`/api/acervo?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
    }

    return response.json();
};

module.exports = {
    mapCollectionItems,
    buildCollectionCategories,
    buildCollectionSubcategories,
    resolveCategory,
    filterItemsByCategory,
    filterItemsBySubcategory,
    filterItemsByQuery,
    paginateItems,
    createAcervoService,
    fetchAcervo,
};
