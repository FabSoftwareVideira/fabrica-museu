const { buildApp, env } = require('./app');

const app = buildApp();

const start = async () => {
    try {
        await app.listen({ host: env.host, port: env.port });
        app.log.info(`Servidor rodando em http://${env.host}:${env.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
