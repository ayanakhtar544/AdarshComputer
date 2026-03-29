"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { UserPlus, Search, ArrowRight, Wallet, Users, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function KhatabookList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalUdhaar: 0, totalCustomers: 0 });

  // 1. Fetch Data & Calculate Stats
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "customers"), orderBy("name"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setCustomers(data);

      // Stats Calculation
      let udhaar = 0;
      data.forEach(c => {
        if(c.balance > 0) udhaar += c.balance;
      });
      setStats({ totalUdhaar: udhaar, totalCustomers: data.length });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. Add Customer Logic
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    try {
      await addDoc(collection(db, "customers"), {
        name: newCustomer.name,
        phone: newCustomer.phone,
        balance: 0, 
        updatedAt: serverTimestamp(),
      });
      toast.success("Customer Added!");
      setShowModal(false);
      setNewCustomer({ name: '', phone: '' });
      fetchCustomers(); 
    } catch (error) {
      toast.error("Error adding customer");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen pb-24">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Khatabook</h1>
          <p className="text-gray-500 text-sm">Manage your daily len-den</p>
        </div>
        
        {/* Total Stats Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-xl shadow-lg w-full md:w-auto min-w-[250px]">
           <div className="flex items-center gap-2 mb-1 opacity-80">
              <Wallet size={16} /> Market Outstanding
           </div>
           <h2 className="text-3xl font-bold">₹{stats.totalUdhaar.toLocaleString()}</h2>
           <p className="text-xs mt-1 opacity-70">{stats.totalCustomers} Active Customers</p>
        </div>
      </div>

      {/* 2. Search & Action Bar */}
      <div className="flex gap-3 mb-6 sticky top-2 z-10">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search Name or Phone..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 rounded-xl flex items-center justify-center shadow-lg transition transform active:scale-95"
        >
          <UserPlus size={24} className="md:mr-2"/> 
          <span className="hidden md:inline font-bold">Add Customer</span>
        </button>
      </div>

      {/* 3. Customers List (Grid for Mobile, Table for Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
           <div className="col-span-full flex justify-center py-20 text-gray-400 gap-2">
             <Loader2 className="animate-spin" /> Loading data...
           </div>
        ) : filteredCustomers.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             <Users size={48} className="mx-auto text-gray-300 mb-3"/>
             <p className="text-gray-500">No customers found.</p>
           </div>
        ) : (
          <AnimatePresence>
            {filteredCustomers.map((customer) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={customer.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                         {customer.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 line-clamp-1">{customer.name}</h3>
                         <p className="text-xs text-gray-400">{customer.phone}</p>
                      </div>
                   </div>
                   <div className={`text-right ${customer.balance > 0 ? 'text-red-500' : customer.balance < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                      <p className="text-lg font-bold">₹{Math.abs(customer.balance)}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wide">
                        {customer.balance > 0 ? 'Lena hai' : customer.balance < 0 ? 'Jama hai' : 'Settled'}
                      </p>
                   </div>
                </div>
                
                <Link href={`/admin/khatabook/${customer.id}`} className="block w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 font-semibold text-sm py-3 rounded-xl text-center transition-colors flex items-center justify-center gap-2">
                   View Hisab Kitab <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 4. Add Customer Modal (Glassmorphism) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
          >
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-500 transition">
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-1">New Customer</h2>
            <p className="text-gray-500 text-sm mb-6">Enter details to start maintaining khata.</p>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <input required type="text" placeholder="e.g. Rahul Kumar" className="w-full mt-1 p-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 transition" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                <input required type="tel" placeholder="e.g. 9876543210" className="w-full mt-1 p-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 transition" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-200 transition">
                Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}