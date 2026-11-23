import { OrderBy, SortBy } from '@/app/constants/orther.constant';
import { ProductStatus } from '@/app/constants/product.constant';
import { CategoryIncludeTranslationSchema } from '@/app/ValidationSchemas/category.schema';
import {
  SKUSchema,
  UpsertSKUBody,
  UpsertSKUBodySchema,
} from '@/app/ValidationSchemas/sku.schema';
import { UserSchema } from '@/app/ValidationSchemas/user.schema';
import { z } from 'zod';

export const ProductTranslationSchema = z.object({
  id: z.number(),
  // Output schema: không siết min (dữ liệu cũ có thể rỗng/ngắn)
  name: z.string().max(500),
  description: z.string().max(2000),
  languageId: z.string(),
  productId: z.number(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductTranslationType = z.infer<typeof ProductTranslationSchema>;

export const VariantSchema = z.object({
  value: z.string().trim(),
  valueOption: z.array(
    z.object({
      value: z.string(),
      price: z.number(),
      image: z.string().optional(),
    }),
  ),
});
export interface VariantOption {
  value: string;
  price: number;
  image: string;
}
export const VariantsSchema = z
  .array(VariantSchema)
  .superRefine((variants, ctx) => {
    // Kiểm tra trùng variant.value
    // const variantValues = variants.map((v) => v.value)
    // const variantSet = new Set(variantValues)
    // if (variantValues.length !== variantSet.size) {
    //   ctx.addIssue({
    //     code: 'custom',
    //     message: 'Danh sách variant có giá trị bị trùng lặp. Vui lòng kiểm tra lại.',
    //   })
    // }

    //Kiểm tra trùng tên value
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const isExistingVariant =
        variants.findIndex(
          (x) => x.value.toLowerCase() === variant.value.toLowerCase(),
        ) !== i;
      if (isExistingVariant) {
        ctx.addIssue({
          code: 'custom',
          message: `Giá trị "${variant.value}" đã tồn tại trong danh sách Variants . Vui lòng kiểm tra lại`,
          path: ['variants'],
        });
      }
    }

    // Kiểm tra trùng option trong từng variant
    variants.forEach((variant) => {
      const options = variant.valueOption;
      const optionSet = new Set(options);
      if (options.length !== optionSet.size) {
        ctx.addIssue({
          code: 'custom',
          message: `Variant "${variant.value}" có valueOption bị trùng. Vui lòng kiểm tra lại.`,
        });
      }
    });
  });

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  basePrice: z.number().positive(),
  virtualPrice: z.number().positive(),
  status: z.enum([
    ProductStatus.ACTIVE,
    ProductStatus.INACTIVE,
    ProductStatus.HIDDEN,
  ]),
  variants: VariantsSchema,
  publishedAt: z.coerce.date().nullable(),
  images: z.array(z.string()),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type VariantType = z.infer<typeof VariantSchema>;

export type VariantsType = z.infer<typeof VariantsSchema>;

export type ProductType = z.infer<typeof ProductSchema>;

// export function GenerateSKU(
//   variants: VariantType[],
//   prop?: { basePrice: number; image: string },
// ): UpsertSKUBody[] {
//   if (!variants || variants.length === 0) {
//     return [];
//   }

//   const optionsArr = variants.map((v) => v.valueOption);
//   const combinations = getCombine(optionsArr);

//   return combinations.map((c) => ({
//     value: c.value,
//     price: c.price || prop?.basePrice || 0,
//     image: c.image || prop?.image || '',
//   }));
// }

// function getCombine(
//   arr: {
//     value: string;
//     price: number;
//     image: string;
//   }[][],
// ): {
//   value: string;
//   price: number;
//   image: string;
// }[] {
//   if (!arr || arr.length === 0) return []; // Không có options → trả về rỗng

//   return arr.reduce(
//     (acc, curr) =>
//       acc.flatMap((x) =>
//         curr.map(({ image, price, value }) => ({
//           value: x.value ? `${x.value}-${value}` : value,
//           price,
//           image,
//         })),
//       ),
//     [] as { value: string; price: number; image: string }[], // seed rỗng
//   );
// }

//   const optionsArr = variants.map((v) => v.valueOption);
//   const combinations = getCombine(optionsArr);

//   return combinations.map((c) => ({
//     value: c.value,
//     price: c.price || prop?.basePrice || 0,
//     image: c.image || prop?.image || '',
//   }));
// }
// export function GenerateSKU(
//   variants: VariantType[],
//   prop?: { basePrice: number; image: string },
// ): UpsertSKUBody[] {
//   // Nếu không có variants hoặc variants rỗng, trả về mảng rỗng
//   if (!variants || variants.length === 0) {
//     return [];
//   }

//   // Lấy danh sách valueOption của từng variant
//   const optionsArr = variants.map((v) => v.valueOption);

//   // Nếu không có options nào, trả về mảng rỗng
//   if (optionsArr.length === 0 || optionsArr.every((opt) => opt.length === 0)) {
//     return [];
//   }

//   const combinations = getCombine(optionsArr);

//   // Nếu không có combinations, trả về mảng rỗng
//   if (!combinations || combinations.length === 0) {
//     return [];
//   }

//   return combinations.map((c) => ({
//     value: c.value,
//     price: c.price || prop?.basePrice || 0,
//     image: c.image || prop?.image || '',
//   }));
// }

// function getCombine(
//   arr: {
//     value: string;
//     price: number;
//     image: string;
//   }[][],
// ): {
//   value: string;
//   price: number;
//   image: string;
// }[] {
//   // Nếu mảng arr rỗng hoặc không có phần tử nào
//   if (!arr || arr.length === 0) {
//     return [];
//   }

//   // Lọc bỏ các mảng con rỗng
//   const nonEmptyArr = arr.filter((subArr) => subArr.length > 0);

//   // Nếu tất cả mảng con đều rỗng
//   if (nonEmptyArr.length === 0) {
//     return [];
//   }

//   // Bắt đầu với mảng rỗng thay vì seed rỗng
//   let result: { value: string; price: number; image: string }[] = [];

//   for (let i = 0; i < nonEmptyArr.length; i++) {
//     const currentOptions = nonEmptyArr[i];

//     if (i === 0) {
//       // Khởi tạo với options đầu tiên
//       result = currentOptions.map((opt) => ({
//         value: opt.value,
//         price: opt.price,
//         image: opt.image,
//       }));
//     } else {
//       // Kết hợp với options tiếp theo
//       result = result.flatMap((existing) =>
//         currentOptions.map((opt) => ({
//           value: `${existing.value}-${opt.value}`,
//           price: opt.price,
//           image: opt.image,
//         })),
//       );
//     }
//   }

//   return result;
// }
// export function GenerateSKU(
//   variants: VariantType[],
//   prop?: { basePrice: number; image: string },
// ): UpsertSKUBody[] {
//   // Nếu không có variants hoặc variants rỗng, trả về mảng rỗng
//   if (!variants || variants.length === 0) {
//     return [];
//   }

//   // Lấy danh sách valueOption của từng variant
//   const optionsArr = variants.map((v) => v.valueOption);

//   // Nếu không có options nào, trả về mảng rỗng
//   if (optionsArr.length === 0 || optionsArr.every((opt) => opt.length === 0)) {
//     return [];
//   }

//   const combinations = getCombine(optionsArr);

//   // Nếu không có combinations, trả về mảng rỗng
//   if (!combinations || combinations.length === 0) {
//     return [];
//   }

//   return combinations.map((c) => ({
//     value: c.value,
//     price: c.price || prop?.basePrice || 0,
//     image: c.image || prop?.image || '',
//   }));
// }

// function getCombine(
//   arr: {
//     value: string;
//     price: number;
//     image: string;
//   }[][],
// ): {
//   value: string;
//   price: number;
//   image: string;
// }[] {
//   // Nếu mảng arr rỗng hoặc không có phần tử nào
//   if (!arr || arr.length === 0) {
//     return [];
//   }

//   // Lọc bỏ các mảng con rỗng
//   const nonEmptyArr = arr.filter((subArr) => subArr.length > 0);

//   // Nếu tất cả mảng con đều rỗng
//   if (nonEmptyArr.length === 0) {
//     return [];
//   }

//   // Bắt đầu với mảng rỗng thay vì seed rỗng
//   let result: { value: string; price: number; image: string }[] = [];

//   for (let i = 0; i < nonEmptyArr.length; i++) {
//     const currentOptions = nonEmptyArr[i];

//     if (i === 0) {
//       // Khởi tạo với options đầu tiên
//       result = currentOptions.map((opt) => ({
//         value: opt.value,
//         price: opt.price,
//         image: opt.image,
//       }));
//     } else {
//       // Kết hợp với options tiếp theo
//       result = result.flatMap((existing) =>
//         currentOptions.map((opt) => ({
//           value: `${existing.value}-${opt.value}`,
//           price: opt.price,
//           image: opt.image,
//         })),
//       );
//     }
//   }

//   return result;
// }
export function GenerateSKU(
  variants: VariantType[],
  prop?: { basePrice: number; image: string },
): UpsertSKUBody[] {
  // Không có biến thể => không sinh SKU tổ hợp nào (khớp với BE: SKU mặc định do service tạo)
  if (!variants || variants.length === 0) return [];

  function getCombine(
    arr: {
      value: string;
      price: number;
      image?: string;
    }[][],
  ): {
    value: string;
    price: number;
    image?: string;
  }[] {
    const result = arr.reduce(
      (acc, curr) =>
        acc.flatMap((x) =>
          curr.map(({ image, price, value }) =>
            x.value
              ? { value: `${x.value}-${value}`, price, image }
              : { value: `${value}`, price, image },
          ),
        ),
      [
        {
          value: '',
          price: 0,
          image: '',
        },
      ],
    );
    return result;
  }

  // Bước 1: Lấy danh sách valueOption của từng Varient
  const options = variants.map((variant) => variant.valueOption);
  // if (options.length === 0) {
  //   options = [[{ value: 'Nguyên bản -', price: prop?.basePrice as number, image: prop?.image as string }]]
  // }
  // console.log('options', options)

  // Bước 2: Sinh tổ hợp SKU value
  const SKUValues = getCombine(options);

  // Bước 3: Map thành mảng SKU với giá trị mặc định
  const skus: UpsertSKUBodyType[] = SKUValues.map((value) => ({
    image: value.image,
    price: value.price,
    value: value.value,
  }));

  return skus;
}
/**
 * Dành cho Client và Guest và Staff
 */
export const GetProductQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
  page: z.coerce.number().int().positive().default(1),
  name: z.string().optional(),
  categories: z.array(z.coerce.number().int().positive()).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Asc),
  sortBy: z
    .enum([SortBy.CreatedAt, SortBy.Sale, SortBy.Price])
    .default(SortBy.CreatedAt),
}); //phu vu chuc nang filter

