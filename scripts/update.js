const { cleanDisplayFolder, fetchGitHubStars, fetchWeather, fetchCurrentTime, parseArgs } = require('./util');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

registerFont(path.join(__dirname, 'base', 'fonts', 'Nivea-Bold.otf'), { family: 'NiveaFont' });

const assets = {
    background: path.join(__dirname, 'base', 'background.png'),
    morning: path.join(__dirname, 'base', 'morning.png'),
    noon: path.join(__dirname, 'base', 'noon.png'),
    evening: path.join(__dirname, 'base', 'evening.png'),
    night: path.join(__dirname, 'base', 'night.png'),
    temperature: path.join(__dirname, 'base', 'icons', 'temperature.png'),
    windSpeed: path.join(__dirname, 'base', 'icons', 'wind.png'),
    moldovaFlag: path.join(__dirname, 'base', 'icons', 'moldova.png'),
    githubStarImage: path.join(__dirname, 'base', 'star', 'githubStar.png')
};

async function renderImage() {
    console.log('Starting image rendering process...');

    const canvas = createCanvas(2048, 2738);
    const ctx = canvas.getContext('2d');

    const starcanvas = createCanvas(1536, 1024);
    const starctx = starcanvas.getContext('2d');

    const { public, private } = parseArgs();
    const ct = await fetchCurrentTime();
    const { temperature, windSpeed } = await fetchWeather();
    const totalStars = await fetchGitHubStars('lumijiez');

    const newImageName = 'toshow' + ct.now.getMilliseconds() + '.png';
    const tempImagePath = path.join(__dirname, 'display', 'temp-' + newImageName);
    const outputPath = path.join(__dirname, 'display', newImageName);

    const baseImagePath = (() => {
        switch (true) {
            case (ct.hour >= 6 && ct.hour < 10):
                return assets.morning;
            case (ct.hour >= 10 && ct.hour < 18):
                return assets.noon;
            case (ct.hour >= 18 && ct.hour < 22):
                return assets.evening;
            default:
                return assets.night;
        }})();

    const tempIcon = await loadImage(assets.temperature);
    const windIcon = await loadImage(assets.windSpeed);
    const moldovaFlag = await loadImage(assets.moldovaFlag);
    const starImage = await loadImage(assets.githubStarImage);
    const backgroundImage = await loadImage(baseImagePath);
    
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = '500px NiveaFont';
    ctx.fillText(`${ct.time}`, 50, 450);
    ctx.strokeText(`${ct.time}`, 50, 450);

    ctx.font = '120px NiveaFont';
    ctx.fillText(`${ct.amPmTime}`, 50, 600); 
    ctx.strokeText(`${ct.amPmTime}`, 50, 600);

    ctx.font = '120px NiveaFont';
    ctx.fillText(`${ct.dayOfWeek}`, 50, 710); 
    ctx.strokeText(`${ct.dayOfWeek}`, 50, 710);

    ctx.font = '100px NiveaFont';
    ctx.fillText(`Repositories:`, 50, 910); 
    ctx.strokeText(`Repositories:`, 50, 910);

    let offset = 115;
    ctx.fillStyle = '#6dba3d';
    ctx.fillText(`${public}`, offset + 50, 1030); 
    ctx.strokeText(`${public}`, offset + 50, 1030);

    ctx.fillStyle = 'white';
    ctx.fillText(`/`, offset + 230, 1030); 
    ctx.strokeText(`/`, offset + 230, 1030);

    ctx.fillStyle = '#f8563a';
    ctx.fillText(`${private}`, offset + 350, 1030); 
    ctx.strokeText(`${private}`, offset + 350, 1030);

    ctx.fillStyle = 'white';
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
    ctx.fillText(`Last updated: ${ct.lastUpdated} GMT+3`, 60, canvas.height - 50);
    ctx.strokeText(`Last updated: ${ct.lastUpdated} GMT+3`, 60, canvas.height - 50);

    const flagSize = 110;
    ctx.drawImage(moldovaFlag, canvas.width - flagSize - 110, canvas.height - flagSize - 100, flagSize, flagSize);
    ctx.font = '85px NiveaFont';
    ctx.fillText('Chisinau', canvas.width - flagSize - 510, canvas.height - 130);
    ctx.strokeText(`Chisinau`, canvas.width - flagSize - 510, canvas.height - 130);

    ctx.font = '60px NiveaFont';
    ctx.fillText('Made by @lumijiez', canvas.width - 650, canvas.height - 50);
    ctx.strokeText(`Made by @lumijiez`, canvas.width - 650, canvas.height - 50);

    cleanDisplayFolder();

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

        fs.writeFileSync('README.md', readmeContent, 'utf-8');
        console.log('README.md updated successfully.');
    });

}

renderImage();
