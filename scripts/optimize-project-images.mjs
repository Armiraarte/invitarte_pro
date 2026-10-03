import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.github',
  '.codex-tmp',
  'dist',
  'node_modules'
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
]);

const CACHE_FILE_NAME = '.invitarte-image-cache.json';
const MAX_DIMENSION = 2200;
const MIN_BYTES_TO_PROCESS = 48 * 1024;

const projectPath = process.argv[2] ? path.resolve(process.argv[2]) : '';

if (!projectPath) {
  console.error('Uso: node scripts/optimize-project-images.mjs <project-path>');
  process.exit(1);
}

const cachePath = path.join(projectPath, CACHE_FILE_NAME);

const readJsonFile = async (filePath) => {
  try {
    const contents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(contents);
  } catch {
    return {};
  }
};

const ensureDirectory = async (directoryPath) => {
  await fs.mkdir(directoryPath, { recursive: true });
};

const walkProject = async (directoryPath, files = []) => {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.has(entry.name)) {
        await walkProject(path.join(directoryPath, entry.name), files);
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      continue;
    }

    files.push(path.join(directoryPath, entry.name));
  }

  return files;
};

const buildFileSignature = (stat) => `${stat.size}:${Math.round(stat.mtimeMs)}`;

const encodeImage = (pipeline, extension) => {
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return pipeline.jpeg({
        quality: 82,
        mozjpeg: true,
        progressive: true
      });
    case '.png':
      return pipeline.png({
        compressionLevel: 9,
        palette: true,
        quality: 82,
        effort: 8
      });
    case '.webp':
      return pipeline.webp({
        quality: 82,
        effort: 6
      });
    default:
      return pipeline;
  }
};

const optimizeImage = async (absolutePath, cache) => {
  const relativePath = path.relative(projectPath, absolutePath).replaceAll('\\', '/');
  const extension = path.extname(absolutePath).toLowerCase();
  const beforeStat = await fs.stat(absolutePath);
  const cachedEntry = cache[relativePath];
  const currentSignature = buildFileSignature(beforeStat);

  if (cachedEntry?.signature === currentSignature) {
    return { optimized: false, skipped: true, before: beforeStat.size, after: beforeStat.size };
  }

  const metadata = await sharp(absolutePath).metadata();
  if ((metadata.pages ?? 1) > 1) {
    cache[relativePath] = { signature: currentSignature };
    return { optimized: false, skipped: true, before: beforeStat.size, after: beforeStat.size };
  }

  const requiresResize = (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;
  if (!requiresResize && beforeStat.size < MIN_BYTES_TO_PROCESS) {
    cache[relativePath] = { signature: currentSignature };
    return { optimized: false, skipped: true, before: beforeStat.size, after: beforeStat.size };
  }

  const temporaryPath = `${absolutePath}.invitarte-tmp`;
  const pipeline = sharp(absolutePath).rotate().resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true
  });

  await encodeImage(pipeline, extension).toFile(temporaryPath);

  const afterStat = await fs.stat(temporaryPath);
  const shouldKeepOriginal = !requiresResize && afterStat.size >= beforeStat.size * 0.99;

  if (shouldKeepOriginal) {
    await fs.unlink(temporaryPath);
    cache[relativePath] = { signature: currentSignature };
    return { optimized: false, skipped: true, before: beforeStat.size, after: beforeStat.size };
  }

  await fs.copyFile(temporaryPath, absolutePath);
  await fs.unlink(temporaryPath);

  const optimizedStat = await fs.stat(absolutePath);
  cache[relativePath] = {
    signature: buildFileSignature(optimizedStat)
  };

  return { optimized: true, skipped: false, before: beforeStat.size, after: optimizedStat.size };
};

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

await ensureDirectory(projectPath);

const cache = await readJsonFile(cachePath);
const imageFiles = await walkProject(projectPath);

let optimizedCount = 0;
let skippedCount = 0;
let beforeBytes = 0;
let afterBytes = 0;

for (const absolutePath of imageFiles) {
  try {
    const result = await optimizeImage(absolutePath, cache);
    beforeBytes += result.before;
    afterBytes += result.after;

    if (result.optimized) {
      optimizedCount += 1;
      console.log(`[optimized] ${path.relative(projectPath, absolutePath)} ${formatKb(result.before)} -> ${formatKb(result.after)}`);
    } else if (result.skipped) {
      skippedCount += 1;
    }
  } catch (error) {
    console.warn(`[skip] ${path.relative(projectPath, absolutePath)}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');

console.log(
  `[summary] optimized=${optimizedCount} skipped=${skippedCount} total=${imageFiles.length} size=${formatKb(beforeBytes)} -> ${formatKb(afterBytes)}`
);
