// -------------------- Access Control --------------------

let editingEnabled = false;

function setMode(mode) {
  if (mode === 'guest') {
    editingEnabled = false;
    document.getElementById('modeOverlay').style.display = 'none';
  } else if (mode === 'editor') {
    document.getElementById('passArea').style.display = 'block';
  }
}

function promptPassword() {
  setMode('editor');
}

function checkPassword() {
  const input = document.getElementById('editorPass').value;
  if (input === '1025047') {
    editingEnabled = true;
    document.getElementById('modeOverlay').style.display = 'none';
    document.getElementById('editor-controls').style.display = 'block';
    alert("Edit mode enabled.");
    refreshAllPopups();
  } else {
    document.getElementById('wrongPass').style.display = 'block';
  }
}

// -------------------- Map Setup --------------------

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

// -------------------- Marker Icon by Rating --------------------

function getColorByRating(rating) {
  switch (parseInt(rating)) {
    case 1: return "green";
    case 2: return "yellow";
    case 3: return "orange";
    case 4: return "red";
    default: return "blue";
  }
}

function createColoredIcon(rating) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${getColorByRating(rating)}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// -------------------- Add Marker --------------------

map.on('click', (e) => {
  if (!editingEnabled) return;

  const { lat, lng } = e.latlng;
  const popupForm = `
    <form id="add-marker-form">
      <label>Description:<br>
        <input type="text" name="description" required>
      </label><br><br>
      <label>Wear Rating (1-5):<br>
        <select name="rating">
          <option>1</option><option>2</option><option>3</option><option>4</option>
        </select>
      </label><br><br>
      <label>Photo file name (in /images/):<br>
        <input type="text" name="photo" placeholder="example.jpg" required>
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
      form.onsubmit = (event) => {
        event.preventDefault();
        const description = form.description.value;
        const rating = form.rating.value;
        const photo = form.photo.value;
        const markerData = { lat, lng, description, rating, photo };
        const marker = createMarker(markerData);
        marker.openPopup();
        map.closePopup();
      };
    }
  }, 10);
});

// -------------------- Create + Update Markers --------------------

function createMarker(data) {
  const marker = L.marker([data.lat, data.lng], {
    icon: createColoredIcon(data.rating)
  }).addTo(map);

  marker.customData = data;
  marker.bindPopup(generatePopupContent(marker));
  markers.push(marker);
  return marker;
}

function generatePopupContent(marker) {
  const { description, rating, photo } = marker.customData;
  return `
    <strong>Description:</strong> ${description}<br>
    <strong>Wear Rating:</strong> ${rating}/5<br>
    <img src="images/${photo}" alt="Sign photo" style="max-width: 100px; margin-top: 5px; cursor:pointer;"
         onclick="showImagePopup(findMarkerByLatLng(${marker.getLatLng().lat}, ${marker.getLatLng().lng}))"><br><br>
    ${editingEnabled ? `
      <button data-lat="${marker.getLatLng().lat}" data-lng="${marker.getLatLng().lng}" class="edit-marker">Edit</button>
      <button data-lat="${marker.getLatLng().lat}" data-lng="${marker.getLatLng().lng}" class="delete-marker">Delete</button>
    ` : ``}
  `;
}

function refreshAllPopups() {
  for (const marker of markers) {
    marker.setPopupContent(generatePopupContent(marker));
    marker.setIcon(createColoredIcon(marker.customData.rating));
  }
}

function findMarkerByLatLng(lat, lng) {
  return markers.find(m => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });
}

// -------------------- Edit/Delete Events --------------------

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-marker')) {
    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);
    const marker = findMarkerByLatLng(lat, lng);
    if (!marker) return;

    const { description, rating, photo } = marker.customData;

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
          </select>
        </label><br><br>
        <label>Photo file name:<br>
          <input type="text" name="photo" value="${photo}" required>
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
          marker.customData.photo = form.photo.value;
          marker.setPopupContent(generatePopupContent(marker));
          marker.setIcon(createColoredIcon(marker.customData.rating));
          marker.openPopup();
        };
      }
    }, 10);
  }

  if (e.target.classList.contains('delete-marker')) {
    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);
    const marker = findMarkerByLatLng(lat, lng);
    if (marker) {
      map.removeLayer(marker);
      markers = markers.filter(m => m !== marker);
    }
  }
});

// -------------------- Load and Save --------------------

fetch('data/markers.json')
  .then(res => res.json())
  .then(data => data.forEach(markerData => createMarker(markerData)))
  .catch(err => console.error('Error loading markers.json', err));

function downloadMarkerData() {
  const markerData = markers.map(m => m.customData);
  const blob = new Blob([JSON.stringify(markerData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'markers.json';
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------- Gallery Image Viewer --------------------

function showImagePopup(currentMarker) {
  const existing = document.getElementById('imagePopup');
  if (existing) existing.remove();

  let currentIndex = markers.indexOf(currentMarker);

  const overlay = document.createElement('div');
  overlay.id = 'imagePopup';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.9)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 10000;
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'sans-serif';
  overlay.style.textAlign = 'center';

  const img = document.createElement('img');
  img.style.maxWidth = '90%';
  img.style.maxHeight = '80%';
  img.style.border = '4px solid white';
  img.style.boxShadow = '0 0 10px black';
  img.style.marginBottom = '10px';

  const caption = document.createElement('div');
  caption.style.fontSize = '18px';
  caption.style.marginBottom = '20px';

  const controls = document.createElement('div');
  controls.innerHTML = `
    <button id="prevImage" style="margin: 0 10px; padding: 8px 16px;">⟵ Prev</button>
    <button id="nextImage" style="margin: 0 10px; padding: 8px 16px;">Next ⟶</button><br><br>
    <button id="showMarker" style="margin: 10px; padding: 6px 14px;">📍 Show Marker</button><br>
    <button onclick="document.getElementById('imagePopup').remove()" style="margin-top:10px; padding: 5px 15px;">Close</button>
  `;

  overlay.appendChild(img);
  overlay.appendChild(caption);
  overlay.appendChild(controls);
  document.body.appendChild(overlay);

  function updateDisplay() {
    const m = markers[currentIndex];
    img.src = "images/" + m.customData.photo;
    caption.innerHTML = `
      <strong>${m.customData.description}</strong><br>
      Wear Rating: ${m.customData.rating}/5
    `;
  }

  updateDisplay();

  document.getElementById('prevImage').onclick = () => {
    currentIndex = (currentIndex - 1 + markers.length) % markers.length;
    updateDisplay();
  };

  document.getElementById('nextImage').onclick = () => {
    currentIndex = (currentIndex + 1) % markers.length;
    updateDisplay();
  };

  document.getElementById('showMarker').onclick = () => {
    const marker = markers[currentIndex];
    document.getElementById('imagePopup').remove();
    map.flyTo(marker.getLatLng(), 17, { animate: true });
    marker.openPopup();
  };

  document.onkeydown = (e) => {
    if (!document.getElementById('imagePopup')) return;
    if (e.key === "ArrowLeft") document.getElementById('prevImage').click();
    if (e.key === "ArrowRight") document.getElementById('nextImage').click();
    if (e.key === "Escape") overlay.remove();
  };
}
