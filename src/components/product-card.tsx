import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-4 flex flex-col">
      <div className="relative mb-4 group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        {product.discount && product.discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
            -{product.discount}%
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart
            className={`w-5 h-5 ${
              isInWishlist
                ? "fill-red-500 text-red-500"
                : "text-gray-400"
            }`}
          />
        </button>
      </div>

      <h3 className="mb-2 line-clamp-2">{product.name}</h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {product.description}
      </p>

      <div className="flex items-center gap-2 mb-3">
        {renderStars(product.rating)}
        <span className="text-sm text-gray-600">({product.reviews})</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl text-blue-600">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <span className="text-sm text-gray-400 line-through">
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
      </div>

      <Button
        onClick={() => onAddToCart(product.id)}
        className="w-full mt-auto"
        disabled={product.stock === 0}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
