import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0; // Prevent caching so orders are always up-to-date

export default async function SellerDashboard() {
    // 1. Ensure the user is securely logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Fetch the user's profile to verify their name and role
    const { data: profile } = await supabase
        .from('users')
        .select('name, role')
        .eq('user_id', user.id)
        .single();

    // ---> NEW: Boot the user back to the homepage if they aren't a seller!
    if (profile?.role !== 'seller') {
        redirect('/');
    }

    // 3. Fetch all order items linked to products owned by THIS seller
    const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          orderitem_id,
          quantity,
          orders ( order_number, status, shipping_address ), 
          products!inner ( 
            name,
            price, 
            users!inner ( user_id ) 
          )
        `)
        .eq('products.users.user_id', user.id)
        .order('orderitem_id', { ascending: false });

    if (error) {
        throw new Error(JSON.stringify(error, null, 2));
    }

    // @ts-ignore
    const items = orderItems || [];

    return (
        <main className="min-h-screen p-8 bg-white text-black font-sans">

            {/* Dashboard Header */}
            <header className="mb-12 border-b-4 border-black pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-widest mb-2">Command Center</h1>
                    <p className="text-lg font-mono font-bold">STORE: {profile?.name || 'Unknown'}</p>
                </div>
                <Link href="/" className="font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4 text-sm border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                    &larr; Back to Shop
                </Link>
            </header>

            {/* Dashboard Content */}
            <div className="flex flex-col gap-8">

                <h2 className="text-3xl font-black uppercase tracking-widest border-b-2 border-black pb-2">Incoming Orders</h2>

                {items.length === 0 ? (
                    <div className="border-4 border-black p-12 text-center border-dashed">
                        <p className="text-xl font-mono uppercase font-bold text-gray-500">No orders yet.</p>
                        <p className="text-sm font-mono mt-2 text-gray-400">When buyers purchase your products, they will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border-4 border-black">
                            <thead>
                                <tr className="bg-black text-white uppercase text-xs font-bold tracking-widest">
                                    <th className="p-4 border-r-2 border-white">Order Ref</th>
                                    <th className="p-4 border-r-2 border-white">Date</th>
                                    <th className="p-4 border-r-2 border-white">Product Details</th>
                                    <th className="p-4 border-r-2 border-white text-center">Qty</th>
                                    <th className="p-4 border-r-2 border-white text-right">Revenue</th>
                                    <th className="p-4 border-r-2 border-white text-center">Status</th>
                                    <th className="p-4">Shipping Destination</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any) => {
                                    // Fallback since we don't have a date column yet
                                    const formattedDate = 'Recent';

                                    return (
                                        <tr key={item.orderitem_id} className="border-b-4 border-black hover:bg-gray-50 transition-colors text-sm">
                                            <td className="p-4 border-r-4 border-black font-black font-mono">
                                                {item.orders?.order_number}
                                            </td>
                                            <td className="p-4 border-r-4 border-black font-mono whitespace-nowrap">
                                                {formattedDate}
                                            </td>
                                            <td className="p-4 border-r-4 border-black font-bold uppercase">
                                                {item.products?.name}
                                            </td>
                                            <td className="p-4 border-r-4 border-black font-mono text-center font-bold text-lg">
                                                {item.quantity}
                                            </td>
                                            <td className="p-4 border-r-4 border-black font-mono text-right font-black text-lg">
                                                RM {((item.products?.price || 0) * item.quantity).toFixed(2)}
                                            </td>
                                            <td className="p-4 border-r-4 border-black text-center">
                                                <span className={`px-2 py-1 font-bold uppercase text-xs border-2 border-black ${item.orders?.status === 'pending' ? 'bg-yellow-300' : 'bg-green-400'}`}>
                                                    {item.orders?.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-xs max-w-[200px] truncate hover:whitespace-normal hover:break-words cursor-help" title={item.orders?.shipping_address}>
                                                {item.orders?.shipping_address || 'No address provided'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}