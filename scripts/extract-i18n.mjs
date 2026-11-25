/**
 * Trích mọi chuỗi tiếng Việt trong `src/**` vào `messages/vi.json` (key = chính câu đó).
 * Chạy lại sau khi thêm màn hình mới: `node scripts/extract-i18n.mjs`
 * `messages/en.json` KHÔNG bị ghi đè (bản dịch do người/agent điền).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const LITERAL = /(?<![A-Za-z0-9_])'([^'\n]{2,300})'|(?<![A-Za-z0-9_])"([^"\n]{2,300})"/g;
// so sánh theo path đã chuẩn hoá để chạy đúng trên Windows (dấu \\) lẫn Linux (dấu /)
const SKIP_DIRS = new Set(['node_modules', '.next', 'src/i18n'].map((p) => p.replace(/\\/g, '/')));

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (SKIP_DIRS.has(path.replace(/\\/g, '/'))) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(path)) out.push(path);
  }
  return out;
};

/**
 * Bỏ qua chuỗi trong `console.log/warn/error/debug/info`: đó là log cho lập trình viên, không
 * phải chữ trên giao diện. Trước đây chúng bị tính là "thiếu bản dịch" và làm nhiễu báo cáo.
 */
const isDevLog = (text, index) => {
  const lineStart = text.lastIndexOf('\n', index) + 1;
  if (/console\s*\.\s*(log|warn|error|debug|info)\s*\(/.test(text.slice(lineStart, index))) return true;
  // chú thích không phải chữ trên giao diện (vd: giải thích trong JSDoc)
  if (/^\s*(\/\/|\*|\/\*)/.test(text.slice(lineStart, index))) return true;
  // `console.log(` có thể nằm ở dòng trước (đối số xuống dòng) -> nhìn lại 300 ký tự,
  // nếu gặp `console.*(` mà chưa có `)` đóng lại thì chuỗi này thuộc lời gọi log đó
  const window = text.slice(Math.max(0, index - 300), index);
  const call = window.lastIndexOf('console');
  if (call === -1) return false;
  const tail = window.slice(call);
  return /^console\s*\.\s*(log|warn|error|debug|info)\s*\(/.test(tail) && !tail.includes(')');
};

const found = new Map();
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(LITERAL)) {
    if (isDevLog(text, match.index ?? 0)) continue;
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

// Chỉ báo thiếu với chuỗi CÒN dùng trong code: key cũ (chuỗi đã bị xoá khỏi giao diện,
// hoặc log `console.*` mà extractor bỏ qua) vẫn được giữ để bản dịch en không mồ côi,
// nhưng không tính vào "còn thiếu" — trước đây chúng làm báo cáo nhiễu.
const used = new Set(found.keys());
const missing = Object.keys(next).filter(
  (key) => used.has(key) && (!en[key] || !en[key].trim()),
);
const stale = Object.keys(next).filter((key) => !used.has(key));
writeFileSync('messages/vi.json', JSON.stringify(next, null, 1) + '\n', 'utf8');
console.log(`messages/vi.json: ${Object.keys(next).length} chuỗi (thêm ${added})`);
console.log(
  `messages/en.json: đã dịch ${used.size - missing.length}/${used.size} chuỗi đang dùng` +
    ` (${stale.length} key cũ không còn trong code)`,
);
if (missing.length) {
  writeFileSync('messages/en.missing.txt', missing.join('\n') + '\n', 'utf8');
  console.log(`-> ${missing.length} chuỗi chưa dịch, xem messages/en.missing.txt`);
} else {
  try { unlinkSync('messages/en.missing.txt'); } catch {}
}
