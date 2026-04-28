const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Fastify = require('fastify');

const securityPlugin = require('../../src/plugins/security');
const staticPlugin = require('../../src/plugins/static');
const limitPlugin = require('../../src/plugins/limit');
const { registerViewEngine } = require('../../src/plugins/viewEngine');

const createApp = () => Fastify({ logger: false });

test('security plugin adiciona headers de seguranca e CSP esperada', async () => {
    const app = createApp();

    await app.register(securityPlugin);
    app.get('/secure', async () => ({ ok: true }));

    const response = await app.inject({ method: 'GET', url: '/secure' });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-security-policy'], /default-src 'self'/);
    assert.match(response.headers['content-security-policy'], /https:\/\/unpkg\.com/);
    assert.match(response.headers['content-security-policy'], /https:\/\/\*\.tile\.openstreetmap\.org/);
    assert.equal(response.headers['cross-origin-embedder-policy'], undefined);
    assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
    assert.equal(response.headers['referrer-policy'], 'strict-origin-when-cross-origin');

    await app.close();
});

test('static plugin serve fotos, assets publicos e modulos da UI', async () => {
    const app = createApp();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'museu-static-'));

    try {
        fs.writeFileSync(path.join(tempDir, 'foto-teste.jpg'), 'conteudo-foto');

        await app.register(staticPlugin, {
            env: {
                nodeEnv: 'test',
                host: '127.0.0.1',
                port: 3000,
                trustProxy: false,
                photosHostPath: tempDir,
            },
        });

        const photoResponse = await app.inject({ method: 'GET', url: '/public/photos/foto-teste.jpg' });
        const manifestResponse = await app.inject({ method: 'GET', url: '/public/manifest.webmanifest' });
        const uiResponse = await app.inject({ method: 'GET', url: '/public/js/ui/theme.js' });

        assert.equal(photoResponse.statusCode, 200);
        assert.equal(photoResponse.payload, 'conteudo-foto');
        assert.equal(manifestResponse.statusCode, 200);
        assert.match(manifestResponse.payload, /name|short_name/i);
        assert.equal(uiResponse.statusCode, 200);
        assert.match(uiResponse.payload, /export const applyTheme/);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
        await app.close();
    }
});

test('view engine plugin disponibiliza reply.view para renderizar templates', async () => {
    const app = createApp();

    app.decorate('appMetadata', {
        appVersion: '1.2.3',
        appCommit: 'abc1234',
        appBuildDate: '2026-04-27T10:00:00Z',
        appImage: 'fabrica-museu:1.2.3',
    });

    await app.register(registerViewEngine, { isDevelopment: false });
    app.get('/page', async (_request, reply) => {
        return reply.view('index.hbs', {
            pageTitle: 'Teste Museu',
            year: 2026,
        });
    });

    const response = await app.inject({ method: 'GET', url: '/page' });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /text\/html/);
    assert.match(response.payload, /<title>Teste Museu<\/title>/);
    assert.match(response.payload, /Versão 1\.2\.3 \(abc1234\) - Build em 2026-04-27T10:00:00Z/);

    await app.close();
});

test('limit plugin bloqueia excesso de chamadas apenas na rota protegida', async () => {
    const app = createApp();

    await app.register(limitPlugin);

    app.after(() => {
        const apiRateLimit = app.rateLimit({
            max: 2,
            timeWindow: '1 minute',
            groupId: 'test-api',
        });

        app.get('/api-protegida', { preHandler: apiRateLimit }, async () => ({ ok: true }));
        app.get('/health', async () => ({ status: 'ok' }));
    });

    await app.ready();

    const firstResponse = await app.inject({ method: 'GET', url: '/api-protegida' });
    const secondResponse = await app.inject({ method: 'GET', url: '/api-protegida' });
    const blockedResponse = await app.inject({ method: 'GET', url: '/api-protegida' });
    const healthResponse = await app.inject({ method: 'GET', url: '/health' });

    assert.equal(firstResponse.statusCode, 200);
    assert.equal(firstResponse.headers['x-ratelimit-limit'], '2');
    assert.equal(firstResponse.headers['x-ratelimit-remaining'], '1');
    assert.equal(secondResponse.statusCode, 200);
    assert.equal(secondResponse.headers['x-ratelimit-remaining'], '0');
    assert.equal(blockedResponse.statusCode, 429);
    assert.equal(blockedResponse.headers['retry-after'], '60');
    assert.match(blockedResponse.payload, /Muitas requisições para este recurso/i);
    assert.equal(healthResponse.statusCode, 200);
    assert.equal(healthResponse.payload, '{"status":"ok"}');

    await app.close();
});