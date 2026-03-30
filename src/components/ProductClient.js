"use client";
import { useState } from 'react';
import CheckoutModal from '@/Dekhoonents/CheckoutModal';
import { ShieldCheck, Cpu, Battery, MemoryStick, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from "framer-motion";

export default function ProductClient({ product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Safe check for images
  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
           <ChevronLeft size={20} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* LEFT: Image Gallery */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <div className="h-[300px] md:h-[500px] bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden p-4 group">
                {images.length > 0 ? (
                   <img 
                     src={images[activeImage]} 
                     alt={product.name} 
                     className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105" 
                   />
                ) : (
                   <span className="text-9xl">💻</span>
                )}
             </div>
             
             {/* Thumbnails */}
             {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 bg-white rounded-xl border-2 flex-shrink-0 p-1 transition-all ${activeImage === idx ? 'border-blue-600 scale-95' : 'border-transparent hover:border-blue-200'}`}
                    >
                      <img src={img} className="w-full h-full object-contain rounded-lg"/>
                    </button>
                  ))}
                </div>
             )}
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
             <span className="text-blue-600 font-bold text-xs uppercase tracking-wide bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                {product.category || "Gadget"}
             </span>
             <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
             
             {/* Price Tag */}
             <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm mb-6 mt-6">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Deal Price</p>
                <div className="flex items-end gap-3">
                   <span className="text-4xl font-bold text-blue-600">₹{Number(product.price).toLocaleString()}</span>
                   {product.originalPrice && (
                     <span className="text-xl text-gray-400 line-through mb-1">₹{Number(product.originalPrice).toLocaleString()}</span>
                   )}
                   {product.originalPrice && (
                     <span className="text-green-600 font-bold mb-1 text-sm">
                       {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                     </span>
                   )}
                </div>
             </div>

             {/* Specs Grid */}
             <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Cpu, label: "Processor", val: product.processor },
                  { icon: MemoryStick, label: "RAM/Storage", val: `${product.ram || ""} / ${product.storage || ""}` },
                  { icon: Battery, label: "Battery", val: "Tested OK" },
                  { icon: ShieldCheck, label: "Warranty", val: "Seller Warranty" }
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                     <div className="text-gray-400 p-2 bg-gray-50 rounded-full"><spec.icon size={18} /></div>
                     <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{spec.label}</p>
                        <p className="font-bold text-sm text-gray-900 line-clamp-1">{spec.val || "N/A"}</p>
                     </div>
                  </div>
                ))}
             </div>

             {/* Buy Button */}
             <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-blue-200 transition transform active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
             >
                Buy Now on WhatsApp
             </button>
             
             <div className="mt-8 bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                   {product.description || "No description available."}
                </p>
             </div>
          </motion.div>
        </div>
      </div>

      {isModalOpen && (
        <CheckoutModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}