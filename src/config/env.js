const path = require('node:path');
const fs = require('node:fs');

const resolvePhotosHostPath = () => {
    const candidates = [
        process.env.PHOTOS_HOST_PATH,
        '/app/src/public/photos',
        path.join(__dirname, '..', 'public', 'photos'),
    ].filter(Boolean);

    const existingPath = candidates.find((candidate) => fs.existsSync(candidate));
    return existingPath || candidates[0];
};

const env = {
    nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || 'false'),
    photosHostPath: resolvePhotosHostPath(),
};

module.exports = { env };
