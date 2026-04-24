const fp = require('fastify-plugin');
const fastifyRateLimit = require('@fastify/rate-limit');

module.exports = fp(async function securityPlugin(app) {
    // Registra o rate limit, mas deixa a aplicacao decidir por rota.
    // Isso evita que assets estaticos e healthcheck consumam o mesmo limite da API.
    await app.register(fastifyRateLimit, {
        global: false,
        max: 80,
        ban: 2,
        timeWindow: '1 minute',

        keyGenerator: (req) => {
            return req.ip;
        },

        addHeaders: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
        },

        errorResponseBuilder: (req, context) => {
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: `Muitas requisições para este recurso. Tente novamente em ${context.after}`,
            };
        },
    });

});