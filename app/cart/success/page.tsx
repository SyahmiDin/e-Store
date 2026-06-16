import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-white text-black font-sans">
      <div className="max-w-lg border-4 border-black p-12 text-center bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Giant Checkmark Placeholder */}
        <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-black font-black text-4xl">
          ✓
        </div>
        
        <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-4">Order Received</h1>
        <p className="font-mono mb-10 text-gray-700">
          Success! Your order has been placed and sent to the seller for processing.
        </p>

        <Link href="/" className="inline-block border-4 border-black bg-white text-black px-8 py-4 hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-widest">
          Continue Shopping
        </Link>

      </div>
    </main>
  );
}