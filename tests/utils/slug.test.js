const test = require('node:test');
const assert = require('node:assert/strict');

const { toSlug, toLabel } = require('../../src/utils/slug');

test('toSlug deve remover acentos e gerar slug', () => {
    assert.equal(toSlug(' Fotografia Histórica '), 'fotografia-historica');
});

test('toSlug deve retornar string vazia para valor invalido', () => {
    assert.equal(toSlug(null), '');
});

test('toLabel deve usar mapa para slugs conhecidos', () => {
    assert.equal(toLabel('fotografia'), 'Fotografia');
});

test('toLabel deve converter slug livre para titulo', () => {
    assert.equal(toLabel('linha-do-tempo'), 'Linha Do Tempo');
});
