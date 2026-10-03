import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const stockDir = path.join(root, 'components/images/stock');

/** @type {{ name: string; url: string; maxWidth: number }[]} */
const STOCK_SOURCES = [
  {
    name: 'portada-principal',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'datos-evento',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'mapa-ubicacion',
    url: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'cuenta-regresiva',
    url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'ambiente-vestimenta',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'agregar-calendario',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'pricing-hero',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1280&q=80',
    maxWidth: 1280
  },
  {
    name: 'pricing-support',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  },
  {
    name: 'process-support',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=960&q=80',
    maxWidth: 960
  }
];

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

await fs.mkdir(stockDir, { recursive: true });

console.log('Descargando imagenes stock y generando WebP...\n');

for (const { name, url, maxWidth } of STOCK_SOURCES) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo descargar ${name}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outputPath = path.join(stockDir, `${name}.webp`);

  await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  const after = (await fs.stat(outputPath)).size;
  console.log(`[ok] ${name}.webp  ${formatKb(after)}`);
}

console.log('\nListo. Actualiza control_images.ts si aun no apunta a ./components/images/stock/*.webp');
