'use client';

import { useState } from 'react';
import { addToCart } from '@/app/actions/cart';

export default function AddToCartForm({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <form action={addToCart} className="flex border-2 border-black w-fit bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
      {/* Hidden inputs to pass data to your Server Action */}
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="quantity" value={quantity.toString()} />

      {/* Minus Button */}
      <button 
        type="button" 
        onClick={decrement}
        className="px-3 py-1 font-black text-lg hover:bg-black hover:text-white transition-colors border-r-2 border-black"
      >
        -
      </button>

      {/* Quantity Display */}
      <div className="w-10 flex items-center justify-center font-mono font-bold text-sm bg-gray-50">
        {quantity}
      </div>

      {/* Plus Button */}
      <button 
        type="button" 
        onClick={increment}
        className="px-3 py-1 font-black text-lg hover:bg-black hover:text-white transition-colors border-l-2 border-black"
      >
        +
      </button>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="px-4 py-2 bg-black text-white hover:bg-white hover:text-black transition-colors uppercase text-xs font-bold tracking-wider border-l-2 border-black cursor-pointer"
      >
        Add
      </button>
    </form>
  );
}