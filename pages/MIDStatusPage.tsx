
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Database, RefreshCw, AlertCircle, CheckCircle2, Search, 
  ArrowLeft, Terminal, Shield, Activity, Filter, Eye,
  AlertTriangle, Clock, ExternalLink, Download, FileText
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { MIDSubmission } from '../types';

// Debounce hook for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const MIDStatusPage: React.FC = () => {
  const { user, midSubmissions, retryMIDSubmission, isLoading, refreshData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filter, setFilter] = useState<'All' | 'Success' | 'Failed' | 'Pending'>('All');

  const filteredSubmissions = useMemo(() => {
    let data = midSubmissions;
    if (filter !== 'All') {
      data = data.filter((s: MIDSubmission) => s.status === filter);
    }
    if (debouncedSearchQuery) {
      const lower = debouncedSearchQuery.toLowerCase();
      data = data.filter((s: MIDSubmission) => 
        s.vrm.toLowerCase().includes(lower) || 
        s.policyId.toLowerCase().includes(lower)
      );
    }
    return data;
  }, [midSubmissions, filter, debouncedSearchQuery]);

  if (isLoading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/auth" />;

  const stats = useMemo(() => ({
    total: midSubmissions.length,
    success: midSubmissions.filter(s => s.status === 'Success').length,
    failed: midSubmissions.filter(s => s.status === 'Failed').length,
    pending: midSubmissions.filter(s => s.status === 'Pending' || s.status === 'Retrying').length
  }), [midSubmissions]);

  return (
    <div className="min-h-screen bg-[#faf8fa] pb-20 font-inter">
      {/* Top Header */}
      <div className="bg-[#2d1f2d] pt-12 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <Link to="/customers" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                <ArrowLeft size={14} /> Back to Hub
              </Link>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#e91e8c] rounded-2xl flex items-center justify-center shadow-2xl">
                   <Database size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold font-outfit tracking-tighter">MID Operations Centre</h1>
                  <p className="text-white/40 text-sm font-medium">National Motor Insurance Database Live Integration Feed</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={refreshData} className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  <RefreshCw size={14} className={stats.pending > 0 ? 'animate-spin' : ''} /> Sync Feed
               </button>
               <div className="px-6 py-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Activity size={14} className="animate-pulse" /> Gateway Active
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Stats Bar */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Registry Load', val: stats.total, color: 'text-[#2d1f2d]' },
              { label: 'Transmission Success', val: stats.success, color: 'text-green-600' },
              { label: 'Upload Failures', val: stats.failed, color: 'text-red-600' },
              { label: 'Active Queue', val: stats.pending, color: 'text-blue-600' }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-pink-900/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-3xl font-black font-outfit ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Main Registry */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-2xl overflow-hidden min-h-[600px]">
              
              <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                   {(['All', 'Success', 'Failed', 'Pending'] as const).map(f => (
                     <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#2d1f2d] text-white' : 'text-gray-400 hover:text-[#2d1f2d]'}`}>
                       {f}
                     </button>
                   ))}
                </div>
                <div className="relative w-full md:w-80">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                   <input 
                     className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-6 py-3.5 text-xs font-bold focus:border-[#e91e8c] outline-none shadow-sm" 
                     placeholder="Search Registry..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                   />
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {filteredSubmissions.length === 0 ? (
                  <div className="py-40 text-center">
                    <Terminal size={48} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No records found matching criteria</p>
                  </div>
                ) : (
                  filteredSubmissions.map(m => (
                    <div key={m.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-8 w-full md:w-auto">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          m.status === 'Success' ? 'bg-green-50 text-green-600' : 
                          m.status === 'Failed' ? 'bg-red-50 text-red-600' : 
                          'bg-blue-50 text-blue-600 animate-pulse'
                        }`}>
                          <Database size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">TRANSACTION: {m.id}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-2xl font-black font-outfit text-[#2d1f2d] uppercase tracking-tighter">{m.vrm}</p>
                            <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">POL: {m.policyId}</p>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                             <span className={m.status === 'Success' ? 'text-green-600' : 'text-red-500'}>{m.status}</span>
                             <span className="text-gray-300">•</span>
                             <span className="text-gray-400">Attempts: {m.retryCount}</span>
                             <span className="text-gray-300">•</span>
                             <span className="text-gray-300 font-mono">{new Date(m.submittedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className="hidden xl:block text-right pr-6 border-r border-gray-100">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Last Update</p>
                            <p className="text-xs font-bold text-gray-500">{m.lastAttemptAt ? new Date(m.lastAttemptAt).toLocaleString() : 'Pending'}</p>
                         </div>
                         <div className="flex gap-2">
                           <button className="p-4 bg-gray-50 text-gray-400 rounded-xl hover:text-[#e91e8c] transition-all"><FileText size={18}/></button>
                           {m.status === 'Failed' && (
                             <button 
                               onClick={async (e) => {
                                 const btn = e.currentTarget;
                                 btn.disabled = true;
                                 await retryMIDSubmission(m.id);
                                 btn.disabled = false;
                               }}
                               className="px-6 py-4 bg-[#2d1f2d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                             >
                               <RefreshCw size={14} /> Force MIB Sync
                             </button>
                           )}
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} className="text-green-500" /> All transmissions encrypted via MIB Protocol v3.4
                 </p>
                 <a href="https://www.askmid.com" target="_blank" className="flex items-center gap-2 text-[10px] font-black text-[#e91e8c] uppercase tracking-widest hover:underline">
                    Public askMID Registry <ExternalLink size={12} />
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIDStatusPage;
