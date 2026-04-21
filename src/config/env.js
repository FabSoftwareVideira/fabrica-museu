const env = {
    nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || 'false'),
    // Versão da aplicação (em produção, extraída da tag git durante deploy)
    appVersion: process.env.APP_VERSION || require('../../package.json').version,
};

module.exports = { env };
