const fs = require('fs');
const path = require('path');

const now = new Date();
const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

const gmtPlus3Time = new Date(utcTime + 3 * 3600000);
const time = gmtPlus3Time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const badgeContent = `![Time](https://img.shields.io/badge/Time-${encodeURIComponent(time)}-blue)`;

const badgePath = path.join(__dirname, '../time_badge.md');
fs.writeFileSync(badgePath, badgeContent);

console.log('Badge updated with time:', time);
