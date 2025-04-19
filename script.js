// Initialize map centered on Plainsboro
const map = L.map('map', {
  minZoom: 13,
  maxBounds: [
    [40.309, -74.61], // Southwest corner
    [40.36, -74.52]   // Northeast corner
  ]
}).setView([40.3337, -74.5616], 14);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store all markers
const markers = [];

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

// Click map to add marker form
map.on('click', function (e) {
  const popupForm = createForm(e.latlng);
  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupForm)
    .openOn(map);
});

// Save marker
function saveMarker(form, lat, lng) {
  const description = form.description.value;
  const rating = form.rating.value;

  const marker = L.marker([lat, lng]).addTo(map);
  marker.description = description;
  marker.rating = rating;

  updateMarkerPopup(marker);
  marker.openPopup();
  map.closePopup();

  markers.push(marker);
  return false;
}

// Update popup content with buttons
function updateMarkerPopup(marker) {
  marker.setPopupContent(`
    <strong>Description:</strong> ${marker.description}<br>
    <strong>Wear Rating:</strong> ${marker.rating}/5<br><br>
    <button class="edit-btn" data-lat="${marker.getLatLng().lat}" data-lng="${marker.getLatLng().lng}">Edit</button>
    <button class="delete-btn" data-lat="${marker.getLatLng().lat}" data-lng="${marker.getLatLng().lng}">Delete</button>
  `);
}

// Handle global button clicks
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-btn')) {
    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);
    const marker = findMarkerAt(lat, lng);
    if (marker) {
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
  }

  if (e.target.classList.contains('delete-btn')) {
    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);
    const marker = findMarkerAt(lat, lng);
    if (marker) {
      map.removeLayer(marker);
    }
  }
});

// Update edited marker
function updateMarker(form, lat, lng) {
  const marker = findMarkerAt(lat, lng);
  if (!marker) return false;

  marker.description = form.description.value;
  marker.rating = form.rating.value;

  updateMarkerPopup(marker);
  marker.openPopup();
  return false;
}

// Find marker by coordinates
function findMarkerAt(lat, lng) {
  return markers.find(m => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });
}
