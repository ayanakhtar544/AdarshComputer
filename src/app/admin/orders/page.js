"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ShoppingBag, Loader2, Search, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Orders from Firebase
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 2. Update Status Logic
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      // Update local state so UI updates instantly
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Status update failed!");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle size={12}/> Delivered</span>;
      case 'Shipped': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Truck size={12}/> Shipped</span>;
      case 'Cancelled': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><XCircle size={12}/> Cancelled</span>;
      default: return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40}/>
      <p className="font-bold text-slate-400 uppercase tracking-widest">Loading Orders...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingBag className="text-red-600"/> Order Management
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">View, track, and update customer orders.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
           <input 
             type="text" 
             placeholder="Search name, phone, order ID..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-50 border border-slate-200 text-sm py-2.5 pl-9 pr-4 rounded-xl outline-none focus:border-red-600 transition-colors"
           />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
              <th className="p-4 rounded-tl-xl">Order Info</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Items & Amount</th>
              <th className="p-4">Status Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
               <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500 font-medium">No orders found.</td>
               </tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                
                {/* Col 1: ID & Date */}
                <td className="p-4 align-top">
                   <p className="text-xs font-bold text-slate-400 mb-1">ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                   <p className="text-sm font-black text-slate-800">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                   </p>
                   <div className="mt-2">{getStatusBadge(order.status)}</div>
                </td>

                {/* Col 2: Customer (SMART CHECK ADDED HERE) */}
                <td className="p-4 align-top max-w-[250px]">
                   {/* Fallback logic: customerName nahi toh name dikhao */}
                   <p className="text-sm font-bold text-slate-900">{order.customerName || order.name || "Admin / Unknown"}</p>
                   {/* Fallback logic: phone nahi toh mobile dikhao */}
                   <p className="text-xs text-slate-500 font-medium mt-0.5">{order.phone || order.phoneNo || order.mobile || "No Phone"}</p>
                   <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2" title={order.address}>
                     {order.address || order.shippingAddress || "Address not provided"}
                   </p>
                </td>

                {/* Col 3: Items (SMART CHECK ADDED HERE) */}
                <td className="p-4 align-top max-w-[250px]">
                   <div className="space-y-1 mb-3">
                     {/* items, cartData, ya cart jo bhi mile usko render karo */}
                     {(order.items || order.cartData || order.cart || []).map((item, idx) => (
                        <p key={idx} className="text-xs text-slate-600 font-medium line-clamp-1">
                           <span className="font-bold text-slate-900">{item.quantity || 1}x</span> {item.name || "Item"}
                        </p>
                     ))}
                   </div>
                   <p className="text-sm font-black text-red-600 bg-red-50 px-2 py-1 rounded w-fit">
                      {/* totalAmount, totalPrice, ya total jo bhi mile */}
                      Total: ₹{Number(order.totalAmount || order.totalPrice || order.total || 0).toLocaleString()}
                   </p>
                </td>

                {/* Col 4: Actions */}
                <td className="p-4 align-top">
                   <select 
                     value={order.status || 'Pending'}
                     onChange={(e) => handleStatusChange(order.id, e.target.value)}
                     className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-red-600 cursor-pointer shadow-sm"
                   >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                   </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}