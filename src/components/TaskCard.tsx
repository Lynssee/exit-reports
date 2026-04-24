import React, { useState, useRef } from 'react';
import { Priority, Status, Task, Role, Comment } from '../types';
import { Trash2, User, Code2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
  currentUserId?: string;
  currentUserEmail?: string;
}

const statusColors: Record<Status, string> = {
  'Done': 'bg-emerald-100 text-emerald-700',
  'Need Review': 'bg-fuchsia-100 text-fuchsia-700',
  'In Progress': 'bg-slate-900 text-white font-black',
  'Waiting': 'bg-red-50 text-red-600 border border-red-100',
  'New': 'bg-slate-50 text-slate-400',
};

const priorityColors: Record<Priority, string> = {
  'High': 'text-red-600 bg-red-100',
  'Medium': 'text-amber-600 bg-amber-100',
  'Low': 'text-slate-500 bg-slate-100',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onClick, currentUserId, currentUserEmail }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Discussion state
  const [commentText, setCommentText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusChange = (newStatus: Status) => {
    onUpdate({ ...task, status: newStatus });
    setIsEditingStatus(false);
  };

  const getPrefix = (category: string) => {
    return category.substring(0, 3).toUpperCase();
  };

  const idSuffix = task.id.replace('task-', '').replace(/[^\d]/g, '').slice(-3) || Math.floor(Math.random() * 999).toString().padStart(3, '0');

  const lastActivityTime = task.comments && task.comments.length > 0 
    ? task.comments[task.comments.length - 1].createdAt 
    : task.createdAt;

  const getActivityText = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
      return `${minutes} m ago`;
    } else if (hours < 24) {
      return `${hours} h ago`;
    } else {
      const d = new Date(timestamp);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  const processAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (selectedImages.length >= 5) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedImages(prev => [...prev, compressed]);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => processAndSetImage(file));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processAndSetImage(file);
        }
      }
    }
  };

  const submitComment = () => {
    if (!commentText.trim() && selectedImages.length === 0) return;

    if (!currentUserId || !currentUserEmail) {
      console.error("Must be logged in to comment.");
      return;
    }

    const role: Role = currentUserEmail === 'beaconcream137@gmail.com' ? 'Developer' : 'User';

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      sender: role,
      createdAt: Date.now(),
      photoUrls: selectedImages.length > 0 ? selectedImages : undefined,
      authorId: currentUserId
    };

    onUpdate({
      ...task,
      comments: [...(task.comments || []), newComment],
      viewedBy: [currentUserId] // Reset read status for others when new comment is added
    });

    setCommentText('');
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isUnread = currentUserId && !task.viewedBy?.includes(currentUserId);

  const toggleExpand = () => {
    const nextExpand = !isExpanded;
    setIsExpanded(nextExpand);
    
    // Mark as read when expanding
    if (nextExpand && isUnread && currentUserId) {
      onUpdate({
        ...task,
        viewedBy: [...(task.viewedBy || []), currentUserId]
      });
    }

    if (onClick) onClick();
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white transition-colors group flex flex-col ${isEditingStatus ? 'z-30 relative shadow-sm' : 'relative'} ${isExpanded ? 'shadow-md border-y border-slate-200 z-10 m-1 sm:m-2 rounded-xl' : 'hover:bg-slate-50/80 border-b border-slate-100 last:border-0'}`}
    >
      <div className="px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center cursor-pointer" onClick={toggleExpand}>
        <div className="col-span-2 text-[10px] sm:text-xs font-mono text-slate-400 whitespace-nowrap mb-1 sm:mb-0 flex items-center gap-2">
          {getPrefix(task.category)}-{idSuffix.padStart(3, '0')}
        </div>
        
        <div className="col-span-5 mb-2 sm:mb-0 pr-4 flex flex-col overflow-hidden">
          <p className={`text-[13px] sm:text-sm font-semibold text-slate-900 leading-tight sm:leading-snug ${isExpanded ? 'whitespace-normal' : 'truncate'}`}>
            {task.title}
          </p>
          <span className="text-[9px] sm:text-[10px] text-red-600 font-bold truncate block mt-0.5">
            {task.category} / {task.description.length > 50 && !isExpanded ? task.description.slice(0, 50) + '...' : task.description}
          </span>
        </div>

        <div className="col-span-2 mb-2 sm:mb-0 flex items-center gap-2 relative">
          <div className="relative">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded sm:rounded-full uppercase ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {isUnread && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2.5 -right-2.5 min-w-[1.5rem] h-6 px-1.5 bg-red-600 text-white text-[11px] font-black rounded-full shadow-[0_0_12px_rgba(220,38,38,0.5)] border-2 border-white flex items-center justify-center z-10" 
                title={`${task.comments?.length || 0} comments`}
              >
                {task.comments && task.comments.length > 0 ? task.comments.length : "!"}
                <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></span>
              </motion.span>
            )}
          </div>
          <div className="sm:hidden flex-1"></div>
          <div className="sm:hidden flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingStatus(!isEditingStatus);
              }}
              className={`px-2 py-1 text-[9px] font-bold rounded uppercase tracking-tight flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${statusColors[task.status]}`}
            >
              {task.status.toUpperCase()}
            </button>
            <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-1.5 py-1 rounded border border-slate-100">
              {getActivityText(lastActivityTime)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex col-span-2 mb-3 sm:mb-0 flex-col sm:items-center relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingStatus(!isEditingStatus);
            }}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg uppercase tracking-tight flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-fit ${statusColors[task.status]}`}
          >
            {task.status.toUpperCase()}
          </button>
          
          <AnimatePresence>
            {isEditingStatus && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 sm:-left-4 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 p-1.5 z-20 w-40 flex flex-col gap-1"
              >
                {(['New', 'Waiting', 'In Progress', 'Need Review', 'Done'] as Status[]).map(st => (
                  <button
                    key={st}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(st);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-md hover:bg-slate-50 uppercase tracking-tight ${statusColors[st]}`}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex col-span-1 items-center justify-end">
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap pr-2">
            {getActivityText(lastActivityTime)}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
          >
            <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6">
              <div className="lg:w-1/3">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Bug/Issue</h3>
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 mb-3 sm:mb-4 shadow-sm">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                  {task.photoUrls && task.photoUrls.length > 0 && (
                    <div className={`mt-3 grid gap-2 ${task.photoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                      {task.photoUrls.map((url, i) => (
                        <div 
                          key={i} 
                          className="aspect-video rounded-lg overflow-hidden border border-slate-100 cursor-pointer group/img relative" 
                          onClick={(e) => { e.stopPropagation(); setPreviewImage(url); }}
                        >
                          <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover bg-slate-50 group-hover/img:scale-105 transition-all" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] sm:text-xs text-slate-400">Created:</span>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-700">
                    {new Date(task.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="text-red-500 font-bold text-[10px] sm:text-[11px] hover:text-red-600 transition-opacity flex items-center gap-1.5 px-3 py-1.5 border border-red-100 bg-red-50 hover:bg-red-100 rounded-lg w-fit"
                >
                   <Trash2 size={12} sm:size={14} />
                   <span>Delete Issue</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discussion</span>
                  <span className="text-[9px] sm:text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{(task.comments || []).length}</span>
                </div>
                
                <div className="p-4 overflow-y-auto max-h-80 space-y-4">
                  {(!task.comments || task.comments.length === 0) ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                         <Code2 size={16} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">No updates yet.</p>
                      <p className="text-xs">Start the discussion below.</p>
                    </div>
                  ) : (
                    task.comments.map((comment) => {
                      const isDev = comment.sender === 'Developer';
                      return (
                        <div key={comment.id} className={`flex gap-3 ${isDev ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isDev ? 'bg-red-600 text-white font-bold' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {isDev ? <Code2 size={14} /> : <User size={14} />}
                          </div>
                          <div className={`flex flex-col max-w-[85%] ${isDev ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[11px] font-bold text-slate-700">{comment.sender}</span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`px-4 py-3 text-sm max-w-full ${
                              isDev 
                                ? 'bg-black text-white rounded-2xl rounded-tr-sm shadow-md border border-slate-800' 
                                : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm'
                            }`}>
                              {comment.text && <p className="whitespace-pre-wrap break-words">{comment.text}</p>}
                              {comment.photoUrls && comment.photoUrls.length > 0 && (
                                <div className={`mt-2 grid gap-1.5 ${comment.photoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                  {comment.photoUrls.map((url, i) => (
                                    <div 
                                      key={i} 
                                      className="rounded-lg overflow-hidden border border-black/10 cursor-pointer" 
                                      onClick={(e) => { e.stopPropagation(); setPreviewImage(url); }}
                                    >
                                      <img src={url} alt="Attachment" className="w-full max-h-48 object-cover hover:brightness-95 transition-all" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50">
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 transition-all flex flex-col">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onPaste={handlePaste}
                      placeholder="Add an update or reply... You can also paste an image here."
                      className="w-full px-3 py-2 text-sm resize-none outline-none max-h-24 placeholder:text-slate-400 bg-transparent"
                      rows={1}
                    />
                    
                    {selectedImages.length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-2 mb-1">
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20">
                            <img src={img} alt="Preview" className="w-full h-full object-cover rounded-md border border-slate-200" />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute -top-1 -right-1 bg-slate-800/80 backdrop-blur-sm text-white rounded-full p-1 hover:bg-slate-900 transition-colors shadow-sm"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50/50 border-t border-slate-100">
                      <div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          onClick={(e) => e.stopPropagation()}
                          className="hidden" 
                          id={`image-upload-${task.id}`}
                        />
                        <label 
                          htmlFor={`image-upload-${task.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer flex items-center justify-center transition-colors"
                          title="Attach Images"
                        >
                          <ImageIcon size={16} />
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            submitComment();
                          }}
                          disabled={!commentText.trim() && selectedImages.length === 0}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-black disabled:opacity-50 rounded-md transition-all shadow-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>
              <img
                src={previewImage}
                alt="Enlarged preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TaskCard;
