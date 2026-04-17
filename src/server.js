const path = require('node:path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const fastifyView = require('@fastify/view');
const handlebars = require('handlebars');

const app = Fastify({
    logger: true,
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
});

app.register(fastifyView, {
    engine: {
        handlebars,
    },
    root: path.join(__dirname, 'views'),
});

app.get('/', async (request, reply) => {
    return reply.view('index.hbs', {
        pageTitle: 'Museu do Vinho Mario Pellegrin',
        year: new Date().getFullYear(),
    });
});

app.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
    try {
        await app.listen({ host, port });
        app.log.info(`Servidor rodando em http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