/**
 * Dành cho Admin , Manage
 */
export const GetManageProductQuerySchema = GetProductQuerySchema.extend({
  //boolean trong prerocess là yêu cầu đầu vào có kiểu là z.boolean
  isPublic: z.preprocess((value) => value === 'true', z.boolean()).optional(), //Vì  manager có thể xem được các sản phẩm chưa được đăng tải
});

export const GetProductsResSchema = z
  .object({
    data: z.array(
      ProductSchema.extend({
        productTranslations: z.array(ProductTranslationSchema),
        skus: z.array(SKUSchema),
        categories: z.array(CategoryIncludeTranslationSchema),
        createdBy: UserSchema.pick({
          id: true,
          name: true,
        }).nullable(),
      }),
    ),
    totalItems: z.number(),
    totalPages: z.number(),
    page: z.number(),
    limit: z.number(),
  })
  .strict();

export const GetProductParamSchema = z
  .object({
    productId: z.coerce.number().positive(),
  })
  .strict();
export const GetProductDetailSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
});

/** Tên món: bắt buộc, 2-100 ký tự (khớp BE) */
export const ProductNameInputSchema = z
  .string()
  .trim()
  .min(2, 'Tên món phải có ít nhất 2 ký tự')
  .max(100, 'Tên món tối đa 100 ký tự');

