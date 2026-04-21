const { homeController } = require('../controllers/homeController');
const { healthController } = require('../controllers/healthController');
const { createAcervoController } = require('../controllers/acervoController');

const registerRoutes = (app, { acervoService }) => {
    const { acervoPageController, acervoApiController, acervoItemController } = createAcervoController({ acervoService });

    app.get('/', homeController);
    app.get('/acervo', acervoPageController);
    app.get('/acervo/:id', acervoItemController);
    app.get('/api/acervo', acervoApiController);
    app.get('/health', healthController);
};

module.exports = { registerRoutes };
