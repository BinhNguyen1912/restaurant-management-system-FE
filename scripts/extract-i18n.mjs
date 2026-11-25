/**
 * Trích mọi chuỗi tiếng Việt trong `src/**` vào `messages/vi.json` (key = chính câu đó).
 * Chạy lại sau khi thêm màn hình mới: `node scripts/extract-i18n.mjs`
 * `messages/en.json` KHÔNG bị ghi đè (bản dịch do người/agent điền).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
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
const next = {};
for (const [value, files] of [...found].sort(([a], [b]) => a.localeCompare(b, 'vi'))) {
  next[value] = existing[value] ?? value;
  if (!existing[value]) console.log('NEW:', value, '->', [...files][0]);
}
writeFileSync('messages/vi.json', JSON.stringify(next, null, 1) + '\n', 'utf8');
console.log(`messages/vi.json: ${Object.keys(next).length} chuỗi (thêm ${Object.keys(next).length - Object.keys(existing).length})`);
