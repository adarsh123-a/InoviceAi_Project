import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, X, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UploadInvoice() {
  const [uploads, setUploads] = useState([]); // { id, file, status: 'pending'|'uploading'|'processing'|'completed'|'failed', progress, result, error }
  const fileInputRef = useRef(null);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      e.target.value = null; // reset input
    }
  };

  const addFiles = (files) => {
    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
      progress: 0,
      result: null,
      error: null
    }));
    setUploads(prev => [...prev, ...newUploads]);
  };

  const removeUpload = (id) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const processUpload = async (uploadId) => {
    setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'uploading', progress: 10, error: null } : u));
    
    const targetUpload = uploads.find(u => u.id === uploadId);
    if (!targetUpload) return;

    try {
      const formData = new FormData();
      formData.append('file', targetUpload.file);

      // We simulate XMLHttpRequest progress since standard fetch doesn't support upload progress
      // For simplicity in this demo, we mock the progress steps before the fetch completes
      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress: 40 } : u));
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'processing', progress: 80 } : u));

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Duplicate Invoice Detected');
        }
        throw new Error(data.error || 'Upload failed');
      }

      setUploads(prev => prev.map(u => u.id === uploadId ? { 
        ...u, 
        status: 'completed', 
        progress: 100, 
        result: data.data 
      } : u));

    } catch (err) {
      console.error(err);
      setUploads(prev => prev.map(u => u.id === uploadId ? { 
        ...u, 
        status: 'failed', 
        error: err.message || 'An error occurred while processing.' 
      } : u));
    }
  };

  const processAllPending = () => {
    uploads.filter(u => u.status === 'pending' || u.status === 'failed').forEach(u => processUpload(u.id));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  };

  const pendingCount = uploads.filter(u => u.status === 'pending' || u.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Invoices</h1>
          <p className="text-slate-500 mt-1">Upload multiple JPG, PNG, or PDF files to extract structured data.</p>
          <div className="mt-4">
            <a 
              href="/sample_invoice.pdf" 
              download="sample_invoice.pdf"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <FileDown size={18} />
              Download Sample Invoice
            </a>
          </div>
        </div>
        {pendingCount > 0 && (
           <button 
             onClick={processAllPending}
             className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
           >
             Extract {pendingCount} Pending
           </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-indigo-200 rounded-xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
            <UploadCloud size={32} />
          </div>
          <div>
            <p className="text-lg font-medium text-slate-700">Click or drag files to this area to upload</p>
            <p className="text-sm text-slate-500 mt-1">Support for multiple image or PDF uploads simultaneously.</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept=".jpg,.jpeg,.png,.pdf" 
            multiple
            onChange={handleFileChange} 
          />
        </div>

        {/* Uploads List */}
        {uploads.length > 0 && (
          <div className="mt-8 space-y-4">
             <div className="flex justify-between items-center border-b border-slate-100 pb-4">
               <h3 className="text-lg font-bold text-slate-800">Upload Queue ({uploads.length})</h3>
               <button onClick={clearCompleted} className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                 Clear Completed
               </button>
             </div>
             
             <div className="space-y-3">
               {uploads.map((u) => (
                  <div key={u.id} className="p-4 border border-slate-200 rounded-xl flex flex-col gap-3 bg-slate-50">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${u.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : u.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-white border border-slate-200 text-slate-500'}`}>
                             {u.status === 'completed' ? <CheckCircle2 size={20} /> : u.status === 'failed' ? <AlertCircle size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{u.file.name}</span>
                            <span className="text-xs text-slate-500">{(u.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           {u.status === 'pending' && (
                             <>
                               <button onClick={() => processUpload(u.id)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Extract</button>
                               <button onClick={() => removeUpload(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><X size={16} /></button>
                             </>
                           )}
                           {(u.status === 'uploading' || u.status === 'processing') && (
                             <div className="flex items-center gap-2 text-indigo-600">
                               <Loader2 size={16} className="animate-spin" />
                               <span className="text-xs font-medium capitalize">{u.status}...</span>
                             </div>
                           )}
                           {u.status === 'failed' && (
                              <button onClick={() => processUpload(u.id)} className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Retry</button>
                           )}
                           {u.status === 'completed' && u.result && (
                              <Link to={`/invoices/${u.result.id}`} className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-lg hover:bg-emerald-200 transition-colors">
                                View Details
                              </Link>
                           )}
                        </div>
                     </div>

                     {/* Progress Bar */}
                     {(u.status === 'uploading' || u.status === 'processing') && (
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${u.progress}%` }}></div>
                        </div>
                     )}

                     {/* Error Message */}
                     {u.status === 'failed' && (
                        <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                          {u.error}
                          {u.error === 'Duplicate Invoice Detected' && (
                            <span className="ml-2 text-xs text-red-500 block mt-1">This file has already been processed and exists in your database.</span>
                          )}
                        </p>
                     )}

                     {/* Success Quick View */}
                     {u.status === 'completed' && u.result && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 p-3 bg-white border border-slate-100 rounded-lg">
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Vendor</span>
                             <span className="text-sm font-semibold truncate">{u.result.vendor_name}</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Amount</span>
                             <span className="text-sm font-bold text-indigo-600">{u.result.currency} {u.result.total_amount}</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Date</span>
                             <span className="text-sm font-semibold text-slate-700">{u.result.invoice_date || '-'}</span>
                           </div>
                           {u.result.extracted_data?.format_used && (
                             <div className="flex items-center">
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                                  Format Learned ⚡
                                </span>
                             </div>
                           )}
                        </div>
                     )}
                  </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
