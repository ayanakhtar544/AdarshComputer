"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Package, Search, Edit3, Trash2, Loader2, X, Save, Image as ImageIcon, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- NAYA: Bulk Delete State ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // 1. Fetch Products
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Single Delete
  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(p => p.id !== id));
        // Agar select kiya hua tha aur delete ho gaya, toh selection se hata do
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        toast.success("Product deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete product.");
      }
    }
  };

  // --- NAYA: 3. Bulk Delete Logic ---
  const handleBulkDelete = async () => {
    if (confirm(`Are you absolutely sure you want to delete ${selectedIds.length} products? This cannot be undone!`)) {
      setIsDeletingBulk(true);
      try {
        // Promise.all use kar rahe hain taaki saare Firebase delete ek sath (parallel) ho jayein
        const deletePromises = selectedIds.map(id => deleteDoc(doc(db, "products", id)));
        await Promise.all(deletePromises);
        
        // UI se delete hue products hata do
        setProducts(products.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]); // Selection khali kar do
        
        toast.success(`Successfully deleted ${selectedIds.length} products! 🚀`);
      } catch (error) {
        console.error("Bulk Delete Error:", error);
        toast.error("Failed to delete some products.");
      } finally {
        setIsDeletingBulk(false);
      }
    }
  };

  // 4. Save Edited Product
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const productRef = doc(db, "products", editingProduct.id);
      const formattedCategory = typeof editingProduct.category === 'string' 
        ? editingProduct.category.split(',').map(c => c.trim()) 
        : editingProduct.category;

      const updatedData = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        originalPrice: Number(editingProduct.originalPrice),
        category: formattedCategory,
      };

      await updateDoc(productRef, updatedData);
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updatedData } : p));
      toast.success("Product updated successfully!");
      setEditingProduct(null);
    } catch (error) {
      toast.error("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  // Filter Search
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(p.category) ? p.category.join(' ') : p.category)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- NAYA: Selection Handlers ---
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      // Jo search me dikh rahe hain, sirf unhe select karo
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40}/>
      <p className="font-bold text-slate-400 uppercase tracking-widest">Loading Inventory...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8 relative">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Package className="text-red-600"/> All Products
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage inventory, update prices, and edit details live.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
           <input 
             type="text" 
             placeholder="Search products..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-50 border border-slate-200 text-sm py-2.5 pl-9 pr-4 rounded-xl outline-none focus:border-red-600 transition-colors"
           />
        </div>
      </div>

      {/* NAYA: Bulk Action Bar (Sirf tab dikhega jab kuch select ho) */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 flex items-center justify-between animate-slide-up">
           <div className="flex items-center gap-3 text-red-700 font-bold text-sm">
              <CheckSquare size={18} />
              <span>{selectedIds.length} Products Selected</span>
           </div>
           <button 
             onClick={handleBulkDelete}
             disabled={isDeletingBulk}
             className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
           >
              {isDeletingBulk ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />}
              Delete Selected
           </button>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-gray-100">
              {/* Master Checkbox */}
              <th className="p-4 w-12 text-center">
                 <input 
                   type="checkbox" 
                   onChange={toggleSelectAll}
                   checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                   className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                 />
              </th>
              <th className="p-4 w-16">Image</th>
              <th className="p-4">Product Details</th>
              <th className="p-4">Pricing</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
               <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">No products found.</td>
               </tr>
            ) : filteredProducts.map(product => {
              const isSelected = selectedIds.includes(product.id);
              return (
              <tr key={product.id} className={`hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-red-50/30' : ''}`}>
                
                {/* Checkbox */}
                <td className="p-4 text-center">
                   <input 
                     type="checkbox" 
                     checked={isSelected}
                     onChange={() => toggleSelection(product.id)}
                     className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                   />
                </td>

                {/* Image */}
                <td className="p-4">
                   <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm">
                      {product.images && product.images[0] ? (
                         <img src={product.images[0]} alt="img" className="max-w-full max-h-full object-contain" />
                      ) : (
                         <ImageIcon size={20} className="text-slate-300"/>
                      )}
                   </div>
                </td>

                {/* Details */}
                <td className="p-4">
                   <p className="text-sm font-bold text-slate-900 line-clamp-2">{product.name}</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {Array.isArray(product.category) ? product.category.join(', ') : product.category || 'N/A'}
                   </p>
                </td>

                {/* Pricing */}
                <td className="p-4">
                   <p className="text-sm font-black text-slate-900">₹{Number(product.price).toLocaleString()}</p>
                   {product.originalPrice && (
                     <p className="text-xs text-slate-400 line-through font-medium mt-0.5">₹{Number(product.originalPrice).toLocaleString()}</p>
                   )}
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                   <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingProduct({
                           ...product, 
                           category: Array.isArray(product.category) ? product.category.join(', ') : product.category
                        })}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm"
                        title="Edit Product"
                      >
                         <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition shadow-sm"
                        title="Delete Product"
                      >
                         <Trash2 size={16}/>
                      </button>
                   </div>
                </td>

              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* LIVE EDIT MODAL (Popup) */}
      {/* ========================================================= */}
      {editingProduct && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-slide-up">
               <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                  <h2 className="font-black text-lg flex items-center gap-2"><Edit3 size={18} className="text-red-500"/> Edit Product</h2>
                  <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Product Name</label>
                     <input 
                       required
                       type="text" 
                       value={editingProduct.name}
                       onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 font-medium text-sm text-slate-900" 
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sale Price (₹)</label>
                        <input 
                          required
                          type="number" 
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 font-black text-sm text-slate-900" 
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Original Price (₹)</label>
                        <input 
                          type="number" 
                          value={editingProduct.originalPrice || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 font-medium text-sm text-slate-900" 
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categories (Comma separated)</label>
                     <input 
                       type="text" 
                       value={editingProduct.category}
                       onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                       placeholder="laptops, apple, premium"
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-red-600 font-medium text-sm text-slate-900" 
                     />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-3">
                     <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm">Cancel</button>
                     <button type="submit" disabled={saving} className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition shadow-lg shadow-red-600/30 flex justify-center items-center gap-2 text-sm">
                        {saving ? <Loader2 size={18} className="animate-spin"/> : <><Save size={18}/> Save Changes</>}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}