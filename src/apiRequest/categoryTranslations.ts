import http from '@/lib/http';

export type CategoryTranslationType = {
  id: number;
  languageId: string;
  name: string;
  description: string;
  categoryId: number;
};

export type CategoryTranslationBodyType = {
  categoryId: number;
  languageId: string;
  name: string;
  description: string;
};

export const categoryTranslationApiRequest = {
  /** bản dịch hiện có của 1 danh mục (cần id để sửa) */
  list: (categoryId: number) =>
    http.get<{ message: string; data: CategoryTranslationType[] }>(`/category-translation?categoryId=${categoryId}`),
  create: (body: CategoryTranslationBodyType) => http.post<CategoryTranslationType>('/category-translation', body),
  update: (id: number, body: Partial<Omit<CategoryTranslationBodyType, 'categoryId' | 'languageId'>>) =>
    http.put<CategoryTranslationType>(`/category-translation/${id}`, body),
};
