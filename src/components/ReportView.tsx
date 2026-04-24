import React, { useRef } from 'react';
import { Task } from '../types';
import { Zap, X, Download, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

interface ReportViewProps {
  tasks: Task[];
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  'Done': 'bg-emerald-100 text-emerald-700',
  'Need Review': 'bg-fuchsia-100 text-fuchsia-700',
  'In Progress': 'bg-slate-100 text-slate-700 font-bold border border-slate-200',
  'Waiting': 'bg-red-50 text-red-600 font-bold border border-red-100',
  'New': 'bg-slate-50 text-slate-400 font-bold',
};

const priorityColors: Record<string, string> = {
  'High': 'text-red-600 font-bold',
  'Medium': 'text-amber-600 font-bold',
  'Low': 'text-emerald-600 font-bold',
};

export default function ReportView({ tasks, onClose }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadScreenshot = async () => {
    if (!reportRef.current) return;
    
    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#f8fafc', // slate-50
      });
      
      const link = document.createElement('a');
      link.download = `BugSync-Report-${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to capture report:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
    >
      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Control */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Camera size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900">Report Preview</h2>
                <p className="text-xs text-slate-400">Capture current issue status for sharing</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadScreenshot}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-red-200"
            >
              <Download size={16} />
              Save Report
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Report Content - This is what gets screenshotted */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div 
            ref={reportRef}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-[1000px] mx-auto min-w-[800px]"
          >
            {/* Report Title */}
            <div className="flex justify-between items-start mb-12 border-b-4 border-slate-950 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Zap className="text-red-600 fill-red-600 w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-black italic text-slate-900 leading-none tracking-tighter">EX<span className="text-red-600">I</span>T</h1>
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px] mt-2">Enterprise Performance Intelligence</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Generated Output</p>
                <p className="text-lg font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-6 mb-12">
               {[
                 { label: 'System Load', val: tasks.length, color: 'slate' },
                 { label: 'Completed', val: tasks.filter(t => t.status === 'Done').length, color: 'emerald' },
                 { label: 'Active Queue', val: tasks.filter(t => t.status === 'In Progress').length, color: 'red' },
                 { label: 'Need Action', val: tasks.filter(t => t.status === 'New' || t.status === 'Waiting' || t.status === 'Need Review').length, color: 'slate' }
               ].map((stat, i) => (
                 <div key={i} className="border-2 border-slate-50 rounded-2xl p-6 bg-slate-50/30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-3xl font-black text-${stat.color === 'red' ? 'red-600' : stat.color + '-600'}`}>{stat.val}</p>
                 </div>
               ))}
            </div>

            {/* List Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 px-6 py-4">
                   <div className="col-span-1 text-[10px] font-black text-slate-400 uppercase">ID</div>
                   <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase">Description / Issue</div>
                   <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Module</div>
                   <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Priority</div>
                   <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Status</div>
                </div>
                <div className="divide-y divide-slate-50">
                   {tasks.sort((a,b) => b.createdAt - a.createdAt).map((task, idx) => (
                      <div key={task.id} className="grid grid-cols-12 px-6 py-4 items-start bg-white">
                         <div className="col-span-1 text-[11px] font-mono font-bold text-slate-300">#{idx + 1}</div>
                         <div className="col-span-5 flex flex-col pr-4">
                            <p className="text-xs font-bold text-slate-800 mb-1 leading-snug">{task.title}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                         </div>
                         <div className="col-span-2 text-[11px] font-bold text-slate-500 uppercase">{task.category}</div>
                         <div className={`col-span-2 text-[11px] uppercase ${priorityColors[task.priority]}`}>{task.priority}</div>
                         <div className="col-span-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${statusColors[task.status]}`}>
                               {task.status}
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center border-t-2 border-slate-950 pt-8">
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">Confidential - EXIT System Management Node</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
