'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// We define a lightweight version of your Product type just for the carousel
type CarouselProduct = {
  product_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string | null;
};

export default function HeroCarousel({ products }: { products: CarouselProduct[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-fade every 5 seconds
  useEffect(() => {
    if (!products || products.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [products]);

  if (!products || products.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % products.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));

  // Some cool brutalist badges to rotate through
  const badges = ['LATEST DROP', 'STAFF PICK', 'HOT SELLER'];

  return (
    // Note: Changed `border-4` to `border-y-4` for a true full-bleed edge-to-edge look!
    <div className="relative w-full h-[60vh] min-h-[500px] border-y-4 border-black mb-16 overflow-hidden bg-white group">
      
      {/* Fading Track Container */}
      <div className="relative w-full h-full">
        {products.map((product, index) => (
          <div 
            key={product.product_id} 
            // The magic is here: absolute stacking and opacity swapping!
            className={`absolute inset-0 w-full h-full flex flex-col md:flex-row transition-opacity duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 z-10' 
                : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            
            {/* Left Side: Massive Typography */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-16 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-black bg-white relative z-10">
              <span className="bg-black text-white px-3 py-1 w-fit font-bold tracking-widest text-xs mb-6 uppercase">
                {badges[index % badges.length]}
              </span>
              <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-6 line-clamp-2">
                {product.name}
              </h2>
              <p className="font-mono text-sm md:text-base text-gray-600 line-clamp-2 md:line-clamp-3 mb-8 max-w-md">
                {product.description}
              </p>
              <Link href={`/product/${product.product_id}`} className="bg-white border-4 border-black px-8 py-4 w-fit font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[6px] hover:translate-x-[6px]">
                Shop Now — RM {Number(product.price).toFixed(2)}
              </Link>
            </div>

            {/* Right Side: Giant Grayscale Image */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-white">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-50"></div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border-y-4 border-r-4 border-black p-4 font-black text-2xl hover:bg-black hover:text-white transition-colors z-20 hidden md:block"
      >
        &larr;
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border-y-4 border-l-4 border-black p-4 font-black text-2xl hover:bg-black hover:text-white transition-colors z-20 hidden md:block"
      >
        &rarr;
      </button>

      {/* Navigation Dots (Bottom) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20">
        {products.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-12 h-3 border-2 border-black transition-colors ${index === currentIndex ? 'bg-black' : 'bg-white hover:bg-gray-300'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}