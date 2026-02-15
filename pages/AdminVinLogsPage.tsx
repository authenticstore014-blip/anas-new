
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Database, Clock, CheckCircle, AlertCircle, Trash2, 
  Search, Shield, ArrowLeft, RefreshCcw, Activity
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const AdminVinLogsPage: React.FC = () => {
  const { user, vehicleLogs, refreshData } = useAuth();

  const stats = useMemo(() => {
    const logs = vehicleLogs || [];
    return {
      total: logs.length,
      cacheHits: logs.filter(l => l.source === 'Cache').length,
      apiHits: logs.filter(l => l.source === 'API' || l.source === 'Intelligence').length,
      failures: logs.filter(l => !l.success).length
    };
  }, [vehicleLogs]);

  if (!user || user.role !== 'admin') return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-[#faf8fa] pb-20">
      <div className="bg-[#2d1f2d] pt-12 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <Link to="/customers" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-black uppercase tracking-widest">
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold font-outfit tracking-tighter flex items-center gap-4">
                <Shield className="text-[#e91e8c]" /> Vehicle Lookup Intelligence
              </h1>
            </div>
            <button onClick={refreshData} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <RefreshCcw size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Lookups', value: stats.total, icon: <Activity className="text-blue-400" /> },
              { label: 'Cache Hits', value: stats.cacheHits, icon: <Database className="text-green-400" /> },
              { label: 'API Requests', value: stats.apiHits, icon: <RefreshCcw className="text-purple-400" /> },
              { label: 'System Errors', value: stats.failures, icon: <AlertCircle className="text-red-400" /> }
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{s.label}</p>
                  {s.icon}
                </div>
                <p className="text-3xl font-black font-outfit">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12">
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold font-outfit">Audit Log Feed</h2>
            <button className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-2">
              <Trash2 size={14} /> Purge Cache Registry
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5">Specification</th>
                  <th className="px-8 py-5">Source</th>
                  <th className="px-8 py-5">Outcome</th>
                  <th className="px-8 py-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 font-mono text-xs font-bold text-[#2d1f2d] uppercase tracking-tighter">
                      {log.registration}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[#2d1f2d]">{log.make} {log.model}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{log.year}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        log.source === 'Cache' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {log.source}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {log.success ? (
                        <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle size={12} /> Success
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                          <AlertCircle size={12} /> Failed
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-400 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVinLogsPage;
