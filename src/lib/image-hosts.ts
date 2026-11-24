/**
 * Danh sách host được `next/image` tối ưu (phải khớp `images.remotePatterns` trong
 * `next.config.mjs`).
 *
 * Ảnh sản phẩm đến từ DB — quản trị viên dán URL bất kỳ — nên KHÔNG thể giả định host
 * nằm trong allowlist. `next/image` gặp host lạ sẽ **throw ngay khi render** (cả trang
 * trắng), vì vậy `SafeImage` chỉ dùng `next/image` cho host đã khai báo, còn lại rơi về
 * `<img>` thường.
 */
export const OPTIMIZED_IMAGE_HOSTS = new Set([
  'i.pinimg.com',
  'ik.imagekit.io',
  'via.placeholder.com',
  'cdn.dribbble.com',
  'nhahang.ai',
  'res.cloudinary.com',
  'vietnamdasac.com',
  'aban.com.vn',
  'backimthang.vn',
  // Ảnh seed/demo
  'picsum.photos',
  'fastly.picsum.photos',
]);

/** Ảnh nội bộ (`/foo.png`) hoặc host đã khai báo thì `next/image` xử lý được */
export function canOptimizeImage(src?: string | null): boolean {
  if (!src) return false;
  if (src.startsWith('/') || src.startsWith('data:')) return true;
  try {
    return OPTIMIZED_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}
