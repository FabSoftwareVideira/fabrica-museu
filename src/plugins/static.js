const path = require('node:path');
const fastifyStatic = require('@fastify/static');
const fp = require('fastify-plugin');

// Configura o plugin de arquivos estáticos para servir recursos públicos (CSS, JS, imagens)
module.exports = fp(async (app, opts) => {

    const { env } = opts;

    app.log.info({
        event: 'app.startup',
        nodeEnv: env.nodeEnv,
        host: env.host,
        port: env.port,
        trustProxy: env.trustProxy,
        photosHostPath: env.photosHostPath,
    }, 'Inicializando aplicacao');

    app.register(fastifyStatic, {
        root: env.photosHostPath,
        prefix: '/public/photos/',
        decorateReply: false,
    });

    app.register(fastifyStatic, {
        root: path.join(__dirname, '..', 'public'),
        prefix: '/public/',
        decorateReply: false,
    });

    app.register(fastifyStatic, {
        root: path.join(__dirname, '..', 'ui'),
        prefix: '/public/js/ui/',
        decorateReply: false,
    });
});