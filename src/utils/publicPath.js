const buildPublicPath = (relativePath) => {
    const normalizedPath = String(relativePath || '').replace(/\\/g, '/');
    return `/public/${encodeURI(normalizedPath)}`;
};

module.exports = { buildPublicPath };
