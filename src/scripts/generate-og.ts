// scripts/generate-og.ts
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const canvas = createCanvas(1200, 630);
const ctx    = canvas.getContext('2d');

// Background
ctx.fillStyle = '#16a34a';
ctx.fillRect(0, 0, 1200, 630);

// Dark overlay bottom half
ctx.fillStyle = '#111827';
ctx.fillRect(0, 315, 1200, 315);

// Title
ctx.fillStyle = '#ffffff';
ctx.font      = 'bold 72px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('SpendLens', 600, 200);

// Subtitle
ctx.font      = '36px sans-serif';
ctx.fillStyle = '#bbf7d0';
ctx.fillText('Free AI Spend Audit', 600, 270);

// Bottom text
ctx.font      = '28px sans-serif';
ctx.fillStyle = '#9ca3af';
ctx.fillText('Find out where your team is overspending', 600, 420);
ctx.fillText('on AI tools — in 2 minutes', 600, 465);

// credex.rocks
ctx.font      = '22px sans-serif';
ctx.fillStyle = '#6b7280';
ctx.fillText('by Raamanjal', 600, 570);

const buffer = canvas.toBuffer('image/png');
writeFileSync('public/og-image.png', buffer);
console.log('OG image generated at public/og-image.png');