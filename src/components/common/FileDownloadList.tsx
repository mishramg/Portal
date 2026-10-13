import React from 'react';
import { Download } from 'lucide-react';
import { downloadFile } from '../../lib/fileUtils';

interface FileItem {
  url: string;
  title: string;
}

interface Props {
  files: FileItem[];
  title?: string;
}

export const FileDownloadList: React.FC<Props> = ({ files, title = "Related Files" }) => {
  const validFiles = files.filter(f => f.url);
  if (validFiles.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {validFiles.map((file, idx) => (
          <button
            key={idx}
            onClick={() => downloadFile(file.url, file.title)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            {file.title || `Asset ${idx + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
};
