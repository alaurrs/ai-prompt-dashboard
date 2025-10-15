import { readFileSync, writeFileSync } from 'node:fs';

const apiBase = process.env.API_BASE || 'http://localhost:8080/api';
const src = readFileSync('src/environments/environments.production.template.ts', 'utf8');
const out = src.replace('__API_BASE__', apiBase);
writeFileSync('src/environments/environments.production.ts', out);
console.log('[env] environments.production.ts generated with API_BASE=', apiBase);
