const museumCoordinates = [-27.008, -51.1516];

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);

    const label = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
    const themeButtons = document.querySelectorAll('[data-theme-toggle]');

    themeButtons.forEach((btn) => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        btn.setAttribute('title', label);
        btn.setAttribute('aria-label', label);
    });
};

const setupTheme = () => {
    let stored = null;
    try { stored = localStorage.getItem('siteTheme'); } catch (e) { }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(initial);

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('siteTheme', next); } catch (e) { }
            applyTheme(next);
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let saved = null;
        try { saved = localStorage.getItem('siteTheme'); } catch (err) { }
        if (!saved) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
};

const setupMap = () => {
    const mapElement = document.getElementById('museum-map');

    if (!mapElement || typeof window.L === 'undefined') {
        return;
    }

    const map = window.L.map('museum-map').setView(museumCoordinates, 14);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    window.L.marker(museumCoordinates)
        .addTo(map)
        .bindPopup('Museu do Vinho Mario Pellegrin')
        .openPopup();
};

const setupNavbarMenu = () => {
    const burger = document.getElementById('navbar-burger');
    const menu = document.getElementById('main-navbar-menu');

    if (!burger || !menu) {
        return;
    }

    const closeMenu = () => {
        burger.classList.remove('is-active');
        menu.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const willOpen = !burger.classList.contains('is-active');
        burger.classList.toggle('is-active', willOpen);
        menu.classList.toggle('is-active', willOpen);
        burger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    };

    burger.addEventListener('click', toggleMenu);

    menu.querySelectorAll('.navbar-item[href]').forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            closeMenu();
        }
    });
};

const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        await navigator.serviceWorker.register('/public/service-worker.js');
    } catch (error) {
        console.warn('Service Worker nao foi registrado:', error);
    }
};

const toText = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return String(value);
};

const buildItemCard = (item) => {
    if (!item || !item.imageUrl) {
        return null;
    }

    const column = document.createElement('div');
    column.className = 'column is-3-desktop is-one-fifth-widescreen is-2-fullhd is-4-tablet is-6-mobile px-1 py-1';

    const safeDesc = toText(item.description, 'Imagem do acervo');
    const id = toText(item.id, '');

    column.innerHTML = `
        <article class="card acervo-item-card" aria-label="Item do acervo: ${safeDesc.replace(/"/g, '&quot;')}">
            <div class="card-image">
                <figure class="image is-square">
                    <img src="${item.imageUrl}" data-fallback-src="${item.originalImageUrl || item.imageUrl}" alt="${safeDesc.replace(/"/g, '&quot;')}" loading="lazy" onerror="if (this.dataset.fallbackSrc && this.src !== this.dataset.fallbackSrc) { this.src = this.dataset.fallbackSrc; }" />
                    <div class="acervo-item-card__overlay" aria-hidden="true">
                        <a href="/acervo/${id}" class="acervo-item-card__detail-btn" tabindex="-1">
                            <span class="icon is-small"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
                            <span>Ver detalhes</span>
                        </a>
                    </div>
                </figure>
            </div>
        </article>
    `;

    return column;
};

const buildSkeletonCard = () => {
    const column = document.createElement('div');
    column.className = 'column is-3-desktop is-one-fifth-widescreen is-2-fullhd is-4-tablet is-6-mobile px-1 py-1 acervo-skeleton-item';

    const article = document.createElement('article');
    article.className = 'card h-100';
    article.setAttribute('aria-hidden', 'true');

    article.innerHTML = `
        <div class="card-image">
            <div class="acervo-skeleton-block acervo-skeleton-image"></div>
        </div>
    `;

    column.appendChild(article);
    return column;
};

