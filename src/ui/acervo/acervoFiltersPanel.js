import { resolveEl } from '../utils.js';

export const createFiltersPanel = (config = {}) => {
    const shell = resolveEl(config.shell, '[data-acervo-shell]');
    if (!shell) return null;

    const toggleButtons = Array.from(
        document.querySelectorAll(config.toggles || '[data-acervo-filters-toggle]')
    );
    if (toggleButtons.length === 0) return null;

    const toggleLabel = resolveEl(config.toggleLabel, '[data-acervo-filters-toggle-label]');
    const backdrop = resolveEl(config.backdrop, '[data-acervo-filters-backdrop]');
    const categoryLinks = Array.from(
        document.querySelectorAll(config.categoryLinks || '.acervo-category-chip[href]')
    );
    const storageKey = config.storageKey || 'acervoFiltersPanelOpen';
    const isMobile = () => window.innerWidth <= 768;

    const readStoredState = () => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored === 'open') return true;
            if (stored === 'closed') return false;
        } catch (_) { }
        return null;
    };

    const persistState = (isOpen) => {
        try { localStorage.setItem(storageKey, isOpen ? 'open' : 'closed'); } catch (_) { }
    };

    const syncPageLock = (isOpen) => {
        document.body.classList.toggle('acervo-filters-locked', isMobile() && isOpen);
    };

    const applyState = (isOpen) => {
        shell.classList.toggle('is-filters-open', isOpen);
        shell.setAttribute('data-filters-open', isOpen ? 'true' : 'false');
        toggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false'));
        if (backdrop) backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (toggleLabel) toggleLabel.textContent = isOpen ? 'Ocultar filtros' : 'Mostrar filtros';
        syncPageLock(isOpen);
    };

    const resolveInitialState = () => {
        if (!isMobile()) return true;
        const storedState = readStoredState();
        return storedState === null ? false : storedState;
    };

    applyState(resolveInitialState());

    const onToggleClick = () => {
        const next = !shell.classList.contains('is-filters-open');
        applyState(next);
        persistState(next);
    };
    toggleButtons.forEach((btn) => btn.addEventListener('click', onToggleClick));

    const onBackdropClick = () => { applyState(false); persistState(false); };
    if (backdrop) backdrop.addEventListener('click', onBackdropClick);

    const onCategoryLinkClick = () => {
        if (!isMobile()) return;
        applyState(false);
        persistState(false);
    };
    categoryLinks.forEach((link) => link.addEventListener('click', onCategoryLinkClick));

    const onKeydown = (event) => {
        if (event.key !== 'Escape') return;
        if (!shell.classList.contains('is-filters-open')) return;
        applyState(false);
        persistState(false);
    };
    document.addEventListener('keydown', onKeydown);

    const onResize = () => {
        if (!isMobile() && !shell.classList.contains('is-filters-open')) {
            applyState(true);
            return;
        }

        syncPageLock(shell.classList.contains('is-filters-open'));
    };
    window.addEventListener('resize', onResize, { passive: true });

    const destroy = () => {
        toggleButtons.forEach((btn) => btn.removeEventListener('click', onToggleClick));
        if (backdrop) backdrop.removeEventListener('click', onBackdropClick);
        categoryLinks.forEach((link) => link.removeEventListener('click', onCategoryLinkClick));
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('resize', onResize);
    };

    return { destroy };
};
