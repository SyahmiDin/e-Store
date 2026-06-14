import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';

export default async function AddProductPage() {
  // Fetch categories so we can populate the dropdown menu
  const { data: categories } = await supabase.from('categories').select('*');

  // SERVER ACTION: This function runs securely on the server when the form is submitted
  async function createProduct(formData: FormData) {
    'use server';
    
    // 1. Get Ali Store's ID (Simulating our logged-in user)
    const { data: seller } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', 'ali@shopee-clone.com')
      .single();

    // 2. Extract data from the form
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock_qty = parseInt(formData.get('stock_qty') as string);
    const category_id = formData.get('category_id') as string;
    
    // Auto-generate a URL slug from the name (e.g., "Hot Sambal" -> "hot-sambal")
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 3. Insert the new product into Supabase
    const { error } = await supabase.from('products').insert({
      seller_id: seller?.user_id,
      category_id,
      name,
      slug,
      description,
      price,
      stock_qty,
      is_active: true,
    });

    if (error) {
      console.error('Failed to insert:', error);
      throw new Error('Failed to create product');
    }

    // 4. Redirect the user back to the dashboard table
    redirect('/seller/dashboard');
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans p-8 md:p-16 max-w-3xl mx-auto">
      <header className="mb-10 border-b-4 border-black pb-4 flex justify-between items-end">
        <h1 className="text-4xl font-extrabold uppercase tracking-widest">Add New Product</h1>
        <a href="/seller/dashboard" className="font-bold hover:underline uppercase text-sm">Cancel & Return</a>
      </header>

      {/* The Form */}
      <form action={createProduct} className="space-y-8">
        
        {/* Name Field */}
        <div className="flex flex-col">
          <label htmlFor="name" className="font-bold uppercase tracking-wider mb-2">Product Name</label>
          <input type="text" id="name" name="name" required placeholder="e.g., Sambal Ijo Extra Pedas"
            className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono" />
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col">
          <label htmlFor="category_id" className="font-bold uppercase tracking-wider mb-2">Category</label>
          <select id="category_id" name="category_id" required className="border-2 border-black p-3 bg-white font-mono focus:outline-none">
            <option value="">-- Select a Category --</option>
            {categories?.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Price and Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label htmlFor="price" className="font-bold uppercase tracking-wider mb-2">Price (RM)</label>
            <input type="number" step="0.01" id="price" name="price" required placeholder="0.00"
              className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono" />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="stock_qty" className="font-bold uppercase tracking-wider mb-2">Initial Stock</label>
            <input type="number" id="stock_qty" name="stock_qty" required placeholder="10"
              className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono" />
          </div>
        </div>

        {/* Description Field */}
        <div className="flex flex-col">
          <label htmlFor="description" className="font-bold uppercase tracking-wider mb-2">Description</label>
          <textarea id="description" name="description" rows={5} required placeholder="Describe your product..."
            className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono"></textarea>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-lg p-4 hover:bg-white hover:text-black border-4 border-black transition-colors">
          Publish Product
        </button>
      </form>
    </div>
  );
}