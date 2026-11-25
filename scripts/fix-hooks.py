"""
Chèn `const { t } = useI18n()` (client) hoặc `const t = getT(getLocaleFromCookies())` (server)
vào đúng function đang dùng `t(...)`, dựa trên lỗi "Cannot find name 't'" của tsc.

- Chọn function BAO QUANH gần nhất (inner-most) chứa dòng lỗi.
- Mỗi function chỉ chèn 1 lần; function đã có hook thì bỏ qua.
Chạy: python scripts/fix-hooks.py
"""
import re, subprocess

MAX_PASSES = 6
CLIENT_HOOK = '  const { t } = useI18n();'
SERVER_HOOK = '  const t = getT(getLocaleFromCookies());'
FUNC_RE = re.compile(r"\s*(export default\s+)?(async\s+)?function\s+\w+\s*(<[^>]*>)?\s*\(")


def tsc_missing_t():
    out = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True).stdout
    errors = {}
    for line in out.splitlines():
        m = re.match(r"(.+?)\((\d+),\d+\): error TS2304: Cannot find name 't'", line.strip())
        if m:
            errors.setdefault(m.group(1).replace('\\', '/'), []).append(int(m.group(2)))
    return errors


def body_start(lines, func_line):
    """Dòng mở thân hàm: bỏ qua danh sách tham số và type annotation."""
    for i in range(func_line, min(func_line + 40, len(lines))):
        stripped = lines[i].rstrip()
        if re.search(r"\)\s*(:\s*.*?)?\{\s*$", stripped):
            return i
    return None


COMPONENT_RE = re.compile(r"\s*(export default\s+)?(async\s+)?function\s+([A-Z]\w*)\s*(<[^>]*>)?\s*\(")


def enclosing_function(lines, line_index):
    """Ưu tiên component (tên viết hoa) bao ngoài: hook phải nằm ở component,
    để hàm con (onSubmit, handler) dùng `t` qua closure — không gọi hook trong callback."""
    nearest = None
    for i in range(line_index, -1, -1):
        if COMPONENT_RE.match(lines[i]):
            return i
        if nearest is None and FUNC_RE.match(lines[i]):
            nearest = i
    return nearest


for _ in range(MAX_PASSES):
    errors = tsc_missing_t()
    if not errors:
        break
    for path, used_lines in errors.items():
        lines = open(path, encoding='utf-8').read().split('\n')
        is_client = any("'use client'" in l or '"use client"' in l for l in lines[:40])
        inserts = set()
        for used in used_lines:
            func = enclosing_function(lines, used - 1)
            if func is None:
                continue
            body = body_start(lines, func)
            if body is None:
                continue
            already = any('useI18n()' in lines[i] or 'getT(' in lines[i] for i in range(body, min(body + 6, len(lines))))
            if already:
                continue
            inserts.add(body)
        if not inserts:
            continue
        for body in sorted(inserts, reverse=True):
            lines.insert(body + 1, CLIENT_HOOK if is_client else SERVER_HOOK)
        text = '\n'.join(lines)
        if not is_client and "from '@/i18n/server'" not in text:
            imports = list(re.finditer(r"^import .*;$", text, re.M))
            if imports:
                at = imports[-1].end()
                text = text[:at] + "\nimport { getLocaleFromCookies, getT } from '@/i18n/server';" + text[at:]
            else:
                text = "import { getLocaleFromCookies, getT } from '@/i18n/server';\n" + text
        open(path, 'w', encoding='utf-8').write(text)
        print('hook ->', path)
print('còn lỗi:', tsc_missing_t())
