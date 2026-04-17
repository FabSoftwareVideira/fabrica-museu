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

const collectionItems = [
    {
        id: 1,
        title: 'Vindima da Familia Rech - 1954',
        category: 'fotografias',
        period: '1950-1960',
        description: 'Registro da colheita em comunidade no interior de Videira.',
    },
    {
        id: 2,
        title: 'Convite da Festa da Uva',
        category: 'documentos',
        period: '1978',
        description: 'Material impresso de divulgacao de evento regional.',
    },
    {
        id: 3,
        title: 'Prensa manual de madeira',
        category: 'objetos',
        period: 'Decada de 1940',
        description: 'Ferramenta usada para extracao inicial do mosto da uva.',
    },
    {
        id: 4,
        title: 'Album da Cooperativa Colonial',
        category: 'fotografias',
        period: '1962',
        description: 'Fotos de producao coletiva e comercializacao local.',
    },
    {
        id: 5,
        title: 'Livro-caixa da cantina',
        category: 'documentos',
        period: '1937-1939',
        description: 'Anotacoes de vendas, trocas e producao de vinho artesanal.',
    },
    {
        id: 6,
        title: 'Barrica restaurada',
        category: 'objetos',
        period: 'Inicio do seculo XX',
        description: 'Peca preservada para exposicao sobre tecnicas tradicionais.',
    },
];

const collectionCategories = [
    { slug: 'todos', label: 'Todos' },
    { slug: 'fotografias', label: 'Fotografias' },
    { slug: 'documentos', label: 'Documentos' },
    { slug: 'objetos', label: 'Objetos' },
];

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

app.get('/acervo', async (request, reply) => {
    const selectedCategory = String(request.query.categoria || 'todos').toLowerCase();
    const categoryIsValid = collectionCategories.some((category) => category.slug === selectedCategory);
    const activeCategory = categoryIsValid ? selectedCategory : 'todos';

    const filteredItems = activeCategory === 'todos'
        ? collectionItems
        : collectionItems.filter((item) => item.category === activeCategory);

    return reply.view('acervo.hbs', {
        pageTitle: 'Explorar o Acervo',
        year: new Date().getFullYear(),
        activeCategory,
        categories: collectionCategories.map((category) => ({
            ...category,
            isActive: category.slug === activeCategory,
        })),
        items: filteredItems,
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
