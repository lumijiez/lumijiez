const fs = require('fs');

function updateTimeBadge() {
    const currentTime = new Date().toLocaleString();
    const badgeContent = `![Time](https://img.shields.io/badge/Time-${encodeURIComponent(currentTime)}-blue)`;

    fs.writeFileSync('time_badge.md', badgeContent);
}

updateTimeBadge();
