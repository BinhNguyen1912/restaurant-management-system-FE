/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tách cache build khỏi cache dev để `npm run build` không làm chết `npm run dev`
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Image Docker: `next build` sinh thêm `.next/standalone` chứa server tối thiểu + node_modules
  // cần thiết, nên image chạy `node server.js` thay vì kéo theo toàn bộ node_modules.
  output: 'standalone',
  images: {
    /**
     * Chỉ webp, KHÔNG bật avif: 3 advisory RCE không cần đăng nhập của next 14.2.30 nằm ở
     * Image Optimization (GHSA-2xp9 cho avif, GHSA-2464 cho svg — svg vốn đã tắt vì không đặt
     * `dangerouslyAllowSVG`). Chỉ bản next >= 15.5.28 mới vá, nên giữ đúng 1 format cho tới khi
     * nâng next; đừng bật avif/svg trước mốc đó.
     */
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com', // domain ảnh ngoài
        pathname: '/**', // đường dẫn cho phép
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**', // cho phép tất cả path
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3300',
        pathname: '/**', // cho phép tất cả path
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**', // cho phép tất cả path
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dribbble.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nhahang.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vietnamdasac.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aban.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'backimthang.vn',
        pathname: '/**',
      },
      // ảnh seed/demo (demo-data.seed.ts, catalog.seed.ts)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        pathname: '/**',
      },
    ],
  },
};
export default nextConfig;
