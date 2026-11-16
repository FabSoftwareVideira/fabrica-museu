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

    // Em produção não há Nginx na frente (o Traefik do Dokploy só faz o proxy),
    // então o cache do navegador é definido aqui. Os nomes dos arquivos não têm
    // hash, por isso CSS/JS ficam com cache curto.
    const isProduction = env.nodeEnv === 'production';

    app.register(fastifyStatic, {
        root: env.photosHostPath,
        prefix: '/public/photos/',
        decorateReply: false,
        maxAge: isProduction ? '7d' : 0,
    });

    app.register(fastifyStatic, {
        root: path.join(__dirname, '..', 'public'),
        prefix: '/public/',
        decorateReply: false,
        maxAge: isProduction ? '1h' : 0,
    });

    app.register(fastifyStatic, {
        root: path.join(__dirname, '..', 'ui'),
        prefix: '/public/js/ui/',
        decorateReply: false,
    });
});