"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState([]);

  // --- 1. CUSTOM SMART CSV PARSER (Failsafe) ---

// --- 1. CUSTOM SMART CSV PARSER (Failsafe & Fixed) ---
  const parseCSV = (text) => {
    // Sabse pehle hidden \r (Windows line breaks) ko delete karo
    const cleanText = text.replace(/\r/g, ''); 
    const lines = cleanText.split('\n').filter(line => line.trim() !== ''); // Khali lines hatao
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      let row = [];
      let cur = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      row.push(cur.trim());

      const obj = {};
      headers.forEach((header, index) => {
        let val = row[index] || "";
        // Agar value ke aage-peeche double quotes "" lag gaye hain, toh unhe hatao
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        obj[header] = val.trim();
      });
      result.push(obj);
    }
    return result;
  };

  // --- 2. FILE SELECTION ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setLogs([{ type: 'info', msg: `File selected: ${selectedFile.name}` }]);
    } else {
      toast.error("Please select a valid CSV file.");
      setFile(null);
    }
  };

  // --- 3. UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (!file) return toast.error("Select a CSV file first!");

    setLoading(true);
    setLogs([{ type: 'info', msg: 'Reading CSV file...' }]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const products = parseCSV(text);
        
        setProgress({ current: 0, total: products.length });
        setLogs(prev => [...prev, { type: 'success', msg: `Found ${products.length} products. Starting upload...` }]);

        let successCount = 0;

        // Upload One-by-One to avoid Firebase overload
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          
          try {
            // Data formatting
            const formattedProduct = {
              name: p.name || "Unknown Product",
              category: p.category ? p.category.split(',').map(c => c.trim()) : [], // String to Array
              price: Number(p.price) || 0,
              originalPrice: Number(p.originalPrice) || null,
              processor: p.processor || "",
              ram: p.ram || "",
              storage: p.storage || "",
              description: p.description || "",
              images: p.images ? p.images.split(',').map(img => img.trim()) : [], // String to Array
              createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "products"), formattedProduct);
            successCount++;
            setProgress({ current: i + 1, total: products.length });
          } catch (err) {
            setLogs(prev => [...prev, { type: 'error', msg: `Failed to upload: ${p.name}` }]);
          }
        }

        toast.success(`Upload Complete! ${successCount} products added.`);
        setLogs(prev => [...prev, { type: 'success', msg: `Successfully uploaded ${successCount} out of ${products.length} products.` }]);
        setFile(null);

      } catch (error) {
         console.error(error);
         toast.error("Error parsing CSV data.");
         setLogs(prev => [...prev, { type: 'error', msg: 'Critical Error: Could not read CSV formatting properly.' }]);
      } finally {
         setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
      
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <UploadCloud className="text-red-600"/> Bulk Upload Products
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm">Upload multiple products at once using a CSV file. Make sure your headers match exactly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT: UPLOAD SECTION */}
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
            {file ? (
              <>
                <FileText size={48} className="text-red-600 mb-4"/>
                <p className="font-bold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">Ready to upload</p>
              </>
            ) : (
              <>
                <UploadCloud size={48} className="text-slate-300 mb-4"/>
                <p className="font-bold text-slate-800">Click or Drag CSV file here</p>
                <p className="text-xs text-slate-400 mt-1">Must be a valid .csv template</p>
              </>
            )}
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:hover:bg-slate-900 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin"/> : 'Start Bulk Upload'}
          </button>

          {/* Progress Bar */}
          {loading && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                 <span>Uploading to Database...</span>
                 <span>{progress.current} / {progress.total}</span>
               </div>
               <div className="w-full bg-slate-200 rounded-full h-2">
                 <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
               </div>
            </div>
          )}
        </div>

        {/* RIGHT: LOGS SECTION */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs overflow-y-auto max-h-[400px] shadow-inner">
           <div className="flex items-center gap-2 text-slate-400 mb-4 border-b border-slate-700 pb-2">
              <AlertCircle size={14}/> <span>System Logs</span>
           </div>
           
           {logs.length === 0 ? (
             <p className="text-slate-600 italic">Waiting for upload action...</p>
           ) : (
             <div className="space-y-2">
               {logs.map((log, idx) => (
                 <div key={idx} className="flex gap-2">
                   <ArrowRight size={14} className={log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-blue-400'}/>
                   <span className={log.type === 'error' ? 'text-red-400' : 'text-slate-300'}>{log.msg}</span>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}