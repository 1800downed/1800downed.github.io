let config = null;
let vessels = [];
let darkMode = localStorage.getItem('darkMode') === 'true';

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        vessels = loadVesselsFromStorage() || config.vessels;
        return true;
    } catch (error) {
        alert('Error loading configuration: ' + error.message);
        return false;
    }
}

function loadVesselsFromStorage() {
    const stored = localStorage.getItem('vessels');
    return stored ? JSON.parse(stored) : null;
}

function saveVesselsToStorage() {
    localStorage.setItem('vessels', JSON.stringify(vessels));
    localStorage.setItem('lastUpdate', new Date().toISOString());
}

function applyDarkMode() {
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyDarkMode();
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
    }) + ' UTC';
}

function getVesselById(id) {
    return vessels.find(v => v.imo === id || v.mmsi === id);
}

function getThreatColor(threat) {
    const colors = {
        critical: '#ef4444',
        high: '#f59e0b',
        medium: '#3b82f6',
        monitor: '#10b981'
    };
    return colors[threat] || colors.monitor;
}

async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Updating...';
    }

    await updateAISData();

    if (typeof populateDashboard === 'function') populateDashboard();
    if (typeof initMap === 'function') initMap();
    if (typeof populateVesselTable === 'function') populateVesselTable();

    if (btn) {
        btn.disabled = false;
        btn.textContent = '↻ Refresh';
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    applyDarkMode();

    const darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }

    await loadConfig();

    if (typeof populateDashboard === 'function') populateDashboard();
    if (typeof initMap === 'function') initMap();
    if (typeof populateVesselTable === 'function') populateVesselTable();
    if (typeof initCharts === 'function') initCharts();

    startAutoUpdate();
});

function populateDashboard() {
    const totalEl = document.getElementById('totalVessels');
    const activeEl = document.getElementById('activeVessels');
    const countriesEl = document.getElementById('totalCountries');
    const updateEl = document.getElementById('lastUpdate');

    if (totalEl) totalEl.textContent = vessels.length;

    if (activeEl) {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const active = vessels.filter(v => new Date(v.timestamp) > threeHoursAgo);
        activeEl.textContent = active.length;
    }

    if (countriesEl) {
        const countries = new Set(vessels.map(v => v.flag));
        countriesEl.textContent = countries.size;
    }

    if (updateEl) {
        const lastUpdate = localStorage.getItem('lastUpdate');
        if (lastUpdate) {
            const date = new Date(lastUpdate);
            updateEl.textContent = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'UTC'
            });
        }
    }

    populateVesselTable();
}

function populateVesselTable() {
    const tbody = document.getElementById('vesselTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const searchBox = document.getElementById('searchBox');
    const searchTerm = searchBox ? searchBox.value.toLowerCase() : '';

    const filtered = vessels.filter(v => {
        if (!searchTerm) return true;
        return v.name.toLowerCase().includes(searchTerm) ||
               v.imo.includes(searchTerm) ||
               v.mmsi.includes(searchTerm) ||
               v.flag.toLowerCase().includes(searchTerm);
    });

    filtered.slice(0, 20).forEach(vessel => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${vessel.name}</strong></td>
            <td>${vessel.imo}</td>
            <td>${vessel.mmsi}</td>
            <td>${vessel.flag}</td>
            <td>${vessel.lat.toFixed(4)}, ${vessel.lon.toFixed(4)}</td>
            <td>${vessel.speed} kn</td>
            <td>${vessel.course}°</td>
            <td>${formatTimestamp(vessel.timestamp)}</td>
        `;
        row.style.cursor = 'pointer';
        row.onclick = () => window.location.href = `vessels.html?imo=${vessel.imo}`;
    });
}

if (document.getElementById('searchBox')) {
    document.getElementById('searchBox').addEventListener('input', populateVesselTable);
}