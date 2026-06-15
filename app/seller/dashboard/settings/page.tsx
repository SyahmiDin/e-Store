import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0; // Ensure we always load the latest profile data

export default async function StoreSettingsPage() {
  // 1. Fetch the logged-in seller (Simulating 'Ali Store')
  const { data: seller, error: sellerError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'ali@shopee-clone.com')
    .single();

  if (sellerError || !seller) {
    return (
      <div className="min-h-screen p-8 font-mono bg-white text-black border-4 border-black m-8">
        <p>Error: Seller account not found.</p>
      </div>
    );
  }

  // 2. SERVER ACTION: Handle form submission to update the database
  async function updateStoreProfile(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase
      .from('users')
      .update({ name, phone, address })
      .eq('email', 'ali@shopee-clone.com');

    if (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update store settings');
    }

    // Redirect back to dashboard after saving
    redirect('/seller/dashboard');
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r-4 border-black p-6 flex flex-col">
        <div className="mb-12 border-b-4 border-black pb-4">
          <h1 className="text-2xl font-black uppercase tracking-wider mb-1">Seller Hub</h1>
          <p className="text-sm font-mono uppercase">Logged in as: <br/><b>{seller.name}</b></p>
        </div>
        
        <nav className="flex flex-col space-y-4 font-bold uppercase tracking-wider">
          <Link href="/seller/dashboard" className="p-2 border-2 border-transparent hover:border-black transition-colors">Dashboard</Link>
          <a href="#" className="p-2 border-2 border-transparent hover:border-black transition-colors">Orders (0)</a>
          <Link href="/seller/dashboard/settings" className="p-2 border-2 border-black bg-black text-white">Store Settings</Link>
        </nav>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 p-8 max-w-3xl">
        
        {/* Header */}
        <header className="mb-12 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-extrabold uppercase tracking-widest">Personal Shop Profile</h2>
          <p className="font-mono mt-2">Update your public store details here.</p>
        </header>

        {/* Settings Form */}
        <form action={updateStoreProfile} className="space-y-8">
          
          {/* Store Name */}
          <div className="flex flex-col">
            <label htmlFor="name" className="font-bold uppercase tracking-wider mb-2">Store Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={seller.name} 
              required 
              className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono" 
            />
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <label htmlFor="email" className="font-bold uppercase tracking-wider mb-2">Login Email</label>
              <input 
                type="email" 
                id="email" 
                defaultValue={seller.email} 
                disabled 
                className="border-2 border-gray-300 bg-gray-100 text-gray-500 p-3 font-mono cursor-not-allowed" 
                title="Email cannot be changed"
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="phone" className="font-bold uppercase tracking-wider mb-2">Business Phone</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                defaultValue={seller.phone || ''} 
                placeholder="+60 12-345 6789"
                className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono" 
              />
            </div>
          </div>

          {/* Store Address */}
          <div className="flex flex-col">
            <label htmlFor="address" className="font-bold uppercase tracking-wider mb-2">Store Address / HQ</label>
            <textarea 
              id="address" 
              name="address" 
              rows={4} 
              defaultValue={seller.address || ''} 
              placeholder="Full business address..."
              className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-black text-white font-bold uppercase tracking-widest text-lg p-4 hover:bg-white hover:text-black border-4 border-black transition-colors">
              Save Changes
            </button>
            <Link href="/seller/dashboard" className="px-8 py-4 font-bold uppercase tracking-widest border-4 border-black hover:bg-gray-100 transition-colors flex items-center justify-center">
              Cancel
            </Link>
          </div>
        </form>

      </main>
    </div>
  );
}