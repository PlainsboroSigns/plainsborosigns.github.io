const map = L.map('map').setView([40.3337, -74.5616], 14); // Centered on Plainsboro

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);
