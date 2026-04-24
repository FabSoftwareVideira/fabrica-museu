import { MUSEUM } from './mapConfig.js';

export const setupMap = () => {
    const el = document.getElementById('museum-map');
    if (!el || typeof window.L === 'undefined') return;

    const { lat, lng } = MUSEUM.coordinates;

    const map = window.L.map(el).setView([lat, lng], MUSEUM.zoom);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const popupContent = `
        <strong>${MUSEUM.name}</strong><br/>
        <a href="${MUSEUM.googleMapsUrl}" target="_blank" rel="noopener noreferrer">
            Abrir no Google Maps
        </a>
    `;

    window.L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popupContent).
        openPopup();
};