"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, MapPin, Settings, LogOut, 
  ChevronRight, Clock, CheckCircle, Truck, XCircle, 
  ArrowLeft, ShoppingBag, ShieldCheck, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// 1. HELPER COMPONENTS
// ============================================================================

const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
    case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending/Processing
  }
};

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'delivered': return <CheckCircle size={16} />;
    case 'shipped': return <Truck size={16} />;
    case 'cancelled': return <XCircle size={16} />;
    default: return <Clock size={16} />;
  }
};

// ============================================================================
// 2. MAIN PROFILE PAGE COMPONENT
// ============================================================================

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  // --- SECURITY CHECK & DATA FETCHING ---
  useEffect(() => {
    // Agar loading khatam ho gayi aur user nahi hai, toh login pe bhejo
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
      return;
    }

    // Agar user hai, toh uske orders fetch karo
    if (user) {
      const fetchUserOrders = async () => {
        try {
          // Firebase query: Sirf is user ke email wale orders lao
          const q = query(
            collection(db, "orders"), 
            where("email", "==", user.email)
            // Note: Agar tumne checkout me email save nahi kiya hai, toh ye empty array dega.
            // Order save karte time `email: user.email` zaroor bhejna!
          );
          const snapshot = await getDocs(q);
          const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Sort by date manually if orderBy requires complex index
          userOrders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
          
          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Could not load your order history.");
        } finally {
          setFetchingOrders(false);
        }
      };

      fetchUserOrders();
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Profile...</h2>
      </div>
    );
  }

  // Double Check Security
  if (!user) return null;

  // ============================================================================
  // 3. TAB RENDERERS (Orders, Account, Addresses)
  // ============================================================================

  const renderOrdersTab = () => {
    if (fetchingOrders) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
           <p className="font-medium text-sm">Fetching your orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="bg-white rounded-3xl p-10 md:p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">No Orders Yet</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't placed any orders yet. Explore our premium collection of refurbished tech!</p>
          <Link href="/products" className="bg-red-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-slate-900 transition-colors uppercase tracking-widest text-sm shadow-lg shadow-red-600/20">
             Start Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all">
            
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-sm font-black text-slate-800">#{order.id.slice(0, 10).toUpperCase()}</p>
               </div>
               <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm font-bold text-slate-700">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just Now'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-sm font-black text-slate-900">₹{Number(order.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider border ${getStatusColor(order.status || 'Processing')}`}>
                     {getStatusIcon(order.status || 'Processing')}
                     {order.status || 'Processing'}
                  </div>
               </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center p-2 border border-slate-100 flex-shrink-0">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    ) : (
                      <Package size={24} className="text-slate-300"/>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₹{Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
               <button className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase rounded-lg hover:bg-slate-50 transition">Need Help?</button>
               <Link href={`/product/${order.items?.[0]?.id}`} className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-lg hover:bg-red-100 transition">Buy Again</Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAccountTab = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
       <div className="p-6 border-b border-gray-100 bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800">Account Details</h3>
          <p className="text-xs text-slate-500 font-medium">Manage your personal information and security.</p>
       </div>
       <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold">{user.displayName || "Not Provided"}</div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold flex items-center gap-2">
                   {user.email} <ShieldCheck size={16} className="text-green-500"/>
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium italic">Update during checkout</div>
             </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
             <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold uppercase hover:bg-red-600 transition shadow-md">Edit Profile</button>
             <button className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-bold uppercase hover:bg-slate-50 transition">Change Password</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans pb-20">
      
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
         <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => router.push('/')} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">My Profile</h1>
            </div>
         </div>
      </div>

      {/* Main Profile Content */}
      <main className="max-w-[1200px] mx-auto px-4 py-8">
         
         {/* User Greeting Card */}
         <div className="bg-slate-900 rounded-3xl p-6 md:p-10 text-white mb-8 flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-slate-900 font-black text-3xl md:text-4xl shadow-lg border-4 border-slate-800">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
               </div>
               <div>
                  <h2 className="text-2xl md:text-3xl font-black mb-1 leading-tight">Hello, {user.displayName || "Customer"}!</h2>
                  <p className="text-slate-400 font-medium text-sm flex items-center gap-2"><CreditCard size={14}/> Premium Member</p>
               </div>
            </div>
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest transition relative z-10 shadow-lg shadow-red-600/30">
               <LogOut size={16}/> Logout
            </button>
         </div>

         {/* Layout: Sidebar & Content */}
         <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-1/4">
               <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                  <div className="p-4 border-b border-gray-100 bg-slate-50/50">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard Menu</p>
                  </div>
                  <nav className="flex flex-col p-2">
                     <button 
                        onClick={() => setActiveTab('orders')} 
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'orders' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <span className="flex items-center gap-3"><Package size={18}/> My Orders</span>
                        {activeTab === 'orders' && <ChevronRight size={16}/>}
                     </button>
                     <button 
                        onClick={() => setActiveTab('account')} 
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'account' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <span className="flex items-center gap-3"><Settings size={18}/> Account Settings</span>
                        {activeTab === 'account' && <ChevronRight size={16}/>}
                     </button>
                     <button 
                        onClick={() => setActiveTab('address')} 
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'address' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <span className="flex items-center gap-3"><MapPin size={18}/> Saved Addresses</span>
                        {activeTab === 'address' && <ChevronRight size={16}/>}
                     </button>
                     <div className="my-2 border-t border-gray-100"></div>
                     <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm text-red-600 hover:bg-red-50 lg:hidden"
                     >
                        <LogOut size={18}/> Logout Securely
                     </button>
                  </nav>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full lg:w-3/4">
               <AnimatePresence mode="wait">
                  <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.2 }}
                  >
                     {activeTab === 'orders' && renderOrdersTab()}
                     {activeTab === 'account' && renderAccountTab()}
                     {activeTab === 'address' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-slate-500">
                           <MapPin size={40} className="mx-auto mb-4 text-slate-300"/>
                           <h3 className="text-xl font-bold text-slate-800 mb-2">No Saved Addresses</h3>
                           <p className="text-sm">Addresses will be automatically saved when you place an order.</p>
                        </div>
                     )}
                  </motion.div>
               </AnimatePresence>
            </div>

         </div>
      </main>
    </div>
  );
}