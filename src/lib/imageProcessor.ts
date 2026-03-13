import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export async function addWatermarkToImage(imagePath: string, watermarkText: string) {
  const absolutePath = path.join(process.cwd(), "public", imagePath);
  const imageBuffer = await fs.readFile(absolutePath);
  const metadata = await sharp(imageBuffer).metadata();

  const width = metadata.width || 1000;
  const height = metadata.height || 1500;

  const svgImage = `
    <svg width="${width}" height="${height}">
      <style>
        .title { fill: white; font-size: ${Math.floor(width / 20)}px; font-weight: bold; opacity: 0.7; }
      </style>
      <text x="50%" y="95%" text-anchor="middle" class="title">${watermarkText}</text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svgImage);

  const watermarkedImage = await sharp(imageBuffer)
    .composite([{ input: svgBuffer, top: 0, left: 0 }])
    .toBuffer();

  await fs.writeFile(absolutePath, watermarkedImage);
}

export async function cleanupOldPins(days = 7) {
  const publicDir = path.join(process.cwd(), "public", "pins");
  try {
    const files = await fs.readdir(publicDir);
    const now = Date.now();
    const expiry = days * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(publicDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtimeMs > expiry) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}
