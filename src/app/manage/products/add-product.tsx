'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Upload, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

import DialogCategory from './dialog-category';
import {
  CreateProductBodyType,
  CreateProductFormSchema,
  CreateProductFormType,
  UpsertSKUBodyType,
  VariantOption,
} from '@/app/ValidationSchemas/product.schema';
import { mediaApiRequest } from '@/apiRequest/media';
import { useAddProductMutation } from '@/app/queries/useProducts';

/** Ảnh đã chọn nhưng chưa upload: giữ File + blob preview, upload 1 lần khi submit */
type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const createPreviewUrl = (file: File) => URL.createObjectURL(file);

/** Lấy thông điệp lỗi thật từ BE (validation 400/422) để hiển thị cho người dùng */
function getErrorMessage(error: unknown): string {
  const err = error as { payload?: any; message?: string } | undefined;
  const payload = err?.payload;
  if (payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors
      .map((item: { path?: (string | number)[]; message?: string }) => item.message)
      .filter(Boolean)
      .join(' • ');
  }
  if (payload?.message && typeof payload.message === 'string') {
    return payload.message;
  }
  if (err?.message) return err.message;
  return 'Có lỗi xảy ra khi thêm món ăn';
}

export default function AddDish() {
  const [open, setOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  /** blob preview URL của ảnh tuỳ chọn biến thể -> File tương ứng (upload khi submit) */
  const [variantFiles, setVariantFiles] = useState<Record<string, File>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const addProductMutation = useAddProductMutation();

  const form = useForm<CreateProductFormType>({
    resolver: zodResolver(CreateProductFormSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      virtualPrice: 0,
      images: [],
      categories: [],
      variants: [],
      publishedAt: null,
    },
  });

  const images = form.watch('images');
  const variants = form.watch('variants');

  // Dọn object URL khi unmount để không rò rỉ bộ nhớ
  const pendingImagesRef = useRef<PendingImage[]>([]);
  const variantFilesRef = useRef<Record<string, File>>({});
  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);
  useEffect(() => {
    variantFilesRef.current = variantFiles;
  }, [variantFiles]);
  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
      Object.keys(variantFilesRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, []);

  const setVariants = (next: CreateProductFormType['variants']) => {
    form.setValue('variants', next, { shouldDirty: true, shouldValidate: true });
  };

  /** Xoá file tạm + thu hồi blob preview của 1 ảnh tuỳ chọn biến thể */
  const dropVariantFile = (imageKey?: string) => {
    if (!imageKey || !variantFilesRef.current[imageKey]) return;
    URL.revokeObjectURL(imageKey);
    setVariantFiles((prev) => {
      const clone = { ...prev };
      delete clone[imageKey];
      return clone;
    });
  };

  // ===== ẢNH SẢN PHẨM =====
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const incoming = Array.from(selected).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`,
      file,
      previewUrl: createPreviewUrl(file),
    }));

    // Cộng dồn ảnh thay vì ghi đè (trước đây chọn ảnh lần 2 là mất ảnh lần 1)
    setPendingImages((prev) => [...prev, ...incoming]);
    // Cho phép chọn lại đúng file vừa xoá
    e.target.value = '';
  };

  const removePendingImage = (index: number) => {
    const target = pendingImages[index];
    if (!target) return;
    URL.revokeObjectURL(target.previewUrl);
    setPendingImages((prev) => prev.filter((item) => item.id !== target.id));
  };

  const removeUploadedImage = (index: number) => {
    form.setValue(
      'images',
      form.getValues('images').filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  // ===== BIẾN THỂ =====
  const handleAddVariant = () => {
    setVariants([
      ...form.getValues('variants'),
      { value: '', valueOption: [{ value: '', price: 0, image: '' }] },
    ]);
  };

  const handleVariantChange = (index: number, value: string) => {
    const next = [...form.getValues('variants')];
    next[index] = { ...next[index], value };
    setVariants(next);
  };

  const handleVariantOptionChange = (
    variantIndex: number,
    optionIndex: number,
    field: keyof VariantOption,
    value: string | number,
  ) => {
    const next = [...form.getValues('variants')];
    const options = [...next[variantIndex].valueOption];
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    next[variantIndex] = { ...next[variantIndex], valueOption: options };
    setVariants(next);
  };

  const handleAddVariantOption = (variantIndex: number) => {
    const next = [...form.getValues('variants')];
    next[variantIndex] = {
      ...next[variantIndex],
      valueOption: [
        ...next[variantIndex].valueOption,
        { value: '', price: 0, image: '' },
      ],
    };
    setVariants(next);
  };

  const handleRemoveVariantOption = (
    variantIndex: number,
    optionIndex: number,
  ) => {
    const next = [...form.getValues('variants')];
    const options = [...next[variantIndex].valueOption];
    const [removed] = options.splice(optionIndex, 1);
    next[variantIndex] = { ...next[variantIndex], valueOption: options };
    setVariants(next);
    // Xoá file tạm đi kèm preview đó
    dropVariantFile(removed?.image);
  };

  const handleRemoveVariant = (index: number) => {
    const next = [...form.getValues('variants')];
    const [removed] = next.splice(index, 1);
    setVariants(next);
    removed?.valueOption.forEach((option) => dropVariantFile(option.image));
  };

  const handleVariantImagePick = (
    variantIndex: number,
    optionIndex: number,
    file: File,
  ) => {
    const previous = form.getValues('variants')[variantIndex]?.valueOption[
      optionIndex
    ]?.image;
    if (previous && variantFiles[previous]) {
      URL.revokeObjectURL(previous);
      setVariantFiles((prev) => {
        const clone = { ...prev };
        delete clone[previous];
        return clone;
      });
    }

    const previewUrl = createPreviewUrl(file);
    setVariantFiles((prev) => ({ ...prev, [previewUrl]: file }));
    handleVariantOptionChange(variantIndex, optionIndex, 'image', previewUrl);
  };

  const resetForm = () => {
    pendingImagesRef.current.forEach((item) =>
      URL.revokeObjectURL(item.previewUrl),
    );
    Object.keys(variantFilesRef.current).forEach((url) =>
      URL.revokeObjectURL(url),
    );
    setPendingImages([]);
    setVariantFiles({});
    setShowCategoryDropdown(false);
    form.reset();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleSubmit = async (values: CreateProductFormType) => {
    if (addProductMutation.isPending) return;

    // Biến thể: bắt buộc có tên biến thể + giá trị tuỳ chọn (BE không chặn, nhưng SKU sẽ vô nghĩa)
    const invalidVariant = values.variants.find(
      (variant) => !variant.value.trim(),
    );
    if (invalidVariant) {
      toast.error('Tên biến thể không được để trống');
      return;
    }
    const invalidOption = values.variants.find((variant) =>
      variant.valueOption.some((option) => !option.value.trim()),
    );
    if (invalidOption) {
      toast.error('Giá trị tuỳ chọn của biến thể không được để trống');
      return;
    }

    try {
      // 1. Upload ảnh sản phẩm (chia lô 10 file/request, lỗi thì dừng — không gửi blob lên BE)
      const uploadedImageUrls = await mediaApiRequest.uploadMany(
        pendingImages.map((item) => item.file),
      );
      const finalImages = [...values.images, ...uploadedImageUrls];

      // 2. Upload ảnh của từng tuỳ chọn biến thể
      const uploadedVariants = await Promise.all(
        values.variants.map(async (variant) => {
          const valueOption = await Promise.all(
            variant.valueOption.map(async (option) => {
              const file = option.image ? variantFiles[option.image] : undefined;
              if (file) {
                const [url] = await mediaApiRequest.uploadMany([file]);
                return { ...option, image: url };
              }
              // Ảnh cũ đã là URL http(s) thì giữ, preview blob thì bỏ
              return {
                ...option,
                image: /^https?:\/\//i.test(option.image ?? '')
                  ? option.image
                  : '',
              };
            }),
          );
          return { ...variant, valueOption };
        }),
      );

      // 3. Sinh SKU: có biến thể -> mỗi tuỳ chọn 1 SKU; không có -> 1 SKU mặc định theo tên món
      const skus: UpsertSKUBodyType[] =
        uploadedVariants.length > 0
          ? uploadedVariants.flatMap((variant) =>
              variant.valueOption.map((option) => ({
                value: option.value,
                price: option.price,
                image: option.image ?? '',
              })),
            )
          : [
              {
                value: values.name,
                price: values.basePrice,
                image: finalImages[0] ?? '',
              },
            ];

      const body: CreateProductBodyType = {
        name: values.name,
        description: values.description ?? '',
        basePrice: values.basePrice,
        virtualPrice: values.virtualPrice,
        images: finalImages,
        categories: values.categories,
        publishedAt: values.publishedAt,
        variants: uploadedVariants,
        skus,
      };

      await addProductMutation.mutateAsync(body);
      toast.success('Thêm món ăn thành công!');
      handleOpenChange(false);
    } catch (error) {
      console.error('[add-product] create failed', error);
      toast.error(getErrorMessage(error));
    }
  };

  const isSubmitting = addProductMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Thêm món ăn
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm món ăn</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-dish-form"
            className="grid gap-6"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Hình & Upload */}
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {images.map((src, idx) => (
                    <div
                      key={`uploaded-${src}-${idx}`}
                      className="relative w-32 h-32 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={src}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 p-0"
                        onClick={() => removeUploadedImage(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {pendingImages.map((item, idx) => (
                    <div
                      key={item.id}
                      className="relative w-32 h-32 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={item.previewUrl}
                        alt={`Ảnh chờ upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 p-0"
                        onClick={() => removePendingImage(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {images.length === 0 && pendingImages.length === 0 && (
                    <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={imageInputRef}
                  onChange={handleFilesChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" /> Tải ảnh lên
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Tối đa 10 ảnh, mỗi ảnh &lt; 5MB
                </p>
              </div>

              {/* Thông tin cơ bản */}
              <div className="md:col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên món ăn</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Phở bò" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          maxLength={500}
                          placeholder="Mô tả ngắn về món ăn (không bắt buộc)"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá cơ bản</FormLabel>
                        <FormControl>
                          <Input
                            id="base-price"
                            type="number"
                            min={0}
                            step={1000}
                            value={Number.isFinite(field.value) ? field.value : ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="virtualPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá ảo</FormLabel>
                        <FormControl>
                          <Input
                            id="virtual-price"
                            type="number"
                            min={0}
                            step={1000}
                            value={Number.isFinite(field.value) ? field.value : ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Danh mục</Label>
                        <FormControl>
                          <DialogCategory
                            selectedCategories={field.value || []}
                            setSelectedCategories={field.onChange}
                            showCategoryDropdown={showCategoryDropdown}
                            setShowCategoryDropdown={setShowCategoryDropdown}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => {
                      const isPublished = field.value !== null;
                      const dateValue = field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0];

                      return (
                        <FormItem>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 text-sm">
                                <FormLabel>Trạng thái công khai</FormLabel>
                                <p className="text-[12px] text-muted-foreground">
                                  {isPublished ? 'Đã công khai' : 'Riêng tư'}
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={isPublished}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked ? new Date() : null)
                                  }
                                />
                              </FormControl>
                            </div>

                            {isPublished && (
                              <div className="grid gap-2">
                                <FormControl>
                                  <Input
                                    id="publish-date"
                                    type="date"
                                    value={dateValue}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? new Date(e.target.value)
                                          : null,
                                      )
                                    }
                                  />
                                </FormControl>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Biến thể */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Biến thể</h3>
                  <p className="text-xs text-muted-foreground">
                    Không bắt buộc. Không có biến thể thì món dùng 1 SKU mặc định
                    theo tên + giá cơ bản.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                >
                  <Plus className="h-4 w-4 mr-1" /> Thêm biến thể
                </Button>
              </div>

              {variants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có biến thể nào
                </p>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, variantIndex) => (
                    <div
                      key={variantIndex}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Tên biến thể (VD: Size)"
                          value={variant.value}
                          onChange={(e) =>
                            handleVariantChange(variantIndex, e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVariant(variantIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {variant.valueOption.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="grid grid-cols-1 md:grid-cols-[1fr_140px_120px_auto] gap-2 items-center"
                          >
                            <Input
                              placeholder="Giá trị (VD: L)"
                              value={option.value}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  variantIndex,
                                  optionIndex,
                                  'value',
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              type="number"
                              min={0}
                              step={1000}
                              placeholder="Giá"
                              value={Number.isFinite(option.price) ? option.price : 0}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  variantIndex,
                                  optionIndex,
                                  'price',
                                  e.target.value === ''
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                            />
                            <label className="relative h-10 rounded-md border border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer">
                              {option.image ? (
                                <img
                                  src={option.image}
                                  alt="Ảnh tuỳ chọn"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">
                                  Ảnh
                                </span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleVariantImagePick(
                                      variantIndex,
                                      optionIndex,
                                      file,
                                    );
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={variant.valueOption.length <= 1}
                              onClick={() =>
                                handleRemoveVariantOption(
                                  variantIndex,
                                  optionIndex,
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddVariantOption(variantIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Thêm tuỳ chọn
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" form="add-dish-form" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Thêm món ăn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
