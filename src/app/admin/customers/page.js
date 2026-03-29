"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Users, Search, Download, Printer, Loader2, User, ShieldCheck, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Customers from Firestore 'users' collection
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        // Agar database khali hai toh error na aaye isliye toast hata diya
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // 2. Export to Excel (CSV Format)
  const downloadExcel = () => {
    if (customers.length === 0) return toast.error("No customers to download.");

    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Role,Join Date\n";

    // Data Rows
    customers.forEach(user => {
      const date = user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown';
      const row = `"${user.name}","${user.email}","${user.role}","${date}"`;
      csvContent += row + "\n";
    });

    // Create Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customers_ChouhanComputers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Excel File Downloaded! 📊");
  };

  // 3. Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // 4. Search Filter
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40}/>
      <p className="font-bold text-slate-400 uppercase tracking-widest">Loading Customers...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 relative">
      
      {/* --- HEADER (Hide on Print) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Users className="text-red-600"/> Customer Database
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Total {customers.length} registered customers on your platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
           {/* Search Box */}
           <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-sm py-2.5 pl-9 pr-4 rounded-xl outline-none focus:border-red-600 transition-colors"
              />
           </div>
           
           {/* Action Buttons */}
           <div className="flex gap-2">
              <button 
                 onClick={downloadExcel} 
                 className="flex-1 sm:flex-none bg-[#107C41] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0B5A2F] transition shadow-sm"
              >
                 <Download size={16}/> Excel
              </button>
              <button 
                 onClick={handlePrint} 
                 className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition shadow-sm"
              >
                 <Printer size={16}/> Print
              </button>
           </div>
        </div>
      </div>

      {/* --- PRINT HEADER (Only visible on PDF Print) --- */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900">
         <h2 className="text-2xl font-black text-slate-900">Adarsh Computer</h2>
         <p className="text-sm font-bold text-slate-500 mt-1">Customer Database Report - {new Date().toLocaleDateString()}</p>
      </div>

      {/* --- CUSTOMERS TABLE --- */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 print:border-none">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-gray-100 print:bg-slate-200 print:text-slate-900">
              <th className="p-4 w-16 text-center">Profile</th>
              <th className="p-4">Customer Name & Role</th>
              <th className="p-4">Email Address</th>
              <th className="p-4 text-right">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.length === 0 ? (
               <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-400">
                     <Users size={40} className="mx-auto mb-3 opacity-20"/>
                     <p className="font-bold">No customers found.</p>
                     <p className="text-sm">When users sign up, they will appear here.</p>
                  </td>
               </tr>
            ) : filteredCustomers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                
                {/* Avatar */}
                <td className="p-4 text-center">
                   <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-black text-sm flex items-center justify-center mx-auto border border-slate-200">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User size={16}/>}
                   </div>
                </td>

                {/* Name & Role */}
                <td className="p-4">
                   <p className="text-sm font-bold text-slate-900">{user.name || "Unknown User"}</p>
                   <div className="flex items-center gap-1 mt-1">
                      {user.email === 'chouhancomputers@gmail.com' ? (
                         <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><ShieldCheck size={10}/> Admin</span>
                      ) : (
                         <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><User size={10}/> Customer</span>
                      )}
                   </div>
                </td>

                {/* Email */}
                <td className="p-4">
                   <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400 print:hidden"/> {user.email}
                   </p>
                </td>

                {/* Date */}
                <td className="p-4 text-right">
                   <p className="text-sm font-bold text-slate-800 flex items-center justify-end gap-2">
                      <Calendar size={14} className="text-slate-400 print:hidden"/> 
                      {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                   </p>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}