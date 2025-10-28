import { ShoppingBag, ShoppingCart, Search, X, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AccountMenu } from "./account-menu";
import { Badge } from "./ui/badge";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  categoryName: string | null;
  onClearCategory: () => void;
  cartItemCount: number;
  wishlistItemCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  userName: string | undefined;
  userEmail: string | undefined;
  onLogout: () => void;
  onViewDashboard: () => void;
  onViewOrders: () => void;
  onViewProfile: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedCategory,
  categoryName,
  onClearCategory,
  cartItemCount,
  wishlistItemCount,
  onOpenCart,
  onOpenWishlist,
  userName,
  userEmail,
  onLogout,
  onViewDashboard,
  onViewOrders,
  onViewProfile,
}: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl">Sense Original</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <div className="flex items-center gap-2">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Shop
              </a>
              {selectedCategory && categoryName && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
                  onClick={onClearCategory}
                >
                  {categoryName}
                  <X className="w-3 h-3" />
                </Badge>
              )}
            </div>
            <a href="#" className="hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onOpenWishlist}
            >
              <Heart className="w-5 h-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onOpenCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
            <AccountMenu
              userName={userName}
              userEmail={userEmail}
              onLogout={onLogout}
              onViewDashboard={onViewDashboard}
              onViewOrders={onViewOrders}
              onViewProfile={onViewProfile}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
