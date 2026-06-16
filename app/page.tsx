import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import { addToCart } from './actions/cart';
import AddToCartForm from '@/components/AddToCartForm';
import HeroCarousel from '@/components/HeroCarousel';

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string | null;
  categories: {
    name: string;
    slug: string;
  };
  users: {
    user_id: string;
    name: string;
  };
}

export const revalidate = 0;

export default async function HomePage() {
  // 1. Check if a user is currently logged in securely
  const { data: { user } } = await supabase.auth.getUser();

  let buyerName = null;
  let cartItemCount = 0;
  let userRole = null; // <--- Add this variable

  // 2. If logged in, fetch their name, role AND cart count
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, role')
      .eq('user_id', user.id)
      .single();

    buyerName = profile?.name;
    userRole = profile?.role;

    // Fetch the cart ID for this user
    const { data: cart } = await supabase
      .from('cart')
      .select('cart_id')
      .eq('buyer_id', user.id)
      .single();

    // If they have a cart, count how many unique items are in it!
    if (cart) {
      const { count } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('cart_id', cart.cart_id);

      cartItemCount = count || 0;
    }
  }

  // 3. Fetch all products (Same as before)
  const { data, error } = await supabase
    .from('products')
    .select(`
      product_id,
      name,
      description,
      price,
      image_url,
      category_id,
      categories ( name, slug ),
      users ( user_id, name )
    `);

  const products = data as unknown as Product[] | null;

  if (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="min-h-screen bg-white text-black p-8 font-mono">
        <p>Error loading products. Check your console and Supabase connection.</p>
      </div>
    );
  }

  const sambals = products?.filter((p) => p.categories?.slug === 'sambal') || [];
  const books = products?.filter((p) => p.categories?.slug === 'books') || [];

  // ---> NEW: Build your custom carousel list! <---
  // Let's grab the 1st Sambal, the 1st Book, and the 2nd Book (just to make 3 items)
  // The .filter(Boolean) part just ensures no empty/null slots break the carousel
  const featuredProducts = [
    sambals[0], 
    books[0], 
    books[1]
  ].filter(Boolean);

  return (
    <main className="min-h-screen p-8 bg-white text-black font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black pt-8 pb-4 mb-12 px-8 -mx-8 -mt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        
        {/* 1. Left: Brand Name */}
        <div className="w-full lg:flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">E-Store</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-500">Prototype Build</p>
        </div>

        {/* 2. Middle: Search Bar */}
        <div className="w-full lg:flex-1">
          <form action="/search" className="flex border-2 border-black focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
            <input 
              type="text" 
              name="q" 
              placeholder="SEARCH PRODUCTS..." 
              required
              className="w-full p-3 font-mono outline-none text-sm bg-gray-50 focus:bg-white"
            />
            <button type="submit" className="bg-black text-white px-6 font-bold uppercase tracking-widest hover:cursor-pointer hover:bg-white hover:text-black border-l-2 border-black transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* 3. Right: Dynamic Navigation */}
        <nav className="w-full lg:flex-1 space-x-6 font-bold uppercase text-sm flex items-center justify-end">
          
          {userRole === 'seller' && (
            <Link href="/dashboard" className="hover:underline decoration-2 underline-offset-4 bg-black text-white px-3 py-1">
              Seller Panel
            </Link>
          )}
          <Link href="/shops" className="hover:underline decoration-2 underline-offset-4">Stores</Link>
          
          {user && (
            <Link href="/profile" className="hover:underline decoration-2 underline-offset-4">Profile</Link>
          )}

          {/* Automatically updates when you click Add to Cart! */}
          <Link href="/cart" className="hover:underline decoration-2 underline-offset-4">
            Cart ({cartItemCount})
          </Link>

          {/* If user exists, show greeting AND Sign Out button. Otherwise, show Login/Register */}
          {buyerName ? (
            <div className="flex items-center gap-4 ml-4 border-l-2 border-black pl-6">
              <span className="font-mono text-xs">
                HELLO, <br/><span className="font-bold text-sm">{buyerName}</span>
              </span>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4 border-l-2 border-black pl-6">
              <Link href="/login" className="hover:underline decoration-2 underline-offset-4">Login</Link>
              <Link href="/register" className="hover:underline decoration-2 underline-offset-4">Register</Link>
            </div>
          )}
        </nav>
      </header>

      {/* --- HERO CAROUSEL --- */}
      <HeroCarousel products={featuredProducts} />

      {/* Sambal Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-black border-b-2 border-black pb-2 mb-6 uppercase">Sambal Selection</h2>
        {sambals.length === 0 ? (
          <p className="italic font-mono border border-dashed border-black p-4">No sambal products found in the database.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sambals.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Books Section */}
      <section>
        <h2 className="text-3xl font-black border-b-2 border-black pb-2 mb-6 uppercase">Books Selection</h2>
        {books.length === 0 ? (
          <p className="italic font-mono border border-dashed border-black p-4">No book products found in the database.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// Reusable Product Card Component
function ProductCard({ product }: { product: Product }) {
  const storeName = product.users?.name || 'Unknown Store';
  const storeId = product.users?.user_id;
  const storeInitial = storeName.charAt(0).toUpperCase();

  return (
    <div className="border-2 border-black p-5 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
      <div>
        {/* Store Link */}
        {storeId && (
          <Link href={`/shop/${storeId}`} className="flex items-center gap-2 mb-3 w-fit group/store">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs border border-black group-hover/store:bg-white group-hover/store:text-black transition-colors">
              {storeInitial}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider group-hover/store:underline decoration-2 underline-offset-2">
              {storeName}
            </span>
          </Link>
        )}

        {/* CLICKABLE PRODUCT LINK */}
        <Link href={`/product/${product.product_id}`} className="block group/item cursor-pointer">
          <div className="w-full h-56 border-2 border-black flex items-center justify-center bg-gray-50 mb-4 overflow-hidden relative">

            {/* 3. SHOW THE REAL IMAGE OR THE FALLBACK */}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-full grayscale transition-all duration-300 group-hover/item:scale-105 group-hover/item:grayscale-0"
              />
            ) : (
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-50"></div>
            )}

          </div>

          <h3 className="font-black text-xl mb-2 uppercase leading-tight group-hover/item:underline decoration-2 underline-offset-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm mb-6 line-clamp-3 font-mono">{product.description}</p>
      </div>

      {/* Price & Add to Cart */}
      <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-auto">
        <span className="font-black text-lg">RM {Number(product.price).toFixed(2)}</span>

        {/* ---> OUR NEW CLIENT COMPONENT <--- */}
        <AddToCartForm productId={product.product_id} />
      </div>
    </div>
  );
}