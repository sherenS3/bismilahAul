// Global variables
let map;
let currentSlide = 0;
let tpsData = { "type": "FeatureCollection", "features": [] }; // Initialize with empty FeatureCollection
let roadsData = { "type": "FeatureCollection", "features": [] };
let districtsData = { "type": "FeatureCollection", "features": [] };
let housingData = { "type": "FeatureCollection", "features": [] };
let layerGroups = {};
let tpsMarkers = []; // To store Leaflet markers for easier access

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeMap();
    loadAllData();
    initializeCarousel(); // Call populateCarousel inside loadAllData or loadSampleData
});

// Navbar functionality
function initializeNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
}

// Map initialization
function initializeMap() {
    // Initialize map centered on Bandung
    map = L.map('map').setView([-6.9175, 107.6191], 12);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);
    
    // Initialize layer groups
    layerGroups = {
        tps: L.layerGroup().addTo(map),
        roads: L.layerGroup().addTo(map),
        districts: L.layerGroup().addTo(map),
        housing: L.layerGroup() // Housing layer is not added by default, controlled by checkbox
    };
    
    // Layer control functionality
    setupLayerControls();
}

// Setup layer control checkboxes
function setupLayerControls() {
    const layerCheckboxes = {
        'tps-layer': 'TPS',
        'roads-layer': 'JALAN',
        'districts-layer': 'KECAMATAN',
        'housing-layer': 'PERMUNGKIMAN'
    };
    
    Object.keys(layerCheckboxes).forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        const layerName = layerCheckboxes[checkboxId];
        
        // Set initial state based on if layer is already added to map in initializeMap
        if (map.hasLayer(layerGroups[layerName])) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }

        checkbox.addEventListener('change', function() {
            if (this.checked) {
                map.addLayer(layerGroups[layerName]);
            } else {
                map.removeLayer(layerGroups[layerName]);
            }
        });
    });
}