/** Ảnh phải là URL http(s) — chặn blob: khi upload thất bại */
export const ProductImagesInputSchema = z
  .array(
    z
      .string()
      .regex(/^https?:\/\/.+/i, 'Ảnh phải là URL http(s) hợp lệ')
      .max(500, 'URL ảnh quá dài'),
  )
  .max(10, 'Tối đa 10 ảnh');

export const ProductDescriptionInputSchema = z
  .string()
  .trim()
  .max(500, 'Mô tả tối đa 500 ký tự')
  .default('');

export const ProductPriceInputSchema = z
  .number()
  .positive('Giá phải lớn hơn 0');

/**
 * Schema dùng cho form thêm món ở FE.
 * Không chứa `skus` vì SKU được sinh từ biến thể lúc submit — tránh việc form báo lỗi
 * "sai số lượng SKU" trong lúc người dùng đang nhập.
 */
export const CreateProductFormSchema = z.object({
  name: ProductNameInputSchema,
  description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự'),
  basePrice: ProductPriceInputSchema,
  virtualPrice: ProductPriceInputSchema,
  images: ProductImagesInputSchema,
  categories: z.array(z.number().int().positive()),
  publishedAt: z.date().nullable(),
  variants: z.array(VariantSchema),
});

export type CreateProductFormType = z.infer<typeof CreateProductFormSchema>;

