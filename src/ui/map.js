import { MUSEUM } from './mapConfig.js';

export const setupMap = () => {
    const el = document.getElementById('museum-map');
    if (!el || typeof window.L === 'undefined') return;

    const { lat, lng } = MUSEUM.coordinates;
    const getCurrentTheme = () => document.documentElement.getAttribute('data-theme') || 'light';

    const map = window.L.map(el).setView([lat, lng], MUSEUM.zoom);

    const buildTileLayer = (theme) => {
        if (theme === 'dark') {
            return window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                subdomains: 'abcd',
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            });
        }

        return window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        });
    };

    let currentTileLayer = buildTileLayer(getCurrentTheme()).addTo(map);

    const popupContent = `
        <strong>${MUSEUM.name}</strong><br/>
        <a href="${MUSEUM.getGoogleMapsUrl()}" target="_blank" rel="noopener noreferrer">
            Abrir no Google Maps
        </a>
    `;

    window.L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();

    const syncMapTheme = (event) => {
        const nextTheme = event?.detail?.theme || getCurrentTheme();
        const nextLayer = buildTileLayer(nextTheme);
        map.removeLayer(currentTileLayer);
        nextLayer.addTo(map);
        currentTileLayer = nextLayer;
    };

    document.addEventListener('site-theme-changed', syncMapTheme);
};