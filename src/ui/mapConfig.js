export const MUSEUM = {
    name: 'Museu do Vinho Mario Pellegrin',
    coordinates: {
        lat: -27.008,
        lng: -51.1516,
    },
    zoom: 14,
    getGoogleMapsUrl() {
        const { lat, lng } = this.coordinates;
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
};