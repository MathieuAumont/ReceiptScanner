const sharp = require('sharp');
const fs = require('fs');

async function convertIcons() {
  const svg = fs.readFileSync('./assets/temp-icon.svg');
  
  // Create icon.png (1024x1024)
  await sharp(svg)
    .resize(1024, 1024)
    .png()
    .toFile('./assets/icon.png');

  // Create adaptive-icon.png (1024x1024)
  await sharp(svg)
    .resize(1024, 1024)
    .png()
    .toFile('./assets/adaptive-icon.png');

  // Create splash.png (1242x2436)
  await sharp(svg)
    .resize(1242, 2436, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 }
    })
    .png()
    .toFile('./assets/splash.png');

  // Create favicon.png (32x32)
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile('./assets/favicon.png');

  console.log('All icons generated successfully!');
}

convertIcons().catch(console.error); 