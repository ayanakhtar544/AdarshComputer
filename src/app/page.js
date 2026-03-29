"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

import { 
  Phone, Mail, Monitor, Laptop, ChevronRight, Zap, 
  Clock, ShieldCheck, RefreshCcw, Truck, Search, 
  Heart, ShoppingBag, User, Star, Cpu, Menu, ArrowRight, MapPin,
  Facebook, Instagram, Twitter, CreditCard
} from "lucide-react";

// ============================================================================
// 1. DATA CONFIGURATION & BRANDS
// ============================================================================

const BRANDS = [
  { name: 'Apple', bg: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300' },
  { name: 'HP', bg: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=300' },
  { name: 'Dell', bg: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=300' },
  { name: 'Lenovo', bg: 'https://images.unsplash.com/photo-1588620353536-cbdf0d1e4eb4?auto=format&fit=crop&q=80&w=300' },
  { name: 'Asus', bg: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&q=80&w=300' },
  { name: 'Acer', bg: 'https://images.unsplash.com/photo-1544108848-d3090632bde5?auto=format&fit=crop&q=80&w=300' },
  { name: 'MSI', bg: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=300' }
];

const HERO_SLIDES = [
  {
    id: 1,
    title: "The Ultimate Refurbished Tech",
    subtitle: "Premium Laptops up to 50% Off",
    img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80",
  }
];

// ============================================================================
// 2. REUSABLE UI COMPONENTS (Premium Animated)
// ============================================================================

const AnnouncementBar = () => (
  <div className="bg-slate-900 text-white text-[10px] md:text-xs py-2 px-4 text-center font-medium tracking-widest uppercase">
    🎉 Extra 10% Off on Prepaid Orders | Free Express Shipping Across India
  </div>
);

// --- Sleek Navbar ---
const Navbar = ({ cartCount, toggleMenu, searchTerm, setSearchTerm }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
          <button onClick={toggleMenu} className="lg:hidden text-slate-900 hover:text-red-600 transition-colors"><Menu size={24}/></button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">ADARSH<span className="text-red-600">Comp</span></span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-widest text-slate-500">
             <Link href="/products" className="hover:text-slate-900 transition-colors">Shop</Link>
             <Link href="/category/apple" className="hover:text-slate-900 transition-colors">MacBooks</Link>
             <Link href="/category/laptops" className="hover:text-slate-900 transition-colors">Windows</Link>
             <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
          
          <div className="flex md:hidden items-center gap-4">
            <Link href={user ? "/profile" : "/login"} className="text-slate-900"><User size={20} /></Link>
            <Link href="/cart" className="relative text-slate-900">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <div className="flex items-center w-full md:w-auto gap-4 md:gap-6">
          <div className="flex-1 md:w-auto relative group">
            <input 
              type="text" 
              placeholder="Search laptops, brands..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 bg-slate-50 border border-slate-200 focus:border-red-400 focus:bg-white rounded-full py-2.5 pl-4 pr-10 text-sm outline-none transition-all duration-300" 
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href={user ? "/profile" : "/login"} className="text-slate-900 hover:text-red-600 transition-colors">
              <User size={20} />
            </Link>
            <Link href="/cart" className="relative text-slate-900 hover:text-red-600 transition-colors flex items-center gap-2">
              <div className="relative">
                 <ShoppingBag size={20} />
                 {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{cartCount}</span>}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Cart</span>
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
};

// --- Deal of the Day Timer ---
const FlashSaleTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 25, seconds: 50 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      <div className="bg-red-600/20 text-red-500 px-2.5 py-1 rounded-md text-sm font-black tracking-widest border border-red-500/30">{format(timeLeft.hours)}</div>
      <span className="text-red-500 font-bold">:</span>
      <div className="bg-red-600/20 text-red-500 px-2.5 py-1 rounded-md text-sm font-black tracking-widest border border-red-500/30">{format(timeLeft.minutes)}</div>
      <span className="text-red-500 font-bold">:</span>
      <div className="bg-red-600/20 text-red-500 px-2.5 py-1 rounded-md text-sm font-black tracking-widest border border-red-500/30">{format(timeLeft.seconds)}</div>
    </div>
  );
};

// --- Premium Product Card ---
const ProductCard = ({ product, addToCart, router }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const hasImage = product.images && product.images.length > 0 && product.images[0] !== "";
  
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col bg-white border border-slate-100 hover:border-red-200 rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.15)] min-w-[160px] max-w-[300px] snap-start relative"
    >
      <div 
        className="relative w-full aspect-square bg-slate-50/50 group-hover:bg-white transition-colors duration-300 p-6 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => router.push(`/product/${product.id}`)}
      >
        {discount > 0 && <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm z-10">{discount}% OFF</span>}
        
        {hasImage ? (
          <motion.img 
             whileHover={{ scale: 1.08 }}
             transition={{ type: "spring", stiffness: 300 }}
             src={product.images[0]} 
             alt={product.name} 
             className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm" 
          />
        ) : (
          <Laptop className="w-12 h-12 text-slate-300" />
        )}
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-grow bg-white border-t border-slate-50 z-10">
        <p className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm inline-block w-fit uppercase tracking-widest mb-2">{product.brand || "Premium"}</p>
        <h3 
          className="text-sm md:text-base font-bold text-slate-900 line-clamp-2 leading-snug mb-3 cursor-pointer group-hover:text-red-600 transition-colors"
          onClick={() => router.push(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        
        <div className="mt-auto mb-5 flex items-end gap-2">
          <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight">₹{Number(product.price).toLocaleString()}</span>
          {product.originalPrice && <span className="text-xs text-slate-400 line-through font-medium pb-1">₹{Number(product.originalPrice).toLocaleString()}</span>}
        </div>

        <div className="flex items-center gap-2 mt-auto">
           <motion.button 
             whileTap={{ scale: 0.9 }}
             onClick={() => setIsWishlisted(!isWishlisted)}
             className={`p-3 rounded-xl border transition-all duration-300 ${isWishlisted ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600'}`}
           >
             <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "animate-pulse" : ""} />
           </motion.button>
           
           <motion.button 
             whileTap={{ scale: 0.95 }}
             onClick={() => { addToCart(product); toast.success("Added to Cart!"); }}
             className="flex-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-slate-900/10 hover:shadow-red-600/30"
           >
             Buy Now
           </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Dynamic Animated Product Row (With "No Product" Logic) ---
const ProductRow = ({ title, icon: Icon, products, link, addToCart, router }) => {
  return (
    <motion.section 
       initial={{ opacity: 0, y: 30 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: "-50px" }}
       transition={{ duration: 0.6, ease: "easeOut" }}
       className="py-10 md:py-14 border-t border-slate-100"
    >
      <div className="flex items-end justify-between mb-8 px-4 md:px-0">
         <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {Icon && <Icon className="text-slate-900" size={28}/>} {title}
         </h2>
         <Link href={link} className="group text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full">
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
         </Link>
      </div>
      
      {/* Fallback agar category me product nahi hai */}
      {(!products || products.length === 0) ? (
         <div className="mx-4 md:mx-0 py-12 px-6 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <Laptop size={32} className="text-slate-300"/>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">No Product Added Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm">We are currently updating our inventory for {title}. Please check back later!</p>
         </div>
      ) : (
         /* Products Grid/Scroll */
         <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 hide-scrollbar px-4 md:px-0 pb-6 snap-x">
            {products.slice(0, 10).map(p => (
               <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />
            ))}
         </div>
      )}
    </motion.section>
  );
};

// ============================================================================
// 3. MAIN PAGE
// ============================================================================

export default function Home() {
  const { addToCart, cart } = useCart();
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Safe category check function
  const checkCat = (p, cat) => {
    if (!p) return false;
    const c = p.category;
    if (Array.isArray(c)) return c.some(x => x && x.toLowerCase() === cat.toLowerCase());
    if (typeof c === 'string') return c.toLowerCase() === cat.toLowerCase();
    
    // Fallback to name/brand checking
    const nameStr = p.name ? p.name.toLowerCase() : '';
    const brandStr = p.brand ? p.brand.toLowerCase() : '';
    return nameStr.includes(cat.toLowerCase()) || brandStr.includes(cat.toLowerCase());
  };

  // Organize Data for Rows
  const dealOfTheDay = products.slice(0, 10); 
  const appleProducts = products.filter(p => checkCat(p, 'apple') || checkCat(p, 'macbook'));
  const hpProducts = products.filter(p => checkCat(p, 'hp'));
  const dellProducts = products.filter(p => checkCat(p, 'dell'));
  const lenovoProducts = products.filter(p => checkCat(p, 'lenovo'));
  const asusProducts = products.filter(p => checkCat(p, 'asus'));
  const latestArrivals = products.slice(0, 15);

  // Live Search Filtering
  const searchResults = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin"></div>
      <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Premium Tech...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <AnnouncementBar />
      <Navbar cartCount={cart.length} toggleMenu={() => console.log('Open Menu')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="max-w-[1400px] mx-auto px-0 md:px-8">
        
        {searchTerm ? (
          <motion.section 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="py-10 md:py-16 px-4 md:px-0 min-h-[60vh]"
          >
             <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Search Results</h2>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-4 py-1.5 rounded-full">{searchResults.length} Found</span>
             </div>
             
             {searchResults.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6"><Search size={40} className="text-slate-300"/></div>
                  <p className="text-slate-500 font-medium text-lg">No products found for "<span className="text-slate-900 font-bold">{searchTerm}</span>"</p>
                  <button onClick={() => setSearchTerm('')} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg">Clear Search</button>
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                 {searchResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />)}
               </div>
             )}
          </motion.section>
        ) : (
          <>
            <motion.section 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
               className="relative w-full h-[400px] md:h-[550px] bg-slate-50 md:rounded-[2rem] mt-0 md:mt-8 overflow-hidden flex items-center border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
               <div className="absolute inset-0 w-full h-full">
                 <img src={HERO_SLIDES[0].img} alt="Hero" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
               </div>
               <div className="relative z-10 px-6 md:px-16 max-w-2xl">
                  <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-white/80 font-bold text-xs uppercase tracking-widest mb-4 block flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Refurbished Reimagined
                  </motion.span>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-6 drop-shadow-lg">
                    {HERO_SLIDES[0].title}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-slate-300 font-medium mb-8 text-sm md:text-base max-w-md">
                    Strict 50-point inspection. 1 Year assured warranty. Experience premium tech at a fraction of the cost.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                     <Link href="/products" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-colors shadow-xl">
                        Explore Collection
                     </Link>
                  </motion.div>
               </div>
            </motion.section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-10 px-4 md:px-0 border-b border-slate-100">
              {[
                { icon: ShieldCheck, t: "1 Year Warranty", s: "Complete peace of mind", c: "text-emerald-500" },
                { icon: Truck, t: "Free Shipping", s: "Across all India", c: "text-blue-500" },
                { icon: RefreshCcw, t: "7 Days Return", s: "Easy replacement", c: "text-purple-500" },
                { icon: Clock, t: "24/7 Support", s: "Always here for you", c: "text-red-500" },
              ].map((f, i) => (
                <motion.div whileHover={{ y: -5 }} key={i} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3 md:gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                   <div className={`${f.c} bg-white p-3 rounded-xl shadow-sm`}><f.icon size={28} strokeWidth={2} /></div>
                   <div>
                      <h4 className="font-bold text-slate-900 text-sm">{f.t}</h4>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1">{f.s}</p>
                   </div>
                </motion.div>
              ))}
            </section>

            <section className="py-12 md:py-16 overflow-hidden">
               <h2 className="text-center text-2xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center justify-center gap-2">
                 <Star className="text-yellow-400" fill="currentColor"/> Explore Top Brands
               </h2>
               
               <div className="relative w-full flex overflow-hidden group">
                  <div className="flex w-max animate-marquee gap-6 md:gap-10 px-4">
                     {[...BRANDS, ...BRANDS].map((brand, i) => (
                        <Link 
                          key={i} href={`/category/${brand.name.toLowerCase()}`}
                          className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden group/brand border-[4px] border-white flex-shrink-0 cursor-pointer shadow-lg hover:shadow-red-600/30 hover:border-red-500 transition-all duration-300"
                        >
                           <img src={brand.bg} alt={brand.name} className="absolute inset-0 w-full h-full object-cover group-hover/brand:scale-110 transition-transform duration-700"/>
                           <div className="absolute inset-0 bg-slate-900/40 group-hover/brand:bg-slate-900/60 transition-colors"></div>
                           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
                              <span className="text-3xl md:text-4xl drop-shadow-lg mb-1 group-hover/brand:-translate-y-1 transition-transform">{brand.logo}</span>
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest drop-shadow-md">{brand.name}</span>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            </section>

            {/* Tagda Deal of the Day Section */}
            <motion.section 
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
               className="my-16 py-12 px-6 md:px-12 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-[0_30px_60px_-15px_rgba(220,38,38,0.3)] relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-72 h-72 bg-red-600/30 rounded-full blur-[100px] pointer-events-none"></div>
               <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none"></div>
               
               <div className="flex flex-col md:flex-row items-center justify-between mb-10 relative z-10">
                  <div className="text-center md:text-left">
                    <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm mb-4 inline-block shadow-lg shadow-red-500/30">Limited Time Offer</span>
                    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 tracking-tight uppercase flex items-center justify-center md:justify-start gap-3">
                      <Zap className="text-amber-400" size={40}/> Deal of the Day
                    </h2>
                    <p className="text-slate-400 mt-3 font-medium">Grab these premium gadgets before the timer runs out!</p>
                  </div>
                  <div className="mt-6 md:mt-0 flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl shadow-xl">
                     <Clock className="text-orange-400" size={24} />
                     <FlashSaleTimer />
                  </div>
               </div>
               
               {/* Deal of the Day Products OR Empty State */}
               {(!dealOfTheDay || dealOfTheDay.length === 0) ? (
                  <div className="mx-4 md:mx-0 py-12 px-6 flex flex-col items-center justify-center bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-700 text-center relative z-10">
                     <Zap size={32} className="text-slate-500 mb-4"/>
                     <h3 className="text-lg font-black text-slate-300 mb-1">No Flash Deals Right Now</h3>
                     <p className="text-sm text-slate-500 max-w-sm">We are cooking up some crazy discounts. Check back soon!</p>
                  </div>
               ) : (
                  <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 hide-scrollbar pb-6 snap-x relative z-10">
                     {dealOfTheDay.map(p => (
                        <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />
                     ))}
                  </div>
               )}
            </motion.section>

            <motion.section 
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
               className="my-12 px-4 md:px-0"
            >
               <div className="bg-gradient-to-r from-slate-900 to-black rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl">
                  <div className="absolute -right-10 -top-20 opacity-10"><Cpu size={400} className="text-white"/></div>
                  <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                     <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block backdrop-blur-md">Custom Built</span>
                     <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Build Your Dream PC</h3>
                     <p className="text-slate-400 font-medium text-sm md:text-base max-w-lg leading-relaxed">
                       Editing, Gaming, or Coding? Tell us your budget and requirements, we will build the perfect workstation for you.
                     </p>
                  </div>
                  <motion.a 
                     whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                     href="https://wa.me/919123188988" target="_blank" rel="noreferrer" 
                     className="relative z-10 bg-white text-slate-900 px-10 py-5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-colors shadow-xl whitespace-nowrap"
                  >
                     Enquire Now
                  </motion.a>
               </div>
            </motion.section>

            {/* Apple & Other Rows */}
            <ProductRow title="Apple MacBooks" icon={Laptop} products={appleProducts} link="/category/apple" addToCart={addToCart} router={router} />
            <ProductRow title="HP Premium Series" icon={Monitor} products={hpProducts} link="/category/hp" addToCart={addToCart} router={router} />
            <ProductRow title="Dell Workstations" icon={Cpu} products={dellProducts} link="/category/dell" addToCart={addToCart} router={router} />
            <ProductRow title="Lenovo ThinkPads" icon={Laptop} products={lenovoProducts} link="/category/lenovo" addToCart={addToCart} router={router} />
            <ProductRow title="Asus Gaming" icon={Zap} products={asusProducts} link="/category/asus" addToCart={addToCart} router={router} />

            <motion.section 
               initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
               className="py-16 mt-10 border-t-4 border-slate-900 rounded-t-[3rem] bg-slate-50"
            >
               <div className="max-w-[1400px] mx-auto">
                  <div className="flex flex-col items-center text-center mb-12 px-4">
                     <span className="bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Full Inventory</span>
                     <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">Latest Arrivals</h2>
                     <p className="text-slate-500 max-w-xl">Browse our complete collection of freshly refurbished tech, certified and ready for you.</p>
                  </div>
                  
                  <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6 hide-scrollbar px-4 md:px-8 pb-8 snap-x">
                     {latestArrivals.map(p => (
                        <ProductCard key={p.id} product={p} addToCart={addToCart} router={router} />
                     ))}
                  </div>

                  <div className="flex justify-center mt-6">
                     <Link href="/products" className="group flex items-center justify-center gap-3 bg-slate-900 text-white font-black px-12 py-5 rounded-xl hover:bg-red-600 transition-all duration-300 shadow-xl uppercase tracking-widest text-sm">
                        View All Products 
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>
                     </Link>
                  </div>
               </div>
            </motion.section>

          </>
        )}
      </main>

      {/* ================= MEGA PREMIUM FOOTER ================= */}
      <footer className="bg-[#0B0F19] pt-20 pb-10 border-t-[4px] border-red-600 relative overflow-hidden font-sans">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-red-600/10 blur-[120px] pointer-events-none"></div>

         <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
               <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">Join The ADARSHComp VIP Club</h3>
                  <p className="text-slate-400 text-sm md:text-base">Get exclusive early access to flash sales, custom PC builds, and special discounts.</p>
               </div>
               <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full md:w-80 bg-slate-950 border border-slate-800 text-slate-300 px-6 py-4 rounded-xl focus:border-red-500 outline-none transition-colors text-sm"
                  />
                  <button className="bg-red-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                     Subscribe <ArrowRight size={16}/>
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
               
               <div className="lg:col-span-4 pr-0 lg:pr-8">
                  <Link href="/" className="flex items-center gap-2 mb-6 group w-fit">
                    <div className="bg-gradient-to-br from-red-600 to-orange-500 text-white p-2.5 rounded-xl shadow-lg group-hover:shadow-red-500/30 transition-shadow">
                       <Laptop size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h1 className="text-2xl font-black text-white tracking-tighter leading-none">ADARSH<span className="text-red-500">Comp</span></h1>
                    </div>
                  </Link>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                    India's most trusted destination for premium refurbished tech. We deliver uncompromised quality, rigorous testing, and exceptional customer support right to your doorstep.
                  </p>
                  <div className="flex gap-4">
                     <a href="#" className="w-10 h-10 bg-slate-800/50 border border-slate-700 rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all text-slate-300 hover:text-white"><Facebook size={18}/></a>
                     <a href="#" className="w-10 h-10 bg-slate-800/50 border border-slate-700 rounded-full flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 transition-all text-slate-300 hover:text-white"><Instagram size={18}/></a>
                     <a href="#" className="w-10 h-10 bg-slate-800/50 border border-slate-700 rounded-full flex items-center justify-center hover:bg-blue-400 hover:border-blue-400 transition-all text-slate-300 hover:text-white"><Twitter size={18}/></a>
                  </div>
               </div>
               
               <div className="lg:col-span-2">
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-3">Shop</h3>
                  <ul className="space-y-4 text-sm font-medium text-slate-400">
                     <li><Link href="/products" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">All Products</Link></li>
                     <li><Link href="/category/apple" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">MacBooks</Link></li>
                     <li><Link href="/category/laptops" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Windows Laptops</Link></li>
                     <li><Link href="/category/mobiles" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Smartphones</Link></li>
                     <li><Link href="/category/gaming" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Gaming Custom PCs</Link></li>
                  </ul>
               </div>

               <div className="lg:col-span-3">
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-3">Support & Legal</h3>
                  <ul className="space-y-4 text-sm font-medium text-slate-400">
                     <li><Link href="/track-order" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Track Your Order</Link></li>
                     <li><Link href="/warranty" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Warranty Registration</Link></li>
                     <li><Link href="/return-policy" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Returns & Replacements</Link></li>
                     <li><Link href="/terms" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Terms & Conditions</Link></li>
                     <li><Link href="/privacy" className="hover:text-red-500 hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
                  </ul>
               </div>
               
               <div className="lg:col-span-3">
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-6 border-l-2 border-red-600 pl-3">Get in Touch</h3>
                  <ul className="space-y-5 text-sm font-medium text-slate-400">
                     <li className="flex gap-4 items-start group cursor-pointer">
                        <MapPin size={20} className="text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform mt-0.5"/> 
                        <span className="group-hover:text-white transition-colors">Mahaveer Market, Chiraiyatand Chauraha, Prithveepur, Patna, Bihar - 800001</span>
                     </li>
                     <li className="flex gap-4 items-center group cursor-pointer">
                        <Phone size={20} className="text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform"/> 
                        <span className="text-white font-bold text-lg tracking-wider group-hover:text-red-500 transition-colors">+91 9123188988</span>
                     </li>
                     <li className="flex gap-4 items-center group cursor-pointer">
                        <Mail size={20} className="text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform"/> 
                        <span className="group-hover:text-white transition-colors">ADARSHComp@gmail.com</span>
                     </li>
                  </ul>
               </div>

            </div>
         </div>

         <div className="border-t border-slate-800 bg-slate-950">
            <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
               
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
                  © {new Date().getFullYear()} ADARSH Comp. All rights reserved. <br className="md:hidden"/>
                  <span className="text-slate-600 font-medium ml-0 md:ml-2">Engineered for Performance.</span>
               </p>
               
               <div className="flex items-center gap-4">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500"/> 100% Secure
                 </span>
                 <div className="flex gap-2 items-center">
                    <div className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-[10px] font-black italic tracking-wider flex items-center">
                       <CreditCard size={12} className="mr-1 opacity-50"/> VISA
                    </div>
                    <div className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider flex items-center">
                       <span className="text-orange-500">Master</span>Card
                    </div>
                    <div className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider">
                       UPI
                    </div>
                 </div>
               </div>

            </div>
         </div>
      </footer>
    </div>
  );
}