const formatAppBuildDate = (buildDate, timeZone) => {
    if (!buildDate) {
        return '';
    }

    return new Date(buildDate).toLocaleDateString('pt-BR', {
        timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

module.exports = {
    formatAppBuildDate,
};
