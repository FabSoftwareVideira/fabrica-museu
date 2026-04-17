const path = require('node:path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const fastifyView = require('@fastify/view');
const handlebars = require('handlebars');
const acervoIndex = require('./data/acervo-index.json');

const app = Fastify({
    logger: true,
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

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

const buildPublicPath = (relativePath) => {
    const normalizedPath = String(relativePath || '').replace(/\\/g, '/');
    return `/public/${encodeURI(normalizedPath)}`;
};

const collectionItems = acervoIndex.map((item, index) => {
    const categories = Array.isArray(item.categories)
        ? item.categories.map((category) => toSlug(category)).filter(Boolean)
        : [];

    return {
        id: item.file_hash || `${index}`,
        filename: item.filename,
        imagePath: item.path,
        imageUrl: buildPublicPath(item.path),
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

const categoryCounts = collectionItems.reduce((acc, item) => {
    item.categories.forEach((category) => {
        acc[category] = (acc[category] || 0) + 1;
    });
    return acc;
}, {});

const collectionCategories = [
    { slug: 'todos', label: 'Todos', count: collectionItems.length },
    ...Object.keys(categoryCounts)
        .sort((a, b) => a.localeCompare(b))
        .map((slug) => ({
            slug,
            label: toLabel(slug),
            count: categoryCounts[slug],
        })),
];

app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
});

app.register(fastifyView, {
    engine: {
        handlebars,
    },
    root: path.join(__dirname, 'views'),
});

app.get('/', async (request, reply) => {
    return reply.view('index.hbs', {
        pageTitle: 'Museu do Vinho Mario Pellegrin',
        year: new Date().getFullYear(),
    });
});

app.get('/acervo', async (request, reply) => {
    const selectedCategory = String(request.query.categoria || 'todos').toLowerCase();
    const categoryIsValid = collectionCategories.some((category) => category.slug === selectedCategory);
    const activeCategory = categoryIsValid ? selectedCategory : 'todos';

    const requestedPage = Number(request.query.page || 1);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = 24;

    const filteredItems = activeCategory === 'todos'
        ? collectionItems
        : collectionItems.filter((item) => item.categories.includes(activeCategory));

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pagedItems = filteredItems.slice(start, start + pageSize);

    return reply.view('acervo.hbs', {
        pageTitle: 'Explorar o Acervo',
        year: new Date().getFullYear(),
        activeCategory,
        categories: collectionCategories.map((category) => ({
            ...category,
            isActive: category.slug === activeCategory,
        })),
        items: pagedItems,
        hasItems: pagedItems.length > 0,
        pagination: {
            currentPage,
            totalPages,
            hasPrevious: currentPage > 1,
            hasNext: currentPage < totalPages,
            previousPage: currentPage - 1,
            nextPage: currentPage + 1,
            totalItems,
            pageSize,
            basePath: `/acervo?categoria=${activeCategory}&page=`,
        },
        imagesFolder: 'src/public/photos',
    });
});

app.get('/api/acervo', async (request, reply) => {
    const selectedCategory = String(request.query.categoria || 'todos').toLowerCase();
    const categoryIsValid = collectionCategories.some((category) => category.slug === selectedCategory);
    const activeCategory = categoryIsValid ? selectedCategory : 'todos';

    const requestedPage = Number(request.query.page || 1);
    const requestedLimit = Number(request.query.limit || 24);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 24;

    const filteredItems = activeCategory === 'todos'
        ? collectionItems
        : collectionItems.filter((item) => item.categories.includes(activeCategory));

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const pagedItems = filteredItems.slice(start, start + limit);

    return reply.send({
        category: activeCategory,
        pagination: {
            page: currentPage,
            limit,
            totalItems,
            totalPages,
        },
        categories: collectionCategories,
        items: pagedItems,
    });
});

app.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
    try {
        await app.listen({ host, port });
        app.log.info(`Servidor rodando em http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
