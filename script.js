const plainsboroBounds = [
  [40.309, -74.61],
  [40.36, -74.52]
];

const map = L.map('map', {
  minZoom: 13,
  maxZoom: 18,
  maxBounds: plainsboroBounds,
  maxBoundsViscosity: 1.0
}).setView([40.3337, -74.5616], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = [];

function createForm(latlng) {
  return `
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
      <label>Photo:<br>
        <input type="file" name="photo" accept="image/*" required>
      </label><br><br>
      <button type="submit">Save</button>
    </form>
  `;
}

map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  const popup = L.popup().setLatLng(e.latlng).setContent(createForm(e.latlng)).openOn(map);

  setTimeout(() => {
    const form = document.getElementById('add-marker-form');
    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();
        const description = form.description.value;
        const rating = form.rating.value;
        const photoFile = form.photo.files[0];
        const photoData = await fileToBase64(photoFile);

        const markerData = { lat, lng, description, rating, photo: photoData };
        createMarker(markerData);
        saveMarkerData();
        map.closePopup();
      };
    }
  }, 10);
});

function createMarker(data) {
  const marker = L.marker([data.lat, data.lng]).addTo(map);
  marker.customData = data;
  updateMarkerPopup(marker);
  markers.push(marker);
}

function updateMarkerPopup(marker) {
  const { description, rating, photo } = marker.customData;

  const content = `
    <strong>Description:</strong> ${description}<br>
    <strong>Wear Rating:</strong> ${rating}/5<br>
    <img src="${photo}" alt="Sign photo" style="max-width: 100px; margin-top: 5px;"><br><br>
    <button class="edit-marker">Edit</button>
    <button class="delete-marker">Delete</button>
  `;
  marker.bindPopup(content);
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-marker')) {
    const marker = findMarkerFromPopup(e.target);
    if (!marker) return;

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
          saveMarkerData();
        };
      }
    }, 10);
  }

  if (e.target.classList.contains('delete-marker')) {
    const marker = findMarkerFromPopup(e.target);
    if (!marker) return;
    map.removeLayer(marker);
    markers = markers.filter(m => m !== marker);
    saveMarkerData();
  }
});

function findMarkerFromPopup(buttonEl) {
  for (const marker of markers) {
    if (marker.getPopup().getContent().includes(buttonEl.outerHTML)) {
      return marker;
    }
  }
  return null;
}

// Helper: convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Save all marker data to localStorage
function saveMarkerData() {
  const data = markers.map(m => m.customData);
  localStorage.setItem('plainsboroSigns', JSON.stringify(data));
}

// Load marker data on startup
function loadMarkers() {
  const stored = localStorage.getItem('plainsboroSigns');
  if (stored) {
    const data = JSON.parse(stored);
    data.forEach(markerData => createMarker(markerData));
  }
}

loadMarkers();
