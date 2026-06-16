import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import AddToCartForm from '@/components/AddToCartForm';

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

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // 1. Await and extract the search query 'q' from the URL securely
  const { q } = await searchParams;
  const query = q?.trim() || '';

  let products: Product[] = [];
  let errorMsg = null;

  if (query) {
    // 2. Query Supabase to find items where name OR description matches the search term
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
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      console.error('Search error:', error);
      errorMsg = 'Something went wrong with the search query.';
    } else {
      products = data as unknown as Product[];
    }
  }

  return (
    <main className="min-h-screen p-8 bg-white text-black font-sans">
      
      {/* Top Navigation / Breadcrumb */}
      <div className="mb-8">
        <Link href="/" className="font-mono text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
          &larr; Back to Marketplace
        </Link>
      </div>

      {/* Search Headline */}
      <header className="border-b-4 border-black pb-6 mb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Search Results for</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">
          &ldquo;<span className="text-underline decoration-black">{query || 'Everything'}</span>&rdquo;
        </h1>
        <p className="text-sm font-mono mt-2 font-bold text-gray-400">
          FOUND {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
        </p>
      </header>

      {/* Error handling */}
      {errorMsg && (
        <div className="border-4 border-black p-6 bg-red-50 font-mono font-bold">
          {errorMsg}
        </div>
      )}

      {/* Grid Results */}
      {products.length === 0 ? (
        <div className="border-4 border-black border-dashed p-16 text-center bg-gray-50">
          <p className="text-xl font-mono font-black uppercase text-gray-400 mb-2">No matching products found</p>
          <p className="text-xs font-mono text-gray-400">Try checking your spelling or search for something else like "Sambal" or "Ketaatan".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const storeName = product.users?.name || 'Unknown Store';
            const storeId = product.users?.user_id;
            const storeInitial = storeName.charAt(0).toUpperCase();

            return (
              <div key={product.product_id} className="border-2 border-black p-5 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
                <div>
                  
                  {/* Store Identity */}
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

                  {/* Product Image Link with cohesive Grayscale Hover Effect */}
                  <Link href={`/product/${product.product_id}`} className="block group/item cursor-pointer">
                    <div className="w-full h-48 border-2 border-black flex items-center justify-center bg-gray-50 mb-4 overflow-hidden relative">
                      
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

                    <h3 className="font-black text-lg mb-2 uppercase leading-tight group-hover/item:underline decoration-2 underline-offset-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs mb-6 line-clamp-3 font-mono text-gray-600">{product.description}</p>
                </div>

                {/* Pricing & Chunky Add-to-Cart Selector */}
                <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-auto">
                  <span className="font-black text-base">RM {Number(product.price).toFixed(2)}</span>
                  <AddToCartForm productId={product.product_id} />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}