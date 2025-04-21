// Initialize map and restrict view to Plainsboro Township
const plainsboroBounds = [
  [40.309, -74.61], // Southwest corner
  [40.36, -74.52]   // Northeast corner
];

const map = L.map('map', {
  minZoom: 13,
  maxZoom: 18,
  maxBounds: plainsboroBounds,
  maxBoundsViscosity: 1.0
}).setView([40.3337, -74.5616], 14);

// Add map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Keep track of markers
let markers = [];

// Handle map click to add a marker
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

  const popup = L.popup()
    .setLatLng(e.latlng)
    .setContent(popupForm)
    .openOn(map);

  // Wait for popup to render, then attach form handler
  setTimeout(() => {
    const form = document.getElementById('add-marker-form');
    if (form) {
      form.onsubmit = (event) => {
        event.preventDefault();
        const description = form.description.value;
        const rating = form.rating.value;

        const marker = L.marker([lat, lng]).addTo(map);
        marker.customData = { description, rating };
        markers.push(marker);

        updateMarkerPopup(marker);
        marker.openPopup();
        map.closePopup();
      };
    }
  }, 10);
});

// Update popup content with buttons
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

// Handle global button clicks
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-marker')) {
    const marker = findMarkerFromPopup(e.target);
    if (marker) {
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
        const form = document.getElementById('edit-marker-form');
        if (form) {
          form.onsubmit = (event) => {
            event.preventDefault();
            marker.customData.description = form.description.value;
            marker.customData.rating = form.rating.value;
            updateMarkerPopup(marker);
            marker.openPopup();
          };
        }
      }, 10);
    }
  }

  if (e.target.classList.contains('delete-marker')) {
    const marker = findMarkerFromPopup(e.target);
    if (marker) {
      map.removeLayer(marker);
      markers = markers.filter(m => m !== marker);
    }
  }
});

// Helper to find marker from an open popup
function findMarkerFromPopup(element) {
  for (const marker of markers) {
    if (marker.getPopup().getContent().includes(element.outerHTML)) {
      return marker;
    }
  }
  return null;
}
