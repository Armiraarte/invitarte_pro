import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** @type {{ input: string; maxWidth: number; quality?: number }[]} */
const OPTIMIZE_TARGETS = [
  { input: 'components/images/pet/logo.png', maxWidth: 480, quality: 88 },
  { input: 'components/images/pet/logo_blanco.png', maxWidth: 480, quality: 88 },
  { input: 'components/images/pet/logo_negro.png', maxWidth: 480, quality: 88 },
  { input: 'components/images/logo_armirarte.png', maxWidth: 256, quality: 90 },
  { input: 'components/images/pet/pet_volteado_cursor_visual.png', maxWidth: 128, quality: 90 },
  { input: 'components/images/mockup/mockup1.png', maxWidth: 960, quality: 84 },
  { input: 'components/images/mockup/mockup2.png', maxWidth: 960, quality: 84 },
  { input: 'components/images/mockup/mockup3.png', maxWidth: 960, quality: 84 },
  { input: 'components/images/paquetes/paquete1.jpg', maxWidth: 1280, quality: 80 },
  { input: 'components/images/paquetes/paquete2.jpg', maxWidth: 1280, quality: 78 },
  { input: 'components/images/paquetes/paquete3.jpg', maxWidth: 1280, quality: 80 },
  { input: 'components/images/beneficios/tiempo.jpg', maxWidth: 960, quality: 82 },
  { input: 'components/images/beneficios/ambiente.jpg', maxWidth: 960, quality: 82 },
  { input: 'components/images/beneficios/difusion.jpg', maxWidth: 960, quality: 82 },
  { input: 'components/images/beneficios/innovacion.jpg', maxWidth: 960, quality: 82 },
  { input: 'components/images/beneficios/invitados.jpg', maxWidth: 960, quality: 80 },
  { input: 'components/images/Nueva carpeta/fondo3.jpg', maxWidth: 1920, quality: 82 },
  { input: 'components/images/Nueva carpeta/fondo5.jpg', maxWidth: 1600, quality: 82 }
];

const REMOVE_AFTER_WEBP = [
  ...OPTIMIZE_TARGETS.map((target) => target.input),
  'components/images/mockup/mockup1.png',
  'components/images/mockup/mockup2.png',
  'components/images/mockup/mockup3.png'
];

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const optimizeOne = async ({ input, maxWidth, quality = 82 }) => {
  const sourcePath = path.join(root, input);
  const outputPath = sourcePath.replace(/\.(png|jpe?g)$/i, '.webp');

  try {
    await fs.access(sourcePath);
  } catch {
    console.warn(`[skip] No existe: ${input}`);
    return null;
  }

  const before = (await fs.stat(sourcePath)).size;
  const pipeline = sharp(sourcePath).rotate().resize({
    width: maxWidth,
    withoutEnlargement: true,
    fit: 'inside'
  });

  await pipeline.webp({ quality, effort: 6, smartSubsample: true }).toFile(outputPath);

  const after = (await fs.stat(outputPath)).size;
  console.log(`[ok] ${path.basename(outputPath)}  ${formatKb(before)} -> ${formatKb(after)}`);
  return outputPath;
};

const removeIfExists = async (relativePath) => {
  const absolutePath = path.join(root, relativePath);
  try {
    await fs.unlink(absolutePath);
    console.log(`[del] ${relativePath}`);
  } catch {
    // already removed
  }
};

console.log('Optimizando imagenes del landing...\n');

for (const target of OPTIMIZE_TARGETS) {
  await optimizeOne(target);
}

console.log('\nEliminando originales y duplicados...\n');

for (const relativePath of REMOVE_AFTER_WEBP) {
  await removeIfExists(relativePath);
}

console.log('\nListo.');
