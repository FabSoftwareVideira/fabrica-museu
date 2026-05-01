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

const APP_VERSION = process.env.IMAGE_TAG || "dev";
const APP_COMMIT = process.env.GIT_COMMIT || "unknown";
const APP_BUILD_DATE = process.env.BUILD_DATE || "";
const APP_IMAGE = process.env.IMAGE_NAME || ""; // opcional

const env = {
    nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),
    timeZone: process.env.TZ || 'America/Sao_Paulo',
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || 'false'),
    photosHostPath: resolvePhotosHostPath(),
    appVersion: APP_VERSION,
    appCommit: APP_COMMIT,
    appBuildDate: APP_BUILD_DATE,
    appImage: APP_IMAGE,
};

module.exports = { env };
