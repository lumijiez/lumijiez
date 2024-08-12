const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function fetchWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude: 47.0105,
        longitude: 28.8638,
        hourly: 'temperature_2m'
    };

    try {
        const response = await axios.get(url, { params });
        const currentTemperature = response.data.hourly.temperature_2m[0];  
        return currentTemperature;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return 'unknown';
    }
}


async function updateReadme() {
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const temperature = await fetchWeather();
    const badgeContent = `![Time](https://img.shields.io/badge/Time-${encodeURIComponent(time)}-blue) ![Temperature](https://img.shields.io/badge/Temperature-${temperature}°C-red)`;
    const readmePath = path.join(__dirname, '../README.md');

    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    const updatedReadmeContent = readmeContent.replace(/!\[Time\]\(.*?\)/, badgeContent);

    fs.writeFileSync(readmePath, updatedReadmeContent);
}

updateReadme();
