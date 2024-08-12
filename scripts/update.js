const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

async function fetchWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude: 47.0105, 
        longitude: 28.8638, 
        current_weather: true
    };

    try {
        const response = await axios.get(url, { params });
        const currentTemperature = response.data.current_weather.temperature;
        return currentTemperature;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return 'unknown';
    }
}

async function updateReadme() {
    const time = moment().tz('Europe/Chisinau').format('HH:mm');
    const temperature = await fetchWeather();
    const lastUpdated = moment().tz('Europe/Chisinau').format('YYYY-MM-DD HH:mm');
    
    const badgeContent = `![Time](https://img.shields.io/badge/Time-${encodeURIComponent(time)}-blue) ![Temperature](https://img.shields.io/badge/Temperature-${temperature}°C-red)<br>`;

    const readmePath = path.join(__dirname, '../README.md');
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    const timeBadgePattern = /!\[Time\]\(https:\/\/img.shields.io\/badge\/Time-.*?-blue\)<br>/;
    const tempBadgePattern = /!\[Temperature\]\(https:\/\/img.shields.io\/badge\/Temperature-.*?-red\)<br>/;
    const lastUpdatedPattern = /<br>Last updated at .* GMT\+3/;

    readmeContent = readmeContent.replace(timeBadgePattern, `![Time](https://img.shields.io/badge/Time-${encodeURIComponent(time)}-blue)<br>`);
    readmeContent = readmeContent.replace(tempBadgePattern, `![Temperature](https://img.shields.io/badge/Temperature-${temperature}°C-red)<br>`);

    if (lastUpdatedPattern.test(readmeContent)) {
        readmeContent = readmeContent.replace(lastUpdatedPattern, `<br>Last updated at ${lastUpdated} GMT+3`);
    } else {
        readmeContent += `<br>Last updated at ${lastUpdated} GMT+3`;
    }

    fs.writeFileSync(readmePath, readmeContent);
}

updateReadme();
