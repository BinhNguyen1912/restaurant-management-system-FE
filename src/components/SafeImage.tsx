import Image from 'next/image';
import { canOptimizeImage } from '@/lib/image-hosts';
import { cn } from '@/lib/utils';

type SafeImageProps = {
  src?: string | null;
  alt: string;
  /** Kích thước thật (px) — dùng cho cả `next/image` và fallback */
  width?: number;
  height?: number;
  /** Lấp đầy khung cha (khung cha phải `position: relative`) */
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Chỉ dùng cho `next/image` (mặc định 75) */
  quality?: number;
  /** Chỉ dùng cho `next/image` */
  title?: string;
  /** Style truyền thẳng cho cả 2 đường render */
  style?: React.CSSProperties;
  fallbackSrc?: string;
};

/**
 * Ảnh có nguồn từ DB.
 *
 * `next/image` chỉ chấp nhận host đã khai báo trong `next.config.mjs`; gặp host lạ nó
 * throw và làm trắng cả trang (đúng lỗi "Invalid src prop ... is not configured under
 * images"). Component này dùng `next/image` cho host an toàn, còn lại dùng `<img>` để
 * trang không bao giờ chết vì một URL ảnh.
 */
export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  className,
  quality,
  title,
  style,
  fallbackSrc = '/placeholder-food.jpg',
}: SafeImageProps) {
  const source = src?.trim() ? src : fallbackSrc;

  if (canOptimizeImage(source)) {
    return (
      <Image
        src={source}
        alt={alt}
        {...(fill
          ? { fill: true }
          : { width: width ?? 48, height: height ?? 48 })}
        sizes={sizes}
        priority={priority}
        quality={quality}
        title={title}
        style={style}
        className={className}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={source}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        title={title}
        style={style}
        className={cn('absolute inset-0 h-full w-full object-cover', className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={alt}
      width={width ?? 48}
      height={height ?? 48}
      loading={priority ? 'eager' : 'lazy'}
      title={title}
      style={style}
      className={className}
    />
  );
}
