import { supabase } from '@/utils/supabase';
import Link from 'next/link';

// Define the Product interface for the table
interface DashboardProduct {
    product_id: string;
    name: string;
    price: number;
    stock_qty: number;
    is_active: boolean;
}

export const revalidate = 0; // Prevent caching so inventory updates show instantly

export default async function SellerDashboard() {
    // 1. Simulate a logged-in seller by fetching 'Ali Store'
    const { data: seller, error: sellerError } = await supabase
        .from('users')
        .select('user_id, name')
        .eq('email', 'ali@shopee-clone.com')
        .single();

    if (sellerError || !seller) {
        return (
            <div className="min-h-screen p-8 font-mono bg-white text-black border-4 border-black m-8">
                <p>Error: Seller account not found. Did you run the dummy data SQL?</p>
            </div>
        );
    }

    // 2. Fetch ONLY the products belonging to this specific seller
    const { data, error } = await supabase
        .from('products')
        .select('product_id, name, price, stock_qty, is_active')
        .eq('seller_id', seller.user_id)
        .order('created_at', { ascending: false });

    const products = (data as DashboardProduct[]) || [];

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col md:flex-row">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 border-r-4 border-black p-6 flex flex-col">
                <div className="mb-12 border-b-4 border-black pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-wider mb-1">Seller Hub</h1>
                    <p className="text-sm font-mono uppercase">Logged in as: <br /><b>{seller.name}</b></p>
                </div>

                <nav className="flex flex-col space-y-4 font-bold uppercase tracking-wider">
                    <a href="#" className="p-2 border-2 border-black bg-black text-white">Dashboard</a>
                    <a href="#" className="p-2 border-2 border-transparent hover:border-black transition-colors">Orders (0)</a>
                    <a href="#" className="p-2 border-2 border-transparent hover:border-black transition-colors">Store Settings</a>
                </nav>
            </aside>

            {/* Main Dashboard Content */}
            <main className="flex-1 p-8">

                {/* Header & Quick Stats */}
                <header className="mb-12 flex justify-between items-end border-b-4 border-black pb-4">
                    <h2 className="text-4xl font-extrabold uppercase tracking-widest">Inventory</h2>
                    <Link href="/seller/dashboard/new">
                        <button className="border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors uppercase font-bold tracking-wider">
                            + Add New Product
                        </button>
                    </Link>
                </header>

                {/* Inventory Table */}
                <section>
                    {products.length === 0 ? (
                        <p className="italic font-mono border border-dashed border-black p-4">You have no products listed yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border-4 border-black">
                                <thead>
                                    <tr className="bg-black text-white uppercase text-sm font-bold tracking-wider">
                                        <th className="p-4 border-r-2 border-white">Product Name</th>
                                        <th className="p-4 border-r-2 border-white">Price (RM)</th>
                                        <th className="p-4 border-r-2 border-white">Stock</th>
                                        <th className="p-4 border-r-2 border-white">Status</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.product_id} className="border-b-2 border-black hover:bg-gray-100 transition-colors">
                                            <td className="p-4 border-r-2 border-black font-bold">{product.name}</td>
                                            <td className="p-4 border-r-2 border-black font-mono">{Number(product.price).toFixed(2)}</td>
                                            <td className="p-4 border-r-2 border-black font-mono">{product.stock_qty}</td>
                                            <td className="p-4 border-r-2 border-black font-bold text-sm uppercase">
                                                {product.is_active ? (
                                                    <span className="border-2 border-black px-2 py-1">Active</span>
                                                ) : (
                                                    <span className="border-2 border-black px-2 py-1 text-gray-500 border-dashed">Draft</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center space-x-2 font-mono text-sm">
                                                <button className="hover:underline decoration-2 underline-offset-4 font-bold">Edit</button>
                                                <span>|</span>
                                                <button className="hover:underline decoration-2 underline-offset-4 font-bold text-gray-600">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}