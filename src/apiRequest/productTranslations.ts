import http from '@/lib/http';

export type ProductTranslationType = {
  id: number;
  languageId: string;
  name: string;
  description: string;
  productId: number;
};

export type ProductTranslationBodyType = {
  productId: number;
  languageId: string;
  name: string;
  description: string;
};

export const productTranslationApiRequest = {
  create: (body: ProductTranslationBodyType) => http.post<ProductTranslationType>('/product-translation', body),
  update: (id: number, body: Partial<Omit<ProductTranslationBodyType, 'productId' | 'languageId'>>) =>
    http.put<ProductTranslationType>(`/product-translation/${id}`, body),
};
