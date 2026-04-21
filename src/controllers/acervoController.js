const createAcervoController = ({ acervoService }) => {
    const acervoPageController = async (request, reply) => {
        const viewModel = acervoService.getAcervoPageData({
            categoria: request.query.categoria,
            pageSize: 24,
        });

        return reply.view('acervo.hbs', {
            ...viewModel,
            year: new Date().getFullYear(),
        });
    };

    const acervoApiController = async (request, reply) => {
        const responsePayload = acervoService.getAcervoApiData({
            categoria: request.query.categoria,
            page: request.query.page,
            limit: request.query.limit,
        });

        return reply.send(responsePayload);
    };

    return {
        acervoPageController,
        acervoApiController,
    };
};

module.exports = { createAcervoController };
