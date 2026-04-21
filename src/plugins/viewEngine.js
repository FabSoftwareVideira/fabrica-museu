const path = require('node:path');
const fs = require('node:fs');
const fastifyView = require('@fastify/view');
const handlebars = require('handlebars');

const partialsDir = path.join(__dirname, '..', 'views', 'partials');
const partialFiles = {
    base: 'base.hbs',
    navbar: 'navbar.hbs',
    footer: 'footer.hbs',
};

const registerPartials = () => {
    Object.entries(partialFiles).forEach(([name, filename]) => {
        const partialPath = path.join(partialsDir, filename);
        const template = fs.readFileSync(partialPath, 'utf8');
        handlebars.registerPartial(name, template);
    });
};

const registerViewEngine = async (app, { isDevelopment }) => {
    registerPartials();

    if (isDevelopment) {
        app.addHook('onRequest', async () => {
            // Em dev, recarrega os parciais para refletir mudancas sem rebuild.
            registerPartials();
        });
    }

    app.register(fastifyView, {
        engine: {
            handlebars,
        },
        root: path.join(__dirname, '..', 'views'),
    });
};

module.exports = { registerViewEngine };
