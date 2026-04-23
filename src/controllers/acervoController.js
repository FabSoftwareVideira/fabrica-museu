const createAcervoController = ({ acervoService }) => {
    const acervoPageController = async (request, reply) => {
        const viewModel = acervoService.getAcervoPageData({
            categoria: request.query.categoria,
            pageSize: 24,
        });

        request.log.info({
            event: 'acervo.page',
            categoria: request.query.categoria || 'todos',
            activeCategory: viewModel.activeCategory,
            totalItems: Number(viewModel.acervoTotalItems),
            totalPages: Number(viewModel.acervoTotalPages),
            pageSize: Number(viewModel.acervoPageSize),
        }, 'Pagina do acervo montada');

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

        request.log.info({
            event: 'acervo.api',
            categoria: request.query.categoria || 'todos',
            pageRequested: request.query.page || 1,
            limitRequested: request.query.limit || 24,
            totalItems: responsePayload.pagination.totalItems,
            totalPages: responsePayload.pagination.totalPages,
            itemsReturned: responsePayload.items.length,
        }, 'API do acervo respondeu');

        return reply.send(responsePayload);
    };

    const acervoItemController = async (request, reply) => {
        const item = acervoService.getItemById(request.params.id);

        if (!item) {
            request.log.warn({
                event: 'acervo.item.not_found',
                id: request.params.id,
            }, 'Item do acervo nao encontrado');
            return reply.code(404).view('404.hbs', { pageTitle: 'Item não encontrado', year: new Date().getFullYear() });
        }

        request.log.info({
            event: 'acervo.item',
            id: request.params.id,
            hasImage: Boolean(item.imageUrl),
        }, 'Item do acervo carregado');

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
