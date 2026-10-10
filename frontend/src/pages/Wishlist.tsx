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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          icon={<Heart className="w-14 h-14 text-rose-400" />}
          title="Danh Sách Yêu Thích Trống"
          description="Bấm vào biểu tượng trái tim trên các thẻ sản phẩm để lưu lại những loại trái cây bạn yêu thích nhé!"
          actionText="Khám phá trái cây ngay"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Danh Sách Yêu Thích ({wishlist.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Các loại trái cây bạn đã lưu lại để mua sau.
          </p>
        </div>

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
            type="button"
            onClick={clearWishlist}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa tất cả</span>
          </button>
        </div>
      </div>

      <ProductGrid products={wishlist} />
    </div>
  );
};
