import { setupNavbarMenu } from '/public/js/ui/navbar.js';
import { setupTheme } from '/public/js/ui/theme.js';
import { setupMap } from '/public/js/ui/map.js';
import { setupNavActiveSection } from '/public/js/ui/navActiveSection.js';
import { registerServiceWorker } from '/public/js/ui/serviceWorker.js';
import { Acervo } from '/public/js/ui/acervo/Acervo.js';

const bootstrapApp = () => {
    setupNavbarMenu();
    setupTheme();
    setupMap();
    setupNavActiveSection();

    Acervo.createShowcase();
    Acervo.createFiltersPanel();

    const grid = Acervo.createGrid();
    Acervo.createSearchFilter({ onSearch: grid?.reload });

    registerServiceWorker();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
