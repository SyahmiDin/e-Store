import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export const revalidate = 0; // Keep the directory fresh as new sellers join

export default async function ShopsDirectoryPage() {
  // Fetch all users who are registered as sellers
  const { data: sellers, error } = await supabase
    .from('users')
    .select('user_id, name, created_at')
    .eq('role', 'seller')
    .order('name', { ascending: true }); // Alphabetical order

  if (error) {
    console.error('Error fetching sellers:', error);
    return (
      <div className="min-h-screen bg-white text-black p-8 font-mono">
        <p>Error loading the shop directory.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-white text-black font-sans max-w-6xl mx-auto">
      
      {/* Header */}
      <header className="border-b-4 border-black pb-4 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">Shop Directory</h1>
          <p className="text-sm font-mono uppercase tracking-widest">Discover our sellers</p>
        </div>
        <Link href="/" className="font-bold hover:underline uppercase text-sm">
          &larr; Back to Home
        </Link>
      </header>

      {/* Sellers Grid */}
      <section>
        {!sellers || sellers.length === 0 ? (
          <p className="italic font-mono border border-dashed border-black p-8 text-center">
            No sellers have joined the marketplace yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellers.map((seller) => (
              <div 
                key={seller.user_id} 
                className="border-4 border-black p-6 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
              >
                {/* Store Avatar */}
                <div className="w-24 h-24 bg-black text-white flex items-center justify-center font-black text-5xl border-2 border-black mb-4">
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Store Info */}
                <h2 className="text-2xl font-black uppercase tracking-wider mb-1">{seller.name}</h2>
                <p className="font-mono text-sm mb-6 text-gray-600">
                  Joined: {new Date(seller.created_at).toLocaleDateString()}
                </p>
                
                {/* Visit Button */}
                <Link 
                  href={`/shop/${seller.user_id}`} 
                  className="w-full border-2 border-black px-4 py-3 uppercase font-bold tracking-widest text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Visit Store
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      
    </main>
  );
}