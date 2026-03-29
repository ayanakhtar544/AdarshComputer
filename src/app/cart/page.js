"use client";

import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Trash2, Plus, Minus, ShoppingBag, 
  ShieldCheck, Truck, ChevronRight 
} from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error("Please login to proceed to Checkout!");
      // User ko login page par bhejo, aur login hone ke baad wapas checkout pe lao
      router.push('/login?redirect=/checkout'); 
    } else {
      router.push('/checkout');
    }
  };

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty!</h2>
          <p className="text-slate-500 mb-8 font-medium">Looks like you haven't added any refurbished tech to your cart yet.</p>
          <button onClick={handleCheckoutClick} className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-slate-900 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                  Proceed to Checkout <ChevronRight size={18} />
               </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-slate-800 pb-24 md:pb-12">
      
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm px-4 py-4">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => router.push('/')} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition">
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                     Shopping Cart
                  </h1>
                  <p className="text-xs font-bold text-slate-400">{cart.length} Items</p>
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: Cart Items List */}
          <div className="w-full lg:w-2/3 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 relative group transition-all hover:shadow-md">
                
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  ) : (
                    <span className="text-3xl">💻</span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col flex-grow justify-between">
                  <div className="pr-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.category || "Gadget"}</p>
                    <Link href={`/product/${item.id}`} className="text-sm md:text-base font-bold text-slate-800 hover:text-red-600 transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-xs text-green-600 font-bold mt-1">In Stock</p>
                  </div>

                  <div className="flex items-end justify-between mt-4 sm:mt-0">
                    {/* Price */}
                    <div className="flex flex-col">
                       {item.originalPrice && <span className="text-xs text-gray-400 line-through">₹{Number(item.originalPrice).toLocaleString()}</span>}
                       <span className="text-lg font-black text-slate-900">₹{Number(item.price).toLocaleString()}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                      <button 
                        onClick={() => updateQuantity(item.id, 'decrease')} 
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-600 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 'increase')} 
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-600 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-full"
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
               
               <div className="space-y-3 mb-6 text-sm font-medium text-slate-600">
                  <div className="flex justify-between">
                     <span>Price ({cart.length} items)</span>
                     <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Delivery Charges</span>
                     <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Packaging Fee</span>
                     <span>₹99</span>
                  </div>
               </div>

               <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-300 mb-6">
                  <span className="text-base font-bold text-slate-800">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">₹{(totalPrice + 99).toLocaleString()}</span>
               </div>

               <Link href="/checkout" className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-slate-900 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                  Proceed to Checkout <ChevronRight size={18} />
               </Link>

               {/* Trust Badges */}
               <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                     <ShieldCheck size={16} className="text-green-600"/> 100% Safe & Secure Payments
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                     <Truck size={16} className="text-blue-600"/> Assured Delivery in 3-5 Days
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}