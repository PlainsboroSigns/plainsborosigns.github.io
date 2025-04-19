const map = L.map('map').setView([40.3337, -74.5616], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create popup HTML form
function createForm(latlng) {
  return `
    <form onsubmit="return saveMarker(this, ${latlng.lat}, ${latlng.lng})">
      <label>Description:<br>
        <input type="text" name="description" required>
      </label><br><br>
      <label>Wear Rating (1-5):<br>
        <select name="rating">
          <option>1</option><option>2</option>
          <option>3</option><option>4</option>
          <option>5</option>
        </select>
      </label><br><br>
      <button type="submit">Save</button>
    </form>
  `;
}

// Add a marker when clicking the map
map.on('click', function (e) {
  const popupForm = createForm(e.latlng);
  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupForm)
    .openOn(map);
});

// Handle saving the marker
function saveMarker(form, lat, lng) {
  const description = form.description.value;
  const rating = form.rating.value;

  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(`
    <strong>Description:</strong> ${description}<br>
    <strong>Wear Rating:</strong> ${rating}/5
  `);

  map.closePopup();
  return false; // prevent page reload
}
