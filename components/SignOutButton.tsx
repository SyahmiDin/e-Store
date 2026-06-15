import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';

// Notice we removed 'use client' - this is now a Server Component!
export default function SignOutButton() {

  // This action runs securely on the Next.js server
  async function handleSignOut() {
    'use server';
    
    // 1. Tell the server-side Supabase client to destroy the session
    await supabase.auth.signOut();
    
    // 2. Force a server-side redirect to refresh the page state
    redirect('/');
  }

  return (
    <form action={handleSignOut}>
      <button 
        type="submit"
        className="border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors uppercase font-bold text-sm tracking-wider cursor-pointer"
      >
        Sign Out
      </button>
    </form>
  );
}