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

    const acervoItemController = async (request, reply) => {
        const item = acervoService.getItemById(request.params.id);

        if (!item) {
            return reply.code(404).view('404.hbs', { pageTitle: 'Item não encontrado', year: new Date().getFullYear() });
        }

        return reply.view('acervo-item.hbs', {
            pageTitle: item.description.slice(0, 60),
            item,
            year: new Date().getFullYear(),
        });
    };

    return {
        acervoPageController,
        acervoApiController,
        acervoItemController,
    };
};

module.exports = { createAcervoController };
