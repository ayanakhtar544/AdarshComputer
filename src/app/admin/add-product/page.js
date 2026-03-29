"use client";
import { useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  PackagePlus, UploadCloud, Loader2, X, Image as ImageIcon, 
  Save, CheckCircle2, AlertCircle, Tag, DollarSign, Cpu, HardDrive, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_CATEGORIES = [
  { id: 'laptops', label: 'Laptops' },
  { id: 'mobiles', label: 'Mobiles' },
  { id: 'cpu', label: 'CPU / Desktops' },
  { id: 'apple', label: 'Apple Devices' },
  { id: 'gaming', label: 'Gaming Gear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'premium', label: 'Premium / Flagship' },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); 

  // --- NAYA FIELD "brand" ADD KIYA HAI ---
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', originalPrice: '', processor: '', ram: '', storage: '', description: ''
  });

  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [images, setImages] = useState([]); 
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    toast.success("Image removed.");
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (images.length + files.length > 10) return toast.error("Maximum 10 images allowed.");

    setUploadStatus(`Starting upload for ${files.length} images...`);
    const toastId = toast.loading(`Uploading ${files.length} files...`);
    let successCount = 0;
    const newUploadedUrls = [];

    try {
      const uploadPromises = files.map(async (file, index) => {
        setUploadStatus(`Uploading image ${index + 1} of ${files.length}...`);
        const data = new FormData();
        data.append('file', file);

        const response = await fetch('/api/upload', { method: 'POST', body: data });
        if (!response.ok) throw new Error("Upload failed");

        const result = await response.json();
        successCount++;
        return result.url;
      });

      const results = await Promise.all(uploadPromises);
      results.forEach(url => { if(url) newUploadedUrls.push(url); });
      setImages(prev => [...prev, ...newUploadedUrls]);
      toast.success(`Uploaded ${successCount} images! 🎉`, { id: toastId });
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    } finally {
      setUploadStatus(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Upload at least one image.");
    if (selectedCategories.length === 0) return toast.error("Select at least one category.");
    if (!formData.name || !formData.price || !formData.brand) return toast.error("Name, Brand, and Price are mandatory.");

    setLoading(true);
    const toastId = toast.loading("Saving to database...");

    try {
      // FIRESTORE ME BRAND BHI SAVE HOGA
      const productData = {
        ...formData,
        brand: formData.brand.trim().toUpperCase(), // Brand ko hamesha uppercase me save karenge
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        category: selectedCategories, 
        images: images, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      await addDoc(collection(db, "products"), productData);
      toast.success("Product Published! 🚀", { id: toastId });
      
      setFormData({ name: '', brand: '', price: '', originalPrice: '', processor: '', ram: '', storage: '', description: '' });
      setImages([]);
      setSelectedCategories([]);
      window.scrollTo(0,0);
    } catch (error) {
      toast.error(`Save failed: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto pb-20">
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
          <div className="bg-red-100 p-3 rounded-2xl text-red-600 shadow-sm"><PackagePlus size={32} strokeWidth={2.5}/></div>
          Create New Product
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ESSENTIAL INFO */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-gray-100 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-4 mb-8 flex items-center gap-2">
             <AlertCircle size={20} className="text-red-600"/> Essential Details
           </h2>
           
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                       Product Title <span className="text-red-500">*</span>
                    </label>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Apple MacBook Air" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-red-500 font-bold text-lg text-slate-900 transition-all" />
                 </div>
                 
                 {/* NAYA: BRAND NAME INPUT */}
                 <div className="space-y-2 relative group/input">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                       Brand Name <span className="text-red-500">*</span>
                    </label>
                    <Award size={20} className="absolute right-4 top-[48px] text-slate-300 group-focus-within/input:text-red-600 transition-colors"/>
                    <input required name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Apple, HP, Dell" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-red-500 font-bold text-lg text-slate-900 transition-all uppercase placeholder:normal-case" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selling Price <span className="text-red-500">*</span></label>
                    <DollarSign size={20} className="absolute left-4 top-[48px] text-slate-400"/>
                    <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="55000" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-red-500 font-black text-2xl text-slate-900 transition-all" />
                 </div>
                 <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Original Price (MRP)</label>
                    <DollarSign size={20} className="absolute left-4 top-[48px] text-slate-400"/>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="85000" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-slate-400 font-bold text-xl text-slate-500 line-through transition-all" />
                 </div>
              </div>
           </div>
        </motion.div>

        {/* CATEGORY BUTTONS */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-gray-100 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-4 mb-8 flex items-center gap-2">
             <Tag size={20} className="text-blue-600"/> Categorization <span className="text-red-500 text-sm">*</span>
           </h2>
           <div className="flex flex-wrap gap-3">
              {AVAILABLE_CATEGORIES.map((cat) => (
                 <motion.button key={cat.id} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleCategory(cat.id)} className={`px-6 py-3 rounded-full font-bold text-sm border-2 transition-all flex items-center gap-2 ${selectedCategories.includes(cat.id) ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-red-400'}`}>
                    {selectedCategories.includes(cat.id) && <CheckCircle2 size={16} />} {cat.label}
                 </motion.button>
              ))}
           </div>
        </motion.div>

        {/* SPECS */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-gray-100 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-4 mb-8 flex items-center gap-2"><Cpu size={20} className="text-emerald-600"/> Specs & Description</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <input name="processor" value={formData.processor} onChange={handleChange} placeholder="Processor (e.g., M1 / i5)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 outline-none focus:border-emerald-500 font-bold text-sm text-slate-900" />
              <input name="ram" value={formData.ram} onChange={handleChange} placeholder="RAM (e.g., 8GB)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 outline-none focus:border-emerald-500 font-bold text-sm text-slate-900" />
              <input name="storage" value={formData.storage} onChange={handleChange} placeholder="Storage (e.g., 512GB SSD)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 outline-none focus:border-emerald-500 font-bold text-sm text-slate-900" />
           </div>
           <textarea name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Detailed product description..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-emerald-500 font-medium text-sm text-slate-900 resize-none" />
        </motion.div>

        {/* IMAGEKIT UPLOAD */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-gray-100 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-purple-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-4 mb-8 flex items-center gap-2"><ImageIcon size={20} className="text-purple-600"/> Gallery <span className="text-red-500 text-sm">*</span></h2>
           
           <AnimatePresence>
             {images.length > 0 && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                 {images.map((url, idx) => (
                   <motion.div key={url} className="relative aspect-square rounded-2xl border-2 border-gray-200 bg-slate-50 overflow-hidden group/img">
                      <img src={url} alt="img" className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform group-hover/img:scale-110" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition shadow-lg"><X size={14}/></button>
                   </motion.div>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>

           <div className={`relative border-3 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${uploadStatus ? 'border-purple-300 bg-purple-50/50 cursor-not-allowed' : 'border-slate-200 hover:border-purple-500 hover:bg-purple-50/30'}`}>
              <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" multiple onChange={handleMultipleImageUpload} disabled={loading || uploadStatus !== null} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" />
              {uploadStatus ? (
                <div className="flex flex-col items-center"><Loader2 size={40} className="text-purple-600 animate-spin" /><p className="font-black text-lg text-slate-800 mt-6">{uploadStatus}</p></div>
              ) : (
                <><UploadCloud size={48} className="text-purple-600 mb-6" /><h3 className="font-black text-2xl text-slate-800">Drag & Drop or <span className="text-purple-600 underline">Click</span></h3></>
              )}
           </div>
        </motion.div>

        {/* SUBMIT BUTTON */}
        <motion.div variants={itemVariants} className="pt-6 border-t-2 border-gray-100">
           <button type="submit" disabled={loading || uploadStatus !== null} className="w-full bg-slate-900 text-white font-black text-lg py-6 rounded-[2rem] hover:bg-red-600 transition disabled:opacity-70 shadow-xl flex justify-center items-center gap-3 uppercase tracking-widest">
              {loading ? <><Loader2 className="animate-spin" size={24}/> Publishing...</> : <><Save size={24}/> Publish Now</>}
           </button>
        </motion.div>

      </form>
    </motion.div>
  );
}