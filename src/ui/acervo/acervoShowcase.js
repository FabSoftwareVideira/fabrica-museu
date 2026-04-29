import { resolveEl, toText, shuffleItems } from '../utils.js';

export const createShowcase = (config = {}) => {
    const showcase = resolveEl(config.showcase, '[data-home-acervo-showcase]');
    if (!showcase) return null;

    const slots = Array.from(showcase.querySelectorAll('.home-acervo-mosaic__item'));
    if (slots.length === 0) return null;

    const apiUrl = config.apiUrl || '/api/acervo';
    const gridSize = Number(config.gridSize || showcase.dataset.gridSize || slots.length);
    const rotateCount = Math.max(1, Number(config.rotateCount || showcase.dataset.rotateCount || 3));
    const rotateInterval = Math.max(
        2000,
        Number(config.rotateInterval ?? showcase.dataset.rotateInterval ?? 3200)
    );

    const loadedKeys = new Set();
    let hasBootstrapped = false;
    let rotationTimer = null;
    let activeItems = [];
    let pool = [];
    let showcaseObserver = null;

    const normalizeItem = (item) => {
        if (!item || !item.imageUrl) return null;
        return { imageUrl: item.imageUrl, description: toText(item.description, 'Imagem do acervo') };
    };

    const renderSlot = (slot, item, { swapping = false } = {}) => {
        if (!slot || !item) return;

        if (swapping) slot.classList.add('is-swapping');

        window.setTimeout(() => {
            const safeAlt = item.description.replace(/"/g, '&quot;');

            slot.innerHTML = `
                <img
                    class="home-acervo-mosaic__image"
                    src="${item.imageUrl}"
                    alt="${safeAlt}"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    draggable="false"
                />
            `;

            const image = slot.querySelector('.home-acervo-mosaic__image');
            if (image) {
                const revealSlot = () => {
                    void slot.offsetWidth;
                    slot.classList.remove('is-loading', 'is-swapping');
                    slot.classList.add('is-loaded', 'is-visible');
                };
                if (image.complete) revealSlot();
                else image.addEventListener('load', revealSlot, { once: true });
            }
        }, swapping ? 280 : 0);
    };

    const pickNextItem = () => {
        const usedUrls = new Set(activeItems.map((i) => i?.imageUrl).filter(Boolean));
        const available = pool.filter((i) => !usedUrls.has(i.imageUrl));
        const source = available.length > 0 ? available : pool;
        if (source.length === 0) return null;
        return source[Math.floor(Math.random() * source.length)];
    };

    const startRotation = () => {
        if (pool.length <= slots.length) return;

        rotationTimer = window.setInterval(() => {
            shuffleItems(slots).slice(0, Math.min(rotateCount, slots.length)).forEach((slot) => {
                const slotIndex = slots.indexOf(slot);
                const nextItem = pickNextItem();
                if (!nextItem) return;
                activeItems[slotIndex] = nextItem;
                renderSlot(slot, nextItem, { swapping: true });
            });
        }, rotateInterval);
    };

    const stopRotation = () => {
        if (rotationTimer) { window.clearInterval(rotationTimer); rotationTimer = null; }
    };

    const bootstrap = async () => {
        if (hasBootstrapped) return;
        hasBootstrapped = true;

        try {
            const poolSize = Math.max(gridSize + 8, 20);
            const response = await fetch(
                `${apiUrl}?categoria_tematica=todos&subcategoria=todos&page=1&limit=${poolSize}`,
            );
            if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

            const payload = await response.json();
            const items = (Array.isArray(payload.items) ? payload.items : [])
                .map(normalizeItem)
                .filter(Boolean)
                .filter((item) => {
                    if (loadedKeys.has(item.imageUrl)) return false;
                    loadedKeys.add(item.imageUrl);
                    return true;
                });

            if (items.length === 0) return;

            pool = shuffleItems(items);
            activeItems = pool.slice(0, slots.length);

            slots.forEach((slot, index) => {
                if (activeItems[index]) renderSlot(slot, activeItems[index]);
            });

            startRotation();
        } catch (error) {
            console.warn('Falha ao carregar vitrine aleatoria do acervo:', error);
        }
    };

    const onVisibilityChange = () => {
        if (document.hidden) { stopRotation(); return; }
        if (!rotationTimer && hasBootstrapped) startRotation();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    showcaseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            bootstrap();
            if (showcaseObserver) { showcaseObserver.disconnect(); showcaseObserver = null; }
        });
    }, { root: null, threshold: 0.15, rootMargin: '200px 0px' });

    showcaseObserver.observe(showcase);

    const destroy = () => {
        stopRotation();
        if (showcaseObserver) { showcaseObserver.disconnect(); showcaseObserver = null; }
        document.removeEventListener('visibilitychange', onVisibilityChange);
    };

    return { destroy };
};
