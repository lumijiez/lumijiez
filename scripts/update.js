const { cleanDisplayFolder, fetchGitHubStars, fetchWeather, fetchCurrentTime } = require('./util');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

registerFont(path.join(__dirname, 'base', 'fonts', 'Nivea-Bold.otf'), { family: 'NiveaFont' });

const baseImages = {
    background: path.join(__dirname, 'base', 'background.png'),
    morning: path.join(__dirname, 'base', 'morning.png'),
    noon: path.join(__dirname, 'base', 'noon.png'),
    evening: path.join(__dirname, 'base', 'evening.png'),
    night: path.join(__dirname, 'base', 'night.png'),
    
};

const icons = {
    temperature: path.join(__dirname, 'base', 'icons', 'temperature.png'),
    windSpeed: path.join(__dirname, 'base', 'icons', 'wind.png'),
    moldovaFlag: path.join(__dirname, 'base', 'icons', 'moldova.png')
};

const githubStarImage = path.join(__dirname, 'base', 'star', 'githubStar.png');


function parseArgs() {
    const args = process.argv.slice(2);
    const public = args[0] ? parseFloat(args[0]) : 0;
    const private = args[1] ? parseFloat(args[1]) : 0;

    console.log(`Public: ${public}, Private: ${private}`);
    return { public, private };
}

async function renderImage() {
    console.log('Starting image rendering process...');
    
    const now = await fetchCurrentTime();

    now.setHours(now.getHours() + 3);
    let hours = now.getHours();

    if (hours === 24) hours = '00';
    else hours = hours.toString().padStart(2, '0');
    
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const amPmTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const lastUpdated = now.toLocaleString();

    const { temperature, windSpeed } = await fetchWeather();

    let baseImagePath;

    if (now.getHours() >= 6 && now.getHours() < 10) {
        baseImagePath = baseImages.morning;
    } else if (now.getHours() >= 10 && now.getHours() < 18) {
        baseImagePath = baseImages.noon;
    } else if (now.getHours() >= 18 && now.getHours() < 22) {
        baseImagePath = baseImages.evening;
    } else {
        baseImagePath = baseImages.night;
    }

    const canvas = createCanvas(2048, 2738);
    const ctx = canvas.getContext('2d');

    const backgroundImage = await loadImage(baseImagePath);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const tempIcon = await loadImage(icons.temperature);
    const windIcon = await loadImage(icons.windSpeed);
    const moldovaFlag = await loadImage(icons.moldovaFlag);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '500px NiveaFont';
    ctx.fillText(`${time}`, 50, 450);
    ctx.strokeText(`${time}`, 50, 450);

    ctx.font = '120px NiveaFont';
    ctx.fillText(`${amPmTime}`, 50, 600); 
    ctx.strokeText(`${amPmTime}`, 50, 600);

    ctx.font = '120px NiveaFont';
    ctx.fillText(`${dayOfWeek}`, 50, 710); 
    ctx.strokeText(`${dayOfWeek}`, 50, 710);

    ctx.font = '80px NiveaFont';
    let verticalStart = 90;
    let horizontalStart = 1500;

    ctx.drawImage(tempIcon, horizontalStart, verticalStart, 80, 80);
    ctx.fillText(temperature, horizontalStart + 120, verticalStart + 140 / 2);
    ctx.strokeText(temperature, horizontalStart + 120, verticalStart + 140 / 2);
    verticalStart += 120;

    ctx.drawImage(windIcon, horizontalStart, verticalStart, 80, 80);
    ctx.fillText(windSpeed, horizontalStart + 120, verticalStart + 130 / 2);
    ctx.strokeText(windSpeed, horizontalStart + 120, verticalStart + 130 / 2);
    verticalStart += 120;

    ctx.font = '50px NiveaFont';
    ctx.fillText(`Last updated: ${lastUpdated} GMT+3`, 60, canvas.height - 50);
    ctx.strokeText(`Last updated: ${lastUpdated} GMT+3`, 60, canvas.height - 50);

    const flagSize = 110;
    ctx.drawImage(moldovaFlag, canvas.width - flagSize - 110, canvas.height - flagSize - 100, flagSize, flagSize);
    ctx.font = '85px NiveaFont';
    ctx.fillText('Chisinau', canvas.width - flagSize - 510, canvas.height - 130);
    ctx.strokeText(`Chisinau`, canvas.width - flagSize - 510, canvas.height - 130);

    ctx.font = '60px NiveaFont';
    ctx.fillText('Made by @lumijiez', canvas.width - 650, canvas.height - 50);
    ctx.strokeText(`Made by @lumijiez`, canvas.width - 650, canvas.height - 50);

    console.log('Cleaning display folder...');

    cleanDisplayFolder();

    console.log('Rendering GitHub stars image...');
    const username = 'lumijiez';
    const totalStars = await fetchGitHubStars(username);

    const starcanvas = createCanvas(1536, 1024);
    const starctx = starcanvas.getContext('2d');

    const starImage = await loadImage(githubStarImage);
    starctx.drawImage(starImage, 0, 0, starcanvas.width, starcanvas.height);

    starctx.fillStyle = '#ff8c00'; 
    starctx.strokeStyle = 'black';
    starctx.lineWidth = 5;
    starctx.font = '800px NiveaFont';
    starctx.textAlign = 'center';
    starctx.textBaseline = 'middle';

    starctx.fillText(`${totalStars}`, starcanvas.width / 2, starcanvas.height / 2 + 100);
    starctx.strokeText(`${totalStars}`, starcanvas.width / 2, starcanvas.height / 2 + 100);

    ctx.drawImage(starcanvas, 50, canvas.height - 550, 600, 400);

    const newImageName = 'toshow' + now.getMilliseconds() + '.png';
    const tempImagePath = path.join(__dirname, 'display', 'temp-' + newImageName);
    const outputPath = path.join(__dirname, 'display', newImageName);

    const out = fs.createWriteStream(tempImagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', async () => {
        console.log('Image rendered and saved successfully.');

        await sharp(tempImagePath)
            .toFormat('jpg', { compressionLevel: 9 }) 
            .toFile(outputPath);

        fs.unlink(tempImagePath, (err) => {
            if (err) console.error('Error deleting temporary file:', err.message);
            else console.log('Temporary file deleted.');
        });

        console.log('Compressed image saved successfully.');

        console.log('Updating README.md with new image link...');
        let readmeContent = fs.readFileSync('README.md', 'utf-8');

        let regex = /!\[Dashboard\]\((.*?)\)/;
        readmeContent = readmeContent.replace(regex, `![Dashboard](https://github.com/lumijiez/lumijiez/blob/main/scripts/display/${newImageName})`);

        const {public, private} = parseArgs();

        fs.writeFileSync('README.md', readmeContent, 'utf-8');
        console.log('README.md updated successfully.');
    });

}

renderImage();
