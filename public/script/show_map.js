const Map = {
  show: (latitude, longitude) => {
    const map = L.map('map').setView([latitude, longitude], 17);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  },
}

module.exports = Map;