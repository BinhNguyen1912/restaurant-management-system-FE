import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import envConfig from '@/config';

/**
 * Truoc day route nay la GET, khong xac thuc, nhan tag bat ky
 * => ai cung goi duoc `?tag=<bat ky>` gay cache poisoning / DoS.
 *
 * Gio: chi POST + phai la ADMIN/STAFF + tag nam trong whitelist.
 *
 * Xac thuc bang "permission probe": goi thang mot endpoint chi ADMIN/STAFF co quyen
 * (`GET /role` — payload nho, chi 4 role). KHONG doc role tu /profile vi profile tra
 * cuu theo userId, ma id cua Guest co the trung id User -> lay nham profile admin.
 *
 * Lay token theo thu tu: header Authorization (lib/http gui Bearer tu client) TRUOC,
 * cookie httpOnly la fallback — neu chi dung cookie thi khi cookie het han (hoac
 * secure cookie bi tu choi ngoai localhost) route tra 401 va lib/http se hieu la
 * het phien, xoa token + day ve /auth/login ngay sau khi thao tac da thanh cong.
 */
const ALLOWED_TAGS = new Set(['ingredients', 'products', 'categories']);
const PERMISSION_PROBE_PATH = '/role'; // ROLE: chi ADMIN + STAFF (STAFF chi duoc GET)

async function isAdminOrStaff(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}${PERMISSION_PROBE_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

type TokenSource = 'header' | 'cookie';

function getToken(request: NextRequest): { token: string; source: TokenSource } | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    const fromHeader = header.slice('Bearer '.length).trim();
    if (fromHeader) return { token: fromHeader, source: 'header' };
  }
  const cookieToken = cookies().get('accessToken')?.value;
  if (cookieToken) return { token: cookieToken, source: 'cookie' };
  return null;
}

/**
 * Token lay tu cookie co the bi gui kem boi request cross-site (cookie duoc browser
 * tu dong gui) => phai kiem Origin/Referer cung goc. Token lay tu header Authorization
 * thi khong the bi cross-site JS dat => khong can check.
 */
function isSameOrigin(request: NextRequest): boolean {
  const allowedOrigin = new URL(envConfig.NEXT_PUBLIC_URL).origin;
  const origin = request.headers.get('origin');
  if (origin) return origin === allowedOrigin;
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === allowedOrigin;
    } catch {
      return false;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');

  if (!tag || !ALLOWED_TAGS.has(tag)) {
    return Response.json({ revalidated: false, message: 'Tag khong hop le' }, { status: 400 });
  }

  const auth = getToken(request);
  // Chua dang nhap => 401 (client hieu la het phien, dang xuat).
  if (!auth) {
    return Response.json({ revalidated: false, message: 'Chua dang nhap' }, { status: 401 });
  }

  // Chong CSRF khi phai dua vao cookie (browser tu gui cookie cross-site).
  if (auth.source === 'cookie' && !isSameOrigin(request)) {
    return Response.json({ revalidated: false, message: 'Origin khong hop le' }, { status: 403 });
  }

  // Da dang nhap nhung khong du quyen => 403. KHONG duoc tra 401,
  // vi lib/http.ts coi 401 la het phien nen se xoa token va day ve trang login.
  if (!(await isAdminOrStaff(auth.token))) {
    return Response.json({ revalidated: false, message: 'Khong co quyen revalidate' }, { status: 403 });
  }

  revalidateTag(tag);
  return Response.json({ revalidated: true, tag, now: Date.now() });
}

export async function GET() {
  return Response.json({ revalidated: false, message: 'Method not allowed' }, { status: 405 });
}
