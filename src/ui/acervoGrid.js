// import { fetchAcervo } from '../services/acervoService.js';
const { fetchAcervo } = require('../services/acervoService.js');

export const setupAcervoGrid = () => {
    const grid = document.getElementById('acervo-grid');
    if (!grid) return;

    const state = {
        page: 1,
        loading: false,
    };

    const loadMore = async () => {
        if (state.loading) return;

        state.loading = true;

        try {
            const data = await fetchAcervo({
                categoria: 'todos',
                page: state.page,
                limit: 24,
            });

            console.log(data); // renderização simplificada aqui
            state.page++;
        } catch (e) {
            console.warn(e);
        } finally {
            state.loading = false;
        }
    };

    loadMore();
};