// Load all data
async function loadAllData() {
    // Show a loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';

    try {
        const [tpsResponse, roadsResponse, districtsResponse, housingResponse] = await Promise.all([
            fetch('data/TITIK_TPS.geojson'),
            fetch('data/JALAN_2.geojson'), // Corrected typo here
            fetch('data/ADMKEC_BANDUNG.geojson'),
            fetch('data/PERMUNGKIMAN.geojson')
        ]);
        
        tpsData = await TPSResponse.json();
        roadsData = await JALANResponse.json();
        districtsData = await KECAMATANResponse.json();
        housingData = await PERMUNGKIMANResponse.json();
        
        addTPSToMap();
        addRoadsToMap();
        addDistrictsToMap();
        addHousingToMap();
        populateCarousel();
        
    } catch (error) {
        console.error('Error loading data from files, loading sample data:', error);
        alert('Gagal memuat data dari file GeoJSON. Memuat data sampel.');
        loadSampleData();
    } finally {
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Load sample data if JSON files don't exist or fail to load
function loadSampleData() {
    console.warn('Loading sample data as JSON files could not be loaded.');

    tpsData = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "TPS Gedebage",
                    "address": "Jl. Raya Gedebage No. 100, Bandung",
                    "lat": -6.9678,
                    "lng": 107.7123,
                    "type": "tps3r",
                    "capacity": "700 ton/hari",
                    "contact": "022-7801234",
                    "description": "TPS terpadu dengan fasilitas pengolahan modern dan daur ulang."
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [107.7123, -6.9678]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "TPS Kopo",
                    "address": "Jl. Kopo No. 200, Bandung",
                    "lat": -6.9456,
                    "lng": 107.5789,
                    "type": "tps-building",
                    "capacity": "450 ton/hari",
                    "contact": "022-5405678",
                    "description": "TPS bangunan permanen, melayani area Kopo dan sekitarnya."
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [107.5789, -6.9456]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "TPS Arcamanik",
                    "address": "Jl. Arcamanik Endah No. 50, Bandung",
                    "lat": -6.9012,
                    "lng": 107.6789,
                    "type": "tps-no-building",
                    "capacity": "250 ton/hari",
                    "contact": "022-7209876",
                    "description": "TPS sementara untuk penampungan sampah dari perumahan sekitar."
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [107.6789, -6.9012]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "TPS Pasteur",
                    "address": "Jl. Pasteur No. 10, Bandung",
                    "lat": -6.8900,
                    "lng": 107.5900,
                    "type": "tps3r",
                    "capacity": "600 ton/hari",
                    "contact": "022-2001122",
                    "description": "Fokus pada pengurangan sampah dan daur ulang, dilengkapi fasilitas pengolahan kompos."
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [107.5900, -6.8900]
                }
            }
        ]
    };
    roadsData = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": { "name": "Jl. Soekarno Hatta", "type": "arterial" },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [107.6200, -6.9400],
                        [107.6500, -6.9500],
                        [107.6800, -6.9600]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": { "name": "Jl. Setiabudi", "type": "collector" },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [107.5800, -6.8500],
                        [107.5900, -6.8700],
                        [107.6000, -6.8900]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": { "name": "Jl. Cikapundung Barat", "type": "local" },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [107.6090, -6.9150],
                        [107.6100, -6.9160],
                        [107.6110, -6.9170]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": { "name": "Jl. Buah Batu", "type": "arterial" },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [107.6100, -6.9600],
                        [107.6300, -6.9700],
                        [107.6500, -6.9800]
                    ]
                }
            }
        ]
    };
    districtsData = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": { "name": "Coblong" },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.5900, -6.8800],
                            [107.6200, -6.8800],
                            [107.6200, -6.9100],
                            [107.5900, -6.9100],
                            [107.5900, -6.8800]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": { "name": "Regol" },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.5900, -6.9300],
                            [107.6100, -6.9300],
                            [107.6100, -6.9500],
                            [107.5900, -6.9500],
                            [107.5900, -6.9300]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": { "name": "Antapani" },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.6400, -6.9000],
                            [107.6600, -6.9000],
                            [107.6600, -6.9200],
                            [107.6400, -6.9200],
                            [107.6400, -6.9000]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": { "name": "Ujung Berung" },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.6900, -6.8800],
                            [107.7200, -6.8800],
                            [107.7200, -6.9100],
                            [107.6900, -6.9100],
                            [107.6900, -6.8800]
                        ]
                    ]
                }
            }
        ]
    };
    housingData = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Perumahan Indah Jaya",
                    "description": "Permukiman padat penduduk di Bandung bagian selatan."
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.6500, -6.9500],
                            [107.6600, -6.9500],
                            [107.6600, -6.9600],
                            [107.6500, -6.9600],
                            [107.6500, -6.9500]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Komplek Hijau Asri",
                    "description": "Perumahan dengan banyak ruang terbuka hijau."
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.6200, -6.8800],
                            [107.6300, -6.8800],
                            [107.6300, -6.8900],
                            [107.6200, -6.8900],
                            [107.6200, -6.8800]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Perumahan Sekejati Indah",
                    "description": "Perumahan dengan akses strategis ke jalan utama."
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.6350, -6.9350],
                            [107.6450, -6.9350],
                            [107.6450, -6.9450],
                            [107.6350, -6.9450],
                            [107.6350, -6.9350]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Klaster Cempaka",
                    "description": "Lingkungan perumahan yang tenang dan nyaman."
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [107.6100, -6.9000],
                            [107.6150, -6.9000],
                            [107.6150, -6.9050],
                            [107.6100, -6.9050],
                            [107.6100, -6.9000]
                        ]
                    ]
                }
            }
        ]
    };
    
    // Clear existing layers before adding sample data
    Object.values(layerGroups).forEach(layerGroup => layerGroup.clearLayers());
    tpsMarkers = []; // Clear stored markers

    addTPSToMap();
    addRoadsToMap();
    addDistrictsToMap();
    addHousingToMap();
    populateCarousel();
}

