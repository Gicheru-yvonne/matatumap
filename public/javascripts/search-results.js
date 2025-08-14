let map = null;

let isLoading = false;
let searchResults = [];

function initializeMap() {
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
    // const mapSection = document.getElementById('map');
    // const ctaSection = document.getElementById('cta');

    // if (isLoading) {
    //     loader.style.display = 'block';
    //     mapSection.style.display = 'none';
    //     ctaSection.style.display = 'none';
    // } else {
    //     // Hide loader and overlay, show content
    //     loader.style.display = 'none';
    //     mapSection.style.display = 'block';
    //     ctaSection.style.display = 'block';
    // }
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
                            </div>
                            <div class="destination-route-no">
                                <span class="destination-route-no-value font-normal text-lg rounded-pill bg-gray-light p-4">${destination.RouteName}</span>
                            </div>
                        </div>
                        <div class="mt-4">
                            <button class="btn btn-primary w-full view-route-btn" data-route="route-${destination.RouteName}" data-sacco="sacco-${destination.SaccoId}" data-card-id="route-card-${index}" id="view-route-btn-${index}" data-btn-id="view-route-btn-${index}">
                                View Route
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        resultsContainer.innerHTML += destinationHtml;
    });

    addViewRouteListeners();
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
            const route = +routeData.split('-')[1];
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

        // Set appropriate map view
        if (routeLayer && allSegments.length > 0) {
            const bounds = L.latLngBounds();

            // Add all route segment points
            allSegments.forEach(segment => {
                segment.forEach(point => {
                    bounds.extend(point);
                });
            });

            // Add sacco location
            bounds.extend([saccoLatitude, saccoLongitude]);

            // Fit map to bounds
            mapInstance.fitBounds(bounds, {
                padding: [40, 40], // Slightly more padding
                maxZoom: 22
            });
        } else {
            mapInstance.setView([saccoLatitude, saccoLongitude], 16);
        }

        // Store references for later use
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