let updateTimer = null;

async function updateAISData() {
    console.log('Starting AIS data update...');

    for (let vessel of vessels) {
        const randomLat = vessel.lat + (Math.random() - 0.5) * 0.5;
        const randomLon = vessel.lon + (Math.random() - 0.5) * 0.5;
        const randomSpeed = Math.max(0, vessel.speed + (Math.random() - 0.5) * 2);
        const randomCourse = (vessel.course + Math.random() * 20 - 10 + 360) % 360;

        vessel.lat = parseFloat(randomLat.toFixed(4));
        vessel.lon = parseFloat(randomLon.toFixed(4));
        vessel.speed = parseFloat(randomSpeed.toFixed(1));
        vessel.course = Math.round(randomCourse);
        vessel.timestamp = new Date().toISOString();

        if (!vessel.history) vessel.history = [];
        vessel.history.push({
            lat: vessel.lat,
            lon: vessel.lon,
            speed: vessel.speed,
            course: vessel.course,
            timestamp: vessel.timestamp
        });

        if (vessel.history.length > 48) {
            vessel.history = vessel.history.slice(-48);
        }
    }

    saveVesselsToStorage();
    console.log('AIS data updated for ' + vessels.length + ' vessels');
    return vessels;
}

function startAutoUpdate() {
    if (updateTimer) clearInterval(updateTimer);

    const interval = config ? config.updateInterval : 10800000;

    updateTimer = setInterval(async () => {
        console.log('Auto-update triggered');
        await updateAISData();

        if (typeof populateDashboard === 'function') populateDashboard();
        if (typeof updateMapMarkers === 'function') updateMapMarkers();
        if (typeof updateCharts === 'function') updateCharts();
    }, interval);

    console.log('Auto-update enabled: every ' + (interval / 1000 / 60) + ' minutes');
}

async function fetchFromMarineTraffic(mmsi) {
    try {
        const url = `https://services.marinetraffic.com/api/exportvessel/v:8/period:daily/days:2/mmsi:${mmsi}/protocol:json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API unavailable');
        return await response.json();
    } catch (error) {
        console.warn('MarineTraffic API not accessible, using simulated data');
        return null;
    }
}