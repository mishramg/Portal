import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { isDocument, downloadFile } from '../../lib/fileUtils';

interface ImageViewerState {
  isOpen: boolean;
  src: string;
  title?: string;
}

declare global {
  interface Window {
    showGlobalImageViewer?: (src: string, title?: string) => void;
  }
}

export const GlobalImageViewer: React.FC = () => {
  const [state, setState] = useState<ImageViewerState>({
    isOpen: false,
    src: '',
    title: '',
  });

  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    window.showGlobalImageViewer = (src: string, title?: string) => {
      if (isDocument(src, title)) {
        downloadFile(src, title);
      } else {
        setState({ isOpen: true, src, title });
        setZoom(0.9);
        setRotate(0);
        setIsFullscreen(false);
      }
    };

    return () => {
      window.showGlobalImageViewer = undefined;
    };
  }, []);

  // Listen to keyboard shortcuts (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setState((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!state.isOpen) return null;

  const handleClose = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDownload = () => {
    downloadFile(state.src, state.title);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="w-full flex justify-between items-center bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl max-w-6xl z-10 backdrop-blur-xs">
        <div className="flex flex-col gap-0.5 text-left pl-2">
          <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
            HD Fullscreen Image Viewer
          </span>
          <span className="text-sm font-bold text-slate-100 truncate max-w-[200px] sm:max-w-md">
            {state.title || 'Site Asset'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 px-1 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Rotate control */}
          <button
            onClick={() => setRotate((r) => (r + 90) % 360)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 px-3 shadow-lg shadow-blue-500/20"
            title="Download Asset directly to device"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Download</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-800 mx-1" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="p-2 bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 border border-rose-900/30 rounded-xl transition-all cursor-pointer"
            title="Close Viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Main Content Area */}
      <div 
        className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-auto my-4 relative p-4 cursor-zoom-out"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        {/* Normal image display content */}
        <div 
          className="transition-transform duration-200 ease-out origin-center"
          style={{
            transform: `scale(${zoom}) rotate(${rotate}deg)`,
          }}
        >
          <img
            src={state.src}
            alt={state.title}
            className="max-w-[95vw] max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-800/80 pointer-events-auto select-all cursor-default"
            referrerPolicy="no-referrer"
            draggable="true"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      </div>

      {/* Bottom status helper */}
      <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium pb-4 flex gap-4">
        <span>💡 Scroll / Pinch to Zoom</span>
        <span>•</span>
        <span>Rotate or download directly using the top bar</span>
        <span>•</span>
        <span>Press ESC to exit</span>
      </div>
    </div>
  );
};
