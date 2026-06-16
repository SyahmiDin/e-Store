'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  // 1. Verify user is logged in
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
    console.error('Profile Update Error:', error);
    throw new Error('Failed to update profile');
  }

  // 4. Refresh the page to show the new data instantly
  revalidatePath('/profile');
}