// This is a development utility to generate placeholder icons
// You should replace these with your actual icons in production

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconColor = '#2d5a27'; // Primary theme color

async function generateIcons() {
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = iconColor;
    ctx.fillRect(0, 0, size, size);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = `${size / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VG', size / 2, size / 2);

    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    const dir = './public/icons';
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(`${dir}/icon-${size}x${size}.png`, buffer);
  }
}

generateIcons().catch(console.error);
