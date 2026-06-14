import { supabase } from '@/utils/supabase';

export const revalidate = 0;

// Define the Product TypeScript interface based on our database schema
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
}

export default async function HomePage() {
  // Fetch products and perform a relational join to get the category slug
  const { data, error } = await supabase
    .from('products')
    .select(`
      product_id,
      name,
      description,
      price,
      category_id,
      categories ( name, slug )
    `);

  // Explicitly tell TypeScript that this data matches our Product interface
  const products = data as unknown as Product[] | null;

  if (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="min-h-screen bg-white text-black p-8 font-mono">
        <p>Error loading products. Check your console and Supabase connection.</p>
      </div>
    );
  }

  // Filter products into their respective categories based on the category slug
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
        <nav className="space-x-6 font-bold uppercase text-sm">
          <a href="#" className="hover:underline decoration-2 underline-offset-4">Cart (0)</a>
          <a href="#" className="hover:underline decoration-2 underline-offset-4">Login</a>
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

// Reusable Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border-2 border-black p-5 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
      <div>
        {/* Wireframe Image Placeholder */}
        <div className="w-full h-56 border-2 border-black flex items-center justify-center bg-white mb-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-50"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-black bg-white px-2 py-1 border border-black relative z-10">
            Image Placeholder
          </span>
        </div>
        
        {/* Product Details */}
        <h3 className="font-black text-xl mb-2 uppercase leading-tight">{product.name}</h3>
        <p className="text-sm mb-6 line-clamp-3 font-mono">{product.description}</p>
      </div>
      
      {/* Price & Action */}
      <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-auto">
        <span className="font-black text-lg">RM {Number(product.price).toFixed(2)}</span>
        <button className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold tracking-wider">
          Add to Cart
        </button>
      </div>
    </div>
  );
}