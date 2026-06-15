import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  
  // SERVER ACTION: Securely handle the login request
  async function handleLogin(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Attempt to sign in using Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login failed:', error.message);
      // If the user hasn't clicked the confirmation email, Supabase will throw an error here!
      // For now, we log it to the terminal.
      return; 
    }

    // If successful, redirect them to the homepage to start shopping
    redirect('/');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-white text-black font-sans">
      
      <div className="w-full max-w-md border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="mb-8 border-b-4 border-black pb-4 text-center">
          <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">E-Store</h1>
          <p className="text-sm font-mono uppercase tracking-widest">Account Login</p>
        </div>

        {/* Login Form */}
        <form action={handleLogin} className="space-y-6">
          
          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="font-bold uppercase tracking-wider mb-2 text-sm">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="you@example.com"
              className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono" 
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password" className="font-bold uppercase tracking-wider mb-2 text-sm">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="••••••••"
              className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black font-mono" 
            />
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            className="w-full bg-black text-white font-bold uppercase tracking-widest text-lg p-4 hover:bg-white hover:text-black border-4 border-black transition-colors mt-4"
          >
            Sign In
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t-2 border-black text-center font-mono text-sm">
          <p>Don't have an account?</p>
          <Link href="/register" className="font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4 mt-2 inline-block">
            Register Here &rarr;
          </Link>
        </div>

      </div>
    </main>
  );
}