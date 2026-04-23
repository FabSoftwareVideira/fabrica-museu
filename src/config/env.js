const path = require('node:path');

const env = {
    nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || 'false'),
    photosHostPath: process.env.PHOTOS_HOST_PATH || path.join(__dirname, '..', 'public', 'photos'),
};

module.exports = { env };
