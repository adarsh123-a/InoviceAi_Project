import React, { useEffect, useState } from 'react';
import { ExternalLink, Calendar, Receipt, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InvoicesList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/invoices`);
        const json = await res.json();
        setInvoices(json);
      } catch (err) {
         console.error('Failed fetching invoices', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = (inv.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (inv.extracted_data?.invoice_number?.value || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesDate = !dateFilter || (inv.invoice_date && inv.invoice_date.startsWith(dateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Saved Invoices</h1>
          <p className="text-slate-500 mt-1">View and manage all your processed invoice documents.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search vendor or invoice #..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-1 sm:w-auto">
            <input 
              type="month"
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600 shadow-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <select 
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600 shadow-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
             <div className="p-12 text-center text-slate-500">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center">
              <Receipt size={48} className="mb-4 text-slate-300" />
              <p className="font-medium text-lg text-slate-600">No invoices found.</p>
              <p className="text-sm">Try extracting a new invoice or adjust your filter.</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 pl-6">Vendor Name</th>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="p-4 pl-6 font-medium text-slate-900 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {inv.vendor_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[150px]" title={inv.vendor_name}>{inv.vendor_name}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {(inv.extracted_data?.invoice_number?.value || inv.extracted_data?.invoice_number) || '-'}
                    </td>
                    <td className="p-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="shrink-0"/>
                        {inv.invoice_date || 'Unknown'}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                       <span className="font-semibold text-slate-900">
                         {inv.currency} {parseFloat(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold uppercase ${
                         inv.status === 'completed' ? 'text-emerald-700 bg-emerald-50' : 
                         inv.status === 'failed' ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                         ${inv.confidence_score > 0.8 ? 'bg-emerald-100 text-emerald-800' : inv.confidence_score > 0.5 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
                       `}>
                         {inv.confidence_score ? `${(inv.confidence_score * 100).toFixed(0)}% Match` : 'N/A'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
