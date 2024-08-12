const fs = require('fs');
const path = require('path');

const now = new Date();
const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

const gmtPlus3Time = new Date(utcTime + 3 * 3600000);
const time = gmtPlus3Time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const badgeContent = `![Time](https://img.shields.io/badge/Time-${encodeURIComponent(time)}-blue)`;

const readmePath = path.join(__dirname, '../README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

const timeBadgeRegex = /!\[Time\]\(https:\/\/img.shields.io\/badge\/Time-[^\)]+\)/;
if (timeBadgeRegex.test(readmeContent)) {
  readmeContent = readmeContent.replace(timeBadgeRegex, badgeContent);
} else {
  const badgeInsertionPoint = '## 🕒 Current Time\n\n';
  readmeContent = readmeContent.replace(badgeInsertionPoint, `${badgeInsertionPoint}${badgeContent}\n`);
}

fs.writeFileSync(readmePath, readmeContent);

console.log('README.md updated with time badge:', time);
