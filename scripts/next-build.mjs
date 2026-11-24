/**
 * Build production vào thư mục `.next-build` để KHÔNG đạp lên cache của `next dev` (`.next`).
 *
 * Vì sao cần: `next build` mặc định ghi vào `.next` — đúng thư mục dev đang dùng. Chạy build
 * trong lúc dev đang chạy sẽ xoá/ghi đè manifest của dev, dev chết với lỗi kiểu
 * "Cannot find the middleware module" hoặc phải compile lại từ đầu (chậm 30–50s).
 */
import { execSync } from 'node:child_process';

execSync('npx next build', {
  stdio: 'inherit',
  env: { ...process.env, NEXT_DIST_DIR: '.next-build' },
});
