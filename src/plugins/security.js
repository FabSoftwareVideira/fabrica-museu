const helmet = require('@fastify/helmet');
const fp = require('fastify-plugin');

// Protecao basica de seguranca com Helmet
// Protege contra XSS, clickjacking e outras vulnerabilidades comuns.
module.exports = fp(async (app) => {

    app.register(helmet, {
        // OSM/CARTO podem exigir Referer para anti-abuso; strict-origin-when-cross-origin
        // envia apenas a origem em chamadas cross-origin, sem expor path/query.
        referrerPolicy: {
            policy: 'strict-origin-when-cross-origin',
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://unpkg.com',
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://fonts.googleapis.com',
                    'https://cdn.jsdelivr.net',
                    'https://cdnjs.cloudflare.com',
                    'https://unpkg.com',
                ],
                fontSrc: [
                    "'self'",
                    'data:',
                    'https://fonts.gstatic.com',
                    'https://cdnjs.cloudflare.com',
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://unpkg.com',
                    'https://cdn.jsdelivr.net',
                    'https://cdnjs.cloudflare.com',
                    'https://*.tile.openstreetmap.org',
                    'https://*.basemaps.cartocdn.com',
                ],
                connectSrc: [
                    "'self'",
                    'https://unpkg.com',
                    'https://cdn.jsdelivr.net',
                    'https://cdnjs.cloudflare.com',
                    'https://*.tile.openstreetmap.org',
                    'https://*.basemaps.cartocdn.com',
                ],
                objectSrc: ["'none'"],
                frameAncestors: ["'self'"],
            },
        },
        // Desabilita COEP para permitir carregamento de imagens de terceiros (ex: tiles do mapa)
        crossOriginEmbedderPolicy: false,
    });
});
