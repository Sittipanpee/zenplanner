const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

async function generateIcons() {
  // Create a simple Zen-style icon (green circle with Z)
  const svgIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="100" fill="#6B8E6B"/>
      <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">Z</text>
    </svg>
  `;

  const publicDir = path.join(__dirname, '../public');

  for (const size of sizes) {
    const filename = `icon-${size}.png`;
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, filename));
    console.log(`Created ${filename}`);
  }

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
