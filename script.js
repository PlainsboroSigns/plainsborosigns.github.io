// Define Plainsboro map bounds
const plainsboroBounds = [
  [40.309, -74.61],
  [40.36, -74.52]
];

// Initialize map with locked bounds
const map = L.map('map', {
  center: [40.3337, -74.5616],
  zoom: 14,
  minZoom: 13,
  maxZoom: 18,
  maxBounds: plainsboroBounds,
  maxBoundsViscosity: 1.0,
  scrollWheelZoom: false
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store all markers
let markers = [];
let currentlyEditingMarker = null;

// Add marker form on map click
map.on('click', (e) => {
  const { lat, lng } = e.latlng;

  const popupForm = `
    <form id="add-marker-form">
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

  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupForm)
    .openOn(map);

  setTimeout(() => {
    const form = document.getElementById('add-marker-form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const description = form.description.value;
        const rating = form.rating.value;

        const marker = L.marker([lat, lng]).addTo(map);
        marker.customData = { description, rating };
        markers.push(marker);

        updateMarkerPopup(marker);
        marker.openPopup();
        map.closePopup();
      });
    }
  }, 10);
});

// Create popup with Edit/Delete buttons
function updateMarkerPopup(marker) {
  const { description, rating } = marker.customData;

  const content = `
    <strong>Description:</strong> ${description}<br>
    <strong>Wear Rating:</strong> ${rating}/5<br><br>
    <button class="edit-marker">Edit</button>
    <button class="delete-marker">Delete</button>
  `;

  marker.bindPopup(content);
}

// Handle button clicks globally
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-marker')) {
    const marker = findMarkerFromPopup(e.target);
    if (marker) {
      currentlyEditingMarker = marker;

      const { description, rating } = marker.customData;

      const formHTML = `
        <form id="edit-marker-form">
          <label>Description:<br>
            <input type="text" name="description" value="${description}" required>
          </label><br><br>
          <label>Wear Rating (1-5):<br>
            <select name="rating">
              <option ${rating == 1 ? "selected" : ""}>1</option>
              <option ${rating == 2 ? "selected" : ""}>2</option>
              <option ${rating == 3 ? "selected" : ""}>3</option>
              <option ${rating == 4 ? "selected" : ""}>4</option>
              <option ${rating == 5 ? "selected" : ""}>5</option>
            </select>
          </label><br><br>
          <button type="submit">Save</button>
        </form>
      `;

      marker.bindPopup(formHTML).openPopup();

      setTimeout(() => {
        const editForm = document.getElementById('edit-marker-form');
        if (editForm) {
          editForm.addEventListener('submit', (event) => {
            event.preventDefault();
            marker.customData.description = editForm.description.value;
            marker.customData.rating = editForm.rating.value;
            updateMarkerPopup(marker);
            marker.openPopup();
            currentlyEditingMarker = null;
          });
        }
      }, 10);
    }
  }

  if (e.target.classList.contains('delete-marker')) {
    const marker = findMarkerFromPopup(e.target);
    if (marker) {
      map.removeLayer(marker);
      markers = markers.filter(m => m !== marker);
      currentlyEditingMarker = null;
    }
  }
});

// Helper to identify marker from popup
function findMarkerFromPopup(element) {
  for (const marker of markers) {
    const content = marker.getPopup()?.getContent();
    if (content && content.includes(element.outerHTML)) {
      return marker;
    }
  }
  return null;
}