// Add TPS markers to map
function addTPSToMap() {
    layerGroups.tps.clearLayers(); // Clear existing TPS markers
    tpsMarkers = []; // Reset stored markers

    const tpsIcons = {
        'tps3r': { color: '#ff6b6b', symbol: '🏢' }, // Red
        'tps-building': { color: '#4ecdc4', symbol: '🏗️' }, // Teal
        'tps-no-building': { color: '#45b7d1', symbol: '📦' } // Light Blue
    };
    
    tpsData.features.forEach((feature, index) => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const iconConfig = tpsIcons[props.type] || { color: '#95a5a6', symbol: '📍' }; // Default icon
        
        const customIcon = L.divIcon({
            html: `<div style="background-color: ${iconConfig.color}; 
                                 width: 30px; height: 30px; 
                                 border-radius: 50%; 
                                 display: flex; 
                                 align-items: center; 
                                 justify-content: center; 
                                 border: 2px solid white; 
                                 box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                                 font-size: 14px;
                                 cursor: pointer;">
                                 ${iconConfig.symbol}
                        </div>`,
            className: 'tps-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([coords[1], coords[0]], { icon: customIcon })
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h4 style="color: var(--primary-green); margin-bottom: 10px;">${props.name}</h4>
                    <p><strong>Alamat:</strong> ${props.address || 'N/A'}</p>
                    <p><strong>Kapasitas:</strong> ${props.capacity || 'N/A'}</p>
                    <p><strong>Kontak:</strong> ${props.contact || 'N/A'}</p>
                    <p><strong>Deskripsi:</strong> ${props.description || 'N/A'}</p>
                    <button class="btn btn-sm btn-primary" onclick="zoomToTPS(${coords[1]}, ${coords[0]})">Zoom to TPS</button>
                </div>
            `);
        
        marker.addTo(layerGroups.tps);
        tpsMarkers.push(marker); // Store marker for later access (e.g., carousel interaction)

        // Add click listener to marker to update carousel
        marker.on('click', function() {
            const clickedCoords = this.getLatLng();
            const foundIndex = tpsData.features.findIndex(feature => 
                feature.geometry.coordinates[0] === clickedCoords.lng && 
                feature.geometry.coordinates[1] === clickedCoords.lat
            );
            if (foundIndex !== -1) {
                goToSlide(foundIndex);
                // Scroll carousel into view if necessary
                document.getElementById('tpsCarouselContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

// Add roads to map
function addRoadsToMap() {
    layerGroups.roads.clearLayers(); // Clear existing roads

    const roadColors = {
        'arterial': '#e74c3c', // Red
        'collector': '#f39c12', // Orange
        'local': '#3498db',    // Blue
        'other': '#95a5a6'     // Grey
    };
    const roadWeights = {
        'arterial': 5,
        'collector': 3,
        'local': 2,
        'other': 1.5
    };
    
    roadsData.features.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const color = roadColors[props.type] || roadColors.other;
        const weight = roadWeights[props.type] || roadWeights.other;
        
        // Handle LineString coordinates: Leaflet expects [lat, lng]
        // GeoJSON coordinates are typically [lng, lat]
        const leafletCoords = coords.map(coord => [coord[1], coord[0]]);

        L.polyline(leafletCoords, {
            color: color,
            weight: weight,
            opacity: 0.8
        }).bindPopup(`
            <div>
                <h4 style="color: var(--primary-green);">Jalan ${props.name || 'Tidak Diketahui'}</h4>
                <p><strong>Jenis:</strong> ${props.type || 'N/A'}</p>
            </div>
        `).addTo(layerGroups.roads);
    });
}

// Add districts to map
function addDistrictsToMap() {
    layerGroups.districts.clearLayers(); // Clear existing districts

    districtsData.features.forEach(feature => {
        const props = feature.properties;
        // GeoJSON polygons can have multiple rings (outer and inner holes).
        // For simplicity, assuming the first array is the outer ring.
        // Leaflet expects [lat, lng] for coordinates.
        const leafletCoords = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        
        L.polygon(leafletCoords, {
            color: '#2ecc71', // Green
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.1,
            dashArray: '5, 5' // Dashed outline for districts
        }).bindPopup(`
            <div>
                <h4 style="color: var(--primary-green);">Kecamatan ${props.name || 'Tidak Diketahui'}</h4>
            </div>
        `).addTo(layerGroups.districts);
    });
}

// Add housing to map
function addHousingToMap() {
    layerGroups.housing.clearLayers(); // Clear existing housing areas

    housingData.features.forEach(feature => {
        const props = feature.properties;
        // Assuming single polygon per housing area, taking the first array for coordinates
        const leafletCoords = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        
        L.polygon(leafletCoords, {
            color: '#9b59b6', // Purple
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.2
        }).bindPopup(`
            <div>
                <h4 style="color: var(--primary-green);">${props.name || 'Tidak Diketahui'}</h4>
                <p>${props.description || 'N/A'}</p>
            </div>
        `).addTo(layerGroups.housing);
    });
}

// Map control functions
function goHome() {
    map.setView([-6.9175, 107.6191], 12);
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
            
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup('Lokasi Anda')
                .openPopup();
        }, function(error) {
            console.error('Error getting user location:', error);
            let errorMessage = 'Gagal mendapatkan lokasi Anda.';
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage += ' Izin lokasi ditolak. Harap izinkan akses lokasi di pengaturan browser Anda.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage += ' Informasi lokasi tidak tersedia.';
            } else if (error.code === error.TIMEOUT) {
                errorMessage += ' Permintaan waktu habis.';
            }
            alert(errorMessage);
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }); // Options for geolocation
    } else {
        alert('Geolocation tidak didukung oleh browser ini.');
    }
}

function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

// Search functionality
function searchTPS() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Harap masukkan kata kunci pencarian.');
        return;
    }
    
    const foundTPS = tpsData.features.find(feature => 
        (feature.properties.name && feature.properties.name.toLowerCase().includes(searchTerm)) ||
        (feature.properties.address && feature.properties.address.toLowerCase().includes(searchTerm))
    );
    
    if (foundTPS) {
        const coords = foundTPS.geometry.coordinates;
        map.setView([coords[1], coords[0]], 16); // Zoom to found TPS
        
        // Scroll to map section
        document.getElementById('map-section').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Find and open the popup for this marker
        const foundMarker = tpsMarkers.find(marker => 
            marker.getLatLng().lat === coords[1] && marker.getLatLng().lng === coords[0]
        );
        if (foundMarker) {
            foundMarker.openPopup();
            // Also, update carousel to show this TPS
            const foundIndex = tpsData.features.indexOf(foundTPS);
            if (foundIndex !== -1) {
                goToSlide(foundIndex);
            }
        }
    } else {
        alert('TPS tidak ditemukan. Silakan coba kata kunci lain.');
    }
}

// Function to zoom to a specific TPS from carousel/popup
function zoomToTPS(lat, lng) {
    map.setView([lat, lng], 16);
    // Optionally, open the popup again after zooming
    layerGroups.tps.eachLayer(function(layer) {
        if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
            layer.openPopup();
        }
    });
    // Scroll to map section
    document.getElementById('map-section').scrollIntoView({
        behavior: 'smooth'
    });
}


// Carousel functionality
// initializeCarousel is called on DOMContentLoaded, no need to call populateCarousel again here directly.
// populateCarousel will be called after data loading.

function populateCarousel() {
    const carousel = document.getElementById('tpsCarousel');
    const indicators = document.getElementById('carouselIndicators');
    
    carousel.innerHTML = '';
    indicators.innerHTML = '';
    
    if (tpsData.features && tpsData.features.length > 0) {
        tpsData.features.forEach((feature, index) => {
            const props = feature.properties;
            
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <div class="slide-image" style="background-image: url('https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop')"></div>
                <div class="slide-content">
                    <h3 class="slide-title">${props.name || 'Nama TPS Tidak Diketahui'}</h3>
                    <div class="slide-info">
                        <h4>Alamat</h4>
                        <p>${props.address || 'N/A'}</p>
                    </div>
                    <div class="slide-info">
                        <h4>Kapasitas</h4>
                        <p>${props.capacity || 'N/A'}</p>
                    </div>
                    <div class="slide-info">
                        <h4>Deskripsi</h4>
                        <p>${props.description || 'N/A'}</p>
                    </div>
                    <div class="slide-info">
                        <h4>Kontak</h4>
                        <p>${props.contact || 'N/A'}</p>
                    </div>
                    <button class="btn btn-sm btn-info" onclick="zoomToTPS(${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]})">Lihat di Peta</button>
                </div>
            `;
            carousel.appendChild(slide);
            
            // Create indicator
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        updateCarousel();
    } else {
        carousel.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Tidak ada data TPS untuk ditampilkan.</p>';
    }
}

function nextSlide() {
    if (tpsData.features && tpsData.features.length > 0) {
        currentSlide = (currentSlide + 1) % tpsData.features.length;
        updateCarousel();
    }
}

function previousSlide() {
    if (tpsData.features && tpsData.features.length > 0) {
        currentSlide = (currentSlide - 1 + tpsData.features.length) % tpsData.features.length;
        updateCarousel();
    }
}

function goToSlide(index) {
    if (tpsData.features && tpsData.features.length > 0) {
        currentSlide = index;
        updateCarousel();
        // Optionally, center map on the current TPS when carousel slide changes
        const currentTPS = tpsData.features[currentSlide];
        if (currentTPS && currentTPS.geometry && currentTPS.geometry.coordinates) {
            const coords = currentTPS.geometry.coordinates;
            map.flyTo([coords[1], coords[0]], 15, { duration: 1.5 }); // Smooth pan and zoom
        }
    }
}

function updateCarousel() {
    const carousel = document.getElementById('tpsCarousel');
    const indicators = document.querySelectorAll('.indicator');
    
    if (tpsData.features && tpsData.features.length > 0) {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
}

// Auto-advance carousel
let autoSlideInterval;
function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval); // Clear existing interval to prevent duplicates
    autoSlideInterval = setInterval(() => {
        if (tpsData.features && tpsData.features.length > 0) {
            nextSlide();
        }
    }, 5000);
}
startAutoSlide(); // Start auto-slide on load

// Pause auto-slide on hover
const carouselContainer = document.getElementById('tpsCarouselContainer'); // Assuming you have a container for the carousel
if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    carouselContainer.addEventListener('mouseleave', () => startAutoSlide());
}


