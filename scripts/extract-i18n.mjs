/**
 * Trích mọi chuỗi tiếng Việt trong `src/**` vào `messages/vi.json` (key = chính câu đó).
 * Chạy lại sau khi thêm màn hình mới: `node scripts/extract-i18n.mjs`
 * `messages/en.json` KHÔNG bị ghi đè (bản dịch do người/agent điền).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const LITERAL = /(?<![A-Za-z0-9_])'([^'\n]{2,300})'|(?<![A-Za-z0-9_])"([^"\n]{2,300})"/g;
const SKIP_DIRS = new Set(['node_modules', '.next', 'src/i18n']);

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (SKIP_DIRS.has(path)) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(path)) out.push(path);
  }
  return out;
};

const found = new Map();
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(LITERAL)) {
    const value = (match[1] ?? match[2] ?? '').trim();
    if (!VN.test(value)) continue;
    if (value.startsWith('@/') || value.startsWith('http') || value.includes('${')) continue;
    if (value.includes('className') || /^(w-|bg-|text-)/.test(value)) continue;
    if (!found.has(value)) found.set(value, new Set());
    found.get(value).add(file);
  }
}

const existing = JSON.parse(readFileSync('messages/vi.json', 'utf8'));
const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));

// GIỮ key cũ: một chuỗi không còn xuất hiện trong code vẫn nằm lại để bản dịch en không bị mồ côi
const next = { ...existing };
let added = 0;
for (const [value, files] of [...found].sort(([a], [b]) => a.localeCompare(b, 'vi'))) {
  if (!next[value]) {
    next[value] = value;
    added += 1;
    console.log('NEW:', value, '->', [...files][0]);
  }
}

const missing = Object.keys(next).filter((key) => !en[key] || !en[key].trim());
writeFileSync('messages/vi.json', JSON.stringify(next, null, 1) + '\n', 'utf8');
console.log(`messages/vi.json: ${Object.keys(next).length} chuỗi (thêm ${added})`);
console.log(`messages/en.json: đã dịch ${Object.keys(next).length - missing.length}/${Object.keys(next).length}`);
if (missing.length) {
  writeFileSync('messages/en.missing.txt', missing.join('\n') + '\n', 'utf8');
  console.log(`-> ${missing.length} chuỗi chưa dịch, xem messages/en.missing.txt`);
} else {
  try { unlinkSync('messages/en.missing.txt'); } catch {}
}
