let map = null;
let markers = [];
let tracks = [];

function initMap() {
    const mapElement = document.getElementById('mainMap') || document.getElementById('miniMap') || document.getElementById('vesselMap');
    if (!mapElement || !config) return;

    if (map) map.remove();

    map = L.map(mapElement).setView(config.mapConfig.defaultCenter, config.mapConfig.defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    updateMapMarkers();

    const vesselFilter = document.getElementById('vesselFilter');
    if (vesselFilter) {
        vesselFilter.addEventListener('change', updateMapMarkers);
    }

    const trackToggle = document.getElementById('trackToggle');
    if (trackToggle) {
        trackToggle.addEventListener('change', toggleTracks);
    }
}

function updateMapMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const filter = document.getElementById('vesselFilter');
    const filterValue = filter ? filter.value : 'all';

    const filtered = vessels.filter(v => {
        if (filterValue === 'all') return true;
        if (filterValue === 'critical') return v.threat === 'critical';
        if (filterValue === 'iran') return v.flag === 'Iran' || v.owner.includes('Iran');
        if (filterValue === 'russia') return v.flag === 'Russia' || v.owner.includes('Russian');
        if (filterValue === 'nk') return v.flag === 'North Korea' || v.owner.includes('DPRK');
        return true;
    });

    filtered.forEach(vessel => {
        const color = getThreatColor(vessel.threat);

        const icon = L.divIcon({
            className: 'vessel-marker',
            html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12]
        });

        const marker = L.marker([vessel.lat, vessel.lon], { icon: icon }).addTo(map);

        const popupContent = `
            <div style="min-width:200px;">
                <h3 style="margin:0 0 10px 0;color:#2563eb;">${vessel.name}</h3>
                <p style="margin:5px 0;"><strong>IMO:</strong> ${vessel.imo}</p>
                <p style="margin:5px 0;"><strong>MMSI:</strong> ${vessel.mmsi}</p>
                <p style="margin:5px 0;"><strong>Flag:</strong> ${vessel.flag}</p>
                <p style="margin:5px 0;"><strong>Position:</strong> ${vessel.lat.toFixed(4)}, ${vessel.lon.toFixed(4)}</p>
                <p style="margin:5px 0;"><strong>Speed:</strong> ${vessel.speed} knots</p>
                <p style="margin:5px 0;"><strong>Course:</strong> ${vessel.course}°</p>
                <p style="margin:5px 0;"><strong>Updated:</strong> ${formatTimestamp(vessel.timestamp)}</p>
                <a href="vessels.html?imo=${vessel.imo}" style="display:inline-block;margin-top:10px;color:#2563eb;">View Details →</a>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
    });
}

function toggleTracks() {
    const trackToggle = document.getElementById('trackToggle');
    if (!trackToggle || !trackToggle.checked) {
        tracks.forEach(track => map.removeLayer(track));
        tracks = [];
        return;
    }

    vessels.forEach(vessel => {
        if (!vessel.history || vessel.history.length < 2) return;

        const points = vessel.history.map(h => [h.lat, h.lon]);
        const polyline = L.polyline(points, {
            color: getThreatColor(vessel.threat),
            weight: 2,
            opacity: 0.6
        }).addTo(map);

        tracks.push(polyline);
    });
}