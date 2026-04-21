const path = require('node:path');
const fs = require('node:fs');
const fastifyView = require('@fastify/view');
const handlebars = require('handlebars');

const partialsDirs = [
    path.join(__dirname, '..', 'views', 'partials'),
    path.join(__dirname, '..', 'views', 'components'),
];

const registerPartials = () => {
    partialsDirs.forEach((dirPath) => {
        const files = fs.readdirSync(dirPath);

        files.forEach((filename) => {
            if (filename.endsWith('.hbs')) {
                const name = filename.replace('.hbs', '');
                const partialPath = path.join(dirPath, filename);
                const template = fs.readFileSync(partialPath, 'utf8');
                handlebars.registerPartial(name, template);
            }
        });
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
