'use client';

import { useEffect, useRef, useState } from 'react';
import SafeImage from '@/components/SafeImage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { T } from '@/components/t';
import { useI18n } from '@/i18n/locale-provider';
import productsApiRequest from '@/apiRequest/products';
import { GetListProductsResType } from '@/app/ValidationSchemas/product.schema';

type Dish = GetListProductsResType['data'][number];

/** "Mới" = đăng bán trong 14 ngày gần đây (trước đây là cờ `isNew` viết cứng trong code) */
const NEW_DAYS = 14;
const MAX_DISHES = 8;

const isNew = (dish: Dish) => {
  const published = dish.publishedAt ? new Date(dish.publishedAt) : null;
  if (!published) return false;
  return Date.now() - published.getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;
};

const priceOf = (dish: Dish) => dish.virtualPrice || dish.basePrice;

/**
 * Băng chuyền món ăn ở trang chủ: lấy từ `GET /product` (public), KHÔNG viết cứng.
 * Trước đây là 8 món hardcode (Phở Bò Tái, ...) không khớp DB nên trang chủ giới thiệu
 * món không tồn tại và không đổi theo ngôn ngữ. Tên món do BE trả theo `X-Locale`
 * (cookie `locale`), nên đổi VI/EN là gọi lại.
 */
export default function HorizontalScrollDishes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const { locale } = useI18n();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // nạp món theo ngôn ngữ đang chọn: BE đã trả tên đã bản địa hoá
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    productsApiRequest
      .getListProduct()
      .then((res) => {
        if (cancelled) return;
        const active = (res.payload?.data ?? [])
          .filter((dish) => dish.status === 'ACTIVE')
          .slice(0, MAX_DISHES);
        setDishes(active);
      })
      .catch(() => {
        if (!cancelled) setDishes([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    const handleScroll = () => {
      setViewportWidth(window.innerWidth);
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isInView = rect.top < windowHeight && rect.bottom > 0;
      setIsVisible(isInView);

      if (isInView) {
        const elementHeight = rect.height;
        const scrollTop = window.pageYOffset;
        const elementTop = scrollTop + rect.top;
        const currentScroll = scrollTop + windowHeight;
        const progress = Math.max(
          0,
          Math.min(1, (currentScroll - elementTop) / (elementHeight + windowHeight)),
        );
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chiều dài băng chuyền tính theo SỐ MÓN thật (trước đây hardcode `dishes.length * 320`
  // trên mảng tĩnh, giờ mảng đến từ DB nên có thể ngắn hơn màn hình -> không dịch quá đà)
  const trackWidth = dishes.length * 320;
  const maxShift = Math.max(0, trackWidth - viewportWidth + 100);
  const transform = isVisible ? `translateX(-${scrollProgress * maxShift}px)` : 'translateX(0)';

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="w-80 flex-shrink-0 animate-pulse bg-white shadow-lg">
            <div className="h-48 bg-gray-200" />
            <CardContent className="space-y-3 p-4">
              <div className="h-5 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-8 w-1/2 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!dishes.length) {
    return (
      <p className="py-10 text-center text-white/80">
        <T>Chưa có món nào đang bán</T>
      </p>
    );
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div
        className="flex gap-6 transition-transform duration-1000 ease-out"
        style={{ transform }}
      >
        {dishes.map((dish) => (
          <Card
            key={dish.id}
            className="w-80 flex-shrink-0 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="relative h-48 overflow-hidden">
              <SafeImage
                src={dish.images?.[0] ?? null}
                alt={dish.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
              {isNew(dish) && (
                <Badge className="absolute right-2 top-2 bg-red-500 text-white">
                  <T>Mới</T>
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <h4 className="line-clamp-1 text-lg font-bold text-gray-800">{dish.name}</h4>
              </div>
              <p className="mb-3 text-sm text-gray-600">{dish.categories?.[0]?.name ?? ''}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-yellow-600">
                  {priceOf(dish).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ
                </span>
                <button className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600">
                  <T>Thêm vào giỏ</T>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-white/30"></div>
          <div className="h-2 w-2 rounded-full bg-white/30"></div>
          <div className="h-2 w-2 rounded-full bg-white/30"></div>
        </div>
      </div>
    </div>
  );
}
