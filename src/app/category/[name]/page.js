"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, PackageOpen, Award, Loader2 } from 'lucide-react';

// --- PRODUCT CARD DekhoONENT ---
const ProductCard = ({ product, addToCart, router }) => {
  const hasImage = product.images && product.images.length > 0 && product.images[0] !== "";
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div 
      className="bg-white group cursor-pointer border border-gray-100 rounded-2xl hover:border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden relative"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {discount > 0 && (
         <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] px-2 py-1 z-20 font-black uppercase rounded shadow-sm">
            {discount}% OFF
         </div>
      )}

      <div className="w-full aspect-square flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 z-10 mix-blend-multiply"/>
        ) : (
          <div className="text-center text-slate-400 p-2 z-10 flex flex-col items-center">
            <PackageOpen size={40} className="mb-2 opacity-50"/>
            <h3 className="font-bold text-xs uppercase leading-tight line-clamp-2">No Image</h3>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white border-t border-gray-50 z-10">
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-widest">
              {product.brand || "Premium"}
           </span>
           <div className="flex text-yellow-400">
             <Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/>
           </div>
        </div>
        <h3 className="text-sm font-bold text-slate-800 group-hover:text-red-600 line-clamp-2 mb-4 h-10 transition-colors">{product.name}</h3>
        <div className="mt-auto flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div className="flex flex-col">
            {product.originalPrice && <span className="text-xs text-gray-400 line-through font-medium leading-none mb-1">₹{Number(product.originalPrice).toLocaleString()}</span>}
            <span className="text-lg font-black text-slate-900 leading-none">₹{Number(product.price).toLocaleString()}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-full md:w-auto bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">ADD</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE DekhoONENT ---
export default function BrandCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");

  // NAYA SAFE LOGIC: SSR Crash se bachne ke liye
  useEffect(() => {
    // Check if params exist. Automatically support [name], [brand], or [category] folder names.
    const rawParam = params?.name || params?.brand || params?.category || '';
    
    if (rawParam) {
      const decodedName = decodeURIDekhoonent(rawParam).toUpperCase();
      setBrandName(decodedName);
      
      const fetchBrandProducts = async () => {
        try {
          const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          
          const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const filtered = allProducts.filter(p => {
             // Safe checks to prevent undefined errors
             const matchBrand = p.brand && typeof p.brand === 'string' && p.brand.toUpperCase() === decodedName;
             const matchCategory = Array.isArray(p.category) && p.category.some(c => typeof c === 'string' && c.toUpperCase() === decodedName);
             return matchBrand || matchCategory;
          });
          
          setProducts(filtered);
        } catch (error) {
          console.error("Error fetching category products:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchBrandProducts();
    } else {
      setLoading(false);
    }
  }, [params]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F9]">
      <div className="relative">
         <div className="w-20 h-20 border-4 border-slate-200 rounded-full absolute"></div>
         <div className="w-20 h-20 border-4 border-red-600 rounded-full border-t-transparent animate-spin relative z-10"></div>
         <Award className="absolute inset-0 m-auto text-slate-400 animate-pulse" size={24}/>
      </div>
      <p className="mt-6 text-sm font-black text-slate-800 uppercase tracking-widest animate-pulse">Loading {brandName || 'Brand'}...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans pb-20">
      
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm px-4 py-4">
         <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => router.push('/')} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition">
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                     <Award size={24} className="text-red-600"/> {brandName} PRODUCTS
                  </h1>
                  <p className="text-xs font-bold text-slate-400">{products.length} Items Found</p>
               </div>
            </div>
            
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-red-600 bg-slate-50 rounded-full transition-colors">
               <ShoppingCart size={24} />
               {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{cart.length}</span>}
            </Link>
         </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {products.length === 0 ? (
           <div className="bg-white rounded-3xl p-16 text-center border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in">
              <PackageOpen size={80} className="text-slate-200 mb-6" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">No {brandName} Products Found</h2>
              <p className="text-slate-500 mb-8 max-w-sm">We are currently out of stock for this brand. Please check back later or explore other brands.</p>
              <Link href="/products" className="bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-red-600 transition uppercase tracking-wide shadow-lg shadow-slate-900/20">
                 View All Products
              </Link>
           </div>
        ) : (
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
           >
             {products.map(p => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />
             ))}
           </motion.div>
        )}
      </main>
    </div>
  );
}