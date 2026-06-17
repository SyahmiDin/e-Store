import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { processCheckout } from '@/app/actions/checkout';
import CartQuantityForm from '@/components/CartQuantityForm';

// Interface to help TypeScript understand our joined database query
interface CartItem {
    cartitem_id: string;
    quantity: number;
    products: {
        product_id: string;
        name: string;
        price: number;
    };
}

export default async function CartPage() {
    // 1. Ensure the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch the user's cart ID
    const { data: cart } = await supabase
        .from('cart')
        .select('cart_id')
        .eq('buyer_id', user.id)
        .single();

    let cartItems: CartItem[] = [];
    let cartTotal = 0;

    // 3. If they have a cart, fetch the items and join with product details
    if (cart) {
        const { data: items } = await supabase
            .from('cart_items')
            .select(`
        cartitem_id,
        quantity,
        products ( product_id, name, price )
      `)
            .eq('cart_id', cart.cart_id)
            .order('cartitem_id', { ascending: true }); // Keep the list order consistent

        if (items) {
            cartItems = items as unknown as CartItem[];
            // Calculate the grand total
            cartTotal = cartItems.reduce((total, item) => {
                return total + (item.products.price * item.quantity);
            }, 0);
        }
    }

    // SERVER ACTION: Remove an item from the cart
    async function removeItem(formData: FormData) {
        'use server';
        const cartitemId = formData.get('cartitem_id') as string;

        await supabase
            .from('cart_items')
            .delete()
            .eq('cartitem_id', cartitemId);

        // Refresh both the cart page and the header counter
        revalidatePath('/cart');
        revalidatePath('/');
    }

    return (
        <main className="min-h-screen p-8 bg-white text-black font-sans">

            {/* Navigation & Header */}
            <nav className="mb-8 border-b-4 border-black pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">Your Cart</h1>
                    <p className="text-sm font-mono uppercase">Review your items</p>
                </div>
                <Link href="/" className="font-bold hover:underline uppercase text-sm flex items-center gap-2">
                    <span>&larr;</span> Continue Shopping
                </Link>

            </nav>

            {/* Cart Content */}
            {cartItems.length === 0 ? (
                <div className="border-4 border-black p-12 text-center flex flex-col items-center">
                    <p className="text-xl font-bold uppercase tracking-widest mb-6">Your cart is entirely empty.</p>
                    <Link href="/" className="border-2 border-black bg-black text-white px-8 py-4 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-widest">
                        Browse Marketplace
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Side: Items Table */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse border-4 border-black">
                            <thead>
                                <tr className="bg-black text-white uppercase text-sm font-bold tracking-wider">
                                    <th className="p-4 border-r-2 border-white">Product</th>
                                    <th className="p-4 border-r-2 border-white text-center">Price</th>
                                    <th className="p-4 border-r-2 border-white text-center">Qty</th>
                                    <th className="p-4 border-r-2 border-white text-right">Subtotal</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.cartitem_id} className="border-b-4 border-black hover:bg-gray-50 transition-colors">
                                        <td className="p-4 border-r-4 border-black font-bold uppercase">
                                            {item.products.name}
                                        </td>
                                        <td className="p-4 border-r-4 border-black font-mono text-center">
                                            RM {item.products.price.toFixed(2)}
                                        </td>
                                        {/* Replace your static quantity number with this: */}
                                        <td className="text-center">
                                            <CartQuantityForm
                                                cartItemId={item.cartitem_id}
                                                currentQuantity={item.quantity}
                                            />
                                        </td>
                                        <td className="p-4 border-r-4 border-black font-mono text-right font-black text-lg">
                                            RM {(item.products.price * item.quantity).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <form action={removeItem}>
                                                <input type="hidden" name="cartitem_id" value={item.cartitem_id} />
                                                <button type="submit" className="font-bold text-sm uppercase hover:underline decoration-2 underline-offset-4 text-gray-500 hover:text-black transition-colors">
                                                    Remove
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Side: Order Summary */}
                    <aside className="w-full lg:w-80 h-fit border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 border-black pb-4 mb-4">Summary</h2>

                        <div className="space-y-4 font-mono text-sm mb-6 border-b-2 border-black pb-6">
                            <div className="flex justify-between">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>RM {cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="font-bold uppercase tracking-wider text-sm">Estimated Total</span>
                            <span className="font-black text-3xl">RM {cartTotal.toFixed(2)}</span>
                        </div>

                        {/* UPATED CHECKOUT BUTTON */}
                        <form action={processCheckout}>
                            <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-lg p-4 hover:bg-white hover:text-black border-4 border-black transition-colors cursor-pointer">
                                Checkout
                            </button>
                        </form>

                    </aside>

                </div>
            )}
        </main>
    );
}