/*
 * One-off: recolor the blue "CALEY" letters in the slogan PNG to neon blue and
 * bake a soft neon glow around only those letters. Cream letters are untouched.
 * Run: node scripts/neon-slogan.cjs
 */
const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "src", "assets", "slogan-call-someone-special.png");
const OUT = path.join(__dirname, "..", "src", "assets", "slogan-call-someone-special-neon.png");

// Deeper electric blue
const NEON = [26, 115, 232];

(async () => {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels === 4
  const recolor = Buffer.from(data); // crisp recolored layer
  const glow = Buffer.alloc(data.length, 0); // blue-letters-only, for the glow

  let blueCount = 0;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 8) continue;

    // Blue letters: blue channel clearly dominant. Cream letters have r,g > b.
    const isBlue = b > r + 6 && b >= g;
    if (isBlue) {
      blueCount++;
      recolor[i] = NEON[0];
      recolor[i + 1] = NEON[1];
      recolor[i + 2] = NEON[2];
      // alpha kept from source -> preserves anti-aliased edges

      glow[i] = NEON[0];
      glow[i + 1] = NEON[1];
      glow[i + 2] = NEON[2];
      glow[i + 3] = a;
    }
  }

  console.log(`Recolored ${blueCount} blue pixels of ${width}x${height}.`);

  const raw = { raw: { width, height, channels } };
  const recolorPng = await sharp(recolor, raw).png().toBuffer();
  const glowPng = await sharp(glow, raw).blur(6).png().toBuffer();

  // glow (stacked twice for intensity) behind the crisp recolored letters
  await sharp(glowPng)
    .composite([{ input: glowPng }, { input: recolorPng }])
    .png()
    .toFile(OUT);

  console.log(`Wrote ${OUT}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
