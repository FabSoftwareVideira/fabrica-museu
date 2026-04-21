const path = require('node:path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');

const { env } = require('./config/env');
const { loadAcervoItems } = require('./repositories/acervoRepository');
const { createAcervoService } = require('./services/acervoService');
const { registerRoutes } = require('./routes');
const { registerViewEngine } = require('./plugins/viewEngine');

const buildApp = () => {
    const app = Fastify({
        logger: true,
        trustProxy: env.trustProxy,
    });

    app.register(fastifyStatic, {
        root: path.join(__dirname, 'public'),
        prefix: '/public/',
    });

    registerViewEngine(app, {
        isDevelopment: env.nodeEnv === 'development',
        appVersion: env.appVersion,
    });

    const acervoService = createAcervoService(loadAcervoItems());
    registerRoutes(app, { acervoService });

    return app;
};

module.exports = {
    buildApp,
    env,
};
