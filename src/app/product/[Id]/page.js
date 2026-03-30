"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { 
  Laptop, ShieldCheck, Truck, ShoppingBag, Heart, Share2, Star, 
  RefreshCcw, CheckCircle, Zap, Minus, Plus, Cpu, MemoryStick, Battery,
  ChevronRight, ArrowRight, MapPin, Phone, Mail, CreditCard, ChevronLeft, AlertCircle, User, Search, Home
} from "lucide-react";

// ============================================================================
// 1. SUB-CompONENTS
// ============================================================================

const TrustBadge = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{title}</p>
      <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
    </div>
  </div>
);

const SpecRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-4 rounded-xl transition-colors">
    <div className="flex items-center gap-3 text-slate-500">
      <div className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 shadow-sm"><Icon size={16} /></div>
      <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-900 text-right max-w-[50%]">{value || "N/A"}</span>
  </div>
);

// 🚨 RELATED PRODUCT CARD
const ProductCard = ({ product, addToCart, router }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const hasImage = product.images && product.images.length > 0 && product.images[0] !== "";
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="group flex flex-col bg-white border border-slate-200 hover:border-red-600 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl min-w-[200px] max-w-[280px] snap-start">
      <div className="relative w-full aspect-square bg-slate-50 p-6 flex items-center justify-center cursor-pointer" onClick={() => router.push(`/product/${product.id}`)}>
        {discount > 0 && <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md z-10">{discount}% OFF</span>}
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
        ) : (
          <Laptop className="w-12 h-12 text-slate-300" />
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2 cursor-pointer hover:text-red-600" onClick={() => router.push(`/product/${product.id}`)}>{product.name}</h3>
        <div className="mt-auto mb-4 flex items-end gap-2">
          <span className="text-lg font-black text-slate-900">₹{Number(product.price).toLocaleString()}</span>
          {product.originalPrice && <span className="text-xs text-slate-400 line-through font-medium pb-0.5">₹{Number(product.originalPrice).toLocaleString()}</span>}
        </div>
        <button onClick={() => { addToCart(product, 1); toast.success("Added to Cart!"); }} className="w-full bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-red-600 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 2. MAIN PRODUCT PAGE
// ============================================================================
export default function ProductPage() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.id || params?.productId || params?.slug || (params && Object.values(params)[0]);

  const { addToCart, cart } = useCart(); 
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // Changed default tab to Specs
  const [isWishlist, setIsWishlist] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false); // Read More State

  useEffect(() => {
    if (!id) return;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() };
          setProduct(prodData);
          
          // 🚨 THE FIX: FAIL-SAFE RELATED PRODUCTS
          let relatedData = [];
          if (prodData.category) {
            const catToCheck = Array.isArray(prodData.category) ? prodData.category[0] : prodData.category;
            const q = query(collection(db, "products"), where("category", "==", catToCheck), limit(6));
            const relatedSnap = await getDocs(q);
            relatedData = relatedSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id); 
          }
          
          // Agar us category me kuch na mile, toh general products utha lo (List hamesha dikhegi)
          if (relatedData.length === 0) {
            const fallbackSnap = await getDocs(query(collection(db, "products"), limit(6)));
            relatedData = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id);
          }
          setRelatedProducts(relatedData);

        } else {
          setErrorMsg("Product not found in database.");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setErrorMsg("Network Error: Could not connect to database.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  if (errorMsg) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
       <AlertCircle size={64} className="text-red-500 mb-4" />
       <h1 className="text-2xl font-black text-slate-900 mb-2">Oops!</h1>
       <p className="text-slate-500 font-medium mb-6">{errorMsg}</p>
       <Link href="/products" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm">Back to Shop</Link>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#F4F6F9] pt-10 pb-20 px-6 max-w-[1400px] mx-auto animate-pulse">
      <div className="w-64 h-4 bg-slate-200 rounded-full mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 aspect-video bg-white rounded-3xl border border-slate-200"></div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full h-12 bg-slate-200 rounded-xl"></div>
          <div className="w-48 h-12 bg-slate-200 rounded-2xl"></div>
          <div className="w-full h-24 bg-white rounded-2xl"></div>
          <div className="flex gap-4"><div className="flex-1 h-14 bg-slate-200 rounded-2xl"></div><div className="flex-1 h-14 bg-slate-200 rounded-2xl"></div></div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const displayCategory = Array.isArray(product.category) ? product.category[0] : (product.category || "Premium Gadget");

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans selection:bg-red-600 selection:text-white pb-24 md:pb-0">
      
      {/* ========================================== */}
      {/* 🚨 1. EXACT HOME PAGE GLOBAL HEADER MATCH  */}
      {/* ========================================== */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-2 rounded-lg hidden md:block shadow-sm">
              <Laptop size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">
              Rana<span className="text-red-600">Computers</span>
            </span>
          </Link>

          {/* Desktop Links (Home page jaise same) */}
          <div className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-slate-500">
             <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
             <Link href="/products" className="hover:text-red-600 transition-colors">Shop</Link>
             <Link href="/category/apple" className="hover:text-red-600 transition-colors">MacBooks</Link>
             <Link href="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
          </div>

          {/* Right Side Icons (Search, Profile, Cart) */}
          <div className="flex items-center gap-5 md:gap-6">
             <Link href="/products" className="text-slate-900 hover:text-red-600 transition-colors">
                <Search size={22} />
             </Link>
             <Link href="/login" className="hidden md:block text-slate-900 hover:text-red-600 transition-colors">
                <User size={22} />
             </Link>
             <Link href="/cart" className="relative text-slate-900 hover:text-red-600 transition-colors flex items-center gap-2 group">
                <div className="relative">
                   <ShoppingBag size={22} />
                   {(cart?.length > 0) && (
                     <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                       {cart.length}
                     </span>
                   )}
                </div>
             </Link>
          </div>

        </div>
      </nav>

      {/* ========================================== */}
      {/* 🚨 2. WEB PATH (BREADCRUMBS) SECTION       */}
      {/* ========================================== */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest overflow-x-auto hide-scrollbar">
          
          <Link href="/" className="hover:text-red-600 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Home size={14} className="mb-0.5" /> Home
          </Link>
          
          <ChevronRight size={14} className="flex-shrink-0" />
          
          <Link href="/products" className="hover:text-red-600 transition-colors whitespace-nowrap">
            Products
          </Link>
          
          <ChevronRight size={14} className="flex-shrink-0" />
          
          <span className="text-slate-900 truncate max-w-[150px] md:max-w-[300px]">
            {product.name}
          </span>
          
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          
          {/* --- LEFT COLUMN: GALLERY --- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] md:aspect-video bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200">
              {images.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img src={images[activeImage]} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50"><Laptop size={80} className="mb-4 opacity-50" /></div>
              )}
              {discount > 0 && <div className="absolute top-5 left-5 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg tracking-widest uppercase">{discount}% OFF</div>}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-20 h-20 bg-white rounded-2xl border-2 p-2 flex-shrink-0 ${activeImage === idx ? 'border-red-600' : 'border-slate-200 opacity-60'}`}>
                    <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt={`Thumb ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: DETAILS --- */}
          <div className="lg:col-span-5 h-full">
            <div className="sticky top-28 space-y-5">
              
              <div>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 block">{product.brand || 'Brand'}</span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <span className="text-3xl md:text-4xl font-black text-red-600">₹{Number(product.price).toLocaleString()}</span>
                  {product.originalPrice && <span className="text-lg text-slate-400 font-bold line-through">₹{Number(product.originalPrice).toLocaleString()}</span>}
                </div>
              </div>

              {/* 🚨 THE FIX: ULTRA-CompACT DESCRIPTION */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Quick Overview</h3>
                 
                 <div className={`text-slate-600 text-sm leading-snug transition-all duration-300 ${!isDescExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
                    {product.description || "No description provided."}
                 </div>
                 
                 {product.description?.length > 80 && (
                   <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="mt-2 text-[11px] font-black text-red-600 uppercase tracking-widest hover:text-red-700">
                     {isDescExpanded ? '- Show Less' : '+ Read More'}
                   </button>
                 )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-white rounded-lg shadow-sm hover:text-red-600"><Minus size={16}/></button>
                    <span className="font-black w-4 text-center text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-white rounded-lg shadow-sm hover:text-red-600"><Plus size={16}/></button>
                 </div>
                 <button onClick={handleBuyNow} className="flex-1 bg-slate-900 hover:bg-red-600 text-white font-black py-3.5 rounded-xl transition-all uppercase tracking-widest text-xs shadow-md">
                   Buy Now
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                 <TrustBadge icon={ShieldCheck} title="1 Yr Warranty" sub="100% Tested" />
                 <TrustBadge icon={Truck} title="Free Delivery" sub="All over India" />
              </div>
            </div>
          </div>
        </div>

        {/* --- TABS SECTION --- */}
        <div className="mt-12 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="flex border-b border-slate-200">
              <button onClick={() => setActiveTab('specs')} className={`flex-1 py-4 font-black text-xs md:text-sm uppercase tracking-widest transition ${activeTab === 'specs' ? 'text-red-600 bg-red-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                Specifications
              </button>
           </div>
           
           <div className="p-6 md:p-10">
             <AnimatePresence mode="wait">
               {activeTab === 'specs' ? (
                 <motion.div key="specs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-w-4xl mx-auto">
                    <SpecRow label="Processor" value={product.processor} icon={Cpu} />
                    <SpecRow label="RAM Memory" value={product.ram} icon={MemoryStick} />
                    <SpecRow label="Storage" value={product.storage} icon={MemoryStick} />
                    <SpecRow label="Category" value={displayCategory} icon={Laptop} />
                    <SpecRow label="Battery Health" value="Tested - Excellent" icon={Battery} />
                    <SpecRow label="Warranty Details" value="1 Year Seller Warranty" icon={ShieldCheck} />
                 </motion.div>
               ) : (
                 <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
                   <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description || "No additional details."}</p>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </main>

      {/* 🚨 THE FIX: GUARANTEED RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="bg-slate-100 py-16 border-t border-slate-200">
           <div className="max-w-[1400px] mx-auto px-4 md:px-8">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">You Might Also Like</h2>
              </div>
              <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-6 snap-x">
                 {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* --- PREMIUM FOOTER --- */}
      <footer className="bg-[#0B0F19] pt-16 pb-10 border-t-[4px] border-red-600 font-sans">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
               <div>
                  <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">Rana<span className="text-red-500">Computers</span></h1>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">India's most trusted destination for premium refurbished tech.</p>
               </div>
               <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 border-l-2 border-red-600 pl-3">Quick Links</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li><Link href="/products" className="hover:text-red-500 transition-colors">All Products</Link></li>
                     <li><Link href="/category/laptops" className="hover:text-red-500 transition-colors">Laptops</Link></li>
                  </ul>
               </div>
               <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 border-l-2 border-red-600 pl-3">Support</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li><Link href="/contact" className="hover:text-red-500 transition-colors">Contact Us</Link></li>
                     <li><Link href="/warranty" className="hover:text-red-500 transition-colors">Warranty Info</Link></li>
                  </ul>
               </div>
               <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 border-l-2 border-red-600 pl-3">Contact</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><Phone size={16} className="text-red-600"/> <span className="text-white font-bold tracking-widest">+91 9123188988</span></li>
                     <li className="flex items-center gap-3"><Mail size={16} className="text-red-600"/> <span>ranaComputers@gmail.com</span></li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="border-t border-slate-800 bg-slate-950">
            <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
               <p>© {new Date().getFullYear()} Rana Computers. All rights reserved.</p>
               <p className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> 100% Secure Checkout</p>
            </div>
         </div>
      </footer>

      {/* MOBILE BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-50 flex gap-3 pb-safe">
         <button onClick={() => { addToCart(product, quantity); toast.success("Added to Cart!"); }} className="flex-1 bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-xs py-4 rounded-xl border border-slate-200">Add to Cart</button>
         <button onClick={handleBuyNow} className="flex-1 bg-red-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-red-600/30">Buy Now</button>
      </div>
    </div>
  );
}