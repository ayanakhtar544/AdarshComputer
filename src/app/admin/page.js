"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, IndianRupee, ShoppingCart, Package, RefreshCw, Laptop } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, productsCount: 0, customersCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  // 🚨 KISI BHI TARAH KA KOI LOGIN CHECK NAHI HAI YAHAN
  // Dekhoonent load hote hi seedha data fetch hoga
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let totalRevenue = 0;
      const uniqueCustomers = new Set(); 

      ordersData.forEach(order => {
        totalRevenue += Number(order.price) || 0;
        if(order.customerPhone) uniqueCustomers.add(order.customerPhone);
      });

      const productsSnapshot = await getDocs(collection(db, "products"));
      
      setStats({
        revenue: totalRevenue,
        ordersCount: ordersData.length,
        productsCount: productsSnapshot.size,
        customersCount: uniqueCustomers.size
      });

      const sortedOrders = ordersData.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).slice(0, 5);
      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load live data!");
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg">
             <Laptop size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Unlocked Mode (Dev) 🔓</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchDashboardData} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg"
          >
            <RefreshCw size={16} className={dataLoading ? "animate-spin" : ""} /> 
            {dataLoading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {dataLoading ? (
        // Data Loading State
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-6"></div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing with Database...</p>
        </div>
      ) : (
        <>
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 shadow-inner"><IndianRupee size={32} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p><h3 className="text-2xl md:text-3xl font-black text-slate-900">₹{stats.revenue.toLocaleString()}</h3></div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-blue-600 shadow-inner"><ShoppingCart size={32} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Orders</p><h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats.ordersCount}</h3></div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-purple-600 shadow-inner"><Package size={32} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Products</p><h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats.productsCount}</h3></div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-orange-600 shadow-inner"><Users size={32} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unique Buyers</p><h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats.customersCount}</h3></div>
            </div>

          </div>

          {/* Recent Orders Table Area */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">Recent Orders</h3>
              <button className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100/50 text-slate-400 text-xs uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-5 md:px-8 border-b border-slate-100">Customer Details</th>
                    <th className="p-5 md:px-8 border-b border-slate-100">Product Info</th>
                    <th className="p-5 md:px-8 border-b border-slate-100">Amount</th>
                    <th className="p-5 md:px-8 border-b border-slate-100">Status</th>
                    <th className="p-5 md:px-8 border-b border-slate-100">Date Ordered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Package size={48} className="mb-4 text-slate-300" />
                          <p className="font-bold text-lg text-slate-600 mb-1">No Orders Yet</p>
                          <p className="text-xs uppercase tracking-widest">Share your store link to get started!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                        <td className="p-5 md:px-8">
                           <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{order.customerName}</p>
                           <p className="text-xs text-slate-400 mt-1">{order.customerPhone || 'No Phone Added'}</p>
                        </td>
                        <td className="p-5 md:px-8 text-slate-500 line-clamp-2 max-w-[250px] mt-3 border-none">{order.productName}</td>
                        <td className="p-5 md:px-8 font-black text-slate-900 text-base">₹{Number(order.price).toLocaleString()}</td>
                        <td className="p-5 md:px-8">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5
                            ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                              order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' : 
                              'bg-amber-50 text-amber-600 border border-amber-200'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : order.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-5 md:px-8 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          {order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Processing'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}