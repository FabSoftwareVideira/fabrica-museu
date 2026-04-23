const test = require('node:test');
const assert = require('node:assert/strict');

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
    const service = createAcervoService(sampleItems);
    const result = service.getAcervoApiData({ categoria: 'evento', page: 1, limit: 999 });

    assert.equal(result.category, 'evento');
    assert.equal(result.pagination.limit, 100);
    assert.equal(result.pagination.totalItems, 2);
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
    const previousPhotosHostPath = process.env.PHOTOS_HOST_PATH;
    process.env.PHOTOS_HOST_PATH = '/srv/fabrica-museu/photos';

    try {
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
        assert.equal(payload.items[0].originalImageUrl, '/public/photos/vps/vps.jpg');
    } finally {
        if (previousPhotosHostPath === undefined) {
            delete process.env.PHOTOS_HOST_PATH;
        } else {
            process.env.PHOTOS_HOST_PATH = previousPhotosHostPath;
        }
    }
});
