export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
        await navigator.serviceWorker.register('/public/service-worker.js');
    } catch (error) {
        console.warn('Service Worker nao foi registrado:', error);
    }
};
