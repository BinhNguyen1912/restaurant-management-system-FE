/**
 * Thay chuỗi tiếng Việt trong code bằng `t('...')`.
 * Chỉ chạm 3 dạng an toàn: text trong JSX, thuộc tính hiển thị, tham số toast.
 * File không tìm được điểm chèn hook sẽ được báo để xử lý tay (không đoán bừa).
 *
 * Chạy: node scripts/replace-i18n.mjs            (thử)   |   node scripts/replace-i18n.mjs --write
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WRITE = process.argv.includes('--write');
const VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const ATTRS = ['placeholder', 'title', 'label', 'aria-label'];
const SKIP = new Set(['node_modules', '.next', 'src/i18n', 'src/components/ui']);
const SKIP_LITERALS = /^(w-|h-|bg-|text-|flex|grid|absolute|relative|https?:|@\/)/;

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry).replace(/\\/g, '/');
    if ([...SKIP].some((skip) => path === skip || path.startsWith(`${skip}/`))) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else if (path.endsWith('.tsx')) out.push(path);
  }
  return out;
};

const q = (value) => JSON.stringify(value); // tránh lỗi nháy đơn trong câu tiếng Việt

const changed = [];
const skipped = [];

for (const file of walk('src')) {
  let text = readFileSync(file, 'utf8');
  // 'use client' có thể nằm sau dòng eslint-disable đầu file
  const isClient = /^\s*(\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/m.test(text.slice(0, 600));
  if (!VN.test(text)) continue;

  const keys = new Set();
  const original = text;

  // 1) text trong JSX: >Chữ tiếng Việt<
  text = text.replace(/>([^<>{}\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ][^<>{}\n]*)</gi, (match, inner) => {
    const value = inner.trim();
    if (!VN.test(value) || value.length < 2) return match;
    keys.add(value);
    return `>{t(${q(value)})}<`;
  });

  // 2) thuộc tính hiển thị
  for (const attr of ATTRS) {
    const re = new RegExp(`${attr}="([^"{}]*)"`, 'g');
    text = text.replace(re, (match, value) => {
      const trimmed = value.trim();
      if (!VN.test(trimmed) || SKIP_LITERALS.test(trimmed)) return match;
      keys.add(trimmed);
      return `${attr}={t(${q(trimmed)})}`;
    });
  }

  // 3) toast.success/error('...')
  text = text.replace(/toast\.(success|error|info|warning)\(\s*(['"])([^'"\n]*)\2/g, (match, kind, quote, value) => {
    if (!VN.test(value)) return match;
    keys.add(value);
    return `toast.${kind}(t(${q(value)})`;
  });

  if (!keys.size || text === original) continue;

  // 4) chèn import + hook (chỉ client; server component để xử lý riêng)
  if (!isClient) {
    skipped.push({ file, reason: 'server component (cần getT)', keys: keys.size });
    continue;
  }
  if (!text.includes("from '@/i18n/locale-provider'")) {
    const lastImport = [...text.matchAll(/^import .*;$/gm)].pop();
    const at = lastImport ? lastImport.index + lastImport[0].length : 0;
    text = `${text.slice(0, at)}\nimport { useI18n } from '@/i18n/locale-provider';${text.slice(at)}`;
  }
  // KHÔNG tự chèn hook: xem scripts/fix-hooks.py

  changed.push({ file, keys: keys.size });
  if (WRITE) {
    // giữ nguyên kiểu xuống dòng của file gốc (repo trộn CRLF/LF) để diff không bị nhiễu
    const crlf = original.includes('\r\n');
    writeFileSync(file, crlf ? text.replace(/\r?\n/g, '\r\n') : text, 'utf8');
  }
}

console.log(`${WRITE ? 'ĐÃ GHI' : 'THỬ'} ${changed.length} file, ${changed.reduce((sum, item) => sum + item.keys, 0)} chuỗi`);
for (const item of changed) console.log(`  ✓ ${item.file} (${item.keys})`);
console.log(`\nCần xử lý tay: ${skipped.length}`);
for (const item of skipped) console.log(`  • ${item.file} — ${item.reason} (${item.keys} chuỗi)`);
