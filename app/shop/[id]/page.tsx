import { supabase } from '@/utils/supabase';
import Link from 'next/link';

interface Product {
    product_id: string;
    name: string;
    description: string;
    price: number;
    categories: {
        name: string;
        slug: string;
    };
}

export const revalidate = 0;

// Notice the type change to Promise<{ id: string }>
export default async function ShopPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. AWAIT the params to safely extract the ID!
    const resolvedParams = await params;
    const sellerId = resolvedParams.id;

    // 2. Simple safety check
    if (!sellerId || sellerId === 'undefined') {
        return (
            <div className="min-h-screen bg-white text-black p-8 font-mono flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-black uppercase mb-4">Invalid Store Link</h1>
                <p className="mb-8 border border-dashed border-black p-4">
                    This link is broken, or the product does not have a valid store attached to it.
                </p>
                <Link href="/" className="border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors uppercase font-bold tracking-wider">
                    Return to Homepage
                </Link>
            </div>
        );
    }

    // 3. Fetch the seller's profile information
    const { data: seller, error: sellerError } = await supabase
        .from('users')
        .select('name, created_at')
        .eq('user_id', sellerId)
        .single();

    if (sellerError || !seller) {
        return (
            <div className="min-h-screen bg-white text-black p-8 font-mono flex flex-col items-center justify-center">
                <h1 className="text-4xl font-black uppercase mb-4">Store Not Found</h1>
                <p className="mb-8">The shop you are looking for does not exist or has been removed.</p>
                <Link href="/" className="border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors uppercase font-bold tracking-wider">
                    Return to Homepage
                </Link>
            </div>
        );
    }

    // 4. Fetch the seller's products
    const { data: rawProducts } = await supabase
        .from('products')
        .select(`
      product_id,
      name,
      description,
      price,
      categories ( name, slug )
    `)
        .eq('seller_id', sellerId)
        .eq('is_active', true);

    const products = rawProducts as unknown as Product[] | null;

    return (
        <main className="min-h-screen p-8 bg-white text-black font-sans max-w-6xl mx-auto">

            {/* Navigation */}
            <nav className="mb-8">
                <Link href="/" className="font-bold hover:underline uppercase text-sm flex items-center gap-2">
                    <span>&larr;</span> Back to Marketplace
                </Link>
            </nav>

            {/* Storefront Header */}
            <header className="border-4 border-black p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-black text-4xl border-2 border-black">
                        {seller.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">{seller.name}</h1>
                        <p className="text-sm font-mono uppercase">Official Store Front</p>
                    </div>
                </div>
                <div className="text-right font-mono text-sm border-l-4 border-black pl-6">
                    <p>Joined:</p>
                    <p className="font-bold">{new Date(seller.created_at).toLocaleDateString()}</p>
                </div>
            </header>

            {/* Store's Product Catalog */}
            <section>
                <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-6">
                    <h2 className="text-3xl font-black uppercase">All Products</h2>
                    <span className="font-mono text-sm">{products?.length || 0} Items</span>
                </div>

                {!products || products.length === 0 ? (
                    <p className="italic font-mono border border-dashed border-black p-8 text-center">This store has no active products right now.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))}
                    </div>
                )}
            </section>

        </main>
    );
}

// Reusable Product Card Component (Slightly simplified for the shop page)
function ProductCard({ product }: { product: Product }) {
    return (
        <div className="border-2 border-black p-5 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
            <div>
                {/* Category Badge */}
                <span className="inline-block bg-black text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 mb-3">
                    {product.categories?.name}
                </span>

                {/* Wireframe Image Placeholder */}
                <div className="w-full h-48 border-2 border-black flex items-center justify-center bg-white mb-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-50"></div>
                    <span className="text-xs font-mono uppercase tracking-widest text-black bg-white px-2 py-1 border border-black relative z-10">
                        Image Placeholder
                    </span>
                </div>

                {/* Product Details */}
                <h3 className="font-black text-lg mb-2 uppercase leading-tight">{product.name}</h3>
            </div>

            {/* Price & Action */}
            <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-4">
                <span className="font-black text-lg">RM {Number(product.price).toFixed(2)}</span>
                <button className="border-2 border-black px-3 py-2 hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold tracking-wider">
                    Add
                </button>
            </div>
        </div>
    );
}