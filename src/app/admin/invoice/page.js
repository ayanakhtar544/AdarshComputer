"use client";
import { useState } from 'react';
import { FileText, Printer, MessageCircle, Plus, Trash2, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceGenerator() {
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Math.floor(Math.random() * 100000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [items, setItems] = useState([{ id: 1, desc: '', qty: 1, price: '' }]);
  const [discount, setDiscount] = useState(0);

  // Handlers for Items
  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), desc: '', qty: 1, price: '' }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return toast.error("At least one item required");
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Calculations
  const subTotal = items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.price)), 0);
  const finalTotal = subTotal - Number(discount);

  // 1. Download/Print PDF Action
  const handlePrint = () => {
    if (!customer.name || !customer.phone) return toast.error("Please fill customer details!");
    window.print(); // Browser's native high-quality PDF print dialog
  };

  // 2. WhatsApp Share Action
  const handleWhatsApp = () => {
    if (!customer.name || !customer.phone) return toast.error("Please fill customer details!");
    
    let msg = `*INVOICE: ${invoiceNo}*\n`;
    msg += `*Lappy Dekho*\n\n`;
    msg += `Hello *${customer.name}*,\nHere are your bill details:\n\n`;
    
    items.forEach((item, idx) => {
      if (item.desc) {
        msg += `${idx + 1}. ${item.desc} (x${item.qty}) - ₹${item.qty * item.price}\n`;
      }
    });
    
    msg += `\n*Subtotal:* ₹${subTotal}`;
    if (discount > 0) msg += `\n*Discount:* -₹${discount}`;
    msg += `\n*Final Amount: ₹${finalTotal}*\n\n`;
    msg += `Thank you for shopping with us! 🚀`;

    const waUrl = `https://wa.me/91${customer.phone}?text=${encodeURIDekhoonent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* 🛑 UI Controls (print:hidden) - Yeh hissa PDF me print nahi hoga */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FileText className="text-red-600"/> Invoice Generator
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Create bills, download as PDF, or send via WhatsApp.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
           <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition shadow-lg">
             <Printer size={18}/> PDF Bill
           </button>
           <button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#128C7E] transition shadow-lg">
             <MessageCircle size={18}/> WhatsApp
           </button>
        </div>
      </div>

      {/* 📄 INVOICE PAPER (Yeh hissa PDF me print hoga) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
         
         {/* Bill Header */}
         <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div>
               <div className="flex items-center gap-2 text-red-600 mb-2">
                 <Monitor size={32} strokeWidth={2.5}/>
                 <h2 className="text-3xl font-black tracking-tighter text-slate-900">LappyDekho</h2>
               </div>
               <p className="text-slate-500 text-sm">Best Refurbished Tech Store</p>
               <p className="text-slate-500 text-sm">Patna, Bihar, India - 800001</p>
               <p className="text-slate-500 text-sm font-bold mt-1">Phone: +91 9123188988</p>
            </div>
            <div className="text-right">
               <h3 className="text-3xl font-black text-slate-200 uppercase tracking-widest mb-2">Invoice</h3>
               <div className="flex items-center justify-end gap-2 text-sm font-bold text-slate-800 mb-1">
                 <span className="text-slate-400">Bill No:</span>
                 <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="w-24 text-right outline-none bg-transparent focus:border-b border-red-200" />
               </div>
               <div className="flex items-center justify-end gap-2 text-sm font-bold text-slate-800">
                 <span className="text-slate-400">Date:</span>
                 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-32 text-right outline-none bg-transparent focus:border-b border-red-200" />
               </div>
            </div>
         </div>

         {/* Customer Details */}
         <div className="mb-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Billed To</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="text" placeholder="Customer Name" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} className="font-bold text-slate-900 text-lg outline-none bg-slate-50/50 p-2 rounded-lg border border-transparent focus:border-red-200 print:bg-transparent print:p-0 print:border-none" />
               <input type="text" placeholder="Phone Number" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className="font-medium text-slate-700 outline-none bg-slate-50/50 p-2 rounded-lg border border-transparent focus:border-red-200 print:bg-transparent print:p-0 print:border-none md:text-right" />
            </div>
            <textarea placeholder="Customer Full Address (Optional)" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} rows="2" className="w-full mt-2 font-medium text-sm text-slate-500 outline-none bg-slate-50/50 p-2 rounded-lg border border-transparent focus:border-red-200 resize-none print:bg-transparent print:p-0 print:border-none" />
         </div>

         {/* Items Table */}
         <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-widest print:bg-slate-200 print:text-slate-900 print:print-exact">
                     <th className="p-3 rounded-tl-lg w-1/2">Item Description</th>
                     <th className="p-3 w-20 text-center">Qty</th>
                     <th className="p-3 w-32 text-right">Price (₹)</th>
                     <th className="p-3 w-32 text-right rounded-tr-lg">Total</th>
                     <th className="p-3 w-10 print:hidden"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                     <tr key={item.id} className="group hover:bg-slate-50 transition print:hover:bg-transparent">
                        <td className="p-2">
                           <input type="text" placeholder="Laptop Model / Item Name" value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} className="w-full font-bold text-slate-800 outline-none bg-transparent p-2 focus:bg-white focus:ring-2 ring-red-100 rounded" />
                        </td>
                        <td className="p-2">
                           <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-full font-bold text-slate-800 text-center outline-none bg-transparent p-2 focus:bg-white focus:ring-2 ring-red-100 rounded" />
                        </td>
                        <td className="p-2">
                           <input type="number" placeholder="0" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} className="w-full font-bold text-slate-800 text-right outline-none bg-transparent p-2 focus:bg-white focus:ring-2 ring-red-100 rounded" />
                        </td>
                        <td className="p-2 text-right font-black text-slate-900 pr-4">
                           {(item.qty * item.price).toLocaleString()}
                        </td>
                        <td className="p-2 text-right print:hidden">
                           <button onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-red-500 transition p-1 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            
            {/* Add Item Button (Hidden on Print) */}
            <button onClick={handleAddItem} className="mt-3 text-xs font-bold text-red-600 flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition print:hidden">
               <Plus size={14}/> Add New Line
            </button>
         </div>

         {/* Totals Section */}
         <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Terms */}
            <div className="w-full md:w-1/2">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Terms & Conditions</h4>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">1. Goods once sold will not be taken back without valid technical reasons.<br/>2. Standard 1 Month checking warranty provided on all refurbished items.<br/>3. Physical damage or liquid damage is not covered under warranty.</p>
            </div>
            
            {/* Calculations */}
            <div className="w-full md:w-1/3 space-y-3 bg-slate-50 p-5 rounded-xl print:bg-transparent print:p-0">
               <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{subTotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-red-600">
                  <span>Discount (₹):</span>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-24 text-right outline-none bg-white p-1 rounded border border-red-200 print:border-none print:bg-transparent" />
               </div>
               <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t-2 border-slate-200 print:border-slate-900">
                  <span>Grand Total:</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
               </div>
            </div>
         </div>
         
         <div className="mt-12 text-center text-xs font-bold text-slate-300 uppercase tracking-widest hidden print:block">
            Dekhouter Generated Invoice - Signature Not Required
         </div>

      </div>
    </div>
  );
}