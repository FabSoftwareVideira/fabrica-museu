const createAcervoController = ({ acervoService }) => {
    const acervoPageController = async (request, reply) => {
        const viewModel = acervoService.getAcervoPageData({
            categoria_tematica: request.query.categoria_tematica,
            subcategoria: request.query.subcategoria,
            categoria: request.query.categoria,
            pageSize: 24,
        });

        request.log.info({
            event: 'acervo.page',
            categoriaTematica: request.query.categoria_tematica || request.query.categoria || 'todos',
            subcategoria: request.query.subcategoria || 'todos',
            activeCategory: viewModel.activeCategory,
            activeSubcategory: viewModel.activeSubcategory,
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
            categoria_tematica: request.query.categoria_tematica,
            subcategoria: request.query.subcategoria,
            categoria: request.query.categoria,
            page: request.query.page,
            limit: request.query.limit,
            q: request.query.q,
        });

        request.log.info({
            event: 'acervo.api',
            categoriaTematica: request.query.categoria_tematica || request.query.categoria || 'todos',
            subcategoria: request.query.subcategoria || 'todos',
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
            pageTitle: (item.description || item.title || 'Item do acervo').slice(0, 60),
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
