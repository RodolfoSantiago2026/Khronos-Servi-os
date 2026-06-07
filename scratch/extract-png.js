const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'khronos-logo.svg');
const pngPath = path.join(__dirname, '..', 'public', 'khronos-logo.png');

try {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  
  if (match && match[1]) {
    const base64Data = match[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);
    console.log('PNG extracted successfully to public/khronos-logo.png!');
  } else {
    console.error('Could not find base64 image data in SVG.');
  }
} catch (err) {
  console.error('Error reading/writing files:', err);
}
