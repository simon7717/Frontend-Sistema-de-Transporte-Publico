/**
 * Genera environment.deploy.generated.ts desde API_PUBLIC_URL (sin barra final).
 * Uso en CI (Netlify, Cloudflare Pages, etc.): definir API_PUBLIC_URL y ejecutar antes de ng build.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const raw = process.env.API_PUBLIC_URL || '';
const apiUrl = raw.replace(/\/+$/, '');

const out = path.join(__dirname, '..', 'src', 'environments', 'environment.deploy.generated.ts');
const content =
  `// Generado por scripts/write-deploy-env.cjs — no editar a mano\n` +
  `export const environment = {\n  apiUrl: ${JSON.stringify(apiUrl)}\n};\n`;

fs.writeFileSync(out, content, 'utf8');
process.stdout.write(`write-deploy-env: wrote ${path.relative(process.cwd(), out)} (apiUrl length=${apiUrl.length})\n`);
