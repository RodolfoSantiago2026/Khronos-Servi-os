const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://grupokhronos.com.br/wp-content/themes/khronos2021/lib/images/logo.svg';
const targetDir = path.join(__dirname, '..', 'public');
const targetPath = path.join(targetDir, 'khronos-logo.svg');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Downloading ${url} to ${targetPath}...`);

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Request failed with status code ${res.statusCode}`);
    return;
  }

  const fileStream = fs.createWriteStream(targetPath);
  res.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Download completed successfully!');
  });
}).on('error', (err) => {
  console.error('Error downloading file:', err);
});