export const CreateProductBodySchema = ProductSchema.pick({
  basePrice: true,
  virtualPrice: true,
  name: true,
  variants: true,
  publishedAt: true,
  images: true,
})
  .extend({
    name: ProductNameInputSchema,
    images: ProductImagesInputSchema,
    description: ProductDescriptionInputSchema,
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus, basePrice, images, name }, ctx) => {
    // Không có biến thể: chỉ cần 0 hoặc 1 SKU mặc định (value = tên món)
    if (variants.length === 0) {
      if (skus.length > 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['skus'],
          message: 'Sản phẩm không có biến thể chỉ cần 1 SKU mặc định',
        });
        return;
      }
      if (skus.length === 1 && skus[0].value !== '' && skus[0].value !== name) {
        ctx.addIssue({
          code: 'custom',
          path: ['skus', 0, 'value'],
          message: `Khi không có biến thể, SKU phải có value = "${name}"`,
        });
      }
      return;
    }

    const skuValueArray = GenerateSKU(variants, {
      basePrice,
      image: images[0],
    });

    if (skus.length !== skuValueArray.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Cần ${skuValueArray.length} SKU theo biến thể, đang có ${skus.length}. Vui lòng kiểm tra lại`,
      });
      return;
    }

    const wrongSKUIndex = skus.findIndex(
      (sku, index) => sku.value !== skuValueArray[index].value,
    );
    if (wrongSKUIndex !== -1) {
      ctx.addIssue({
        code: 'custom',
        path: ['skus', wrongSKUIndex, 'value'],
        message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ. Vui lòng kiểm tra lại`,
      });
    }
  });

