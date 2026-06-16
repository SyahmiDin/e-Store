import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { updateStoreProfile } from '@/app/actions/store';

export const dynamic = 'force-dynamic';

export default async function SellerDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 1. Fetch the seller's full profile
    const { data: profile } = await supabase
        .from('users')
        .select('name, role, email, address')
        .eq('user_id', user.id)
        .single();

    if (profile?.role !== 'seller') {
        redirect('/');
    }

    // 2. Fetch all order items linked to products owned by THIS seller
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
                    <p className="text-lg font-mono font-bold text-gray-500">{profile?.email}</p>
                </div>

                <div className="flex gap-4">
                    <Link href="/dashboard/add" className="font-bold uppercase tracking-widest text-sm border-4 border-black bg-black text-white px-6 py-2 hover:bg-white hover:text-black transition-colors">
                        + Add Product
                    </Link>
                    <Link href="/" className="font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4 text-sm border-4 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                        &larr; Back to Shop
                    </Link>
                </div>
            </header>

            <div className="flex flex-col gap-12">

                {/* --- STORE SETTINGS SECTION --- */}
                <section className="border-4 border-black p-8 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2 inline-block">Store Profile</h2>

                    <form action={updateStoreProfile} className="flex flex-col md:flex-row gap-6">

                        <div className="flex flex-col gap-2 flex-1">
                            <label htmlFor="name" className="font-bold uppercase tracking-wider text-sm">Store Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                defaultValue={profile?.name || ''}
                                required
                                className="border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            <label htmlFor="address" className="font-bold uppercase tracking-wider text-sm">Dispatch / Return Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                defaultValue={profile?.address || ''}
                                required
                                className="border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="flex items-end">
                            <button type="submit" className="bg-black text-white font-bold uppercase tracking-widest p-3 hover:bg-white hover:text-black border-4 border-black transition-colors w-full md:w-auto">
                                Update Store
                            </button>
                        </div>
                    </form>
                </section>


                {/* --- INCOMING ORDERS SECTION --- */}
                <section>
                    <h2 className="text-3xl font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-6">Incoming Orders</h2>

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
                </section>

            </div>
        </main>
    );
}