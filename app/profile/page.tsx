import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import { updateProfile } from '@/app/actions/profile';

// Prevent caching so the order history is always up to date
export const revalidate = 0; 

export default async function ProfilePage() {
  // 1. Ensure user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch User Profile Data
  const { data: profile } = await supabase
    .from('users')
    .select('name, email, address')
    .eq('user_id', user.id)
    .single();

  // 3. Fetch Order History (Deep join to get the items inside the order)
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      order_id,
      order_number,
      total_amount,
      status,
      order_items (
        quantity,
        products ( name )
      )
    `)
    .eq('buyer_id', user.id)
    .order('order_id', { ascending: false }); // Sort by newest first

  return (
    <main className="min-h-screen p-8 bg-white text-black font-sans">
      
      <header className="mb-12 border-b-4 border-black pb-6">
        <h1 className="text-5xl font-black uppercase tracking-widest mb-2">My Profile</h1>
        <p className="text-lg font-mono font-bold text-gray-500">{profile?.email}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LEFT COLUMN: EDIT PROFILE FORM */}
        <section className="w-full lg:w-1/3">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-6 bg-black text-white px-4 py-2 inline-block">
            Personal Details
          </h2>
          
          <form action={updateProfile} className="border-4 border-black p-6 bg-gray-50 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-bold uppercase tracking-wider text-sm">Full Name</label>
              <input 
                type="text" 
                id="name"
                name="name" 
                defaultValue={profile?.name || ''} 
                required
                className="border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="address" className="font-bold uppercase tracking-wider text-sm">Default Shipping Address</label>
              <textarea 
                id="address"
                name="address" 
                defaultValue={profile?.address || ''} 
                rows={4}
                required
                className="border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-black resize-none"
              ></textarea>
            </div>

            <button type="submit" className="bg-black text-white font-bold uppercase tracking-widest p-4 hover:bg-white hover:text-black border-4 border-black transition-colors mt-4">
              Save Changes
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: ORDER HISTORY */}
        <section className="w-full lg:w-2/3">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-6 border-b-4 border-black pb-2">
            Order History
          </h2>

          {!orders || orders.length === 0 ? (
            <div className="border-4 border-black p-12 text-center border-dashed">
              <p className="text-xl font-mono uppercase font-bold text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order: any) => (
                <div key={order.order_id} className="border-4 border-black p-6 hover:bg-gray-50 transition-colors">
                  
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between md:items-center border-b-2 border-black pb-4 mb-4 gap-4">
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-500 block mb-1">Order Ref</span>
                      <span className="text-xl font-black font-mono">{order.order_number}</span>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-500 block mb-1">Total</span>
                        <span className="text-xl font-black font-mono">RM {Number(order.total_amount).toFixed(2)}</span>
                      </div>
                      <span className={`px-4 py-2 font-bold uppercase text-xs border-2 border-black ${order.status === 'pending' ? 'bg-yellow-300' : 'bg-green-400'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="font-mono text-sm">
                    <span className="font-bold uppercase tracking-wider text-xs mb-2 block">Items Purchased:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {order.order_items.map((item: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-bold">{item.quantity}x</span> {item.products?.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}