
import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageCaptured: (base64: string) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageCaptured, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onImageCaptured(base64String);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading) cameraInputRef.current?.click();
  };

  const triggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading) fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative group h-96 border-2 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center justify-center p-12 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 ${
          dragActive ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 scale-[1.02]' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700'
        } ${isLoading ? 'opacity-80 cursor-wait ring-4 ring-emerald-500/10' : 'cursor-pointer'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerUpload}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={onFileChange}
          disabled={isLoading}
        />

        <input 
          type="file" 
          ref={cameraInputRef} 
          className="hidden" 
          accept="image/*" 
          capture="environment" 
          onChange={onFileChange}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-white dark:bg-stone-800 h-24 w-24 rounded-3xl flex items-center justify-center shadow-xl border border-emerald-100 dark:border-emerald-900/30">
                <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={40} />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Analyzing Specimen</h3>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500 animate-pulse" />
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">Querying Botanical Engine</p>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 to-transparent" />
            
            <div className="bg-stone-50 dark:bg-stone-800 h-24 w-24 rounded-3xl flex items-center justify-center text-stone-300 dark:text-stone-600 mb-8 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500 shadow-inner">
              <ImageIcon size={48} strokeWidth={1.5} />
            </div>
            
            <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 text-center">Capture Nature's Beauty</h3>
            <p className="text-stone-500 dark:text-stone-400 text-center text-base max-w-sm mb-10 font-medium">
              Identify any plant instantly with Leafy's advanced botanical AI.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={triggerCamera}
                className="flex items-center gap-3 px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl font-bold text-sm hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xl shadow-stone-200 dark:shadow-stone-900/50 active:scale-95"
              >
                <Camera size={20} />
                Snap Photo
              </button>
              <button 
                onClick={triggerUpload}
                className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-2xl font-bold text-sm hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm active:scale-95"
              >
                <Upload size={20} />
                Upload Image
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-stone-400 dark:text-stone-600">
              <span className="h-[1px] w-8 bg-stone-200 dark:bg-stone-800" />
              <span className="text-[10px] font-black uppercase tracking-widest">Or Drag & Drop</span>
              <span className="h-[1px] w-8 bg-stone-200 dark:bg-stone-800" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
