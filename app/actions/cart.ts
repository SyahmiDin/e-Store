'use server';

import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function addToCart(formData: FormData) {
  // 1. Get the product ID from the submitted form
  const productId = formData.get('product_id') as string;
  const quantityToAdd = parseInt(formData.get('quantity') as string) || 1;

  // 2. Check if the user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If they aren't logged in, send them to the login page!
    redirect('/login');
  }

  // 3. Find the user's cart
  let { data: cart } = await supabase
    .from('cart')
    .select('cart_id')
    .eq('buyer_id', user.id)
    .single();

  // 4. If they don't have a cart yet, create one
  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('cart')
      .insert({ buyer_id: user.id })
      .select('cart_id')
      .single();
      
    if (error) throw new Error('Could not create cart');
    cart = newCart;
  }

  // 5. Check if this exact product is already in their cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('cartitem_id, quantity')
    .eq('cart_id', cart.cart_id)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // If it is, just add 1 to the quantity
    await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantityToAdd })
      .eq('cartitemid', existingItem.cartitem_id);
  } else {
    // If it's a new item, insert it with a quantity of 1
    await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.cart_id,
        product_id: productId,
        quantity: quantityToAdd
      });
  }

  // 6. Tell Next.js to refresh the page in the background so the cart counter updates
  revalidatePath('/');
}

export async function updateCartQuantity(formData: FormData) {
  const cartItemId = formData.get('cart_item_id') as string;
  const newQuantity = parseInt(formData.get('quantity') as string);

  // If the quantity drops to 0 or below, we can delete the item entirely
  if (newQuantity <= 0) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_item_id', cartItemId);
  } else {
    // Otherwise, update with the new number
    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('cartitem_id', cartItemId);
  }

  // Refresh the cart page so the subtotal and summary instantly update
  revalidatePath('/cart');
}