import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = async () => {
    for (const prod of wishlist) {
      await addToCart(prod, 1);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon={<Heart className="w-16 h-16 text-rose-400" />}
          title="Danh sách yêu thích trống"
          description="Hãy tim thả cho những sản phẩm trái cây bạn yêu thích để dễ dàng tìm lại khi cần nhé!"
          actionText="Khám phá trái cây ngay"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Danh Sách Yêu Thích ({wishlist.length})
        </h1>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleAddAllToCart}
            variant="primary"
            size="sm"
            icon={<ShoppingBag className="w-4 h-4" />}
          >
            Thêm Tất Cả Vào Giỏ
          </Button>

          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Xóa tất cả
          </button>
        </div>
      </div>

      <ProductGrid products={wishlist} />
    </div>
  );
};
