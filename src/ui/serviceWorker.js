export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
        await navigator.serviceWorker.register('/public/service-worker.js', {
            updateViaCache: 'none',
        });
    } catch (error) {
        console.warn('Service Worker nao foi registrado:', error);
    }
};
