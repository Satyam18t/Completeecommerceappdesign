import { X, Heart, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";

interface WishlistItem {
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    stock: number;
    rating: number;
  };
}

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistItem[];
  onRemoveItem: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  onRemoveItem,
  onAddToCart,
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
            <h2>My Wishlist</h2>
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
              {wishlist.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Heart className="w-20 h-20 mb-4" />
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => {
                if (!item.product) return null;

                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="mb-1 line-clamp-2">{item.product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600">
                          ${item.product.price.toFixed(2)}
                        </span>
                        {item.product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${item.product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddToCart(item.productId)}
                        disabled={item.product.stock === 0}
                        className="w-full"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg h-fit"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
