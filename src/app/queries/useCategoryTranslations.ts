import { categoryTranslationApiRequest, CategoryTranslationBodyType } from '@/apiRequest/categoryTranslations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCategoryTranslations = (categoryId: number, enabled = true) =>
  useQuery({
    queryKey: ['category-translations', categoryId],
    queryFn: () => categoryTranslationApiRequest.list(categoryId),
    enabled,
  });

export const useSaveCategoryTranslation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: CategoryTranslationBodyType & { id?: number }) =>
      id
        ? categoryTranslationApiRequest.update(id, { name: body.name, description: body.description })
        : categoryTranslationApiRequest.create(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['category-translations', variables.categoryId] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
