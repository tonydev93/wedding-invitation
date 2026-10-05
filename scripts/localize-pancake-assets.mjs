import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const indexPath = path.join(projectRoot, 'index.html');
const outputDirectory = path.join(projectRoot, 'assets', 'pancake');
const pancakeUrlPattern = /https:\/\/(?:content|statics)\.pancake\.vn\/[^"'<>\s\\)]+/g;

const extensionFor = (url, contentType) => {
  const pathnameExtension = new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1];
  if (pathnameExtension) return pathnameExtension.toLowerCase();

  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'audio/mpeg': 'mp3',
    'font/ttf': 'ttf',
    'font/otf': 'otf',
  }[contentType?.split(';')[0]] ?? 'bin';
};

const extractUrl = (rawUrl) => rawUrl.replace(/(?:&quot;|&amp;|;)+$/g, '');

const indexHtml = await (await import('node:fs/promises')).readFile(indexPath, 'utf8');
const rawUrls = [...new Set(indexHtml.match(pancakeUrlPattern) ?? [])];

await mkdir(outputDirectory, { recursive: true });

const localized = new Map();
for (const rawUrl of rawUrls) {
  const url = extractUrl(rawUrl);
  if (!localized.has(url)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);

    const extension = extensionFor(url, response.headers.get('content-type'));
    const name = `${createHash('sha256').update(url).digest('hex').slice(0, 20)}.${extension}`;
    await writeFile(path.join(outputDirectory, name), Buffer.from(await response.arrayBuffer()));
    localized.set(url, `./assets/pancake/${name}`);
  }
}

const rewritten = indexHtml.replace(pancakeUrlPattern, (rawUrl) => {
  const url = extractUrl(rawUrl);
  return rawUrl.replace(url, localized.get(url));
});

await writeFile(indexPath, rewritten);
console.log(`Localized ${localized.size} Pancake assets.`);
