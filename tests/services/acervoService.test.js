const test = require('node:test');
const assert = require('node:assert/strict');

const {
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
