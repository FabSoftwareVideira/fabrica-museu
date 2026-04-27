const { homeController } = require('../controllers/homeController');
const { healthController } = require('../controllers/healthController');
const { createAcervoController } = require('../controllers/acervoController');
const { buildRateLimitConfig, createRouteRateLimiters, withRateLimit } = require('./rateLimitConfig');

const registerRoutes = (app, { acervoService }) => {
    const { acervoPageController, acervoApiController, acervoItemController } = createAcervoController({ acervoService });
    const rateLimitConfig = buildRateLimitConfig();
    const { pageRateLimit, apiRateLimit } = createRouteRateLimiters(app, rateLimitConfig);

    app.get('/', withRateLimit(pageRateLimit), homeController);
    app.get('/acervo', withRateLimit(pageRateLimit), acervoPageController);
    app.get('/acervo/:id', withRateLimit(pageRateLimit), acervoItemController);
    app.get('/api/acervo', withRateLimit(apiRateLimit), acervoApiController);
    app.get('/health', healthController);
};

module.exports = { registerRoutes };
