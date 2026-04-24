/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useMemo, useEffect } from 'react';
import { Task } from './types';
import TaskBoard from './components/TaskBoard';
import NewTaskForm from './components/NewTaskForm';
import ReportView from './components/ReportView';
import { Zap, Download, LogIn, LogOut, Loader2, Database, Menu, FileText } from 'lucide-react';
import { auth, db, loginWithGoogle, logout, handleFirestoreError } from './lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { predefinedTasks } from './seedTasks';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    
    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      // Sort tasks descending by createdAt
      fetchedTasks.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(fetchedTasks);
    }, (error) => {
      console.error("Error fetching tasks snapshot", error);
      try {
        handleFirestoreError(error, 'list', '/tasks');
      } catch (err) {
        console.error("Firestore security error", err);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTask = async (newTask: Task) => {
    if (!user) return;
    try {
      const taskWithUser = { ...newTask, ownerId: user.uid };
      const cleanedTask = JSON.parse(JSON.stringify(taskWithUser));
      await setDoc(doc(db, 'tasks', cleanedTask.id), cleanedTask);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      handleFirestoreError(error, 'create', `/tasks/${newTask.id}`);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!user) return;
    try {
      const cleanedTask = JSON.parse(JSON.stringify(updatedTask));
      await updateDoc(doc(db, 'tasks', cleanedTask.id), cleanedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      handleFirestoreError(error, 'update', `/tasks/${updatedTask.id}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      handleFirestoreError(error, 'delete', `/tasks/${taskId}`);
    }
  };

  const importPredefinedTasks = async () => {
    if (!user) return;
    setIsImporting(true);
    try {
      for (const t of predefinedTasks) {
        const id = `task-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newTask: Task = {
           id,
           title: t.title,
           description: t.description,
           category: t.category,
           status: t.status,
           priority: t.priority,
           createdAt: Date.now(),
           ownerId: user.uid,
           comments: [],
           viewedBy: [user.uid]
        };
        await setDoc(doc(db, 'tasks', id), newTask);
        // Small delay to ensure createdAt timestamp order is slightly different
        await new Promise(res => setTimeout(res, 50));
      }
    } catch (error) {
      console.error('Error importing tasks:', error);
      alert('Failed to import tasks. Make sure you are logged in.');
    } finally {
      setIsImporting(false);
    }
  };

  const totalIssues = tasks.length;
  const resolvedIssues = tasks.filter(t => t.status === 'Done').length;
  const inProgressIssues = tasks.filter(t => t.status === 'In Progress').length;
  const waitingIssues = tasks.filter(t => t.status === 'Waiting').length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <div className="w-screen h-screen bg-slate-50 font-sans flex flex-col overflow-hidden text-slate-800">
      <nav className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-950 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 fill-red-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-slate-900 leading-none">
                EX<span className="text-red-600">I</span>T
              </h1>
              <p className="hidden sm:block text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                Management System
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={importPredefinedTasks}
                disabled={isImporting}
                className="hidden lg:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                Import List
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-black rounded-lg shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                New Entry
              </button>
            </div>
          )}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-700">EXIT Live Proxy</span>
          </div>
          {isAuthLoading ? (
             <div className="flex items-center justify-center w-8 h-8">
                <Loader2 className="animate-spin text-slate-400" size={18} />
             </div>
          ) : user ? (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                 {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : null}
              </div>
              <button 
                onClick={logout}
                className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[11px] sm:text-xs font-semibold"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="px-4 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2"
            >
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Nav */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, x: -256, opacity: 0 }}
              animate={{ width: 256, x: 0, opacity: 1 }}
              exit={{ width: 0, x: -256, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="bg-white border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto shrink-0 z-40 fixed md:relative h-full shadow-xl md:shadow-none"
            >
              <section>
                <div className="flex items-center justify-between md:hidden mb-4 border-b border-slate-100 pb-2">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
                   <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-400">
                      <Menu size={18} />
                   </button>
                </div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  Project Modules
                </h3>
                <div className="space-y-1">
                  <button className="w-full text-left px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm flex justify-between items-center group shadow-md shadow-red-100">
                    Produksi 
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] text-white underline underline-offset-2">{categoryCounts['Produksi'] || 0}</span>
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm transition-colors flex justify-between group">
                    Finance
                    {(categoryCounts['Finance'] || 0) > 0 && <span className="bg-slate-100 group-hover:bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px]">{categoryCounts['Finance']}</span>}
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm transition-colors flex justify-between group">
                    Inventory
                    {(categoryCounts['Inventory'] || 0) > 0 && <span className="bg-slate-100 group-hover:bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px]">{categoryCounts['Inventory']}</span>}
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm transition-colors flex justify-between group">
                    Procurement
                    {(categoryCounts['Procurement'] || 0) > 0 && <span className="bg-slate-100 group-hover:bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px]">{categoryCounts['Procurement']}</span>}
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded-lg text-amber-600 bg-amber-50/50 hover:bg-amber-50 font-semibold text-sm transition-colors flex justify-between items-center">
                    Marketing 
                    <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px]">{categoryCounts['Marketing/Sales'] || 0}</span>
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium text-sm transition-colors flex justify-between group">
                    Project
                    {(categoryCounts['Project'] || 0) > 0 && <span className="bg-slate-100 group-hover:bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px]">{categoryCounts['Project']}</span>}
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  Management Tools
                </h3>
                <div className="space-y-1">
                  <button 
                    onClick={() => setIsReportOpen(true)}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-slate-900 bg-white border border-slate-200 hover:border-red-600 font-bold text-sm flex items-center gap-2 group transition-all"
                  >
                    <FileText size={18} className="text-red-600" />
                    Report Preview
                  </button>
                </div>
              </section>
    
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-8 flex flex-col gap-4 sm:gap-6 overflow-y-auto">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 shrink-0">
            <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Total Issues</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{totalIssues}</p>
            </div>
            <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Resolved</p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-600">{resolvedIssues}</p>
            </div>
            <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">In Progress</p>
              <p className="text-lg sm:text-2xl font-bold text-indigo-600">{inProgressIssues}</p>
            </div>
            <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Waiting</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-600">{waitingIssues}</p>
            </div>
          </div>

          <TaskBoard 
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            currentUserId={user?.uid}
            currentUserEmail={user?.email || undefined}
          />
        </main>
      </div>

      {isFormOpen && (
        <NewTaskForm 
          onClose={() => setIsFormOpen(false)}
          onAdd={handleAddTask}
          currentUserId={user?.uid || ''}
        />
      )}

      <AnimatePresence>
        {isReportOpen && (
          <ReportView 
            tasks={tasks}
            onClose={() => setIsReportOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
