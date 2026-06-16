'use server';

import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';

export async function processCheckout() {
    // 1. Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Fetch the user's active cart and its items
    const { data: cart } = await supabase
        .from('cart')
        .select('cart_id')
        .eq('buyer_id', user.id)
        .single();

    if (!cart) return;

    const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`
      cartitem_id,
      quantity,
      products ( product_id, price )
    `)
        .eq('cart_id', cart.cart_id);

    if (!cartItems || cartItems.length === 0) return;

    // 3. Calculate the grand total
    const totalAmount = cartItems.reduce((total, item) => {
        // @ts-ignore - bypassing strict type checking for the join
        return total + (item.products.price * item.quantity);
    }, 0);

    const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 4. Create the official Order
    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
            buyer_id: user.id,
            order_number: orderNumber,
            subtotal: totalAmount,
            total_amount: totalAmount,
            shipping_address: '123 Prototype Street, Kuala Lumpur, Malaysia', // <--- ADDED THIS LINE
            status: 'pending'
        })
        .select('order_id')
        .single();

    if (orderError || !newOrder) {
        console.error('Supabase Real Error:', JSON.stringify(orderError, null, 2));
        throw new Error('Checkout failed');
    }

    // 5. Move items from Cart to Order Items
    const orderItemsData = cartItems.map((item) => ({
        order_id: newOrder.order_id,
        // @ts-ignore
        product_id: item.products.product_id,
        quantity: item.quantity,
        // @ts-ignore
        price_at_purchase: item.products.price // Lock in the price!
    }));

    await supabase.from('order_items').insert(orderItemsData);

    // 6. Empty the shopping cart
    await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.cart_id);

    // 7. Redirect the buyer to a success page!
    redirect('/cart/success');
}