import React, { useState } from 'react';
import { Task, Category } from '../types';
import { classifyTask } from '../lib/gemini';
import { Sparkles, X, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface NewTaskFormProps {
  onClose: () => void;
  onAdd: (task: Task) => void;
  currentUserId: string;
}

export default function NewTaskForm({ onClose, onAdd, currentUserId }: NewTaskFormProps) {
  const [description, setDescription] = useState('');
  const [division, setDivision] = useState<Category | ''>('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (photoUrls.length >= 10) {
      setError('Maximum 10 images allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // Constrain dimension to reduce base64 size
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
        // Compress as JPEG
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoUrls(prev => [...prev, compressed]);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageUpload(file);
        break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsClassifying(true);
    setError(null);

    try {
      const classification = await classifyTask(description, division || undefined);
      
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: classification.title,
        description,
        category: division || classification.category,
        priority: classification.priority,
        status: 'New',
        createdAt: Date.now(),
        ownerId: currentUserId,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        comments: [],
        viewedBy: [currentUserId],
      };

      onAdd(newTask);
    } catch (err: any) {
      console.error('Classification error:', err);
      setError(err.message || 'Failed to auto-classify task.');
      // If it fails, we fall back to manual defaults
      onAdd({
        id: `task-${Date.now()}`,
        title: description.slice(0, 40) + '...',
        description,
        category: division || 'Other',
        priority: 'Medium',
        status: 'New',
        createdAt: Date.now(),
        ownerId: currentUserId,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        comments: [],
        viewedBy: [currentUserId],
      });
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-black italic tracking-tight text-slate-800">ADD NEW <span className="text-red-600">ENTRY</span></h2>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="division" className="text-xs sm:text-sm font-medium text-slate-700">
              Division
            </label>
            <div className="relative">
              <select
                id="division"
                required
                value={division}
                onChange={(e) => setDivision(e.target.value as Category | '')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none appearance-none bg-white text-sm sm:text-base text-slate-800 transition-shadow transition-all"
              >
                <option value="" disabled>Select a division</option>
                <option value="Produksi">Produksi</option>
                <option value="RMC">RMC</option>
                <option value="Finance">Finance</option>
                <option value="Inventory">Inventory</option>
                <option value="Project">Project</option>
                <option value="Procurement">Procurement</option>
                <option value="Marketing/Sales">Marketing/Sales</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm justify-between font-medium text-slate-700 mb-1.5">
              <span className="flex items-center gap-2">
                Description
              </span>
            </label>
            <textarea
              id="description"
              autoFocus
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              onPaste={handlePaste}
              placeholder="Describe the bug or update... Paste image here."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none resize-none placeholder:text-slate-400 transition-all shadow-inner"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label htmlFor="image-upload" className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 hover:text-red-600 transition-colors">
                <ImageIcon size={14} sm:size={16} className="text-red-600" />
                Attach Images (Up to 10)
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach((file: File) => handleImageUpload(file));
                  }
                }}
              />
            </div>
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative inline-block">
                    <img 
                      src={url} 
                      alt={`Attached ${index + 1}`} 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-slate-200 object-cover bg-slate-50 cursor-pointer hover:brightness-95 transition-all" 
                      onClick={() => setPreviewImage(url)}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrls(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl transition-colors"
              disabled={isClassifying}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || !division || isClassifying}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-black disabled:opacity-50 rounded-md sm:rounded-lg transition-all shadow-lg shadow-red-100"
            >
              {isClassifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
        </div>
      )}
    </div>
  );
}
