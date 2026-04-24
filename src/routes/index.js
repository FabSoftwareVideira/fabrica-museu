const { homeController } = require('../controllers/homeController');
const { healthController } = require('../controllers/healthController');
const { createAcervoController } = require('../controllers/acervoController');

const registerRoutes = (app, { acervoService }) => {
    const { acervoPageController, acervoApiController, acervoItemController } = createAcervoController({ acervoService });

    // const pageRateLimit = app.rateLimit({
    //     max: 120,
    //     timeWindow: '1 minute',
    //     groupId: 'public-pages',
    // });

    // const apiRateLimit = app.rateLimit({
    //     max: 80,
    //     timeWindow: '1 minute',
    //     groupId: 'acervo-api',
    // });

    // app.get('/', { preHandler: pageRateLimit }, homeController);
    // app.get('/acervo', { preHandler: pageRateLimit }, acervoPageController);
    // app.get('/acervo/:id', { preHandler: pageRateLimit }, acervoItemController);
    // app.get('/api/acervo', { preHandler: apiRateLimit }, acervoApiController);
    // app.get('/health', healthController);

    app.get('/', homeController);
    app.get('/acervo', acervoPageController);
    app.get('/acervo/:id', acervoItemController);
    app.get('/api/acervo', acervoApiController);
    app.get('/health', healthController);
};

module.exports = { registerRoutes };
