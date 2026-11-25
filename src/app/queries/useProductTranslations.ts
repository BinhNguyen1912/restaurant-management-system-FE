import { productTranslationApiRequest, ProductTranslationBodyType } from '@/apiRequest/productTranslations';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Lưu bản dịch: có id thì sửa, chưa có thì tạo mới (API tách POST/PUT nên FE tự chọn) */
export const useSaveProductTranslation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ProductTranslationBodyType & { id?: number }) =>
      id
        ? productTranslationApiRequest.update(id, { name: body.name, description: body.description })
        : productTranslationApiRequest.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
