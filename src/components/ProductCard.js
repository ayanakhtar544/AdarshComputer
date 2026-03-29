import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  // Discount Calculation
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  // Pehli Image nikalo (Agar hai toh)
  const productImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col h-full">
      
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
          {discount}% OFF
        </div>
      )}

      {/* Image Area */}
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden bg-white h-48 sm:h-56 flex items-center justify-center p-4">
        {productImage ? (
           // Asli Photo
           <img 
             src={productImage} 
             alt={product.name} 
             className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
           />
        ) : (
           // Placeholder Icon (Agar photo nahi hai)
           <div className="text-6xl text-gray-200 group-hover:scale-110 transition duration-500">
             💻
           </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Tag */}
        <span className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wide">
            {product.category || "General"}
        </span>

        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug hover:text-blue-600 transition mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg sm:text-xl font-bold text-slate-900">₹{product.price?.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Link 
              href={`/product/${product.id}`}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10 text-xs sm:text-sm"
            >
               Buy Now
            </Link>
            <Link 
               href={`/product/${product.id}`}
               className="p-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition bg-white"
            >
               <Eye size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}