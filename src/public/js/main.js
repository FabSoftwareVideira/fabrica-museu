const museumCoordinates = [-27.008, -51.1516];

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

window.addEventListener('load', () => {
    setupMap();
    registerServiceWorker();
});
