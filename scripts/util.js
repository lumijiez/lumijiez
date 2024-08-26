const fs = require('fs');
const path = require('path');
const axios = require('axios');

function cleanDisplayFolder() {
    const displayFolder = path.join(__dirname, 'display');

    fs.readdir(displayFolder, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err.message);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(displayFolder, file);
            fs.unlink(filePath, err => {
                if (err) {
                    console.error('Error deleting file:', err.message);
                }
            });
        });
    });
}

async function fetchGitHubStars(username) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100`;

    try {
        const response = await axios.get(url);
        const repos = response.data;

        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        return totalStars;
    } catch (error) {
        console.error('Error fetching GitHub stars:', error.message);
        return 0;
    }
}

async function fetchWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude: 47.0105,
        longitude: 28.8638,
        current_weather: true 
    };

    try {
        const response = await axios.get(url, { params });
        const { temperature, windspeed } = response.data.current_weather;
        return {
            temperature: temperature + '°C',
            windSpeed: windspeed + ' km/h',
        };
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return {
            temperature: 'unknown',
            windSpeed: 'unknown',
        };
    }
}

async function fetchCurrentTime() {
    const url = 'http://worldtimeapi.org/api/timezone/Europe/Chisinau';

    try {
        const response = await axios.get(url);
        const { datetime, timezone } = response.data;
        return new Date(datetime);
    } catch (error) {
        console.error('Error fetching current time:', error.message);
        return new Date(); 
    }
}

module.exports = {
    cleanDisplayFolder,
    fetchGitHubStars,
    fetchWeather,
    fetchCurrentTime
};
