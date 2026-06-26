'use client';

import { useState, useEffect, useRef } from 'react';
import { addToCart } from '@/app/actions/cart';

export default function AddToCartForm({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [flyingBlocks, setFlyingBlocks] = useState<{ id: number; startX: number; startY: number; endX: number; endY: number }[]>([]);

  // 1. We change this to an onSubmit handler so we can stop the default page freeze
  const handleAddToCart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stop the form from freezing the screen!

    // Grab the form data so we can manually send it to the server
    const formData = new FormData(e.currentTarget);

    // 2. Start the animation math
    const cartTarget = document.getElementById('cart-target');
    const button = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    if (cartTarget && button) {
      const cartRect = cartTarget.getBoundingClientRect();
      const btnRect = button.getBoundingClientRect();
      
      // Calculate starting position (Center of the Add to Cart button)
      const startX = btnRect.left + btnRect.width / 2;
      const startY = btnRect.top + btnRect.height / 2;
      
      // Calculate destination (Center of the Cart link in the Header)
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;

      const newBlock = { id: Date.now(), startX, startY, endX, endY, quantity };
      setFlyingBlocks((prev) => [...prev, newBlock]);

      // Cleanup the block exactly when the 800ms animation finishes
      setTimeout(() => {
        setFlyingBlocks((prev) => prev.filter((block) => block.id !== newBlock.id));
      }, 800);
    } else {
      console.error("Could not find the target to animate to!");
    }

    // 3. Send the data to your Supabase backend quietly in the background!
    addToCart(formData);
  };

  return (
    <>
      {/* Notice we are using onSubmit instead of action! */}
      <form onSubmit={handleAddToCart} className="flex flex-col gap-6 w-full max-w-sm">
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="quantity" value={quantity} />

        <div className="flex items-center gap-4">
          <span className="font-bold uppercase tracking-widest text-sm">QTY:</span>
          <div className="flex items-center border-2 border-black w-fit bg-white">
            <button 
              type="button" 
              onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              className="w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-black hover:text-white transition-colors"
            >
              -
            </button>
            <span className="w-16 text-center font-mono font-bold text-lg border-x-2 border-black h-12 flex items-center justify-center">
              {quantity}
            </span>
            <button 
              type="button" 
              onClick={() => setQuantity((prev) => prev + 1)}
              className="w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-black hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-black text-white p-5 font-black text-lg uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-[6px_6px_0px_0px_rgba(200,200,200,1)] active:shadow-none active:translate-y-[6px] active:translate-x-[6px]"
        >
          Add To Cart
        </button>
      </form>

      {/* Render the flying animation blocks */}
      {flyingBlocks.map((block) => (
        <FlyingBlock key={block.id} block={block} quantity={quantity} />
      ))}
    </>
  );
}

// ---> THE BULLETPROOF ANIMATION COMPONENT <---
function FlyingBlock({ block, quantity }: { block: any; quantity: number }) {
  const [isFlying, setIsFlying] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Force the browser to commit the "start" position to the screen
    // before we flip styles. Reading layout (getBoundingClientRect)
    // forces a synchronous reflow, which guarantees the start state
    // has actually been painted.
    el.getBoundingClientRect();

    // Now schedule the flip on the next frame — this is reliable because
    // the reflow above already flushed the start state to the screen.
    requestAnimationFrame(() => {
      setIsFlying(true);
    });
  }, []);

  return (
    <div
      ref={elRef}
      className="fixed z-[9999] top-0 left-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold font-mono text-sm border-2 border-black pointer-events-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
      style={{
        transition: 'transform 0.8s cubic-bezier(0.2, 1, 0.3, 1), opacity 0.8s ease-in-out',
        transform: isFlying
          ? `translate(${block.endX - 20}px, ${block.endY - 20}px) scale(0.3) rotate(45deg)`
          : `translate(${block.startX - 20}px, ${block.startY - 20}px) scale(1) rotate(0deg)`,
        opacity: isFlying ? 0 : 1,
      }}
    >
      +{quantity}
    </div>
  );
}