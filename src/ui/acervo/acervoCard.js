import { toText } from '../utils.js';

export const buildItemCard = (item) => {
    if (!item || !item.imageUrl) return null;

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