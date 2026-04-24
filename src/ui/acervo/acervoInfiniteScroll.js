import { resolveEl } from '../utils.js';
import { buildItemCard } from './acervoCard.js';
import { buildSkeletonCard } from './acervoSkeleton.js';

export const createGrid = (config = {}) => {
    const grid = resolveEl(config.grid, '#acervo-grid');
    const sentinel = resolveEl(config.sentinel, '#acervo-sentinel');

    if (!grid || !sentinel) return null;

    const loadingNode = resolveEl(config.loading, '#acervo-loading');
    const endMessageNode = resolveEl(config.endMessage, '#acervo-end-message');
    const countStatusNode = resolveEl(config.countStatus, '#acervo-count-status');
    const apiUrl = config.apiUrl || '/api/acervo';

    const initialLoadedItems = grid.querySelectorAll('.column:not(.acervo-skeleton-item)').length;

    const state = {
        category: config.category || grid.dataset.category || 'todos',
        q: '',
        nextPage: 2,
        totalPages: 1,
        pageSize: Number(config.pageSize || grid.dataset.pageSize || 24),
        totalItems: initialLoadedItems,
        loadedItems: initialLoadedItems,
        hasNext: false,
        loading: false,
    };

    const SCROLL_LOAD_AHEAD_PX = 420;
    const skeletonNodes = [];

    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const shouldRetryStatus = (status) => [404, 429, 500, 502, 503, 504].includes(Number(status));

    const fetchApiWithRetry = async (url, { attempts = 3 } = {}) => {
        let lastError = null;

        for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
                const response = await fetch(url, {
                    cache: 'no-store',
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    const retryable = shouldRetryStatus(response.status);
                    if (retryable && attempt < attempts) {
                        await wait(120 * attempt);
                        continue;
                    }

                    throw new Error(`Erro HTTP ${response.status}`);
                }

                return response;
            } catch (error) {
                lastError = error;
                if (attempt < attempts) {
                    await wait(120 * attempt);
                    continue;
                }
            }
        }

        throw lastError || new Error('Falha de rede ao carregar o acervo');
    };

    const updateStatusText = () => {
        if (countStatusNode)
            countStatusNode.textContent = `Exibindo ${state.loadedItems} de ${state.totalItems} itens.`;
    };

    const setLoading = (on) => {
        if (loadingNode) loadingNode.classList.toggle('is-hidden', !on);
    };

    const showSkeletons = () => {
        const remaining = Math.max(0, state.totalItems - state.loadedItems);
        const count = Math.min(6, Math.max(3, remaining));
        for (let i = 0; i < count; i += 1) {
            const sk = buildSkeletonCard();
            skeletonNodes.push(sk);
            grid.appendChild(sk);
        }
    };

    const clearSkeletons = () => {
        while (skeletonNodes.length > 0) skeletonNodes.pop().remove();
    };

    const showEndMessage = () => {
        if (endMessageNode) endMessageNode.classList.remove('is-hidden');
    };

    const hideEndMessage = () => {
        if (endMessageNode) endMessageNode.classList.add('is-hidden');
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) fetchNextPage(); });
    }, { root: null, threshold: 0, rootMargin: '300px 0px' });

    const isNearPageBottom = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        return (scrollTop + viewportHeight) >= (docHeight - SCROLL_LOAD_AHEAD_PX);
    };

    const maybeLoadMore = () => {
        if (!state.hasNext || state.loading) return;
        if (isNearPageBottom()) fetchNextPage();
    };

    let rafScheduled = false;
    const scheduleScrollCheck = () => {
        if (rafScheduled) return;
        rafScheduled = true;
        window.requestAnimationFrame(() => { rafScheduled = false; maybeLoadMore(); });
    };

    const fetchNextPage = async () => {
        if (!state.hasNext || state.loading) return;

        state.loading = true;
        setLoading(true);
        showSkeletons();

        try {
            const params = new URLSearchParams({
                categoria: state.category,
                page: String(state.nextPage),
                limit: String(state.pageSize),
            });
            if (state.q) params.set('q', state.q);

            const response = await fetchApiWithRetry(`${apiUrl}?${params.toString()}`);

            const payload = await response.json();
            const items = Array.isArray(payload.items) ? payload.items : [];
            const fragment = document.createDocumentFragment();
            let rendered = 0;

            items.forEach((item) => {
                const card = buildItemCard(item);
                if (card) { fragment.appendChild(card); rendered += 1; }
            });

            if (rendered > 0) grid.appendChild(fragment);

            clearSkeletons();
            state.loadedItems += rendered;
            state.totalItems = payload.pagination?.totalItems || state.totalItems;

            const currentPage = payload.pagination?.page || state.nextPage;
            const totalPages = payload.pagination?.totalPages || state.totalPages;
            state.totalPages = totalPages;
            state.nextPage = currentPage + 1;
            state.hasNext = currentPage < totalPages;

            updateStatusText();

            if (!state.hasNext) { showEndMessage(); observer.disconnect(); }
        } catch (error) {
            console.warn('Falha ao carregar mais itens do acervo:', error);
        } finally {
            clearSkeletons();
            state.loading = false;
            setLoading(false);
            window.requestAnimationFrame(maybeLoadMore);
        }
    };

    const reload = async (newQ) => {
        const trimmed = String(newQ || '').trim();
        state.q = trimmed;
        state.loading = false;

        Array.from(grid.querySelectorAll('.column:not(.acervo-skeleton-item)')).forEach((el) => el.remove());
        clearSkeletons();
        hideEndMessage();
        observer.disconnect();
        setLoading(true);

        try {
            const params = new URLSearchParams({
                categoria: state.category,
                page: '1',
                limit: String(state.pageSize),
            });
            if (trimmed) params.set('q', trimmed);

            const response = await fetchApiWithRetry(`${apiUrl}?${params.toString()}`);

            const payload = await response.json();
            const items = Array.isArray(payload.items) ? payload.items : [];
            const fragment = document.createDocumentFragment();
            let rendered = 0;

            items.forEach((item) => {
                const card = buildItemCard(item);
                if (card) { fragment.appendChild(card); rendered += 1; }
            });

            if (rendered > 0) grid.appendChild(fragment);

            const currentPage = payload.pagination?.page || 1;
            const totalPages = payload.pagination?.totalPages || 1;
            state.loadedItems = rendered;
            state.totalItems = payload.pagination?.totalItems || 0;
            state.totalPages = totalPages;
            state.nextPage = currentPage + 1;
            state.hasNext = currentPage < totalPages;

            updateStatusText();

            if (!state.hasNext) { showEndMessage(); return; }

            hideEndMessage();
            observer.observe(sentinel);
            scheduleScrollCheck();
        } catch (error) {
            console.warn('Falha ao recarregar acervo com filtro:', error);
            updateStatusText();
        } finally {
            setLoading(false);
        }
    };

    const bootstrapFromApi = async () => {
        try {
            const params = new URLSearchParams({
                categoria: state.category,
                page: '1',
                limit: String(state.pageSize),
            });

            const response = await fetchApiWithRetry(`${apiUrl}?${params.toString()}`);

            const payload = await response.json();
            const currentPage = payload.pagination?.page || 1;
            const totalPages = payload.pagination?.totalPages || 1;

            state.totalItems = payload.pagination?.totalItems || state.loadedItems;
            state.totalPages = totalPages;
            state.nextPage = currentPage + 1;
            state.hasNext = currentPage < totalPages;

            updateStatusText();

            if (!state.hasNext) { showEndMessage(); return; }

            hideEndMessage();
            observer.observe(sentinel);
            scheduleScrollCheck();
        } catch (error) {
            console.warn('Falha ao inicializar metadados do acervo:', error);
            updateStatusText();
            showEndMessage();
        }
    };

    window.addEventListener('scroll', scheduleScrollCheck, { passive: true });
    window.addEventListener('resize', scheduleScrollCheck, { passive: true });

    bootstrapFromApi();

    const destroy = () => {
        observer.disconnect();
        window.removeEventListener('scroll', scheduleScrollCheck);
        window.removeEventListener('resize', scheduleScrollCheck);
    };

    return { reload, destroy };
};