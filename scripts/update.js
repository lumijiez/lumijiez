const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

registerFont(path.join(__dirname, 'base', 'fonts', 'Nivea-Bold.otf'), { family: 'CustomFont' });

const baseImages = {
    morning: path.join(__dirname, 'base', 'morning.png'),
    noon: path.join(__dirname, 'base', 'noon.png'),
    evening: path.join(__dirname, 'base', 'evening.png'),
    night: path.join(__dirname, 'base', 'night.png')
};

const icons = {
    temperature: path.join(__dirname, 'base', 'icons', 'thermometer.png'),
    windSpeed: path.join(__dirname, 'base', 'icons', 'wind.png'),
    precipitation: path.join(__dirname, 'base', 'icons', 'precipitation.png'),
    moldovaFlag: path.join(__dirname, 'base', 'icons', 'moldova.png')
};

async function fetchWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude: 47.0105,
        longitude: 28.8638,
        current_weather: true,
        hourly: 'temperature_2m,precipitation,wind_speed_10m'
    };

    try {
        const response = await axios.get(url, { params });
        const { temperature_2m, wind_speed_10m, precipitation } = response.data.hourly;
        return {
            temperature: temperature_2m[0] + '°C',
            windSpeed: wind_speed_10m[0] + ' km/h',
            precipitation: precipitation[0] + ' mm'
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            temperature: 'unknown',
            windSpeed: 'unknown',
            precipitation: 'unknown'
        };
    }
}

async function fetchCurrentTime() {
    const url = 'http://worldtimeapi.org/api/timezone/Europe/Chisinau';

    try {
        const response = await axios.get(url);
        const { datetime } = response.data;
        return new Date(datetime);
    } catch (error) {
        console.error('Error fetching current time:', error);
        return new Date(); // Fallback to current local time
    }
}

async function renderImage() {
    const now = await fetchCurrentTime();
    const time = now.toISOString().substr(11, 5); // HH:mm
    const amPmTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const lastUpdated = now.toISOString().substr(0, 19).replace('T', ' ');

    const { temperature, windSpeed, precipitation } = await fetchWeather();

    let baseImagePath;

    if (now.getHours() >= 8 && now.getHours() < 12) {
        baseImagePath = baseImages.morning;
    } else if (now.getHours() >= 12 && now.getHours() < 18) {
        baseImagePath = baseImages.noon;
    } else if (now.getHours() >= 18 && now.getHours() < 21) {
        baseImagePath = baseImages.evening;
    } else {
        baseImagePath = baseImages.night;
    }

    const canvas = createCanvas(2048, 1024);
    const ctx = canvas.getContext('2d');

    const baseImage = await loadImage(baseImagePath);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    const tempIcon = await loadImage(icons.temperature);
    const windIcon = await loadImage(icons.windSpeed);
    const precipIcon = await loadImage(icons.precipitation);
    const moldovaFlag = await loadImage(icons.moldovaFlag);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '350px CustomFont';
    ctx.fillText(`${time}`, 35, 300);
    ctx.strokeText(`${time}`, 35, 300);

    ctx.font = '90px CustomFont';
    ctx.fillText(`${amPmTime}`, 50, 440); 
    ctx.strokeText(`${amPmTime}`, 50, 440);

    ctx.font = '90px CustomFont';
    ctx.fillText(`-`, 480, 440); 
    ctx.strokeText(`-`, 480, 440);

    ctx.font = '90px CustomFont';
    ctx.fillText(`${dayOfWeek}`, 550, 440); 
    ctx.strokeText(`${dayOfWeek}`, 550, 440);

    ctx.font = '80px CustomFont';
    let verticalStart = 50;
    let horizontalStart = 1550;

    ctx.drawImage(tempIcon, horizontalStart, verticalStart, 80, 100);
    ctx.fillText(temperature, horizontalStart + 120, verticalStart + 160 / 2);
    ctx.strokeText(temperature, horizontalStart + 120, verticalStart + 160 / 2);
    verticalStart += 120;

    ctx.drawImage(windIcon, horizontalStart, verticalStart, 80, 80);
    ctx.fillText(windSpeed, horizontalStart + 120, verticalStart + 130 / 2);
    ctx.strokeText(windSpeed, horizontalStart + 120, verticalStart + 130 / 2);
    verticalStart += 120;

    ctx.drawImage(precipIcon, horizontalStart, verticalStart, 80, 80);
    ctx.fillText(precipitation, horizontalStart + 120, verticalStart + 100 / 2);
    ctx.strokeText(precipitation, horizontalStart + 120, verticalStart + 100 / 2);

    ctx.font = '30px CustomFont';
    ctx.fillText(`Last updated: ${lastUpdated} GMT+3`, 20, canvas.height - 20);
    ctx.strokeText(`Last updated: ${lastUpdated} GMT+3`, 20, canvas.height - 20);

    const flagSize = 110;
    ctx.drawImage(moldovaFlag, canvas.width - flagSize - 50, canvas.height - flagSize - 70, flagSize, flagSize);
    ctx.font = '70px CustomFont';
    ctx.fillText('Chisinau', canvas.width - flagSize - 400, canvas.height - 100);
    ctx.strokeText(`Chisinau`, canvas.width - flagSize - 400, canvas.height - 100);

    ctx.font = '40px CustomFont';
    ctx.fillText('Made by @lumijiez', canvas.width - 470, canvas.height - 20);
    ctx.strokeText(`Made by @lumijiez`, canvas.width - 470, canvas.height - 20);

    const outputPath = path.join(__dirname, 'display', 'toshow.png');
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
        console.log('The image was created successfully!');
    });
}

renderImage();
