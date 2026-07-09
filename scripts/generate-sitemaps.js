#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.DOMAIN || 'https://hamarabrand.in';
const OUT = path.join(process.cwd(), 'sitemap.xml');

function formatDate(d) {
  return new Date(d).toISOString().split('T')[0];
}

function walk(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      files.push(...walk(full));
    } else if (it.isFile() && it.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function toUrl(filePath) {
  // convert workspace path to site path
  let rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  // remove index.html
  if (rel.endsWith('index.html')) {
    rel = rel.replace(/index.html$/, '');
  }
  if (!rel.startsWith('/')) rel = '/' + rel;
  // ensure no double-slash
  return SITE_URL.replace(/\/$/, '') + rel.replace(/\/index\.html$/,'').replace(/\/$/, '') + (rel.endsWith('/') ? '/' : '');
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'\"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generate() {
  const urls = [];
  // homepage
  urls.push({ loc: SITE_URL + '/', lastmod: formatDate(new Date()), changefreq: 'weekly', priority: 1.0 });

  // include HTML pages under blog/, seo/, keywords/
  const scanDirs = ['blog', 'seo', 'keywords'];
  for (const d of scanDirs) {
    const dir = path.join(process.cwd(), d);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir);
    for (const f of files) {
      const loc = toUrl(f).replace(/\/+$|\/$/,'');
      urls.push({ loc, lastmod: formatDate(fs.statSync(f).mtime), changefreq: 'monthly', priority: 0.8 });
    }
  }

  const xmlEntries = urls.map(u => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries.join('\n')}\n</urlset>`;

  fs.writeFileSync(OUT, xml, 'utf8');
  console.log(`Generated sitemap with ${urls.length} URLs -> ${OUT}`);
}

try {
  generate();
} catch (err) {
  console.error(err);
  process.exit(1);
}
