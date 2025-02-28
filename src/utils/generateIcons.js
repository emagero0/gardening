// This is a development utility to generate placeholder icons
// You should replace these with your actual icons in production

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconColor = '#2d5a27'; // Primary theme color

async function generateIcons() {
  try {
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
      const dir = join(__dirname, '../../public/icons');
      
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, `icon-${size}x${size}.png`), buffer);
      console.log(`Generated icon-${size}x${size}.png`);
    }
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
