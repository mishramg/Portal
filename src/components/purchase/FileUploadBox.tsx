import React, { useRef, useState } from 'react';
import { 
  Upload, FileText, Image as ImageIcon, CheckCircle2, 
  X, Eye, Paperclip, Camera, Sparkles, Trash2, FileCheck
} from 'lucide-react';

export interface UploadedFileDoc {
  name: string;
  url: string;
  type?: string;
  size?: string;
  uploadedAt?: string;
}

interface FileUploadBoxProps {
  label?: string;
  helperText?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  onFileChange: (file: { name: string; url: string; size?: string } | null) => void;
  accept?: string;
  sampleOptions?: { title: string; url: string; size?: string }[];
  compact?: boolean;
  required?: boolean;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  label = 'Upload Document / Reference',
  helperText = 'PDF, JPG, PNG, CAD up to 15MB',
  fileUrl,
  fileName,
  onFileChange,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  sampleOptions,
  compact = false,
  required = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      
      onFileChange({
        name: file.name,
        url: result,
        size: sizeStr
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      handleFileSelect(e.clipboardData.files[0]);
    }
  };

  const isImage = fileUrl && (
    fileUrl.startsWith('data:image/') || 
    fileUrl.includes('.jpg') || 
    fileUrl.includes('.png') || 
    fileUrl.includes('.jpeg') || 
    fileUrl.includes('.webp') ||
    fileUrl.includes('images.unsplash.com')
  );

  return (
    <div className="space-y-1.5" onPaste={handlePaste}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {sampleOptions && sampleOptions.length > 0 && !fileUrl && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-500" />
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              {sampleOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onFileChange({ name: opt.title, url: opt.url, size: opt.size || '1.2 MB' })}
                  className="px-1.5 py-0.5 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200 rounded text-[9.5px] font-semibold transition-colors cursor-pointer"
                >
                  +{opt.title.slice(0, 15)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {fileUrl ? (
        // Uploaded File Card View
        <div className="bg-slate-50 border-2 border-emerald-300/80 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage ? (
              <div 
                onClick={() => setShowPreviewModal(true)}
                className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 cursor-pointer relative group"
              >
                <img 
                  src={fileUrl} 
                  alt="Attachment thumbnail" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 truncate block">
                  {fileName || 'Attached_Document.pdf'}
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full shrink-0">
                  Ready
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Click preview to inspect or replace file
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Preview Document"
            >
              <Eye className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Change File"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
            </button>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Remove File"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        // Dropzone & Upload Button Area
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
            compact ? 'p-2.5' : 'p-4'
          } ${
            isDragging 
              ? 'border-yellow-500 bg-yellow-50/60 ring-2 ring-yellow-400/30' 
              : 'border-slate-300 hover:border-amber-400 bg-slate-50/70 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl flex items-center justify-center shrink-0 ${
              compact ? 'w-8 h-8 bg-amber-100 text-amber-900' : 'w-10 h-10 bg-amber-500 text-slate-950 shadow-xs'
            }`}>
              <Upload className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Click to Upload or Drag & Drop</span>
              </p>
              <p className="text-[10.5px] text-slate-500">
                {helperText}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Paperclip className="w-3 h-3 text-amber-600" />
            <span>Browse</span>
          </button>
        </div>
      )}

      {/* Preview Fullscreen Modal */}
      {showPreviewModal && fileUrl && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-500" />
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {fileName || 'Document Preview'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-3">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt="Full preview"
                  className="max-h-[60vh] object-contain rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center py-12 space-y-3">
                  <FileCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">{fileName || 'Document Ready'}</p>
                  <p className="text-xs text-slate-500">Document formatted for instant verification & review.</p>
                  <a
                    href={fileUrl}
                    download={fileName || 'document.pdf'}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-yellow-400 font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Open / Download File
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 text-right">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
