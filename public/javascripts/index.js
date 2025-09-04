let map = null;
let marker = null;
let greenIcon = null;

// Modal functionality
function openModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    loadSaccos();

    // Focus on first input for accessibility
    setTimeout(() => {
        document.getElementById('issueType').focus();
    }, 300);
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    const form = document.getElementById('issueForm');
    const successMessage = document.getElementById('successMessage');

    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling

    // Reset form and hide success message
    form.reset();
    successMessage.style.display = 'none';

    document.getElementById('routeChangeGroup').style.display = 'none';
    // Hide stop location map
    document.getElementById('stopLocationGroup').style.display = 'none';
    document.getElementById('selectedLocationInfo').style.display = 'none';
    // Clear map marker if exists
    if (marker && map) {
        map.removeLayer(marker);
        marker = null;
    }
    // Clear hidden location inputs
    document.getElementById('selectedLatitude').value = '';
    document.getElementById('selectedLongitude').value = '';
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

document.getElementById('issueType').addEventListener('change', function() {
    const routeChangeGroup = document.getElementById('fareChangeGroup');
    const stopLocationGroup = document.getElementById('stopLocationGroup');

    // Remove existing marker
    if (marker && map) {
        map.removeLayer(marker);
        marker = null;
    }

    if (this.value === 'fare-change') {
        routeChangeGroup.style.display = 'block';
    } else {
        routeChangeGroup.style.display = 'none';
        document.getElementById('fareChange').value = '';
    }

    if (this.value === 'stop-moved') {
        stopLocationGroup.style.display = 'block';
        // Initialize map after a short delay to ensure the container is visible
        setTimeout(initializeMap, 100);
    } else {
        stopLocationGroup.style.display = 'none';
        document.getElementById('selectedLatitude').value = '';
        document.getElementById('selectedLongitude').value = '';
    }
});

function initializeMap() {
    // Only initialize if map doesn't exist or if the container is empty
    if (!map || !document.getElementById('map').hasChildNodes()) {
        // Remove any existing map
        if (map) {
            map.remove();
        }

        greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Initialize the map centered on Nairobi
        map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([-1.281230001797726, 36.82260458114266], 16);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        map.on('click', function (e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker([lat, lng], {
                draggable: true
            }).addTo(map);

            // Update hidden inputs
            document.getElementById('selectedLatitude').value = lat;
            document.getElementById('selectedLongitude').value = lng;

            // Show location info
            document.getElementById('locationCoords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            document.getElementById('selectedLocationInfo').style.display = 'block';

            // Make marker draggable and update coordinates on drag
            marker.on('dragend', function (event) {
                const position = event.target.getLatLng();
                document.getElementById('selectedLatitude').value = position.lat;
                document.getElementById('selectedLongitude').value = position.lng;
                document.getElementById('locationCoords').textContent = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
            });
        });

        // Force map to resize properly
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }
}

async function submitReport() {
    const form = document.getElementById('issueForm');
    const submitBtn = document.getElementById('issue-submit-btn');
    const successMessage = document.getElementById('successMessage');

    // Validate required fields
    const issueType = document.getElementById('issueType').value;
    const sacco = document.getElementById('sacco').value;

    if (!issueType || !sacco) {
        alert('Please fill in all required fields.');
        return;
    }

    // Additional validation for fare change
    if (issueType === 'fare-change') {
        const fareChange = document.getElementById('fareChange').value;
        if (!fareChange || isNaN(parseFloat(fareChange))) {
            alert('Please enter a valid fare amount.');
            return;
        }
    }

    // Additional validation for stop moved
    if (issueType === 'stop-moved') {
        const latitude = document.getElementById('selectedLatitude').value;
        const longitude = document.getElementById('selectedLongitude').value;
        if (!latitude || !longitude) {
            alert('Please select the new stop location on the map.');
            return;
        }
    }

    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    form.classList.add('loading');

    try {
        // Collect form data
        const formData = {
            issueType: issueType,
            sacco: sacco,
            details: document.getElementById('details').value,
            contact: document.getElementById('contact').value,
            userAgent: navigator.userAgent
        };

        // Add conditional fields based on issue type
        if (issueType === 'fare-change') {
            formData.fareChange = document.getElementById('fareChange').value;
        }

        if (issueType === 'stop-moved') {
            formData.selectedLatitude = document.getElementById('selectedLatitude').value;
            formData.selectedLongitude = document.getElementById('selectedLongitude').value;
        }

        const response = await axios.post('/api/report-issue', formData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });

        const result = response.data;

        if (result.success) {
            successMessage.style.display = 'block';
            form.reset();

            document.getElementById('selectedLatitude').value = '';
            document.getElementById('selectedLongitude').value = '';

            document.getElementById('fareChangeGroup').style.display = 'none';
            document.getElementById('stopLocationGroup').style.display = 'none';
            document.getElementById('selectedLocationInfo').style.display = 'none';

            setTimeout(() => {
                closeModal();
            }, 3000);
        } else {
            throw new Error(result.message || 'Failed to submit report');
        }

    } catch (error) {
        console.error('Error submitting report:', error);

        let errorMessage = 'Failed to submit report. Please try again.';

        if (error.response) {
            errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. Please try again.';
        }

        alert(errorMessage);
    } finally {
        submitBtn.textContent = 'Submit Report';
        submitBtn.disabled = false;
        form.classList.remove('loading');
    }
}

async function loadSaccos() {
    const saccoSelect = document.getElementById('sacco');

    try {
        saccoSelect.innerHTML = '<option value="">Loading saccos...</option>';
        saccoSelect.disabled = true;

        const response = await axios.get('/api/saccos');

        if (response.data && response.data.saccos) {
            const saccos = response.data.saccos;

            saccoSelect.innerHTML = '<option value="">Select a Sacco</option>';

            saccos.forEach(sacco => {
                const option = document.createElement('option');
                option.value = sacco.SaccoId || sacco.SaccoName;
                option.textContent = sacco.SaccoName;
                option.dataset.latitude = sacco.SaccoLatitude;
                option.dataset.longitude = sacco.SaccoLongitude;
                saccoSelect.appendChild(option);
            });

            saccoSelect.disabled = false;
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        console.error('Error loading saccos:', error);

        saccoSelect.innerHTML = '<option value="">Select a Sacco</option>';

        saccoSelect.disabled = false;

        console.warn('Falling back to hardcoded sacco list');
    }
}

let saccoMarker;

const saccoSelect = document.getElementById('sacco');

saccoSelect.addEventListener('change', function () {
    const selectedOption = saccoSelect.options[saccoSelect.selectedIndex];

    if (selectedOption && selectedOption.dataset.latitude && selectedOption.dataset.longitude) {
        const lat = parseFloat(selectedOption.dataset.latitude);
        const lng = parseFloat(selectedOption.dataset.longitude);

        if (!isNaN(lat) && !isNaN(lng) && map) {
            map.setView([lat, lng], 16);

            if (saccoMarker) {
                map.removeLayer(saccoMarker);
            }

            saccoMarker = L.marker([lat, lng], { icon: greenIcon }).addTo(map);

            document.getElementById('selectedLatitude').value = lat;
            document.getElementById('selectedLongitude').value = lng;
            document.getElementById('locationCoords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            document.getElementById('selectedLocationInfo').style.display = 'block';
        }
    }
});
