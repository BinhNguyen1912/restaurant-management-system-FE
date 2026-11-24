import { TokenPayload } from '@/types/jwt.types';

/**
 * Decode JWT **không verify** (chỉ đọc payload) — dùng cho middleware/edge.
 *
 * Trước đây file này import `jsonwebtoken` (thư viện chỉ chạy Node: dùng `crypto`/`buffer`),
 * mà middleware của Next lại chạy ở Edge runtime. Hệ quả:
 *  - webpack phải kéo cả `jsonwebtoken` vào bundle middleware (152 module) → compile chậm,
 *    mỗi lần đổi middleware là chờ hàng trăm ms tới vài giây;
 *  - edge runtime không luôn có đủ Node API nên dễ sinh lỗi "Cannot find the middleware module"
 *    hoặc crash ngay khi request vào.
 *
 * Decode base64url thuần JS dưới đây không phụ thuộc gì, chạy được ở cả Node và Edge.
 * Không dùng hàm này để xác thực chữ ký — verify vẫn nằm ở server (BE).
 */
export const decode = (token: string): TokenPayload => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Token không đúng định dạng JWT');
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  const json =
    typeof atob === 'function'
      ? atob(padded)
      : // fallback Node (script/test) — Buffer không có ở Edge nên phải guard
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        (globalThis as unknown as { Buffer: { from: (s: string, e: string) => { toString: (e: string) => string } } })
          .Buffer.from(padded, 'base64')
          .toString('binary');

  // atob trả chuỗi binary -> phải decode UTF-8 để không hỏng tên tiếng Việt
  const bytes = Uint8Array.from(json, (char) => char.charCodeAt(0));
  const payload = JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;

  return payload;
};
