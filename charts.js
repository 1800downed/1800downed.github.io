let speedChart = null;
let courseChart = null;

function initCharts() {
    const urlParams = new URLSearchParams(window.location.search);
    const imo = urlParams.get('imo');

    if (!imo) {
        populateVesselSelect();
        return;
    }

    const vessel = getVesselById(imo);
    if (!vessel) return;

    displayVesselDetails(vessel);
    createCharts(vessel);

    if (typeof initMap === 'function') {
        setTimeout(() => {
            initMap();
            if (map) {
                map.setView([vessel.lat, vessel.lon], 6);
                const marker = L.marker([vessel.lat, vessel.lon]).addTo(map);
                marker.bindPopup(`<strong>${vessel.name}</strong><br>Current Position`).openPopup();
            }
        }, 100);
    }
}

function populateVesselSelect() {
    const select = document.getElementById('vesselSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select a vessel...</option>';

    vessels.forEach(vessel => {
        const option = document.createElement('option');
        option.value = vessel.imo;
        option.textContent = `${vessel.name} (${vessel.imo})`;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        if (e.target.value) {
            window.location.href = `vessels.html?imo=${e.target.value}`;
        }
    });
}

function displayVesselDetails(vessel) {
    document.getElementById('vName').textContent = vessel.name;
    document.getElementById('vIMO').textContent = vessel.imo;
    document.getElementById('vMMSI').textContent = vessel.mmsi;
    document.getElementById('vFlag').textContent = vessel.flag;
    document.getElementById('vOwner').textContent = vessel.owner;
    document.getElementById('vLat').textContent = vessel.lat.toFixed(4);
    document.getElementById('vLon').textContent = vessel.lon.toFixed(4);
    document.getElementById('vSpeed').textContent = vessel.speed;
    document.getElementById('vCourse').textContent = vessel.course;
    document.getElementById('vTime').textContent = formatTimestamp(vessel.timestamp);

    const select = document.getElementById('vesselSelect');
    if (select) select.value = vessel.imo;
}

function createCharts(vessel) {
    const history = vessel.history || generateMockHistory(vessel);

    const labels = history.map(h => {
        const date = new Date(h.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const speedData = history.map(h => h.speed);
    const courseData = history.map(h => h.course);

    const speedCtx = document.getElementById('speedChart');
    if (speedCtx && speedChart) speedChart.destroy();
    if (speedCtx) {
        speedChart = new Chart(speedCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Speed (knots)',
                    data: speedData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Knots' }
                    }
                }
            }
        });
    }

    const courseCtx = document.getElementById('courseChart');
    if (courseCtx && courseChart) courseChart.destroy();
    if (courseCtx) {
        courseChart = new Chart(courseCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Course (degrees)',
                    data: courseData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 360,
                        title: { display: true, text: 'Degrees' }
                    }
                }
            }
        });
    }
}

function generateMockHistory(vessel) {
    const history = [];
    for (let i = 48; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
        history.push({
            lat: vessel.lat + (Math.random() - 0.5) * 0.1,
            lon: vessel.lon + (Math.random() - 0.5) * 0.1,
            speed: Math.max(0, vessel.speed + (Math.random() - 0.5) * 3),
            course: (vessel.course + (Math.random() - 0.5) * 30 + 360) % 360,
            timestamp: timestamp.toISOString()
        });
    }
    return history;
}