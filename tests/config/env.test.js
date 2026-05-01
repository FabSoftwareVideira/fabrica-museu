const test = require('node:test');
const assert = require('node:assert/strict');

const envModulePath = require.resolve('../../src/config/env');

const loadEnvWith = (overrides) => {
    const previous = {
        IMAGE_TAG: process.env.IMAGE_TAG,
        IMAGE_NAME: process.env.IMAGE_NAME,
        GIT_COMMIT: process.env.GIT_COMMIT,
        BUILD_DATE: process.env.BUILD_DATE,
    };

    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }

    delete require.cache[envModulePath];
    const { env } = require('../../src/config/env');

    for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }

    delete require.cache[envModulePath];
    return env;
};

test('env usa metadados de build fornecidos pelo ambiente', () => {
    const env = loadEnvWith({
        IMAGE_TAG: 'v0.0.74',
        IMAGE_NAME: 'fabrica-museu:v0.0.74',
        GIT_COMMIT: '17e0d5d',
        BUILD_DATE: '27/04/2026',
    });

    assert.equal(env.appVersion, 'v0.0.74');
    assert.equal(env.appImage, 'fabrica-museu:v0.0.74');
    assert.equal(env.appCommit, '17e0d5d');
    assert.equal(env.appBuildDate, '27/04/2026');
});

test('env aplica fallback para dev quando IMAGE_TAG nao existe', () => {
    const env = loadEnvWith({
        IMAGE_TAG: undefined,
        IMAGE_NAME: undefined,
        GIT_COMMIT: '17e0d5d',
        BUILD_DATE: '27/04/2026',
    });

    assert.equal(env.appVersion, 'dev');
    assert.equal(env.appImage, '');
    assert.equal(env.appCommit, '17e0d5d');
    assert.equal(env.appBuildDate, '27/04/2026');
});