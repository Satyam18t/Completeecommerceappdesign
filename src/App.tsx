import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { SplashScreen } from "./components/splash-screen";
import { AuthPage } from "./components/auth-page";
import { Header } from "./components/header";
import { CategorySidebar } from "./components/category-sidebar";
import { ProductCard } from "./components/product-card";
import { CartDrawer } from "./components/cart-drawer";
import { WishlistDrawer } from "./components/wishlist-drawer";
import { Toaster, toast } from "sonner@2.0.3";

interface Category {
  id: string;
  name: string;
  icon: string;
}

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

interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface WishlistItem {
  productId: string;
  product?: Product;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bc5d8c42`;

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          setAccessToken(session.access_token);
          setIsAuthenticated(true);
          await fetchUserProfile(session.access_token);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      initializeData();
      fetchCategories();
      fetchProducts();
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, accessToken]);

  // Fetch products when category or search changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [selectedCategory, searchQuery]);

  const initializeData = async () => {
    try {
      const response = await fetch(`${apiUrl}/init-data`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to initialize data");
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `${apiUrl}/products?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCart = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${apiUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchWishlist = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${apiUrl}/wishlist`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleAuthSuccess = async (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    await fetchUserProfile(token);
    toast.success("Welcome! You're now signed in.");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setAccessToken(null);
      setUser(null);
      setCart([]);
      setWishlist([]);
      toast.success("You've been logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!accessToken) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        await fetchCart();
        toast.success("Added to cart!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${apiUrl}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await fetchCart();
        if (quantity === 0) {
          toast.success("Item removed from cart");
        }
      } else {
        toast.error("Failed to update cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${apiUrl}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        await fetchCart();
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!accessToken) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }

    const isInWishlist = wishlist.some((item) => item.productId === productId);

    try {
      if (isInWishlist) {
        const response = await fetch(`${apiUrl}/wishlist/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          await fetchWishlist();
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const response = await fetch(`${apiUrl}/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          await fetchWishlist();
          toast.success("Added to wishlist!");
        } else {
          toast.error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${apiUrl}/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        await fetchWishlist();
        toast.success("Removed from wishlist");
      } else {
        toast.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleCheckout = () => {
    toast.info("Checkout feature coming soon!");
  };

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const getCategoryName = () => {
    if (!selectedCategory) return null;
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.name || null;
  };

  const handleViewDashboard = () => {
    toast.info("Dashboard feature coming soon!");
  };

  const handleViewOrders = () => {
    toast.info("Orders feature coming soon!");
  };

  const handleViewProfile = () => {
    toast.info("Profile feature coming soon!");
  };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        categoryName={getCategoryName()}
        onClearCategory={handleClearCategory}
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlistItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        userName={user?.name}
        userEmail={user?.email}
        onLogout={handleLogout}
        onViewDashboard={handleViewDashboard}
        onViewOrders={handleViewOrders}
        onViewProfile={handleViewProfile}
      />

      <div className="flex">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl mb-2">
                {selectedCategory
                  ? getCategoryName()
                  : searchQuery
                  ? `Search results for "${searchQuery}"`
                  : "All Products"}
              </h2>
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-xl">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={isProductInWishlist(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveItem={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
