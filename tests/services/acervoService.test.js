const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
    mapCollectionItems,
    resolveCategory,
    filterItemsByCategory,
    paginateItems,
    createAcervoService,
} = require('../../src/services/acervoService');

const sampleItems = [
    {
        file_hash: '1',
        filename: 'a.jpg',
        path: 'photos/a.jpg',
        categories: ['Fotografia'],
        tags: [],
    },
    {
        file_hash: '2',
        filename: 'b.jpg',
        path: 'photos/b.jpg',
        categories: ['Evento'],
        tags: [],
    },
    {
        file_hash: '3',
        filename: 'c.jpg',
        path: 'photos/c.jpg',
        categories: ['Evento'],
        tags: [],
    },
];

test('resolveCategory retorna todos quando categoria e invalida', () => {
    const categories = [
        { slug: 'todos' },
        { slug: 'evento' },
    ];

    assert.equal(resolveCategory('nao-existe', categories), 'todos');
});

test('filterItemsByCategory retorna apenas itens da categoria informada', () => {
    const normalizedItems = [
        { categories: ['evento'] },
        { categories: ['fotografia'] },
    ];

    const filtered = filterItemsByCategory(normalizedItems, 'evento');
    assert.equal(filtered.length, 1);
});

test('paginateItems calcula paginas corretamente', () => {
    const result = paginateItems([1, 2, 3, 4, 5], 2, 2);
    assert.deepEqual(result.items, [3, 4]);
    assert.equal(result.totalPages, 3);
    assert.equal(result.page, 2);
});

test('acervoService monta dados da API com limite maximo de 100', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acervo-limit-'));
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = tempDir;

    try {
        fs.writeFileSync(path.join(tempDir, 'b.jpg'), 'img-b');
        fs.writeFileSync(path.join(tempDir, 'c.jpg'), 'img-c');

        const service = createAcervoService(sampleItems);
        const result = service.getAcervoApiData({ categoria: 'evento', page: 1, limit: 999 });

        assert.equal(result.category, 'evento');
        assert.equal(result.pagination.limit, 100);
        assert.equal(result.pagination.totalItems, 2);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});

test('mapCollectionItems monta imageUrl com sufixo _thumb.webp e originalImageUrl', () => {
    const mapped = mapCollectionItems([
        {
            file_hash: 'abc123',
            filename: 'img478.jpg',
            path: 'photos/parte-1/Caixa azul 02/A23 Feira Parque da Uva/img478.jpg',
            categories: ['Evento'],
            tags: ['vinho'],
        },
    ]);

    assert.equal(mapped.length, 1);
    assert.equal(
        mapped[0].imageUrl,
        '/public/photos/parte-1/Caixa%20azul%2002/A23%20Feira%20Parque%20da%20Uva/img478_thumb.webp',
    );
    assert.equal(
        mapped[0].originalImageUrl,
        '/public/photos/parte-1/Caixa%20azul%2002/A23%20Feira%20Parque%20da%20Uva/img478.jpg',
    );
});

test('acervoService mantem mapeamento por path do JSON mesmo com PHOTOS_HOST_PATH definido', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acervo-vps-'));
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = tempDir;

    try {
        fs.mkdirSync(path.join(tempDir, 'vps'), { recursive: true });
        fs.writeFileSync(path.join(tempDir, 'vps', 'vps_thumb.webp'), 'thumb-vps');

        const service = createAcervoService([
            {
                file_hash: 'hash-vps',
                filename: 'vps.jpg',
                path: 'photos/vps/vps.jpg',
                categories: ['Evento'],
                tags: [],
            },
        ]);

        const payload = service.getAcervoApiData({ categoria: 'todos', page: 1, limit: 24 });
        assert.equal(payload.items.length, 1);
        assert.equal(payload.items[0].imageUrl, '/public/photos/vps/vps_thumb.webp');
        assert.equal(payload.items[0].originalImageUrl, null);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});

test('mapCollectionItems usa thumb quando _thumb.webp existe no disco', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acervo-thumb-'));
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = tempDir;

    try {
        const relDir = path.join(tempDir, 'parte-1');
        fs.mkdirSync(relDir, { recursive: true });
        fs.writeFileSync(path.join(relDir, 'img001_thumb.webp'), 'thumb');

        const mapped = mapCollectionItems([
            {
                file_hash: 'thumb-ok',
                filename: 'img001.jpg',
                path: 'photos/parte-1/img001.jpg',
                categories: ['Evento'],
                tags: [],
            },
        ]);

        assert.equal(mapped[0].imageUrl, '/public/photos/parte-1/img001_thumb.webp');
        assert.equal(mapped[0].hasImage, true);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});

test('mapCollectionItems usa original quando thumb nao existe mas original existe', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acervo-orig-'));
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = tempDir;

    try {
        const relDir = path.join(tempDir, 'parte-1');
        fs.mkdirSync(relDir, { recursive: true });
        fs.writeFileSync(path.join(relDir, 'img002.jpg'), 'original');

        const mapped = mapCollectionItems([
            {
                file_hash: 'orig-ok',
                filename: 'img002.jpg',
                path: 'photos/parte-1/img002.jpg',
                categories: ['Evento'],
                tags: [],
            },
        ]);

        assert.equal(mapped[0].imageUrl, '/public/photos/parte-1/img002.jpg');
        assert.equal(mapped[0].originalImageUrl, '/public/photos/parte-1/img002.jpg');
        assert.equal(mapped[0].hasImage, true);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});

test('acervoService nao retorna itens na listagem/API quando imagem e thumb nao existem', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acervo-missing-'));
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = tempDir;

    try {
        const service = createAcervoService([
            {
                file_hash: 'missing',
                filename: 'img003.jpg',
                path: 'photos/parte-1/img003.jpg',
                categories: ['Evento'],
                tags: [],
            },
        ]);

        const pageData = service.getAcervoPageData({ categoria: 'todos', pageSize: 24 });
        const apiData = service.getAcervoApiData({ categoria: 'todos', page: 1, limit: 24 });

        assert.equal(pageData.items.length, 0);
        assert.equal(pageData.hasItems, false);
        assert.equal(apiData.items.length, 0);
        assert.equal(apiData.pagination.totalItems, 0);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});

test('acervoService calcula contadores de filtros apenas com itens que possuem imagem', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acervo-categories-'));
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = tempDir;

    try {
        fs.writeFileSync(path.join(tempDir, 'img-a.jpg'), 'a');
        fs.writeFileSync(path.join(tempDir, 'img-b.jpg'), 'b');

        const service = createAcervoService([
            {
                file_hash: 'a',
                filename: 'img-a.jpg',
                path: 'photos/img-a.jpg',
                categories: ['Evento'],
                tags: [],
            },
            {
                file_hash: 'b',
                filename: 'img-b.jpg',
                path: 'photos/img-b.jpg',
                categories: ['Fotografia'],
                tags: [],
            },
            {
                file_hash: 'missing',
                filename: 'img-missing.jpg',
                path: 'photos/img-missing.jpg',
                categories: ['Evento'],
                tags: [],
            },
        ]);

        const pageData = service.getAcervoPageData({ categoria: 'todos', pageSize: 24 });
        const bySlug = Object.fromEntries(pageData.categories.map((c) => [c.slug, c.count]));

        assert.equal(bySlug.todos, 2);
        assert.equal(bySlug.evento, 1);
        assert.equal(bySlug.fotografia, 1);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});
