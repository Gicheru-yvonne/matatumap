let map = null;

let stopMovedMap = null;
let stopMovedMarker = null;
let currentStopMovedSacco = null;

let greenIcon = null;
let saccoMarker;

let isLoading = false;
let searchResults = [];

function initializeMap() {
    greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (!map) {
        map = L.map('map').setView([-1.281230001797726, 36.82260458114266], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
    }

    return map;
}

document.addEventListener('DOMContentLoaded', () => {
    isLoading = true;

    initializeMap();

    updateLoadingState();

    const urlParams = new URLSearchParams(window.location.search);
    const searchDestination = urlParams.get('search-destination');

    if (!searchDestination) {
        isLoading = false;
    }

    const searchInput = document.getElementById('search-destination');

    searchInput.value = searchDestination;

    searchDestinations(searchDestination)
});

function searchDestinations(destination) {
    axios.get(`/api/destination?search=${destination}`)
        .then(response => {
            searchResults = [];
            for (let result of response.data.destinations) {
                searchResults.push(result);
            }

            renderDataToUi(searchResults);
        })
        .catch(error => {
            console.error('Error:', error);
        }).finally(() => {
        isLoading = false;

        updateLoadingState();
    })
}

function updateLoadingState() {
}

function renderDataToUi(results) {
    const resultsContainer = document.getElementById('results-container');

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = `
        <div class="flex flex-col items-center">
            <div class="text-center p-8">
                <p class="text-lg text-gray-500">No routes found</p>
            </div>  
        </div>`;

        return;
    }

    document.querySelector('.search-input').focus();

    results.forEach((destination, index) => {
        const destinationHtml = `
            <div class="card ${index > 0 ? 'card-mt' : ''}" id="route-card-${index}">
                <div class="card-body">
                    <div class="flex flex-col">
                        <div class="flex justify-between">
                            <div class="flex items-center">
                                <div class="icon">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                         xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                        <rect width="40" height="40" fill="url(#pattern0_455_44)"/>
                                        <defs>
                                            <pattern id="pattern0_455_44" patternContentUnits="objectBoundingBox"
                                                     width="1" height="1">
                                                <use xlink:href="#image0_455_44" transform="scale(0.0111111)"/>
                                            </pattern>
                                            <image id="image0_455_44" width="90" height="90" preserveAspectRatio="none"
                                                   xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD6ElEQVR4nO2dvWsUQRjGp1EDimjnN2IlGDQg+FHZpPWjSSOBk8s8z96eXrRQz1LwH4haGbFIay+KH01AgyDESiM2mlgLiRENRE5emUCiySVnZmd2794fTBN2Z5753buzm+xmzxhFURRFURRFUZROgOQ+kjWSTwBMkJwl2ShIm3WZJfulNE33mryRJMluAPdIzudAWMNHA/CL5MMkSfabPEDyHIBvscUwuzYD4ExUyQAuu08+toxGgOoejFnJbS+Zi2QHr2xr7Z42Xy4aK7SZcrm8K5hokg88hJ4DcD1EcBmDZF3G9JD7vgl4Cefj6qIeJPDS7HUPuefliA4RdtDTYbjTBKZare7wlP1i5mEBPPYRthxyrVu6hKw7O4BHmYcl+cFTVdQzD/tv9hueRE+ECDvjSfScyC7gyVDaTAjRPoI2it5UNFV0I3YVakUzvjhdOhhfqq7R7EDRpk2hig6Dig6Eig6Eig6Eig6Eig6Eig6Eig6Eig6Eig6Eig6Eig6Eig6Eig6Eiu5U0f39/ZtNm1GtVrfkTjTJ06bNSJLkbB5Ff6pUKt2mTahUKt0kP+dR9MKT8WPyaCvJa1IRErhUKm0zOUWyWWsPyUPmAK66/8V5udpD9pkHW8cNze8k35N8AWCE5G0AN0leIVmSDwXAKWvtUZIH0zQ9IE2eAE3TdLu0UqnUtUhQ18LP3TZ/tpd9pQ/pS/q01l6QMdxYMuYIgOck37lMxbo522nNqGiqaOagErWiGV+eLh2ML1bXaKro6FVHrWhGF6VLB+NLLMoa/YPkUJIkx+QvetJIHne/lf2MLchXztiipwYGBg6vtG+SJEdkmxxIXndOkzXNKqRZ+MWTiFzZXnKarGkygaG19gHgTkTRXnKarFlpYFnr1tqHtfZELNG+cpqsWWlgue3j4xYRM26+cpqs8TGBWq22tQiim+U0WaNLB+OKluvPFvq4G6uifeX8b4EtDL7swHIpJJdEq+1vre3x+JaBlpuvnCZrVpnIVLNJWGt7AHyJWM3ecpqsWUvFyPWnXBrJiceduU+6wzBaJfvOGV10pzSjoqmimYNK1IpmfHm6dDC+WF2jqaKjVx07qaIBfI0tJYuMuRPt9tkgL/mTOxsAekmedy/5vkVyWF7xTvIZyVGSb0h+BDApAha16WUETf+1zaTs6/oYBfDU9T0sY8mYbuxeySLvR5Vs/zuvTGnlvdEiwhQE5G1eAF638MmPmYKAvM2rldcay9dsmILAvM2rVqttAvB2DYHG+/r6NpqCUMvjvNw7/puFGpfvZjEFw+ZxXlIB7luExuRE4torOayKVMmdMi9FURRFUUyH8BvshjJJgVod0wAAAABJRU5ErkJggg=="/>
                                        </defs>
                                    </svg>
                                </div>
                                <div class="destination-sacco">
                                    <p class="font-semibold text-lg">${destination.SaccoName}</p>
                                </div>
                            </div>
                            <div>
                                <div class="destination-price">
                                    <p class="price text-color-primary font-semibold text-lg">
                                        Ksh. ${destination.Fare}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="destination-details">
                                <p class="font-normal text-sm">${destination.DestinationServed}</p>
                                
                                <div class="status-row">
                                    ${destination.Issues.length === 0 ? '<span class="status-badge status-available">Available</span>' : '<span></span>'}
                                    ${destination.Issues.length >= 1 ? `<span class="status-badge status-${destination.Issues[0].IssueType}">${toTitleCase(destination.Issues[0].IssueType)}</span>` : '<span></span>'}
                                    ${destination.Issues.length >= 1 && destination.Issues[0].IssueUpdatedAt ? `<span class="status-badge status-updated">Updated ${timeAgo(destination.Issues[0].IssueUpdatedAt)}</span>` : '<span></span>'}
                                 </div>
                            </div>
                            
                            <div class="destination-route-no">
                                <span class="destination-route-no-value font-normal text-sm rounded-pill bg-gray-light p-4">${destination.RouteName}</span>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="action-buttons flex flex-col">
                                <div class="flex">
                                    <button class="btn btn-outline report-issue-btn" data-issue-type="matatu-full" data-sacco-id=${destination.SaccoId} data-sacco-name=${destination.SaccoName} data-route-name=${destination.RouteName}>Report Full</button>
                                    <button class="btn btn-outline report-issue-btn" data-issue-type="fare-change" data-sacco-id=${destination.SaccoId} data-sacco-name=${destination.SaccoName} data-route-name=${destination.RouteName}>Fare Change</button>
                                    <button class="btn btn-warning report-issue-btn" data-issue-type="stop-moved" data-sacco-id=${destination.SaccoId} data-latitude=${destination.gps_location_latitude} data-longitude=${destination.gps_location_longitude} data-sacco-name=${destination.SaccoName} data-route-name=${destination.RouteName}>Stop Moved</button>
                                    <button class="share-btn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="18" cy="5" r="3"/>
                                            <circle cx="6" cy="12" r="3"/>
                                            <circle cx="18" cy="19" r="3"/>
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                        </svg>
                                    </button>
                                </div>
                                <div>
                                    <button class="btn btn-primary w-full view-route-btn" data-route="route-${destination.RouteName}" data-sacco="sacco-${destination.SaccoId}" data-card-id="route-card-${index}" id="view-route-btn-${index}" data-btn-id="view-route-btn-${index}">
                                        View Route
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        `;

        resultsContainer.innerHTML += destinationHtml;
    });

    addViewRouteListeners();

    document.querySelectorAll('.report-issue-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const issueType = this.dataset.issueType;
            const saccoId = this.dataset.saccoId;
            const latitude = this.dataset.latitude;
            const longitude = this.dataset.longitude;
            const routeName = this.dataset.longitude;

            // Build formData directly from dataset
            const formData = {
                issueType,
                sacco: saccoId,
                userAgent: navigator.userAgent,
            };

            // For issue types that need extra input, you can still prompt
            if (issueType === 'fare-change') {
                const fare = prompt("Enter new fare (KSH):");
                if (!fare || isNaN(parseFloat(fare))) {
                    alert("Invalid fare entered.");
                    return;
                }
                formData.fareChange = fare;
            }

            if (issueType === 'stop-moved') {
                openStopMovedModal(saccoId, latitude, longitude);
                return;
            }

            try {
                const response = await axios.post('/api/report-issue', formData, {
                    headers: {'Content-Type': 'application/json'},
                });

                if (response.data.success) {
                    alert("Issue reported successfully!");

                    refetchData(saccoId, routeName)
                } else {
                    alert(response.data.message || "Failed to report issue.");
                }
            } catch (err) {
                console.error(err);
                alert("Something went wrong while submitting.");
            }
        });
    });


    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();

            try {
                await navigator.clipboard.writeText(window.location.href);

                showSuccessMessage('Link copied to clipboard!');

            } catch (err) {
                console.error('Failed to copy to clipboard:', err);

                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);

                    showSuccessMessage('Link copied to clipboard!');
                } catch (fallbackErr) {
                    console.error('Fallback copy failed:', fallbackErr);
                    alert('Could not copy link to clipboard');
                }
            }
        });
    });

    document.getElementById('submitStopMoved').addEventListener('click', async () => {
        const element = document.querySelectorAll('.report-issue-btn')?.[0];

        if (!element) {
            alert("Please select a stop moved issue.");
            return;
        }

        const routeName = element.dataset.routeName;
        const saccoId = element.dataset.saccoId;

        const lat = document.getElementById('newStopLat').value;
        const lng = document.getElementById('newStopLng').value;

        if (!lat || !lng) {
            alert("Please select a new stop location on the map.");
            return;
        }

        const formData = {
            issueType: 'stop-moved',
            sacco: currentStopMovedSacco,
            selectedLatitude: lat,
            selectedLongitude: lng,
            userAgent: navigator.userAgent,
        };

        try {
            const response = await axios.post('/api/report-issue', formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success) {
                alert("Stop moved issue reported successfully!");
                closeStopMovedModal();

                refetchData();
            } else {
                alert(response.data.message || "Failed to submit issue.");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting stop-moved issue.");
        }
    });

    document.getElementById('closeStopMovedModal').addEventListener('click', closeStopMovedModal);
}

