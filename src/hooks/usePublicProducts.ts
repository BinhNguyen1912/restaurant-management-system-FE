'use client';

import { useEffect, useState } from 'react';
import productsApiRequest from '@/apiRequest/products';
import { GetListProductsResType } from '@/app/ValidationSchemas/product.schema';
import { useI18n } from '@/i18n/locale-provider';

export type PublicProduct = GetListProductsResType['data'][number];

/**
 * Món đang bán cho các section công khai (trang chủ).
 *
 * `GET /product` là endpoint `@IsPublic()` và BE đã bản địa hoá tên theo `X-Locale`, nên
 * ở đây chỉ cần nạp lại khi đổi ngôn ngữ. Cache theo locale ở module để nhiều section
 * trên cùng trang dùng chung **một** request thay vì mỗi section tự gọi.
 */
const cache = new Map<string, PublicProduct[]>();
const inflight = new Map<string, Promise<PublicProduct[]>>();

const load = (locale: string): Promise<PublicProduct[]> => {
  const cached = cache.get(locale);
  if (cached) return Promise.resolve(cached);
  const running = inflight.get(locale);
  if (running) return running;

  const request = productsApiRequest
    .getListProduct()
    .then((res) => {
      const active = (res.payload?.data ?? []).filter((item) => item.status === 'ACTIVE');
      cache.set(locale, active);
      return active;
    })
    .catch(() => [] as PublicProduct[])
    .finally(() => inflight.delete(locale));

  inflight.set(locale, request);
  return request;
};

/** Dùng ở client component; `products` truyền vào để một section đã nạp sẵn chia sẻ cho section con */
export function usePublicProducts(provided?: PublicProduct[]) {
  const { locale } = useI18n();
  const [products, setProducts] = useState<PublicProduct[]>(provided ?? []);
  const [isLoading, setIsLoading] = useState(!provided);

  useEffect(() => {
    if (provided) {
      setProducts(provided);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    load(locale).then((list) => {
      if (cancelled) return;
      setProducts(list);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, provided]);

  return { products, isLoading };
}
