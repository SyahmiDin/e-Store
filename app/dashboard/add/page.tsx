import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { addProduct } from '@/app/actions/product';

export default async function AddProductPage() {
  // 1. Verify user is logged in and is a seller
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'seller') {
    redirect('/');
  }

  // 2. Fetch categories for the dropdown menu
  const { data: categories } = await supabase
    .from('categories')
    .select('category_id, name')
    .order('name');

  return (
    <main className="min-h-screen p-8 bg-white text-black font-sans">
      
      <header className="mb-12 border-b-4 border-black pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-widest mb-2">New Product</h1>
          <p className="text-lg font-mono font-bold text-gray-500">Expand your inventory</p>
        </div>
        <Link href="/dashboard" className="font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4 text-sm border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
          &larr; Cancel
        </Link>
      </header>

      <form action={addProduct} className="border-4 border-black p-8 bg-gray-50 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-bold uppercase tracking-wider text-sm">Product Name</label>
          <input 
            type="text" 
            id="name"
            name="name" 
            required
            placeholder="e.g., Spicy Sambal Extra Hot"
            className="border-2 border-black p-4 font-mono focus:outline-none focus:ring-2 focus:ring-black text-lg"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="price" className="font-bold uppercase tracking-wider text-sm">Price (RM)</label>
            <input 
              type="number" 
              id="price"
              name="price" 
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="border-2 border-black p-4 font-mono focus:outline-none focus:ring-2 focus:ring-black text-lg"
            />
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="category_id" className="font-bold uppercase tracking-wider text-sm">Category</label>
            <select 
              id="category_id"
              name="category_id"
              required
              className="border-2 border-black p-4 font-mono focus:outline-none focus:ring-2 focus:ring-black text-lg bg-white"
            >
              <option value="">Select a category...</option>
              {categories?.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-bold uppercase tracking-wider text-sm">Product Description</label>
          <textarea 
            id="description"
            name="description" 
            rows={5}
            required
            placeholder="Describe your product..."
            className="border-2 border-black p-4 font-mono focus:outline-none focus:ring-2 focus:ring-black resize-none"
          ></textarea>
        </div>

        <button type="submit" className="bg-black text-white font-black uppercase tracking-widest text-xl p-6 hover:bg-white hover:text-black border-4 border-black transition-colors mt-4">
          Publish Product
        </button>
      </form>

    </main>
  );
}