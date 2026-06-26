import Link from 'next/link';
// 1. We must import your custom SignOutButton!
import SignOutButton from '@/components/SignOutButton'; 

export default function Header({ 
  showSearch = true,
  userName,
  cartCount = 0,
}: { 
  showSearch?: boolean;
  userName?: string | null; 
  cartCount?: number;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-6 py-6 mb-8 border-b-4 border-black bg-white">
      
      {/* 1. Logo Area */}
      <Link href="/" className="flex flex-col">
        <span className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-black">
          E-STORE
        </span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
          Prototype Build
        </span>
      </Link>

      {/* 2. The Search Bar */}
      {showSearch ? (
        <form action="/search" className="flex flex-1 max-w-2xl min-w-[280px] order-3 lg:order-none w-full lg:w-auto">
          <input 
            type="text" 
            name="q"
            placeholder="SEARCH PRODUCTS..." 
            className="w-full border-2 border-black border-r-0 p-3 font-sans font-medium focus:outline-none focus:bg-gray-50 transition-colors"
          />
          <button type="submit" className="bg-black text-white px-8 font-black uppercase tracking-widest border-2 border-black hover:bg-gray-800 transition-colors">
            Search
          </button>
        </form>
      ) : (
        <div className="flex-1 hidden lg:block"></div>
      )}

      {/* 3. Navigation Links */}
      <nav className="flex items-center gap-4 md:gap-6 font-black uppercase tracking-widest text-sm whitespace-nowrap order-2 lg:order-none text-black">
        <Link href="/shops" className="hover:underline hover:text-gray-600 transition-colors">
          Shops
        </Link>
        
        <Link id="cart-target" href="/cart" className="hover:underline hover:text-gray-600 transition-colors">
          Cart ({cartCount})
        </Link>
        
        {/* Vertical Divider */}
        <span className="text-black font-normal text-xl pb-1 hidden sm:inline-block">
          |
        </span>
        
        {/* 4. Dynamic Login / User Name Section */}
        {userName ? (
          <div className="hidden sm:flex items-center gap-4">
            {/* Styled exactly like your original Home Page! */}
            <span className="font-mono text-xs">
              HELLO, <br/><span className="font-bold text-sm uppercase">{userName}</span>
            </span>
            {/* Using your actual SignOut component */}
            <SignOutButton />
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/login" className="hover:underline hover:text-gray-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:underline hover:text-gray-600 transition-colors">
              Register
            </Link>
          </div>
        )}
      </nav>

    </header>
  );
}