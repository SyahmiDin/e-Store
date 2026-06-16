'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

export async function updateStoreProfile(formData: FormData) {
  // 1. Verify user is securely logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Extract data from the form
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;

  // 3. Update the users table
  const { error } = await supabase
    .from('users')
    .update({ 
      name: name, 
      address: address 
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Store Profile Update Error:', error);
    throw new Error('Failed to update store profile');
  }

  // 4. Refresh the dashboard and homepage so the new Store Name appears instantly everywhere
  revalidatePath('/dashboard');
  revalidatePath('/');
}