const setupAcervoInfiniteScroll = () => {
    const grid = document.getElementById('acervo-grid');
    const sentinel = document.getElementById('acervo-sentinel');

    if (!grid || !sentinel) {
        return;
    }

    const loadingNode = document.getElementById('acervo-loading');
    const endMessageNode = document.getElementById('acervo-end-message');
    const countStatusNode = document.getElementById('acervo-count-status');
    const skeletonNodes = [];

    const initialLoadedItems = grid.querySelectorAll('.column:not(.acervo-skeleton-item)').length;

    const state = {
        category: grid.dataset.category || 'todos',
        nextPage: 2,
        totalPages: 1,
        pageSize: Number(grid.dataset.pageSize || 24),
        totalItems: initialLoadedItems,
        loadedItems: initialLoadedItems,
        hasNext: false,
        loading: false,
    };

    const updateStatusText = () => {
        if (!countStatusNode) {
            return;
        }
        countStatusNode.textContent = `Exibindo ${state.loadedItems} de ${state.totalItems} itens.`;
    };

    const setLoading = (isLoading) => {
        if (!loadingNode) {
            return;
        }
        loadingNode.classList.toggle('is-hidden', !isLoading);
    };

    const showSkeletons = () => {
        const remaining = Math.max(0, state.totalItems - state.loadedItems);
        const skeletonCount = Math.min(6, Math.max(3, remaining));

        for (let index = 0; index < skeletonCount; index += 1) {
            const skeleton = buildSkeletonCard();
            skeletonNodes.push(skeleton);
            grid.appendChild(skeleton);
        }
    };

    const clearSkeletons = () => {
        while (skeletonNodes.length > 0) {
            const node = skeletonNodes.pop();
            node.remove();
        }
    };

    const showEndMessage = () => {
        if (!endMessageNode) {
            return;
        }
        endMessageNode.classList.remove('is-hidden');
    };

    const hideEndMessage = () => {
        if (!endMessageNode) {
            return;
        }
        endMessageNode.classList.add('is-hidden');
    };

    const fetchNextPage = async () => {
        if (!state.hasNext || state.loading) {
            return;
        }

        state.loading = true;
        setLoading(true);
        showSkeletons();

        try {
            const query = new URLSearchParams({
                categoria: state.category,
                page: String(state.nextPage),
                limit: String(state.pageSize),
            });

            const response = await fetch(`/api/acervo?${query.toString()}`);

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const payload = await response.json();
            const items = Array.isArray(payload.items) ? payload.items : [];
            const fragment = document.createDocumentFragment();
            let renderedItems = 0;

            items.forEach((item) => {
                const card = buildItemCard(item);
                if (card) {
                    fragment.appendChild(card);
                    renderedItems += 1;
                }
            });

            if (renderedItems > 0) {
                grid.appendChild(fragment);
            }

            clearSkeletons();
            state.loadedItems += renderedItems;
            state.totalItems = payload.pagination?.totalItems || state.totalItems;

            const currentPage = payload.pagination?.page || state.nextPage;
            const totalPages = payload.pagination?.totalPages || state.totalPages;
            state.totalPages = totalPages;
            state.nextPage = currentPage + 1;
            state.hasNext = currentPage < totalPages;

            updateStatusText();

            if (!state.hasNext) {
                showEndMessage();
                observer.disconnect();
            }
        } catch (error) {
            console.warn('Falha ao carregar mais itens do acervo:', error);
        } finally {
            clearSkeletons();
            state.loading = false;
            setLoading(false);
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                fetchNextPage();
            }
        });
    }, {
        root: null,
        threshold: 0,
        rootMargin: '300px 0px',
    });

    const bootstrapFromApi = async () => {
        try {
            const query = new URLSearchParams({
                categoria: state.category,
                page: '1',
                limit: String(state.pageSize),
            });

            const response = await fetch(`/api/acervo?${query.toString()}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const payload = await response.json();
            const currentPage = payload.pagination?.page || 1;
            const totalPages = payload.pagination?.totalPages || 1;

            state.totalItems = payload.pagination?.totalItems || state.loadedItems;
            state.totalPages = totalPages;
            state.nextPage = currentPage + 1;
            state.hasNext = currentPage < totalPages;

            updateStatusText();

            if (!state.hasNext) {
                showEndMessage();
                return;
            }

            hideEndMessage();
            observer.observe(sentinel);
        } catch (error) {
            console.warn('Falha ao inicializar metadados do acervo:', error);
            updateStatusText();
            showEndMessage();
        }
    };

    bootstrapFromApi();
};

const setupAcervoFiltersPanel = () => {
    const shell = document.querySelector('[data-acervo-shell]');

    if (!shell) {
        return;
    }

    const toggleButtons = Array.from(document.querySelectorAll('[data-acervo-filters-toggle]'));
    const toggleLabel = document.querySelector('[data-acervo-filters-toggle-label]');
    const backdrop = document.querySelector('[data-acervo-filters-backdrop]');
    const categoryLinks = Array.from(document.querySelectorAll('.acervo-category-chip[href]'));
    const storageKey = 'acervoFiltersPanelOpen';
    const isMobileViewport = () => window.innerWidth <= 768;

    if (toggleButtons.length === 0) {
        return;
    }

    const readStoredState = () => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored === 'open') {
                return true;
            }
            if (stored === 'closed') {
                return false;
            }
        } catch (error) {
            return null;
        }

        return null;
    };

    const persistState = (isOpen) => {
        try {
            localStorage.setItem(storageKey, isOpen ? 'open' : 'closed');
        } catch (error) {
        }
    };

    const syncPageLock = (isOpen) => {
        document.body.classList.toggle('acervo-filters-locked', isMobileViewport() && isOpen);
    };

    const applyState = (isOpen) => {
        shell.classList.toggle('is-filters-open', isOpen);
        shell.setAttribute('data-filters-open', isOpen ? 'true' : 'false');

        toggleButtons.forEach((button) => {
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        if (backdrop) {
            backdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        }

        if (toggleLabel) {
            toggleLabel.textContent = isOpen ? 'Ocultar filtros' : 'Mostrar filtros';
        }

        syncPageLock(isOpen);
    };

    const storedState = readStoredState();
    const defaultOpen = isMobileViewport() ? false : true;
    applyState(storedState === null ? defaultOpen : storedState);

    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const nextState = !shell.classList.contains('is-filters-open');
            applyState(nextState);
            persistState(nextState);
        });
    });

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            applyState(false);
            persistState(false);
        });
    }

    categoryLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (!isMobileViewport()) {
                return;
            }

            applyState(false);
            persistState(false);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        if (!shell.classList.contains('is-filters-open')) {
            return;
        }

        applyState(false);
        persistState(false);
    });

    const handleViewportChange = () => {
        syncPageLock(shell.classList.contains('is-filters-open'));
    };

    window.addEventListener('resize', handleViewportChange, { passive: true });
};

const setupNavActiveSection = () => {
    // Only applies on pages with anchor sections in the navbar (home)
    const navLinks = Array.from(
        document.querySelectorAll('.navbar-end .navbar-item[href]')
    ).filter((a) => {
        const href = a.getAttribute('href') || '';
        return href.startsWith('#');
    });

    if (navLinks.length === 0) return;

    const sections = navLinks
        .map((a) => {
            const hash = a.getAttribute('href').replace(/^.*#/, '');
            const section = document.getElementById(hash);
            return section ? { id: hash, section } : null;
        })
        .filter(Boolean);

    if (sections.length === 0) return;

    const setActive = (id) => {
        navLinks.forEach((a) => {
            const hash = a.getAttribute('href').replace(/^.*#/, '');
            a.classList.toggle('is-active', hash === id);
        });
    };

    const getActiveSectionId = () => {
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 64;
        const activationLine = navHeight + 20;

        let activeId = sections[0].id;

        sections.forEach(({ id, section }) => {
            const top = section.getBoundingClientRect().top;
            if (top <= activationLine) {
                activeId = id;
            }
        });

        return activeId;
    };

    let rafScheduled = false;
    const updateFromScroll = () => {
        if (rafScheduled) return;
        rafScheduled = true;
        window.requestAnimationFrame(() => {
            setActive(getActiveSectionId());
            rafScheduled = false;
        });
    };

    navLinks.forEach((a) => {
        a.addEventListener('click', () => {
            const hash = a.getAttribute('href').replace(/^.*#/, '');
            setActive(hash);
            updateFromScroll();
        });
    });

    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    updateFromScroll();
};

const shuffleItems = (items) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
};

const setupHomeAcervoShowcase = () => {
    const showcase = document.querySelector('[data-home-acervo-showcase]');

    if (!showcase) {
        return;
    }

    const slots = Array.from(showcase.querySelectorAll('.home-acervo-mosaic__item'));
    if (slots.length === 0) {
        return;
    }

    const gridSize = Number(showcase.dataset.gridSize || slots.length);
    const rotateCount = Math.max(1, Number(showcase.dataset.rotateCount || 3));
    const rotateInterval = Math.max(2000, Number(showcase.dataset.rotateInterval || 3200));
    const loadedKeys = new Set();
    let hasBootstrapped = false;
    let rotationTimer = null;
    let activeItems = [];
    let pool = [];
    let showcaseObserver = null;

    const normalizeItem = (item) => {
        if (!item || !item.imageUrl) {
            return null;
        }

        return {
            imageUrl: item.imageUrl,
            description: toText(item.description, 'Imagem do acervo'),
        };
    };

    const renderSlot = (slot, item, { swapping = false } = {}) => {
        if (!slot || !item) {
            return;
        }

        if (swapping) {
            slot.classList.add('is-swapping');
        }

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
                    void slot.offsetWidth; // força reflow para iniciar transição do opacity
                    slot.classList.remove('is-loading', 'is-swapping');
                    slot.classList.add('is-loaded', 'is-visible');
                };

                if (image.complete) {
                    revealSlot();
                } else {
                    image.addEventListener('load', revealSlot, { once: true });
                }
            }
        }, swapping ? 280 : 0);
    };

    const pickNextItem = () => {
        const usedUrls = new Set(activeItems.map((item) => item?.imageUrl).filter(Boolean));
        const available = pool.filter((item) => !usedUrls.has(item.imageUrl));
        const source = available.length > 0 ? available : pool;

        if (source.length === 0) {
            return null;
        }

        return source[Math.floor(Math.random() * source.length)];
    };

    const startRotation = () => {
        if (pool.length <= slots.length) {
            return;
        }

        rotationTimer = window.setInterval(() => {
            const shuffledSlots = shuffleItems(slots).slice(0, Math.min(rotateCount, slots.length));

            shuffledSlots.forEach((slot) => {
                const slotIndex = slots.indexOf(slot);
                const nextItem = pickNextItem();

                if (!nextItem) {
                    return;
                }

                activeItems[slotIndex] = nextItem;
                renderSlot(slot, nextItem, { swapping: true });
            });
        }, rotateInterval);
    };

    const stopRotation = () => {
        if (rotationTimer) {
            window.clearInterval(rotationTimer);
            rotationTimer = null;
        }
    };

    const bootstrap = async () => {
        if (hasBootstrapped) {
            return;
        }

        hasBootstrapped = true;

        try {
            const poolSize = Math.max(gridSize + 8, 20);
            const response = await fetch(`/api/acervo?categoria=todos&page=1&limit=${poolSize}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const payload = await response.json();
            const items = (Array.isArray(payload.items) ? payload.items : [])
                .map(normalizeItem)
                .filter(Boolean)
                .filter((item) => {
                    if (loadedKeys.has(item.imageUrl)) {
                        return false;
                    }

                    loadedKeys.add(item.imageUrl);
                    return true;
                });

            if (items.length === 0) {
                return;
            }

            pool = shuffleItems(items);
            activeItems = pool.slice(0, slots.length);

            slots.forEach((slot, index) => {
                const item = activeItems[index];
                if (item) {
                    renderSlot(slot, item);
                }
            });

            startRotation();
        } catch (error) {
            console.warn('Falha ao carregar vitrine aleatoria do acervo:', error);
        }
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopRotation();
            return;
        }

        if (!rotationTimer && hasBootstrapped) {
            startRotation();
        }
    });

    showcaseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            bootstrap();

            if (showcaseObserver) {
                showcaseObserver.disconnect();
                showcaseObserver = null;
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '200px 0px',
    });

    showcaseObserver.observe(showcase);
};

const bootstrapApp = () => {
    setupNavbarMenu();
    setupTheme();
    setupMap();
    setupNavActiveSection();
    setupHomeAcervoShowcase();
    setupAcervoFiltersPanel();
    setupAcervoInfiniteScroll();
    registerServiceWorker();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
