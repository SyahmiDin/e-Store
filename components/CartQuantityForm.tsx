'use client';

// 1. Add useEffect to the import list
import { useState, useEffect } from 'react'; 
import { updateCartQuantity } from '@/app/actions/cart';

export default function CartQuantityForm({ 
  cartItemId, 
  currentQuantity 
}: { 
  cartItemId: string; 
  currentQuantity: number;
}) {
  const [quantity, setQuantity] = useState(currentQuantity);

  // 2. Add this hook! It syncs the local state whenever the server data changes.
  useEffect(() => {
    setQuantity(currentQuantity);
  }, [currentQuantity]);

  const hasChanged = quantity !== currentQuantity;

  return (
    <form action={updateCartQuantity} className="flex flex-col items-center justify-center gap-2">
      <input type="hidden" name="cart_item_id" value={cartItemId} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex items-center justify-center gap-4">
        <button 
          type="button" 
          onClick={() => setQuantity(quantity > 0 ? quantity - 1 : 0)}
          className="w-8 h-8 flex items-center justify-center border-2 border-black font-black hover:bg-black hover:text-white transition-colors"
        >
          -
        </button>
        
        <span className="font-bold font-mono text-lg w-4 text-center">
          {quantity}
        </span>
        
        <button 
          type="button" 
          onClick={() => setQuantity(quantity + 1)}
          className="w-8 h-8 flex items-center justify-center border-2 border-black font-black hover:bg-black hover:text-white transition-colors"
        >
          +
        </button>
      </div>

      {hasChanged && (
        <button 
          type="submit"
          className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 mt-1 hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_0px_rgba(200,200,200,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
        >
          Save Change
        </button>
      )}
    </form>
  );
}