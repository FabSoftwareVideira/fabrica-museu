const toBoolean = (value, defaultValue) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return /^(1|true|yes|on)$/i.test(String(value).trim());
};

const buildRateLimitConfig = (env = process.env) => {
    const globalEnabled = toBoolean(env.RATE_LIMIT_ENABLED, true);

    return {
        pagesEnabled: toBoolean(env.RATE_LIMIT_PAGES_ENABLED, globalEnabled),
        apiEnabled: toBoolean(env.RATE_LIMIT_API_ENABLED, globalEnabled),
    };
};

const createRouteRateLimiters = (app, config) => ({
    pageRateLimit: config.pagesEnabled
        ? app.rateLimit({
            max: 120,
            timeWindow: '1 minute',
            groupId: 'public-pages',
        })
        : null,
    apiRateLimit: config.apiEnabled
        ? app.rateLimit({
            max: 80,
            timeWindow: '1 minute',
            groupId: 'acervo-api',
        })
        : null,
});

const withRateLimit = (rateLimitHandler) => (rateLimitHandler ? { preHandler: rateLimitHandler } : {});

module.exports = {
    buildRateLimitConfig,
    createRouteRateLimiters,
    withRateLimit,
};
