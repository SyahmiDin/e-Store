import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
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

  // 2. If logged in, fetch their name from our public.users table
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('user_id', user.id)
      .single();
    
    buyerName = profile?.name;
  }

  // 3. Fetch all products (Same as before)
  const { data, error } = await supabase
    .from('products')
    .select(`
      product_id,
      name,
      description,
      price,
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

  return (
    <main className="min-h-screen p-8 bg-white text-black font-sans">
      {/* Header */}
      <header className="border-b-4 border-black pb-4 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">E-Store</h1>
          <p className="text-sm font-mono uppercase tracking-widest">Prototype Build</p>
        </div>
        
        {/* Dynamic Navigation */}
        <nav className="space-x-6 font-bold uppercase text-sm flex items-center">
          <Link href="/shops" className="hover:underline decoration-2 underline-offset-4">Stores</Link>
          <a href="#" className="hover:underline decoration-2 underline-offset-4">Cart (0)</a>
          
          {/* If user exists, show greeting AND Sign Out button. Otherwise, show Login/Register */}
          {buyerName ? (
            <div className="flex items-center gap-4">
              <span className="border-2 border-black px-3 py-1 bg-black text-white">
                HELLO, {buyerName}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link href="/login" className="hover:underline decoration-2 underline-offset-4">Login</Link>
              <Link href="/register" className="hover:underline decoration-2 underline-offset-4">Register</Link>
            </>
          )}
        </nav>
      </header>

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

// Reusable Product Card Component (Same as before)
function ProductCard({ product }: { product: Product }) {
  const storeName = product.users?.name || 'Unknown Store';
  const storeId = product.users?.user_id;
  const storeInitial = storeName.charAt(0).toUpperCase();

  return (
    <div className="border-2 border-black p-5 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
      <div>
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

        <div className="w-full h-56 border-2 border-black flex items-center justify-center bg-white mb-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-50"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-black bg-white px-2 py-1 border border-black relative z-10">
            Image Placeholder
          </span>
        </div>
        
        <h3 className="font-black text-xl mb-2 uppercase leading-tight">{product.name}</h3>
        <p className="text-sm mb-6 line-clamp-3 font-mono">{product.description}</p>
      </div>
      
      <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-auto">
        <span className="font-black text-lg">RM {Number(product.price).toFixed(2)}</span>
        <button className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold tracking-wider">
          Add to Cart
        </button>
      </div>
    </div>
  );
}