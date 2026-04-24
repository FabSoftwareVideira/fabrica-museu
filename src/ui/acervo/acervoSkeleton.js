export const buildSkeletonCard = () => {
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