const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function cleanDisplayFolder() {
    console.log('Cleaning display folder...');
    const displayFolder = path.join(__dirname, 'display');

    try {
        const files = await fs.promises.readdir(displayFolder);
        await Promise.all(files.map(file => fs.promises.unlink(path.join(displayFolder, file))));
        console.log('Display folder clean...');
    } catch (err) {
        console.error('Error cleaning display folder:', err.message);
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    const public = args[0] ? parseFloat(args[0]) : 0;
    const private = args[1] ? parseFloat(args[1]) : 0;

    console.log(`Public: ${public}, Private: ${private}`);
    return { public, private };
}

async function fetchGitHubStars(username) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100`;

    try {
        const repos = (await axios.get(url)).data;
        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        return totalStars;
    } catch (error) {
        console.error('Error fetching GitHub stars:', error.message);
        return 0;
    }
}

async function fetchWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = { latitude: 47.0105, longitude: 28.8638, current_weather: true };

    try {
        const { temperature, windspeed } = (await axios.get(url, { params })).data.current_weather;
        return {
            temperature: temperature + '°C',
            windSpeed: windspeed + ' kmh',
        };
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return {
            temperature: '0',
            windSpeed: '0',
        };
    }
}

function fetchCurrentTime() {
    const now = new Date();

    const hour = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const renderableHours = hour === 24 ? '00' : hour.toString().padStart(2, '0');
    const time = `${renderableHours}:${minutes}`;

    const amPmTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    const lastUpdated = now.toLocaleString();

    return {
        now,
        hour,
        minutes,
        renderableHours,
        time,
        amPmTime,
        dayOfWeek,
        lastUpdated
    };
}


module.exports = {
    cleanDisplayFolder,
    fetchGitHubStars,
    fetchWeather,
    fetchCurrentTime,
    parseArgs
};
