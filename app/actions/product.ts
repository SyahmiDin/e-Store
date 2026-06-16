'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addProduct(formData: FormData) {
  // 1. Verify user is securely logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Extract data from the form
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const category_id = formData.get('category_id') as string;

  // 3. Insert the new product into the database
  const { error } = await supabase
    .from('products')
    .insert({
      user_id: user.id, // Lock the product to this seller
      name,
      description,
      price,
      category_id,
      stock_quantity: 100 // Defaulting to 100 for the prototype
    });

  if (error) {
    console.error('Failed to add product:', error);
    throw new Error('Failed to add product: ' + error.message);
  }

  // 4. Refresh the shop pages and send the seller back to their dashboard
  revalidatePath('/');
  revalidatePath('/dashboard');
  redirect('/dashboard');
}