export type UpsertSKUBodyType = z.infer<typeof UpsertSKUBodySchema>;
export const UpdateProductBodySchema = ProductSchema.pick({
  basePrice: true,
  virtualPrice: true,
  name: true,
  variants: true,
  publishedAt: true,
  images: true,
})
  .extend({
    name: ProductNameInputSchema,
    images: ProductImagesInputSchema,
    // Update: không bắt buộc gửi mô tả — không gửi thì BE giữ nguyên mô tả cũ
    description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự').optional(),
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus, basePrice, images, name }, ctx) => {
    if (variants.length === 0) {
      if (skus.length !== 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['skus'],
          message: `Khi không có variants, cần đúng 1 SKU kế thừa từ sản phẩm gốc`,
        });
        return;
      }

      const expectedSku = {
        value: name,
        price: basePrice,
        image: images[0] ?? '',
      };

      const sku = skus[0];
      if (sku.value !== expectedSku.value) {
        ctx.addIssue({
          code: 'custom',
          path: ['skus', 0, 'value'],
          message: `SKU phải có value = "${expectedSku.value}"`,
        });
      }
      return;
    }

    // ✅ Trường hợp có variants → kiểm tra generate
    const generatedSkus = GenerateSKU(variants, {
      basePrice,
      image: images[0],
    });

    if (skus.length !== generatedSkus.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Cần có ${generatedSkus.length} SKUs khi có variants. Vui lòng kiểm tra lại`,
      });
      return;
    }

    // check từng SKU
    skus.forEach((sku, index) => {
      if (sku.value !== generatedSkus[index].value) {
        ctx.addIssue({
          code: 'custom',
          path: ['skus', index, 'value'],
          message: `SKU index ${index} không khớp với variants. Expected "${generatedSkus[index].value}"`,
        });
      }
    });
  });

// export const UpdateProductBodySchema = ProductSchema.pick({
//   basePrice: true,
//   virtualPrice: true,
//   name: true,
//   variants: true,
//   publishedAt: true,
//   images: true,
// })
//   .extend({
//     categories: z.array(z.coerce.number().int().positive()),
//     skus: z.array(UpsertSKUBodySchema),
//   })
//   .strict()
//   .superRefine(({ variants, skus, basePrice, images }, ctx) => {
//     console.log('variants', variants);
//     console.log('skus', skus);

//     // Bỏ qua validation nếu cả variants và skus đều rỗng (cho phép update)
//     if (variants.length === 0 && skus.length === 0) {
//       return;
//     }

//     // Nếu có dữ liệu, áp dụng validation giống Create
//     if (skus.length === 0) {
//       const generatedSkus = GenerateSKU(variants, {
//         basePrice,
//         image: images[0],
//       });
//       if (generatedSkus.length > 0) {
//         ctx.addIssue({
//           code: 'custom',
//           path: ['skus'],
//           message: `Số lượng SKUS nên là ${generatedSkus.length}. Vùi lòng kiểm tra lại`,
//         });
//       }
//       return;
//     }

//     const skuValueArray = GenerateSKU(variants, {
//       basePrice,
//       image: images[0],
//     });

//     if (skus.length !== skuValueArray.length) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ['skus'],
//         message: `Số lượng SKUS nên là ${skuValueArray.length}. Vùi lòng kiểm tra lại`,
//       });
//       return;
//     }

//     let wrongSKUIndex = -1;
//     const isValidSKUs = skus.every((sku, index) => {
//       const isValid = sku.value === skuValueArray[index].value;
//       if (!isValid) wrongSKUIndex = index;
//       return isValid;
//     });

//     if (!isValidSKUs) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ['skus', wrongSKUIndex],
//         message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ. Vui lòng kiểm tra lại `,
//       });
//     }
//   });

export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;

export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;

export type GetProductQueryType = z.infer<typeof GetProductQuerySchema>;

export type GetProductDetailType = z.infer<typeof GetProductDetailSchema>;

export type GetListProductsResType = z.infer<typeof GetProductsResSchema>;

export type GetProductParamType = z.infer<typeof GetProductParamSchema>;

export type GetManageProductQueryType = z.infer<
  typeof GetManageProductQuerySchema
>;
