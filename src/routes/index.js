const { homeController } = require('../controllers/homeController');
const { healthController } = require('../controllers/healthController');
const { createAcervoController } = require('../controllers/acervoController');

const registerRoutes = (app, { acervoService }) => {
    const { acervoPageController, acervoApiController } = createAcervoController({ acervoService });

    app.get('/', homeController);
    app.get('/acervo', acervoPageController);
    app.get('/api/acervo', acervoApiController);
    app.get('/health', healthController);
};

module.exports = { registerRoutes };
