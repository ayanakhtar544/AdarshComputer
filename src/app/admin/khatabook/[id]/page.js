"use client";
import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Plus, Minus, Printer, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerLedger({ params }) {
  const { id } = use(params);

  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('debit'); // 'debit' or 'credit'
  const [submitting, setSubmitting] = useState(false); // <--- YE BUTTON KO ROKEGA

  // 1. Data Fetching
  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        try {
            const docRef = doc(db, "customers", id);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
                setCustomer({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (err) {
            console.error(err);
        }

        const q = query(collection(db, `customers/${id}/transactions`), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(txns);
            setLoading(false);
        });
        return () => unsubscribe();
    };
    fetchData();
  }, [id]);

  // 2. Add Transaction Logic (With Safety Lock)
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!amount || submitting) return; // Agar submitting true hai to RUK JAO

    setSubmitting(true); // Lock laga diya

    const val = Number(amount);
    
    try {
        // A. Add to History
        await addDoc(collection(db, `customers/${id}/transactions`), {
            amount: val,
            type: type,
            description: desc || (type === 'debit' ? 'Udhaar diya' : 'Payment received'),
            createdAt: serverTimestamp(),
        });

        // B. Update Balance
        const balanceChange = type === 'debit' ? val : -val;
        const customerRef = doc(db, "customers", id);
        
        await updateDoc(customerRef, {
            balance: increment(balanceChange),
            updatedAt: serverTimestamp()
        });

        // C. Local Update (Instant Feedback)
        setCustomer(prev => ({ ...prev, balance: (prev?.balance || 0) + balanceChange }));

        toast.success(type === 'debit' ? "Udhaar Added!" : "Payment Received!");
        setAmount('');
        setDesc('');
        
        // Focus wapas description pe ya amount pe laane ke liye (Optional)
        document.getElementById('amountInput').focus();

    } catch (error) {
        console.error(error);
        toast.error("Transaction failed");
    } finally {
        setSubmitting(false); // Lock khol diya
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-blue-600 gap-2">
        <Loader2 className="animate-spin" /> Loading Ledger...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Navigation */}
        <Link href="/admin/khatabook" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={20} /> Back to Customer List
        </Link>

        {/* Hero Card (Customer Info) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div>
             <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/10 p-2 rounded-full"><Wallet size={24} /></div>
                <h1 className="text-3xl font-bold">{customer?.name}</h1>
             </div>
             <p className="text-gray-400 ml-12">{customer?.phone}</p>
          </div>
          
          <div className="text-right mt-6 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
             <p className="text-sm text-gray-300 mb-1">Net Balance</p>
             <h2 className={`text-4xl font-bold ${customer?.balance > 0 ? 'text-red-400' : customer?.balance < 0 ? 'text-green-400' : 'text-white'}`}>
               ₹{Math.abs(customer?.balance || 0).toLocaleString()}
             </h2>
             <span className="text-xs text-gray-400 uppercase tracking-wide">
               {customer?.balance > 0 ? 'To Collect (Lena Hai)' : customer?.balance < 0 ? 'Advance (Jama Hai)' : 'Settled'}
             </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* LEFT: Transaction Form */}
           <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    Add New Entry
                 </h3>
                 
                 {/* Toggle Buttons */}
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                      onClick={() => setType('debit')}
                      className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'debit' ? 'bg-red-50 text-red-600 ring-2 ring-red-500 ring-offset-2' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Minus size={18}/> Udhaar (Dena)
                    </button>
                    <button 
                      onClick={() => setType('credit')}
                      className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'credit' ? 'bg-green-50 text-green-600 ring-2 ring-green-500 ring-offset-2' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Plus size={18}/> Payment (Lena)
                    </button>
                 </div>
  
                 <form onSubmit={handleTransaction} className="space-y-5">
                    <div className="relative">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount</label>
                      <div className="relative mt-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                          <input 
                            id="amountInput"
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                            placeholder="0"
                            autoFocus
                          />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Note</label>
                      <input 
                        type="text" 
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        placeholder={type === 'debit' ? "e.g. Laptop Repair" : "e.g. PhonePe / Cash"}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting || !amount}
                      className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${type === 'debit' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
                    >
                      {submitting ? (
                          <> <Loader2 className="animate-spin" /> Saving... </>
                      ) : (
                          type === 'debit' ? 'Add Udhaar' : 'Accept Payment'
                      )}
                    </button>
                 </form>
              </div>
           </div>
  
           {/* RIGHT: History List */}
           <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition">
                      <Printer size={20} />
                    </button>
                 </div>
                 
                 <div className="max-h-[600px] overflow-y-auto p-2">
                    {transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Wallet size={32} className="opacity-20"/>
                         </div>
                         <p>No transactions yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-gray-50">
                          <AnimatePresence>
                             {transactions.map((txn) => (
                               <motion.tr 
                                 key={txn.id} 
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0 }}
                                 className="group hover:bg-blue-50/50 transition-colors"
                               >
                                 <td className="p-4 pl-6">
                                   <p className="font-bold text-gray-800 group-hover:text-blue-700 transition">{txn.description}</p>
                                   <p className="text-xs text-gray-400 mt-1">
                                     {txn.createdAt ? new Date(txn.createdAt.seconds * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now'}
                                   </p>
                                 </td>
                                 <td className={`p-4 pr-6 text-right font-bold text-lg ${txn.type === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                                   {txn.type === 'debit' ? '+' : '-'} ₹{txn.amount}
                                 </td>
                               </motion.tr>
                             ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}