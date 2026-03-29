"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  // Security Check
  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      router.push('/login?redirect=/checkout');
    }
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [user, cart, router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalAmount = totalPrice + 99; // Total + Packaging
    
    // 1. Data format jo Profile aur Admin exactly expect kar rahe hain
    const newOrder = {
      customerName: formData.name,
      email: user.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
      items: cart,               // 'items' array zaroori hai
      totalAmount: finalAmount,  // 'totalAmount' zaroori hai
      status: "Pending",         // Initial Status
      createdAt: serverTimestamp()
    };

    try {
      // 2. Save to Firebase
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      
      // 3. Generate WhatsApp Message
      let message = `*NEW ORDER ALERT (Adarsh Computer)* 🚀\n\n`;
      message += `*Order ID:* #${docRef.id.slice(0,8).toUpperCase()}\n`;
      message += `*Name:* ${formData.name}\n`;
      message += `*Phone:* ${formData.phone}\n`;
      message += `*Address:* ${formData.address}, ${formData.city} - ${formData.pincode}\n\n`;
      message += `*ORDER ITEMS:*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
      });
      message += `\n*Total Amount: ₹${finalAmount}* (Incl. 99 Packaging)`;
      
      const whatsappUrl = `https://wa.me/919123188988?text=${encodeURIComponent(message)}`;

      // 4. Cleanup & Redirect
      clearCart();
      toast.success("Order Placed Successfully! 🎉");
      
      // Open Whatsapp in new tab, then redirect user to profile
      window.open(whatsappUrl, '_blank');
      router.push('/profile');

    } catch (error) {
      console.error("Checkout Error: ", error);
      toast.error("Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm px-4 py-4">
         <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition">
               <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Secure Checkout</h1>
         </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Delivery Details Form */}
        <div className="w-full lg:w-2/3">
           <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide border-b border-gray-100 pb-4 flex items-center gap-2">
                 <Truck className="text-red-600"/> Delivery Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-red-600 font-medium text-sm" placeholder="John Doe" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-red-600 font-medium text-sm" placeholder="+91 9876543210" />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Address (House, Street, Area)</label>
                 <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-red-600 font-medium text-sm resize-none" placeholder="123 Main Street..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">City</label>
                    <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-red-600 font-medium text-sm" placeholder="Patna" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pincode</label>
                    <input required name="pincode" value={formData.pincode} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-red-600 font-medium text-sm" placeholder="800001" />
                 </div>
              </div>
           </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
                 <CheckCircle className="text-red-600"/> Order Summary
              </h2>
              
              <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between text-sm font-medium">
                     <span className="text-slate-600 line-clamp-1 pr-4">{item.quantity}x {item.name}</span>
                     <span className="text-slate-900 font-bold whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
              </div>

              <div className="space-y-3 py-4 border-t border-b border-gray-100 mb-6 text-sm font-medium text-slate-500">
                 <div className="flex justify-between">
                    <span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Shipping</span><span className="text-green-600 font-bold">FREE</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Packaging</span><span>₹99</span>
                 </div>
                 <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-dashed border-gray-200 mt-2">
                    <span>Total Pay</span><span>₹{(totalPrice + 99).toLocaleString()}</span>
                 </div>
              </div>

              <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-xs font-bold mb-6 flex items-start gap-2 border border-blue-100">
                 <ShieldCheck size={16} className="mt-0.5 flex-shrink-0"/>
                 <p>Cash on Delivery (COD) is available. Our executive will call you to confirm the order.</p>
              </div>

              <button 
                 form="checkout-form"
                 type="submit"
                 disabled={loading}
                 className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-red-600 transition-colors uppercase tracking-widest text-sm shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                 {loading ? <Loader2 className="animate-spin" size={20}/> : 'Confirm & Place Order'}
              </button>
           </div>
        </div>

      </main>
    </div>
  );
}