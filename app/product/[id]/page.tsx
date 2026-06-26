import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addToCart } from '@/app/actions/cart';
import AddToCartForm from '@/components/AddToCartForm';
import Header from '@/components/Header';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
    const { id } = await params;

    // 1. NEW FIX: Fetch the currently logged-in user!
    const { data: { user } } = await supabase.auth.getUser();
    
    // Extract the name (Checks metadata first, falls back to email prefix if name is empty)
    const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || null;

    // ---> NEW: Fetch the cart items to get the total count <---
    const { data: cartItems } = await supabase
        .from('cart_items')
        .select('quantity');
        // .eq('user_id', user.id) <-- Uncomment this if your cart is tied to specific users!

    // Add up all the quantities in the cart
    const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

    // 2. Fetch the exact product and join the store (users) and category data
    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      users (user_id, name),
      categories (name)
    `)
        .eq('product_id', id)
        .single();

    // If no product is found, automatically show a 404 page
    if (error || !product) {
        notFound();
    }

    // @ts-ignore
    const storeName = product.users?.name || 'Unknown Store';
    // @ts-ignore
    const storeId = product.users?.user_id;
    // @ts-ignore
    const categoryName = product.categories?.name || 'Uncategorized';
    
    return (
        <main className="min-h-screen p-8 bg-white text-black font-sans">

            {/* 3. NEW FIX: Pass the userName and cartCount into the Header! */}
            <Header showSearch={false} userName={userName} cartCount={cartCount} />

            {/* Breadcrumb Navigation */}
            <nav className="mb-8 font-mono text-sm uppercase tracking-widest flex gap-2 text-gray-500">
                <Link href="/" className="hover:text-black hover:underline decoration-2 underline-offset-4">Home</Link>
                <span>/</span>
                <span className="text-black font-bold">{categoryName}</span>
                <span>/</span>
                <span className="truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-12">

                {/* Left Side: Product Image */}
                <div className="w-full md:w-1/3">
                    <div className="w-full aspect-square border-4 border-black flex items-center justify-center bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">

                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-cover w-full h-full grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-50"></div>
                                <span className="text-lg font-mono uppercase tracking-widest text-black bg-white px-4 py-2 border-2 border-black relative z-10">
                                    No Image
                                </span>
                            </>
                        )}

                    </div>
                </div>

                {/* Right Side: Product Details */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">

                    {/* Store Info */}
                    {storeId && (
                        <Link href={`/shop/${storeId}`} className="inline-block border-2 border-black px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider mb-4 hover:bg-white hover:text-black transition-colors w-fit">
                            Store: {storeName}
                        </Link>
                    )}

                    {/* Title & Price */}
                    <h1 className="text-5xl font-black uppercase leading-none mb-6">{product.name}</h1>
                    <div className="text-4xl font-mono font-bold mb-8 pb-8 border-b-4 border-black">
                        RM {Number(product.price).toFixed(2)}
                    </div>

                    {/* Description */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold uppercase tracking-widest mb-4">Description</h2>
                        <p className="font-mono text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {product.description}
                        </p>
                    </div>

                    {/* Add to Cart Action */}
                    <div className="mt-8">
                        <AddToCartForm productId={product.product_id} />
                    </div>

                </div>
            </div>

        </main>
    );
}