import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-bc5d8c42/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Auth middleware to verify user
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    return null;
  }
  
  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return null;
  }
  
  return user;
};

// Sign up endpoint
app.post("/make-server-bc5d8c42/auth/signup", async (c) => {
  try {
    const { email, password, name, role = 'customer' } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user cart and wishlist
    await kv.set(`cart:${data.user.id}`, []);
    await kv.set(`wishlist:${data.user.id}`, []);
    
    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        role: data.user.user_metadata?.role
      }
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to sign up' }, 500);
  }
});

// Initialize demo data endpoint
app.post("/make-server-bc5d8c42/init-data", async (c) => {
  try {
    // Check if data already exists
    const existingProducts = await kv.get('products');
    if (existingProducts) {
      return c.json({ message: 'Data already initialized' });
    }

    // Categories
    const categories = [
      { id: 'electronics', name: 'Electronics', icon: 'Monitor' },
      { id: 'fashion', name: 'Fashion', icon: 'Shirt' },
      { id: 'home', name: 'Home & Living', icon: 'Home' },
      { id: 'sports', name: 'Sports & Outdoors', icon: 'Dumbbell' },
      { id: 'beauty', name: 'Beauty & Health', icon: 'Sparkles' },
      { id: 'books', name: 'Books', icon: 'Book' },
    ];

    // Products - 10+ per category
    const products = [
      // Electronics (12 products)
      { id: '1', name: 'Wireless Headphones', category: 'electronics', price: 79.99, originalPrice: 99.99, discount: 20, rating: 4.5, reviews: 128, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', description: 'Premium wireless headphones with noise cancellation', stock: 50 },
      { id: '2', name: 'Smart Watch', category: 'electronics', price: 199.99, originalPrice: 249.99, discount: 20, rating: 4.7, reviews: 256, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', description: 'Advanced fitness tracking and notifications', stock: 30 },
      { id: '3', name: 'Bluetooth Speaker', category: 'electronics', price: 39.99, originalPrice: 59.99, discount: 33, rating: 4.5, reviews: 412, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1', description: 'Portable waterproof Bluetooth speaker', stock: 85 },
      { id: '4', name: 'Gaming Mouse', category: 'electronics', price: 49.99, originalPrice: 69.99, discount: 29, rating: 4.7, reviews: 389, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', description: 'RGB gaming mouse with programmable buttons', stock: 110 },
      { id: '5', name: 'Mechanical Keyboard', category: 'electronics', price: 129.99, originalPrice: 159.99, discount: 19, rating: 4.8, reviews: 567, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', description: 'RGB mechanical keyboard with blue switches', stock: 45 },
      { id: '6', name: 'Webcam HD', category: 'electronics', price: 69.99, originalPrice: 89.99, discount: 22, rating: 4.4, reviews: 234, image: 'https://images.unsplash.com/photo-1526509867162-5b0c0d1b5ec7', description: '1080p HD webcam for streaming', stock: 67 },
      { id: '7', name: 'USB-C Hub', category: 'electronics', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f', description: '7-in-1 USB-C multiport adapter', stock: 120 },
      { id: '8', name: 'Wireless Charger', category: 'electronics', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.3, reviews: 445, image: 'https://images.unsplash.com/photo-1591290619762-d2c87c6eba39', description: 'Fast wireless charging pad', stock: 200 },
      { id: '9', name: 'Phone Camera Lens', category: 'electronics', price: 44.99, originalPrice: 64.99, discount: 31, rating: 4.5, reviews: 156, image: 'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385', description: '3-in-1 clip-on lens kit', stock: 78 },
      { id: '10', name: 'Power Bank 20000mAh', category: 'electronics', price: 39.99, originalPrice: 54.99, discount: 27, rating: 4.7, reviews: 678, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5', description: 'High capacity portable charger', stock: 95 },
      { id: '11', name: 'Laptop Stand', category: 'electronics', price: 29.99, originalPrice: 39.99, discount: 25, rating: 4.6, reviews: 324, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', description: 'Aluminum adjustable laptop stand', stock: 88 },
      { id: '12', name: 'Cable Organizer', category: 'electronics', price: 14.99, originalPrice: 19.99, discount: 25, rating: 4.4, reviews: 512, image: 'https://images.unsplash.com/photo-1558089687-7b7f2d3d9b4f', description: 'Magnetic cable management system', stock: 250 },

      // Fashion (12 products)
      { id: '13', name: 'Laptop Backpack', category: 'fashion', price: 49.99, originalPrice: 69.99, discount: 29, rating: 4.3, reviews: 89, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', description: 'Stylish and functional laptop backpack', stock: 100 },
      { id: '14', name: 'Winter Jacket', category: 'fashion', price: 119.99, originalPrice: 179.99, discount: 33, rating: 4.6, reviews: 287, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5', description: 'Warm and stylish winter jacket', stock: 40 },
      { id: '15', name: 'Leather Wallet', category: 'fashion', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.7, reviews: 456, image: 'https://images.unsplash.com/photo-1627123424574-724f4a4b2b60', description: 'Genuine leather bifold wallet', stock: 150 },
      { id: '16', name: 'Sunglasses UV Protection', category: 'fashion', price: 29.99, originalPrice: 44.99, discount: 33, rating: 4.5, reviews: 234, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083', description: 'Polarized UV400 sunglasses', stock: 120 },
      { id: '17', name: 'Canvas Sneakers', category: 'fashion', price: 44.99, originalPrice: 59.99, discount: 25, rating: 4.4, reviews: 567, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', description: 'Classic low-top canvas shoes', stock: 85 },
      { id: '18', name: 'Crossbody Bag', category: 'fashion', price: 54.99, originalPrice: 74.99, discount: 27, rating: 4.6, reviews: 345, image: 'https://images.unsplash.com/photo-1564422167509-4f27a8546e41', description: 'Leather crossbody messenger bag', stock: 65 },
      { id: '19', name: 'Baseball Cap', category: 'fashion', price: 19.99, originalPrice: 29.99, discount: 33, rating: 4.3, reviews: 789, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b', description: 'Adjustable cotton baseball cap', stock: 200 },
      { id: '20', name: 'Wrist Watch', category: 'fashion', price: 89.99, originalPrice: 129.99, discount: 31, rating: 4.8, reviews: 423, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d', description: 'Stainless steel analog watch', stock: 55 },
      { id: '21', name: 'Silk Scarf', category: 'fashion', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.5, reviews: 167, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26', description: 'Elegant silk printed scarf', stock: 90 },
      { id: '22', name: 'Leather Belt', category: 'fashion', price: 29.99, originalPrice: 44.99, discount: 33, rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583c2', description: 'Genuine leather dress belt', stock: 110 },
      { id: '23', name: 'Denim Jeans', category: 'fashion', price: 59.99, originalPrice: 79.99, discount: 25, rating: 4.7, reviews: 678, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d', description: 'Classic fit stretch denim jeans', stock: 75 },
      { id: '24', name: 'Polo Shirt', category: 'fashion', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.4, reviews: 345, image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d', description: 'Cotton pique polo shirt', stock: 95 },

      // Home & Living (12 products)
      { id: '25', name: 'Coffee Maker', category: 'home', price: 59.99, originalPrice: 79.99, discount: 25, rating: 4.4, reviews: 167, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6', description: 'Programmable coffee maker with timer', stock: 45 },
      { id: '26', name: 'Desk Lamp', category: 'home', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.3, reviews: 156, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', description: 'LED desk lamp with adjustable brightness', stock: 95 },
      { id: '27', name: 'Throw Pillow Set', category: 'home', price: 29.99, originalPrice: 44.99, discount: 33, rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', description: 'Decorative throw pillows 4-pack', stock: 80 },
      { id: '28', name: 'Wall Clock', category: 'home', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.5, reviews: 345, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c', description: 'Modern minimalist wall clock', stock: 120 },
      { id: '29', name: 'Candle Set', category: 'home', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.7, reviews: 567, image: 'https://images.unsplash.com/photo-1602874801006-96237de0bb3c', description: 'Scented soy candle collection', stock: 150 },
      { id: '30', name: 'Picture Frame Set', category: 'home', price: 39.99, originalPrice: 54.99, discount: 27, rating: 4.4, reviews: 234, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15', description: 'Gallery wall photo frame set', stock: 90 },
      { id: '31', name: 'Indoor Plant Pot', category: 'home', price: 19.99, originalPrice: 29.99, discount: 33, rating: 4.6, reviews: 456, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411', description: 'Ceramic planter with drainage', stock: 200 },
      { id: '32', name: 'Storage Baskets', category: 'home', price: 44.99, originalPrice: 59.99, discount: 25, rating: 4.5, reviews: 178, image: 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5', description: 'Woven storage basket set', stock: 85 },
      { id: '33', name: 'Bath Towel Set', category: 'home', price: 49.99, originalPrice: 69.99, discount: 29, rating: 4.7, reviews: 345, image: 'https://images.unsplash.com/photo-1562184552-1af00d4c0db5', description: 'Egyptian cotton towel 6-piece', stock: 70 },
      { id: '34', name: 'Area Rug', category: 'home', price: 89.99, originalPrice: 119.99, discount: 25, rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1580480414847-2d1eacc0a8a3', description: 'Modern geometric area rug', stock: 40 },
      { id: '35', name: 'Cutting Board Set', category: 'home', price: 29.99, originalPrice: 39.99, discount: 25, rating: 4.5, reviews: 456, image: 'https://images.unsplash.com/photo-1584990347449-39abf0acf80d', description: 'Bamboo cutting board 3-piece', stock: 110 },
      { id: '36', name: 'Table Lamp', category: 'home', price: 54.99, originalPrice: 74.99, discount: 27, rating: 4.8, reviews: 289, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15', description: 'Modern bedside table lamp', stock: 65 },

      // Sports & Outdoors (12 products)
      { id: '37', name: 'Running Shoes', category: 'sports', price: 89.99, originalPrice: 129.99, discount: 31, rating: 4.8, reviews: 342, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', description: 'Comfortable running shoes for daily training', stock: 75 },
      { id: '38', name: 'Yoga Mat', category: 'sports', price: 29.99, originalPrice: 39.99, discount: 25, rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f', description: 'Non-slip eco-friendly yoga mat', stock: 120 },
      { id: '39', name: 'Resistance Bands', category: 'sports', price: 19.99, originalPrice: 29.99, discount: 33, rating: 4.5, reviews: 567, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc', description: 'Exercise resistance band set', stock: 150 },
      { id: '40', name: 'Water Bottle', category: 'sports', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.7, reviews: 892, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8', description: 'Insulated stainless steel bottle', stock: 200 },
      { id: '41', name: 'Gym Bag', category: 'sports', price: 44.99, originalPrice: 59.99, discount: 25, rating: 4.4, reviews: 234, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', description: 'Durable sports duffel bag', stock: 90 },
      { id: '42', name: 'Jump Rope', category: 'sports', price: 14.99, originalPrice: 19.99, discount: 25, rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0', description: 'Adjustable speed jump rope', stock: 180 },
      { id: '43', name: 'Dumbbells Set', category: 'sports', price: 79.99, originalPrice: 99.99, discount: 20, rating: 4.8, reviews: 356, image: 'https://images.unsplash.com/photo-1517344800994-0f4b8f6e6d4f', description: 'Adjustable weight dumbbell pair', stock: 55 },
      { id: '44', name: 'Fitness Tracker', category: 'sports', price: 59.99, originalPrice: 79.99, discount: 25, rating: 4.5, reviews: 678, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6', description: 'Heart rate and activity tracker', stock: 85 },
      { id: '45', name: 'Camping Tent', category: 'sports', price: 129.99, originalPrice: 179.99, discount: 28, rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4', description: '4-person waterproof camping tent', stock: 30 },
      { id: '46', name: 'Bicycle Helmet', category: 'sports', price: 39.99, originalPrice: 54.99, discount: 27, rating: 4.6, reviews: 345, image: 'https://images.unsplash.com/photo-1567369597474-e00ed7a5f4ad', description: 'Adjustable cycling helmet', stock: 95 },
      { id: '47', name: 'Tennis Racket', category: 'sports', price: 69.99, originalPrice: 94.99, discount: 26, rating: 4.5, reviews: 167, image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67', description: 'Professional tennis racket', stock: 45 },
      { id: '48', name: 'Hiking Backpack', category: 'sports', price: 84.99, originalPrice: 109.99, discount: 23, rating: 4.8, reviews: 289, image: 'https://images.unsplash.com/photo-1622260614927-2c4ba3fdd97e', description: '40L waterproof hiking backpack', stock: 60 },

      // Beauty & Health (12 products)
      { id: '49', name: 'Skincare Set', category: 'beauty', price: 69.99, originalPrice: 99.99, discount: 30, rating: 4.7, reviews: 198, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03', description: 'Complete skincare routine set', stock: 60 },
      { id: '50', name: 'Face Mask Pack', category: 'beauty', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.5, reviews: 456, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b', description: 'Hydrating sheet mask collection', stock: 150 },
      { id: '51', name: 'Hair Dryer', category: 'beauty', price: 54.99, originalPrice: 74.99, discount: 27, rating: 4.6, reviews: 345, image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a', description: 'Ionic hair dryer with diffuser', stock: 70 },
      { id: '52', name: 'Makeup Brush Set', category: 'beauty', price: 39.99, originalPrice: 54.99, discount: 27, rating: 4.7, reviews: 567, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796', description: 'Professional makeup brush 12-piece', stock: 90 },
      { id: '53', name: 'Essential Oil Set', category: 'beauty', price: 29.99, originalPrice: 44.99, discount: 33, rating: 4.5, reviews: 234, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108', description: 'Aromatherapy essential oil kit', stock: 120 },
      { id: '54', name: 'Facial Cleansing Brush', category: 'beauty', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.6, reviews: 345, image: 'https://images.unsplash.com/photo-1556228852-80f63f7d1e59', description: 'Electric facial cleansing device', stock: 85 },
      { id: '55', name: 'Vitamin C Serum', category: 'beauty', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.8, reviews: 678, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', description: 'Anti-aging vitamin C face serum', stock: 110 },
      { id: '56', name: 'Nail Polish Set', category: 'beauty', price: 19.99, originalPrice: 29.99, discount: 33, rating: 4.4, reviews: 234, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1', description: 'Long-lasting nail polish 6-pack', stock: 140 },
      { id: '57', name: 'Body Lotion', category: 'beauty', price: 16.99, originalPrice: 24.99, discount: 32, rating: 4.6, reviews: 445, image: 'https://images.unsplash.com/photo-1556228724-d2f011826fe1', description: 'Moisturizing body lotion 16oz', stock: 180 },
      { id: '58', name: 'Lip Balm Set', category: 'beauty', price: 14.99, originalPrice: 19.99, discount: 25, rating: 4.5, reviews: 567, image: 'https://images.unsplash.com/photo-1585155921228-7da5c2fd22ce', description: 'Nourishing lip balm variety pack', stock: 200 },
      { id: '59', name: 'Eye Cream', category: 'beauty', price: 34.99, originalPrice: 49.99, discount: 30, rating: 4.7, reviews: 345, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b', description: 'Anti-wrinkle eye cream', stock: 95 },
      { id: '60', name: 'Bath Bombs Set', category: 'beauty', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.6, reviews: 456, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108', description: 'Luxury bath bombs 12-pack', stock: 130 },

      // Books (12 products)
      { id: '61', name: 'Fiction Novel Collection', category: 'books', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.8, reviews: 523, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794', description: 'Bestselling fiction novel collection', stock: 200 },
      { id: '62', name: 'Cookbook', category: 'books', price: 29.99, originalPrice: 39.99, discount: 25, rating: 4.7, reviews: 345, image: 'https://images.unsplash.com/photo-1589998059171-988d887df646', description: 'Healthy recipes cookbook', stock: 150 },
      { id: '63', name: 'Self-Help Book', category: 'books', price: 19.99, originalPrice: 27.99, discount: 29, rating: 4.6, reviews: 678, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', description: 'Personal development guide', stock: 180 },
      { id: '64', name: 'Mystery Thriller', category: 'books', price: 16.99, originalPrice: 24.99, discount: 32, rating: 4.5, reviews: 456, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e', description: 'Suspenseful mystery novel', stock: 220 },
      { id: '65', name: 'Business Book', category: 'books', price: 27.99, originalPrice: 37.99, discount: 26, rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d', description: 'Entrepreneurship and leadership', stock: 140 },
      { id: '66', name: 'Art & Photography Book', category: 'books', price: 44.99, originalPrice: 59.99, discount: 25, rating: 4.8, reviews: 167, image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', description: 'Contemporary art collection', stock: 90 },
      { id: '67', name: 'Travel Guide', category: 'books', price: 22.99, originalPrice: 32.99, discount: 30, rating: 4.5, reviews: 345, image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe', description: 'World destinations travel guide', stock: 160 },
      { id: '68', name: 'Science Fiction', category: 'books', price: 18.99, originalPrice: 26.99, discount: 30, rating: 4.6, reviews: 567, image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365', description: 'Epic sci-fi adventure novel', stock: 190 },
      { id: '69', name: 'History Book', category: 'books', price: 32.99, originalPrice: 44.99, discount: 27, rating: 4.7, reviews: 234, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', description: 'World history chronicle', stock: 120 },
      { id: '70', name: 'Poetry Collection', category: 'books', price: 14.99, originalPrice: 19.99, discount: 25, rating: 4.4, reviews: 289, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', description: 'Modern poetry anthology', stock: 210 },
      { id: '71', name: 'Graphic Novel', category: 'books', price: 24.99, originalPrice: 34.99, discount: 29, rating: 4.8, reviews: 445, image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7', description: 'Award-winning graphic novel', stock: 175 },
      { id: '72', name: 'Biography', category: 'books', price: 21.99, originalPrice: 29.99, discount: 27, rating: 4.6, reviews: 356, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', description: 'Inspiring life story', stock: 155 },
    ];

    await kv.set('categories', categories);
    await kv.set('products', products);

    return c.json({ message: 'Data initialized successfully' });
  } catch (error) {
    console.log('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// Get all categories
app.get("/make-server-bc5d8c42/categories", async (c) => {
  try {
    const categories = await kv.get('categories') || [];
    return c.json(categories);
  } catch (error) {
    console.log('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Get all products
app.get("/make-server-bc5d8c42/products", async (c) => {
  try {
    const category = c.req.query('category');
    const search = c.req.query('search');
    
    let products = await kv.get('products') || [];
    
    // Filter by category
    if (category && category !== 'all') {
      products = products.filter((p: any) => p.category === category);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter((p: any) => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    return c.json(products);
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Get single product
app.get("/make-server-bc5d8c42/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const products = await kv.get('products') || [];
    const product = products.find((p: any) => p.id === id);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json(product);
  } catch (error) {
    console.log('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// Get user cart
app.get("/make-server-bc5d8c42/cart", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cart = await kv.get(`cart:${user.id}`) || [];
    const products = await kv.get('products') || [];
    
    // Enrich cart items with product details
    const enrichedCart = cart.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      return {
        ...item,
        product
      };
    });
    
    return c.json(enrichedCart);
  } catch (error) {
    console.log('Error fetching cart:', error);
    return c.json({ error: 'Failed to fetch cart' }, 500);
  }
});

// Add to cart
app.post("/make-server-bc5d8c42/cart", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { productId, quantity = 1 } = await c.req.json();
    
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    const cart = await kv.get(`cart:${user.id}`) || [];
    const existingItemIndex = cart.findIndex((item: any) => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    await kv.set(`cart:${user.id}`, cart);
    
    return c.json({ message: 'Added to cart', cart });
  } catch (error) {
    console.log('Error adding to cart:', error);
    return c.json({ error: 'Failed to add to cart' }, 500);
  }
});

// Update cart item
app.put("/make-server-bc5d8c42/cart/:productId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const { quantity } = await c.req.json();
    
    if (quantity < 0) {
      return c.json({ error: 'Invalid quantity' }, 400);
    }

    const cart = await kv.get(`cart:${user.id}`) || [];
    
    if (quantity === 0) {
      const updatedCart = cart.filter((item: any) => item.productId !== productId);
      await kv.set(`cart:${user.id}`, updatedCart);
    } else {
      const itemIndex = cart.findIndex((item: any) => item.productId === productId);
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        await kv.set(`cart:${user.id}`, cart);
      }
    }
    
    return c.json({ message: 'Cart updated' });
  } catch (error) {
    console.log('Error updating cart:', error);
    return c.json({ error: 'Failed to update cart' }, 500);
  }
});

// Remove from cart
app.delete("/make-server-bc5d8c42/cart/:productId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const cart = await kv.get(`cart:${user.id}`) || [];
    const updatedCart = cart.filter((item: any) => item.productId !== productId);
    
    await kv.set(`cart:${user.id}`, updatedCart);
    
    return c.json({ message: 'Removed from cart' });
  } catch (error) {
    console.log('Error removing from cart:', error);
    return c.json({ error: 'Failed to remove from cart' }, 500);
  }
});

// Clear cart
app.delete("/make-server-bc5d8c42/cart", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await kv.set(`cart:${user.id}`, []);
    
    return c.json({ message: 'Cart cleared' });
  } catch (error) {
    console.log('Error clearing cart:', error);
    return c.json({ error: 'Failed to clear cart' }, 500);
  }
});

// Get user wishlist
app.get("/make-server-bc5d8c42/wishlist", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const wishlist = await kv.get(`wishlist:${user.id}`) || [];
    const products = await kv.get('products') || [];
    
    // Enrich wishlist items with product details
    const enrichedWishlist = wishlist.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      return {
        ...item,
        product
      };
    });
    
    return c.json(enrichedWishlist);
  } catch (error) {
    console.log('Error fetching wishlist:', error);
    return c.json({ error: 'Failed to fetch wishlist' }, 500);
  }
});

// Add to wishlist
app.post("/make-server-bc5d8c42/wishlist", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { productId } = await c.req.json();
    
    if (!productId) {
      return c.json({ error: 'Product ID is required' }, 400);
    }

    const wishlist = await kv.get(`wishlist:${user.id}`) || [];
    const exists = wishlist.some((item: any) => item.productId === productId);
    
    if (!exists) {
      wishlist.push({ productId });
      await kv.set(`wishlist:${user.id}`, wishlist);
    }
    
    return c.json({ message: 'Added to wishlist', wishlist });
  } catch (error) {
    console.log('Error adding to wishlist:', error);
    return c.json({ error: 'Failed to add to wishlist' }, 500);
  }
});

// Remove from wishlist
app.delete("/make-server-bc5d8c42/wishlist/:productId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const wishlist = await kv.get(`wishlist:${user.id}`) || [];
    const updatedWishlist = wishlist.filter((item: any) => item.productId !== productId);
    
    await kv.set(`wishlist:${user.id}`, updatedWishlist);
    
    return c.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.log('Error removing from wishlist:', error);
    return c.json({ error: 'Failed to remove from wishlist' }, 500);
  }
});

// Get user profile
app.get("/make-server-bc5d8c42/profile", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      role: user.user_metadata?.role
    });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put("/make-server-bc5d8c42/profile", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name } = await c.req.json();
    
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: { 
          ...user.user_metadata,
          name 
        }
      }
    );

    if (error) {
      console.log('Error updating profile:', error);
      return c.json({ error: 'Failed to update profile' }, 500);
    }

    return c.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.log('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

Deno.serve(app.fetch);
