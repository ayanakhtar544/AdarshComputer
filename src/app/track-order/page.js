"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Order ID se document dhoondo
      const docRef = doc(db, "orders", orderId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Order ID not found. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Status Step Helper
  const getStepStatus = (step) => {
    if (!order) return 'gray';
    
    const statusMap = { 'Pending': 1, 'Shipped': 2, 'Delivered': 3, 'Cancelled': 0 };
    const currentStep = statusMap[order.status] || 1;
    const targetStep = statusMap[step];

    if (currentStep >= targetStep) return 'completed';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your Order ID sent on WhatsApp</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Paste Order ID here (e.g. 7A2b9...)" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-mono text-lg"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 transition transform active:scale-95 disabled:opacity-70"
            >
              {loading ? "Searching..." : "Track Now"}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}
        </div>

        {/* Order Details Result */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            {/* Order Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
               <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Order ID</p>
                  <p className="font-mono font-bold text-lg">{order.id}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Amount</p>
                  <p className="font-bold text-lg">₹{order.price}</p>
               </div>
            </div>

            <div className="p-6 md:p-8">
               {/* Product Info */}
               <div className="flex items-start gap-4 mb-8 pb-8 border-b border-gray-100">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                     📦
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-gray-800">{order.productName}</h2>
                     <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                       <Clock size={14}/> Ordered on: {order.timestamp ? new Date(order.timestamp.seconds * 1000).toDateString() : 'Recent'}
                     </p>
                     <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                       <MapPin size={14}/> Delivery to: {order.address}
                     </p>
                  </div>
               </div>

               {/* Tracking Timeline (Vertical on Mobile, Horizontal on Desktop) */}
               {order.status === 'Cancelled' ? (
                  <div className="bg-red-50 p-6 rounded-xl text-center text-red-600 font-bold border border-red-100">
                     ❌ This Order has been Cancelled.
                  </div>
               ) : (
                  <div className="relative">
                    {/* Progress Bar Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    <div className="md:hidden absolute left-6 top-0 h-full w-1 bg-gray-200 z-0"></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                       
                       {/* Step 1: Pending */}
                       <TimelineStep 
                          status={getStepStatus('Pending')} 
                          icon={Clock} 
                          title="Order Placed" 
                          date="We have received your order"
                       />

                       {/* Step 2: Shipped */}
                       <TimelineStep 
                          status={getStepStatus('Shipped')} 
                          icon={Truck} 
                          title="Shipped" 
                          date="Your item is on the way"
                       />

                       {/* Step 3: Delivered */}
                       <TimelineStep 
                          status={getStepStatus('Delivered')} 
                          icon={CheckCircle} 
                          title="Delivered" 
                          date="Enjoy your product!"
                       />

                    </div>
                  </div>
               )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

// Component for each step
function TimelineStep({ status, icon: Icon, title, date }) {
  const isCompleted = status === 'completed';
  
  return (
    <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
       <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-200 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
          <Icon size={20} />
       </div>
       <div>
          <h3 className={`font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{title}</h3>
          <p className="text-xs text-gray-500">{date}</p>
       </div>
    </div>
  );
}