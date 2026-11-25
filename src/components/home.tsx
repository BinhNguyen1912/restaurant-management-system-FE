import { T } from '@/components/t';
// components/Home.tsx
'use client';

const Home = () => {
  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-4xl font-bold mb-6"><T>Chào mừng đến với trang chủ</T></h1>
      <p className="text-lg mb-8"><T>Next.js đã tải xong và sẵn sàng hoạt động!</T></p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-semibold mb-3"><T>Tính năng 1</T></h3>
          <p>
            Mô tả tính năng đầu tiên của website với thiết kế trắng đen tinh tế.
          </p>
        </div>
        <div className="p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-semibold mb-3"><T>Tính năng 2</T></h3>
          <p>
            Mô tả tính năng thứ hai của website với thiết kế trắng đen tinh tế.
          </p>
        </div>
        <div className="p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-semibold mb-3"><T>Tính năng 3</T></h3>
          <p>
            Mô tả tính năng thứ ba của website với thiết kế trắng đen tinh tế.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
