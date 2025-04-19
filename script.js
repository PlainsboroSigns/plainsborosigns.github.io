// Initialize map centered on Plainsboro
const map = L.map('map').setView([40.3337, -74.5616], 14);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Restrict map view to Plainsboro boundaries
map.setMaxBounds([
  [40.309, -74.61], // Southwest corner
  [40.36, -74.52]   // Northeast corner
]);

map.on('drag', function () {
  map.panInsideBounds(map.getBounds(), { animate: false });
});

// Popup form for adding a marker
function createForm(latlng) {
  return `
    <form onsubmit="return saveMarker(this, ${latlng.lat}, ${latlng.lng})">
      <label>Description:<br>
        <input type="text" name="description" required>
      </label><br><br>
      <label>Wear Rating (1-5):<br>
        <select name="rating">
          <option>1</option><option>2</option><option>3</option>
          <option>4</option><option>5</option>
        </select>
      </label><br><br>
      <button type="submit">Save</button>
    </form>
  `;
}

// Add form popup when map is clicked
map.on('click', function (e) {
  const popupForm = createForm(e.latlng);
  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupForm)
    .openOn(map);
});

// Save marker from form submission
function saveMarker(form, lat, lng) {
  const description = form.description.value;
  const rating = form.rating.value;

  const marker = L.marker([lat, lng]).addTo(map);
  marker.description = description;
  marker.rating = rating;

  function updatePopup() {
    marker.setPopupContent(`
      <strong>Description:</strong> ${marker.description}<br>
      <strong>Wear Rating:</strong> ${marker.rating}/5<br><br>
      <button onclick="editMarker(${lat}, ${lng}, this)">Edit</button>
      <button onclick="deleteMarker(${lat}, ${lng}, this)">Delete</button>
    `);
  }

  updatePopup();
  marker.openPopup();
  map.closePopup();
  return false;
}

// Edit an existing marker
function editMarker(lat, lng, button) {
  const marker = findMarkerAt(lat, lng);
  if (!marker) return;

  const formHTML = `
    <form onsubmit="return updateMarker(this, ${lat}, ${lng})">
      <label>Description:<br>
        <input type="text" name="description" value="${marker.description}" required>
      </label><br><br>
      <label>Wear Rating (1-5):<br>
        <select name="rating">
          <option ${marker.rating == 1 ? "selected" : ""}>1</option>
          <option ${marker.rating == 2 ? "selected" : ""}>2</option>
          <option ${marker.rating == 3 ? "selected" : ""}>3</option>
          <option ${marker.rating == 4 ? "selected" : ""}>4</option>
          <option ${marker.rating == 5 ? "selected" : ""}>5</option>
        </select>
      </label><br><br>
      <button type="submit">Save</button>
    </form>
  `;
  marker.bindPopup(formHTML).openPopup();
}

// Update edited marker
function updateMarker(form, lat, lng) {
  const marker = findMarkerAt(lat, lng);
  if (!marker) return false;

  marker.description = form.description.value;
  marker.rating = form.rating.value;

  marker.closePopup();
  saveMarker({ description: { value: marker.description }, rating: { value: marker.rating } }, lat, lng);

  return false;
}

// Delete marker from map
function deleteMarker(lat, lng, button) {
  const marker = findMarkerAt(lat, lng);
  if (marker) {
    map.removeLayer(marker);
  }
}

// Helper: find marker by coordinates
function findMarkerAt(lat, lng) {
  let foundMarker = null;
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      const pos = layer.getLatLng();
      if (pos.lat === lat && pos.lng === lng) {
        foundMarker = layer;
      }
    }
  });
  return foundMarker;
}
