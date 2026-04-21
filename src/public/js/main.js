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

const ACERVO_VIEW_MODES = ['cards', 'list-compact', 'list-detailed'];

const normalizeViewMode = (mode) => (ACERVO_VIEW_MODES.includes(mode) ? mode : 'cards');

const applyAcervoViewMode = (grid, mode) => {
    const normalizedMode = normalizeViewMode(mode);

    grid.classList.remove('acervo-grid--cards', 'acervo-grid--list-compact', 'acervo-grid--list-detailed');
    grid.classList.add(`acervo-grid--${normalizedMode}`);

    return normalizedMode;
};

const setupAcervoViewModes = (grid) => {
    const controls = document.getElementById('acervo-view-controls');

    if (!grid || !controls) {
        return;
    }

    const buttons = Array.from(controls.querySelectorAll('[data-view-mode]'));
    if (buttons.length === 0) {
        return;
    }

    let initialMode = 'cards';

    try {
        initialMode = normalizeViewMode(window.localStorage.getItem('acervoViewMode'));
    } catch (error) {
        initialMode = 'cards';
    }

    const updateButtons = (activeMode) => {
        buttons.forEach((button) => {
            const mode = normalizeViewMode(button.dataset.viewMode || 'cards');
            const isActive = mode === activeMode;

            button.classList.toggle('is-primary', isActive);
            button.classList.toggle('is-ghost', !isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    };

    const setMode = (mode) => {
        const appliedMode = applyAcervoViewMode(grid, mode);
        updateButtons(appliedMode);

        try {
            window.localStorage.setItem('acervoViewMode', appliedMode);
        } catch (error) {
            // Ignore storage errors (private mode / quota).
        }
    };

    setMode(initialMode);

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const mode = normalizeViewMode(button.dataset.viewMode || 'cards');
            setMode(mode);
        });
    });
};

const buildItemCard = (item) => {
    const column = document.createElement('div');
    column.className = 'column is-4-desktop is-6-tablet p-2';

    const article = document.createElement('article');
    article.className = 'card h-100';
    article.setAttribute('aria-label', `Item do acervo: ${toText(item.description, 'Sem descricao')}`);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-image';

    const figure = document.createElement('figure');
    figure.className = 'image is-square has-background-grey-lighter';

    const image = document.createElement('img');
    image.src = item.imageUrl;
    image.alt = toText(item.description, 'Imagem do acervo');
    image.loading = 'lazy';

    figure.appendChild(image);
    imageWrapper.appendChild(figure);

    const content = document.createElement('div');
    content.className = 'card-content';

    const detailsTags = document.createElement('div');
    detailsTags.className = 'tags mb-3';

    if (item.estimatedYear) {
        const yearTag = document.createElement('span');
        yearTag.className = 'tag is-warning is-light';
        yearTag.textContent = `Ano estimado: ${item.estimatedYear}`;
        detailsTags.appendChild(yearTag);
    }

    if (item.historicalPeriod) {
        const periodTag = document.createElement('span');
        periodTag.className = 'tag is-light';
        periodTag.textContent = item.historicalPeriod;
        detailsTags.appendChild(periodTag);
    }

    content.appendChild(detailsTags);

    const description = document.createElement('p');
    description.className = 'mb-4 acervo-description';
    description.textContent = toText(item.description, 'Sem descricao disponivel.');
    content.appendChild(description);

    const categoriesTags = document.createElement('div');
    categoriesTags.className = 'tags acervo-category-tags';
    (Array.isArray(item.categoriesLabel) ? item.categoriesLabel : []).forEach((label) => {
        const categoryTag = document.createElement('span');
        categoryTag.className = 'tag is-info is-light';
        categoryTag.textContent = label;
        categoriesTags.appendChild(categoryTag);
    });
    content.appendChild(categoriesTags);

    const people = document.createElement('p');
    people.className = 'is-size-7 has-text-grey mt-2 acervo-meta-item';
    people.textContent = `Pessoas na cena: ${toText(item.peopleCount, 'Nao informado')}`;
    content.appendChild(people);

    const type = document.createElement('p');
    type.className = 'is-size-7 has-text-grey acervo-meta-item';
    type.textContent = `Tipo: ${toText(item.documentType, 'Nao informado')}`;
    content.appendChild(type);

    const tags = document.createElement('p');
    tags.className = 'is-size-7 has-text-grey acervo-meta-item';
    const tagsText = Array.isArray(item.tags) ? item.tags.join(', ') : toText(item.tags, '');
    tags.textContent = `Tags: ${tagsText || 'Sem tags'}`;
    content.appendChild(tags);

    const aiBadge = document.createElement('span');
    aiBadge.className = 'acervo-ai-badge icon has-text-grey-light';
    aiBadge.title = 'Informacoes geradas por IA';
    aiBadge.innerHTML = '<i class="fa-solid fa-robot" aria-hidden="true"></i>';
    content.appendChild(aiBadge);

    const footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.innerHTML = `
        <p class="card-footer-item is-size-7 has-text-grey-light">
            <span class="icon-text">
                <span class="icon is-small"><i class="fa-solid fa-robot" aria-hidden="true"></i></span>
                <span>Informacoes geradas por IA</span>
            </span>
        </p>
    `;

    article.appendChild(imageWrapper);
    article.appendChild(content);
    article.appendChild(footer);
    column.appendChild(article);

    return column;
};

const buildSkeletonCard = () => {
    const column = document.createElement('div');
    column.className = 'column is-4-desktop is-6-tablet acervo-skeleton-item';

    const article = document.createElement('article');
    article.className = 'card h-100';
    article.setAttribute('aria-hidden', 'true');

    article.innerHTML = `
        <div class="card-image">
            <div class="acervo-skeleton-block acervo-skeleton-image"></div>
        </div>
        <div class="card-content">
            <div class="acervo-skeleton-block acervo-skeleton-line acervo-skeleton-line-short"></div>
            <div class="acervo-skeleton-block acervo-skeleton-line"></div>
            <div class="acervo-skeleton-block acervo-skeleton-line"></div>
            <div class="acervo-skeleton-block acervo-skeleton-line acervo-skeleton-line-short"></div>
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
    setupAcervoViewModes(grid);

    const getRealItemsCount = () => grid.querySelectorAll('.column:not(.acervo-skeleton-item)').length;

    const state = {
        category: grid.dataset.category || 'todos',
        nextPage: 2,
        totalPages: 1,
        pageSize: Number(grid.dataset.pageSize || 24),
        totalItems: getRealItemsCount(),
        loadedItems: getRealItemsCount(),
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

            items.forEach((item) => {
                grid.appendChild(buildItemCard(item));
            });

            clearSkeletons();
            state.loadedItems = getRealItemsCount();
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
                <a class="home-acervo-mosaic__link" href="/acervo" aria-label="Abrir acervo a partir da imagem ${safeAlt}">
                    <img
                        class="home-acervo-mosaic__image"
                        src="${item.imageUrl}"
                        alt="${safeAlt}"
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                    />
                </a>
            `;

            const image = slot.querySelector('.home-acervo-mosaic__image');
            if (image) {
                image.addEventListener('load', () => {
                    slot.classList.remove('is-loading', 'is-swapping');
                    slot.classList.add('is-loaded', 'is-visible');
                }, { once: true });

                if (image.complete) {
                    slot.classList.remove('is-loading', 'is-swapping');
                    slot.classList.add('is-loaded', 'is-visible');
                }
            }
        }, swapping ? 220 : 0);
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
    setupAcervoInfiniteScroll();
    registerServiceWorker();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
