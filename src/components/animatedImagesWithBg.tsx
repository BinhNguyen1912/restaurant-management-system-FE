// components/AnimatedImagesOnBg.jsx
'use client';

import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { Button } from '@/components/ui/button';
import { T } from '@/components/t';
import HorizontalScrollDishes from '@/components/HorizontalScrollDishes';
import { PublicProduct, usePublicProducts } from '@/hooks/usePublicProducts';

const MAX_CARDS = 3;
const MAX_ITEMS_PER_CARD = 4;

/** Gom món theo danh mục để hiện thẻ danh mục; dữ liệu lấy từ DB thay vì viết cứng */
function groupByCategory(products: PublicProduct[]) {
  const groups = new Map<
    number,
    { title: string; image: string | null; items: string[] }
  >();

  for (const product of products) {
    const category = product.categories?.[0];
    const key = category?.id ?? 0;
    const current = groups.get(key) ?? {
      title: category?.name ?? '',
      image: category?.logo ?? product.images?.[0] ?? null,
      items: [],
    };
    if (product.name) current.items.push(product.name);
    if (!current.image) current.image = product.images?.[0] ?? null;
    groups.set(key, current);
  }

  return Array.from(groups.values())
    .filter((group) => group.title && group.items.length > 0)
    .slice(0, MAX_CARDS);
}

const AnimatedImagesOnBg = () => {
  const { products, isLoading } = usePublicProducts();
  const menuCategories = groupByCategory(products);

  return (
    <div className="relative w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw] py-20">
      {/* Background */}
      {/* Nền gradient tự vẽ: trước đây là ảnh hotlink từ website của nhà hàng khác */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-amber-800/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-4 font-serif">
              <T>Thực đơn</T>
            </h1>
            <p className="text-xl text-amber-800 mb-6">
              <T>Đi đâu để ăn món Việt khắp ba miền?</T>
            </p>
            <p className="text-lg text-amber-700 max-w-4xl mx-auto leading-relaxed">
              <T>
                B'Restaurant phục vụ các món ngon truyền thống, đảm bảo vệ sinh an toàn thực phẩm, khâu tuyển chọn
                nguyên liệu tươi ngon, quy trình kiểm định nghiêm ngặt để mang đến trải nghiệm hoàn hảo nhất cho mỗi
                bữa ăn.
              </T>
            </p>
          </motion.div>
        </div>

        {/* Menu Categories — lấy từ DB (GET /product gom theo danh mục), không viết cứng nữa */}
        {isLoading && (
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {Array.from({ length: MAX_CARDS }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-2xl bg-amber-100/60" />
            ))}
          </div>
        )}
        {!isLoading && menuCategories.length === 0 && (
          <p className="mb-12 text-center text-lg text-amber-800">
            <T>Thực đơn đang được cập nhật</T>
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {menuCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: 'easeOut',
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              className="group relative cursor-pointer"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-amber-50">
                <SafeImage
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-amber-800/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.items.slice(0, MAX_ITEMS_PER_CARD).map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Menu Button */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <T>Xem menu</T>
            </Button>
          </motion.div>
        </div>

        {/* New Dishes Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 font-serif">
              <T>Các món mới</T>
            </h2>
            <p className="text-lg text-amber-700 max-w-3xl mx-auto">
              <T>
                B'Restaurant là điểm đến lý tưởng cho những ai muốn khám phá hương vị đặc sắc của ẩm thực ba miền.
                Không chỉ trải nghiệm không gian ấm cúng, chúng tôi tự hào mang đến cho bạn và gia đình bữa ăn đậm đà
                bản sắc ẩm thực Việt Nam.
              </T>
            </p>
          </motion.div>
        </div>

        {/* Băng chuyền món: trước đây section này chỉ có tiêu đề, không có món nào */}
        <HorizontalScrollDishes products={products} />
      </div>
    </div>
  );
};

export default AnimatedImagesOnBg;
