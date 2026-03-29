"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShoppingCart, Star, PackageOpen, Search, 
  Filter, SlidersHorizontal, Award 
} from 'lucide-react';

// --- CATEGORIES FOR FILTER ---
const CATEGORIES = ["All", "Laptops", "Mobiles", "Apple", "Gaming", "Accessories"];

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({ product, addToCart, router }) => {
  const hasImage = product.images && product.images.length > 0 && product.images[0] !== "";
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div 
      className="bg-white group cursor-pointer border border-gray-100 rounded-2xl hover:border-red-200 hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden relative"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {discount > 0 && (
         <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] px-2 py-1 z-20 font-black uppercase tracking-widest rounded shadow-md">
            {discount}% OFF
         </div>
      )}

      <div className="w-full aspect-square flex items-center justify-center p-5 relative overflow-hidden bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 z-10 mix-blend-multiply drop-shadow-sm"/>
        ) : (
          <div className="text-center text-slate-300 p-2 z-10 flex flex-col items-center">
            <PackageOpen size={48} className="mb-2 opacity-50"/>
            <h3 className="font-bold text-xs uppercase tracking-widest leading-tight">No Image</h3>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow bg-white border-t border-gray-50 z-10">
        <div className="flex justify-between items-center mb-3">
           <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest border border-slate-200">
              {product.brand || "Premium"}
           </span>
           <div className="flex text-amber-400">
             <Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} className="text-slate-200" fill="currentColor"/>
           </div>
        </div>
        <h3 className="text-sm font-bold text-slate-800 group-hover:text-red-600 line-clamp-2 mb-4 transition-colors leading-relaxed h-10">{product.name}</h3>
        
        <div className="mt-auto flex flex-col md:flex-row md:items-end justify-between gap-3 pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            {product.originalPrice && <span className="text-xs text-slate-400 line-through font-medium leading-none mb-1.5">₹{Number(product.originalPrice).toLocaleString()}</span>}
            <span className="text-lg font-black text-slate-900 leading-none">₹{Number(product.price).toLocaleString()}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
            className="w-full md:w-auto bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-md shadow-slate-900/10"
          >
             ADD
          </button>
        </div>
      </div>
    </div>
  );
};


export default function AllProductsPage() {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(product => {
    // 1. Search Match (Name or Brand)
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Category Match
    let matchesCategory = true;
    if (activeCategory !== "All") {
       const hasCategory = Array.isArray(product.category) && product.category.some(c => c.toUpperCase() === activeCategory.toUpperCase());
       const hasBrand = product.brand && product.brand.toUpperCase() === activeCategory.toUpperCase();
       matchesCategory = hasCategory || hasBrand;
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans pb-24">
      
      {/* --- PREMIUM NAVBAR --- */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-sm px-4 py-4">
         <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 md:gap-4">
               <button onClick={() => router.push('/')} className="p-2 md:p-2.5 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 <Award className="text-red-600 hidden md:block" size={24}/> THE SHOWROOM
               </h1>
            </div>

            {/* Main Search Bar (Desktop) */}
            <div className="hidden md:flex relative flex-1 max-w-xl mx-8">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search for laptops, mobiles, brands..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-100/50 border border-slate-200 text-sm py-3 pl-12 pr-4 rounded-full outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-medium text-slate-800 placeholder:text-slate-400"
               />
            </div>
            
            <Link href="/cart" className="relative p-2.5 text-slate-600 hover:text-red-600 bg-slate-50 border border-slate-100 hover:border-red-100 rounded-full transition-all shadow-sm">
               <ShoppingCart size={22} />
               {cart.length > 0 && (
                 <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black min-w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in">
                    {cart.length}
                 </span>
               )}
            </Link>

         </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-6 md:py-10">
        
        {/* --- MOBILE SEARCH BAR --- */}
        <div className="md:hidden relative mb-6">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search products..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white shadow-sm border border-slate-200 text-sm py-3.5 pl-12 pr-4 rounded-2xl outline-none focus:border-red-400 transition-all font-medium text-slate-800"
           />
        </div>

        {/* --- CATEGORY TABS --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
           <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mr-2">
             <Filter size={14}/> Filter:
           </div>
           {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                 {cat}
              </button>
           ))}
        </div>

        {/* --- PRODUCTS GRID OR LOADING/EMPTY STATES --- */}
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full absolute"></div>
                <div className="w-16 h-16 border-4 border-red-600 rounded-full border-t-transparent animate-spin relative z-10"></div>
             </div>
             <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Inventory...</p>
           </div>
        ) : filteredProducts.length === 0 ? (
           <div className="bg-white rounded-[2rem] p-12 md:p-20 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] mt-4 animate-in fade-in zoom-in">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <Search size={40} className="text-slate-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">No Products Found</h2>
              <p className="text-slate-500 mb-8 max-w-sm font-medium">We couldn't find anything matching "{searchTerm}" in the {activeCategory} category.</p>
              <button 
                onClick={() => {setSearchTerm(""); setActiveCategory("All");}} 
                className="bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-red-600 transition uppercase tracking-widest text-sm shadow-lg shadow-slate-900/20"
              >
                 Clear All Filters
              </button>
           </div>
        ) : (
           <div>
             <div className="flex justify-between items-end mb-6">
                <p className="text-sm font-bold text-slate-400">Showing <span className="text-slate-900">{filteredProducts.length}</span> Results</p>
                {/* Future Scope: Add a Sort Dropdown here */}
             </div>
             
             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
               className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
             >
               {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />
               ))}
             </motion.div>
           </div>
        )}
      </main>
    </div>
  );
}