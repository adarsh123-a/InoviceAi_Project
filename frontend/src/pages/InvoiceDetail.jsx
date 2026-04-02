import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({});
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'raw'

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/invoices/${id}`);
        const data = await res.json();
        if (res.ok) {
          setInvoice(data);
          // Initialize form with values
          const ext = data.extracted_data || {};
          setFormData({
            vendor_name: typeof ext.vendor_name === 'object' ? ext.vendor_name?.value : (ext.vendor_name || data.vendor_name),
            total_amount: typeof ext.total_amount === 'object' ? ext.total_amount?.value : (ext.total_amount || data.total_amount),
            currency: typeof ext.currency === 'object' ? ext.currency?.value : (ext.currency || data.currency),
            invoice_date: typeof ext.invoice_date === 'object' ? ext.invoice_date?.value : (ext.invoice_date || data.invoice_date),
            invoice_number: typeof ext.invoice_number === 'object' ? ext.invoice_number?.value : (ext.invoice_number || ''),
          });
        } else {
          setError(data.error || 'Failed to fetch');
        }
      } catch (err) {
        setError('Failed to fetch invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);


    const updatedExtracted = { ...invoice.extracted_data };

    Object.keys(formData).forEach(key => {
      if (updatedExtracted[key] && typeof updatedExtracted[key] === 'object') {
        updatedExtracted[key].value = formData[key];
      } else {
        updatedExtracted[key] = formData[key];
      }
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted_data: updatedExtracted })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setInvoice(data);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading invoice details...</div>;
  if (error && !invoice) return <div className="p-8 text-center text-red-500">{error}</div>;

  const getConfidenceColor = (conf) => {
    if (conf === undefined || conf === null) return 'text-slate-400 bg-slate-100';
    if (typeof conf !== 'number') return 'text-slate-400 bg-slate-100';
    if (conf > 0.8) return 'text-emerald-700 bg-emerald-100';
    if (conf > 0.5) return 'text-amber-700 bg-amber-100';
    return 'text-red-700 bg-red-100';
  };

  const renderField = (label, fieldKey, type = 'text') => {
    const extConf = invoice.extracted_data?.[fieldKey]?.confidence;

    return (
      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
          {label}
          {extConf !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getConfidenceColor(extConf)}`}>
              {(extConf * 100).toFixed(0)}% AI Conf
            </span>
          )}
        </label>
        <input
          type={type}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
          value={formData[fieldKey] || ''}
          onChange={(e) => handleChange(fieldKey, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoice Details</h1>
            <p className="text-sm text-slate-500">ID: {invoice.id}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /> <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse">
          <CheckCircle2 size={20} /> <span className="text-sm font-medium">Changes saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">


        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Extracted Data</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Overall Confidence: {invoice.confidence_score ? `${(invoice.confidence_score * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>

          {renderField('Vendor Name', 'vendor_name')}
          {renderField('Invoice Number', 'invoice_number')}

          <div className="grid grid-cols-2 gap-4">
            {renderField('Total Amount', 'total_amount', 'number')}
            {renderField('Currency', 'currency')}
          </div>

          {renderField('Invoice Date', 'invoice_date', 'date')}

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Raw JSON Data</h3>
            <pre className="bg-slate-50 p-4 rounded-xl text-[11px] text-slate-600 overflow-x-auto border border-slate-100">
              {JSON.stringify(invoice.extracted_data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right Column: Original Document / Raw Text */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
          <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              <ImageIcon size={16} /> Document Preview
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'raw' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              <FileText size={16} /> Raw OCR Text
            </button>
          </div>

          <div className="flex-1 bg-slate-100 p-4 relative flex flex-col">
            {viewMode === 'preview' ? (
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 bg-white">
                {invoice.file_url ? (
                  <iframe
                    src={invoice.file_url}
                    className="w-full h-full border-0 min-h-[500px]"
                    title="Invoice Document"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">No document found</div>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-800 mb-4 sticky top-0 bg-white pb-2 border-b">OCR Output</h3>
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                  {invoice.extracted_data?.raw_text || 'No raw OCR text was extracted for this document.'}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
