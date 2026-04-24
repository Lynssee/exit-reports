import React, { useMemo, useState } from 'react';
import { Category, Task, Priority, Status } from '../types';
import TaskCard from './TaskCard';
import { Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  currentUserId?: string;
  currentUserEmail?: string;
}

const CATEGORIES: Category[] = [
  'Produksi',
  'RMC',
  'Finance',
  'Inventory',
  'Project',
  'Procurement',
  'Marketing/Sales',
  'Other'
];

const STATUSES: Status[] = ['New', 'Waiting', 'In Progress', 'Need Review', 'Done'];

export default function TaskBoard({ tasks, onUpdateTask, onDeleteTask, currentUserId, currentUserEmail }: TaskBoardProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(['Low', 'Medium', 'High']);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>(['New', 'Waiting', 'In Progress', 'Need Review', 'Done']);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      selectedPriorities.includes(t.priority) && 
      selectedStatuses.includes(t.status)
    );
  }, [tasks, selectedPriorities, selectedStatuses]);

  const groupedTasks = useMemo(() => {
    const acc = CATEGORIES.reduce((acc, category) => {
      acc[category] = filteredTasks.filter(t => t.category === category);
      return acc;
    }, {} as Record<Category, Task[]>);
    return acc;
  }, [filteredTasks]);

  const togglePriority = (p: Priority) => {
    setSelectedPriorities(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const toggleStatus = (s: Status) => {
    setSelectedStatuses(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-8 pb-8 relative">
      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 sticky top-0 z-50 mb-4 sm:mb-6">
        {/* Priority Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-r border-slate-200 pr-4 shrink-0">
            <Filter size={14} />
            Priority
          </div>
          <div className="flex flex-wrap gap-4">
            {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
              <label 
                key={p} 
                className="flex items-center gap-2 cursor-pointer group select-none relative"
              >
                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    checked={selectedPriorities.includes(p)}
                    onChange={() => togglePriority(p)}
                    className="peer absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full pointer-events-auto"
                  />
                  <div className="w-full h-full rounded border border-slate-300 peer-checked:bg-red-600 peer-checked:border-red-600 transition-all" />
                  <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${selectedPriorities.includes(p) ? 'text-slate-900' : 'text-slate-400'}`}>
                  {p}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div className="flex items-center gap-4 lg:border-l lg:border-slate-100 lg:pl-8">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-r border-slate-200 pr-4 shrink-0">
            <Filter size={14} />
            Status
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {STATUSES.map(s => (
              <label 
                key={s} 
                className="flex items-center gap-2 cursor-pointer group select-none relative"
              >
                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    checked={selectedStatuses.includes(s)}
                    onChange={() => toggleStatus(s)}
                    className="peer absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full pointer-events-auto"
                  />
                  <div className="w-full h-full rounded border border-slate-300 peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-all" />
                  <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tight transition-colors ${selectedStatuses.includes(s) ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:ml-auto flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button 
            onClick={() => {
              setSelectedPriorities(['Low', 'Medium', 'High']);
              setSelectedStatuses(['New', 'Waiting', 'In Progress', 'Need Review', 'Done']);
            }}
            className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-tight"
          >
            Reset All
          </button>
          <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
            {filteredTasks.length} RESULTS
          </div>
        </div>
      </div>

      {CATEGORIES.map(category => {
        const categoryTasks = groupedTasks[category];
        if (categoryTasks.length === 0) return null;

        return (
          <section key={category} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-slate-800 text-base flex justify-between items-center w-full sm:w-auto">
                Issue Registry: {category}
                <span className="sm:hidden text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                  {categoryTasks.length}
                </span>
              </h2>
              <div className="flex gap-2">
                <span className="text-[9px] sm:text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded uppercase">FILTER: ACTIVE</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded hidden sm:inline-block">
                  {categoryTasks.length} NODES
                </span>
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
              <div className="col-span-2">ID</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-2 relative">
                <button 
                  onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                  className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  Priority
                  <Filter size={10} className={selectedPriorities.length < 3 ? 'text-red-600' : ''} />
                </button>
                
                <AnimatePresence>
                  {isPriorityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsPriorityDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-30 min-w-[140px]"
                      >
                        <div className="flex flex-col gap-2">
                          {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                            <label key={p} className="flex items-center gap-2 cursor-pointer group whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                checked={selectedPriorities.includes(p)}
                                onChange={() => togglePriority(p)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer"
                              />
                              <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedPriorities.includes(p) ? 'text-slate-900' : 'text-slate-400'}`}>
                                {p}
                              </span>
                            </label>
                          ))}
                          <div className="h-px bg-slate-100 my-1" />
                          <button 
                            onClick={() => { setSelectedPriorities(['Low', 'Medium', 'High']); setIsPriorityDropdownOpen(false); }}
                            className="text-[10px] text-red-600 hover:underline font-bold text-left"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="col-span-2 text-center relative">
                <button 
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center justify-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer uppercase tracking-wider font-bold w-full"
                >
                  Status
                  <Filter size={10} className={selectedStatuses.length < 5 ? 'text-red-600' : ''} />
                </button>

                <AnimatePresence>
                  {isStatusDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsStatusDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-30 min-w-[160px]"
                      >
                        <div className="flex flex-col gap-2">
                          {STATUSES.map(s => (
                            <label key={s} className="flex items-center gap-2 cursor-pointer group whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                checked={selectedStatuses.includes(s)}
                                onChange={() => toggleStatus(s)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer"
                              />
                              <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedStatuses.includes(s) ? 'text-slate-900' : 'text-slate-400'}`}>
                                {s}
                              </span>
                            </label>
                          ))}
                          <div className="h-px bg-slate-100 my-1" />
                          <button 
                            onClick={() => { setSelectedStatuses(['New', 'Waiting', 'In Progress', 'Need Review', 'Done']); setIsStatusDropdownOpen(false); }}
                            className="text-[10px] text-red-600 hover:underline font-bold text-left"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="col-span-1 text-right pr-2">Last Active</div>
            </div>

            <div className="flex flex-col flex-1 divide-y divide-slate-100">
              {categoryTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  currentUserId={currentUserId}
                  currentUserEmail={currentUserEmail}
                />
              ))}
            </div>

            <div className="h-12 border-t border-slate-100 bg-white flex items-center justify-between px-6 shrink-0 mt-auto">
              <p className="text-[11px] text-slate-400">Showing {categoryTasks.length} results</p>
              <div className="flex gap-1">
                <button className="w-8 h-6 bg-slate-100 rounded text-slate-600 text-xs flex items-center justify-center font-bold">1</button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