function addViewRouteListeners() {
    document.querySelectorAll('.view-route-btn').forEach(button => {
        button.addEventListener('click', function () {
            const cardId = this.getAttribute('data-card-id');
            const buttonId = this.getAttribute('data-btn-id');

            highlightCard(cardId);
            disableAndShowLoading(buttonId);

            const routeData = this.getAttribute('data-route');
            const saccoData = this.getAttribute('data-sacco');
            const route = routeData.split('-')[1];
            const saccoId = saccoData.split('-')[1];

            fetchRouteDetails(saccoId, route, buttonId)
        });
    });
}

function highlightCard(cardId) {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('highlight');
    });

    const card = document.getElementById(cardId);

    card.classList.add('highlight');
}

function disableAndShowLoading(buttonId) {
    const button = document.getElementById(buttonId);

    if (button) {
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
        `;
    }
}

function enableButton(buttonId) {
    const button = document.getElementById(buttonId);

    if (button) {
        button.disabled = false;
        button.innerHTML = 'View Route';
    }
}

function fetchRouteDetails(saccoId, route, buttonId) {
    axios.post(`/api/routes`, {
        saccoId,
        route
    })
        .then(response => {
            const routeDetails = response.data.routeDetails;

            mapRouteDetailsToUi(routeDetails);
        })
        .catch(error => {
            console.error('Error fetching route details:', error);
        })
        .finally(() => {
            isLoading = false;
            updateLoadingState();
            enableButton(buttonId);
        });
}

function mapRouteDetailsToUi(routeDetails) {
    try {
        const saccoLatitude = routeDetails.SaccoLatitude;
        const saccoLongitude = routeDetails.SaccoLongitude;
        const geometry = routeDetails.geometry;

        if (isNaN(saccoLatitude) || isNaN(saccoLongitude)) {
            console.error('Invalid sacco coordinates');
            return;
        }

        const mapInstance = initializeMap();

        clearMapLayers(mapInstance);

        let routeLayer = null;
        let startMarker = null;
        let endMarker = null;

        let allSegments = [];

        if (geometry && (geometry.type === 'LineString' || geometry.type === 'MultiLineString')) {
            if (geometry.type === 'MultiLineString') {
                // Handle MultiLineString - multiple separate line segments
                const routeGroup = L.layerGroup();
                const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1'];

                geometry.coordinates.forEach((lineString, index) => {
                    const leafletCoords = lineString.map(coord => [coord[1], coord[0]]);
                    const color = colors[index % colors.length];

                    const segment = L.polyline(leafletCoords, {
                        color: color,
                        weight: 5,
                        opacity: 1,
                        smoothFactor: 1,
                        className: 'animated-route'
                    });

                    // Add popup to each segment
                    segment.bindPopup(`
                        <div style="font-family: Arial, sans-serif;">
                            <h5 style="margin: 0 0 5px 0; color: ${color};">
                                Route ${routeDetails.RouteName}
                            </h5>
                        </div>
                    `);

                    routeGroup.addLayer(segment);
                    allSegments.push(leafletCoords);
                });

                routeGroup.addTo(mapInstance);
                routeLayer = routeGroup;
            }

            // Add start/end markers for first and last segments
            if (allSegments.length > 0) {
                const firstSegment = allSegments[0];
                const lastSegment = allSegments[allSegments.length - 1];

                if (firstSegment.length > 0) {
                    startMarker = L.marker(firstSegment[0], {
                        icon: L.divIcon({
                            className: 'route-marker',
                            html: '<div style="background: #28a745; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">S</div>',
                            iconSize: [25, 25],
                            iconAnchor: [12, 12]
                        })
                    }).addTo(mapInstance).bindPopup('<strong>🚀 Route Start</strong>');
                }

                if (lastSegment.length > 0) {
                    const lastPoint = lastSegment[lastSegment.length - 1];
                    endMarker = L.marker(lastPoint, {
                        icon: L.divIcon({
                            className: 'route-marker',
                            html: '<div style="background: #dc3545; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">E</div>',
                            iconSize: [25, 25],
                            iconAnchor: [12, 12]
                        })
                    }).addTo(mapInstance).bindPopup('<strong>🏁 Route End</strong>');
                }
            }

            // Add comprehensive route info popup to the layer group or polyline
            const totalPoints = allSegments.reduce((total, segment) => total + segment.length, 0);
            const segmentCount = geometry.type === 'MultiLineString' ? geometry.coordinates.length : 1;

            const routePopup = `
                <div style="font-family: Arial, sans-serif; min-width: 220px;">
                    <h4 style="margin: 0 0 10px 0; color: #007bff;">
                        🚌 ${routeDetails.RouteName || 'Route'}
                    </h4>
                    <p style="margin: 5px 0;"><strong>Sacco:</strong> ${routeDetails.SaccoName}</p>
                    <p style="margin: 5px 0;"><strong>Full Route:</strong> ${routeDetails.route_long || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Destination:</strong> ${routeDetails.headsign || 'N/A'}</p>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #666;">
                        <strong>Type:</strong> ${geometry.type}<br>
                        <strong>Segments:</strong> ${segmentCount} | <strong>Total Points:</strong> ${totalPoints}
                    </p>
                </div>
            `;

            if (geometry.type === 'LineString') {
                routeLayer.bindPopup(routePopup);
            }
        }

        // Add sacco location marker
        const saccoMarker = L.marker([saccoLatitude, saccoLongitude], {
            icon: L.divIcon({
                className: 'sacco-marker',
                html: `
                    <div style="
                        background: linear-gradient(135deg, #28a745, #20c997); 
                        color: white; 
                        border-radius: 50%; 
                        width: 35px; 
                        height: 35px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-weight: bold; 
                        border: 3px solid white; 
                        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                        font-size: 16px;
                    ">🏢</div>
                `,
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            })
        }).addTo(mapInstance);

        saccoMarker.bindPopup(`
            <div style="font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 10px 0; color: #28a745;">
                    🏢 ${routeDetails.SaccoName}
                </h4>
                <p style="margin: 5px 0;"><strong>Operating Route:</strong> ${routeDetails.RouteName || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong></p>
                <p style="margin: 2px 0; font-size: 0.9em; color: #666;">
                    ${saccoLatitude.toFixed(6)}, ${saccoLongitude.toFixed(6)}
                </p>
            </div>
        `).openPopup();

        if (routeLayer && allSegments.length > 0) {
            const bounds = L.latLngBounds();

            allSegments.forEach(segment => {
                segment.forEach(point => {
                    bounds.extend(point);
                });
            });

            bounds.extend([saccoLatitude, saccoLongitude]);

            mapInstance.fitBounds(bounds, {
                padding: [40, 40],
                maxZoom: 22
            });
        } else {
            mapInstance.setView([saccoLatitude, saccoLongitude], 16);
        }

        mapInstance.currentRoute = {
            routeLayer,
            saccoMarker,
            startMarker,
            endMarker,
            routeDetails
        };

    } catch (error) {
        console.error('Error mapping route details:', error);
    }
}


function clearMapLayers(mapInstance) {
    mapInstance.eachLayer(layer => {
        // Keep the tile layer, remove everything else
        if (!(layer instanceof L.TileLayer)) {
            mapInstance.removeLayer(layer);
        }
    });
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";

    return "just now";
}

function toTitleCase(str) {
    return str
        .replace(/-/g, " ") // replace dashes with spaces
        .split(" ")         // split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
        .join(" ");         // join back
}

function openStopMovedModal(saccoId, latitude, longitude) {
    currentStopMovedSacco = saccoId;
    const modal = document.getElementById('stopMovedModal');
    modal.style.display = 'block';

    if (!stopMovedMap) {
        stopMovedMap = L.map('stopMovedMap').setView([latitude, longitude], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(stopMovedMap);

        if (saccoMarker) {
            stopMovedMap.removeLayer(saccoMarker);
        }

        saccoMarker = L.marker([latitude, longitude], { icon: greenIcon }).addTo(stopMovedMap);

        stopMovedMap.on('click', function (e) {
            const {lat, lng} = e.latlng;

            if (stopMovedMarker) {
                stopMovedMap.removeLayer(stopMovedMarker);
            }

            // New marker (draggable)
            stopMovedMarker = L.marker([lat, lng], {draggable: true})
                .addTo(stopMovedMap)
                .bindPopup("New Stop")
                .openPopup();

            // Set hidden input values
            document.getElementById('newStopLat').value = lat;
            document.getElementById('newStopLng').value = lng;

            stopMovedMarker.on('dragend', function (event) {
                const pos = event.target.getLatLng();
                document.getElementById('newStopLat').value = pos.lat;
                document.getElementById('newStopLng').value = pos.lng;
            });
        });
    }

    // Ensure the map resizes correctly when modal opens
    setTimeout(() => stopMovedMap.invalidateSize(), 200);
}

function closeStopMovedModal() {
    document.getElementById('stopMovedModal').style.display = 'none';
}

async function refetchData() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchDestination = urlParams.get('search-destination');

    if (!searchDestination) {
        isLoading = false;
        return;
    }

    const searchInput = document.getElementById('search-destination');
    searchInput.value = searchDestination;

    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }

    await searchDestinations(searchDestination);
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-weight: 500;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}