// Handle search on Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchTPS();
    }
});

// Add these to your HTML (assuming you have a structure for map controls and a loading indicator):

/*
<div id="map-controls" style="position: absolute; top: 10px; right: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
    <button onclick="goHome()">Home</button>
    <button onclick="getUserLocation()">My Location</button>
    <button onclick="zoomIn()">Zoom In</button>
    <button onclick="zoomOut()">Zoom Out</button>
    <input type="text" id="searchInput" placeholder="Cari TPS..." style="margin-top: 5px;">
    <button onclick="searchTPS()">Cari</button>
    <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
        <label><input type="checkbox" id="tps-layer"> TPS</label><br>
        <label><input type="checkbox" id="roads-layer"> Jalan</label><br>
        <label><input type="checkbox" id="districts-layer"> Kecamatan</label><br>
        <label><input type="checkbox" id="housing-layer"> Permukiman</label>
    </div>
</div>

<div id="loadingIndicator" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 20px; border-radius: 10px; z-index: 9999;">
    Memuat data...
</div>

// For the carousel to pause on hover, wrap it like this:
<div id="tpsCarouselContainer" class="carousel-container">
    <div id="tpsCarousel" class="carousel"></div>
    <div class="carousel-controls">
        <button class="prev" onclick="previousSlide()">&#10094;</button>
        <button class="next" onclick="nextSlide()">&#10095;</button>
    </div>
    <div id="carouselIndicators" class="carousel-indicators"></div>
</div>
*/