import { T } from '@/components/t';
import { useI18n } from '@/i18n/locale-provider';
import { tr } from '@/i18n/tr';
// components/Home.tsx
'use client';

const Home = () => {
  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-4xl font-bold mb-6">{tr("Chào mừng đến với trang chủ")}</h1>
      <p className="text-lg mb-8">{tr("Next.js đã tải xong và sẵn sàng hoạt động!")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{tr("Tính năng 1")}</h3>
          <p>
            <T>Mô tả tính năng đầu tiên của website với thiết kế trắng đen tinh tế.</T>
          </p>
        </div>
        <div className="p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{tr("Tính năng 2")}</h3>
          <p>
            <T>Mô tả tính năng thứ hai của website với thiết kế trắng đen tinh tế.</T>
          </p>
        </div>
        <div className="p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{tr("Tính năng 3")}</h3>
          <p>
            <T>Mô tả tính năng thứ ba của website với thiết kế trắng đen tinh tế.</T>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
