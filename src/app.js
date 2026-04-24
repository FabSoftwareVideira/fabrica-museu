const Fastify = require('fastify');

const { env } = require('./config/env');
const { loadAcervoItems } = require('./repositories/acervoRepository');
const { createAcervoService } = require('./services/acervoService');
const { registerRoutes } = require('./routes');
const { registerViewEngine } = require('./plugins/viewEngine');

// Bibliotecas adicionais
const securityPlugin = require('./plugins/security');
const staticPlugin = require('./plugins/static');
const limitPlugin = require('./plugins/limit');

const buildApp = () => {
    const app = Fastify({
        logger: true,
        trustProxy: env.trustProxy,
    });

    // 1. Plugins
    app.register(staticPlugin, { env });
    app.register(securityPlugin);
    app.register(limitPlugin);
    app.register(registerViewEngine, { isDevelopment: env.nodeEnv === 'development' });

    // 2. Serviços e Repositórios
    const acervoService = createAcervoService(loadAcervoItems());

    // 3. Rotas
    app.after(() => {
        registerRoutes(app, { acervoService });
    });

    return app;
};

module.exports = {
    buildApp,
    env,
};
