const fs = require('fs');
let content = fs.readFileSync('src/components/common/GlobalImageViewer.tsx', 'utf8');

content = content.replace(
  `import { X, ZoomIn, ZoomOut, Download, Maximize2, Minimize2, FileText } from 'lucide-react';`,
  `import { X, ZoomIn, ZoomOut, Download, Maximize2, Minimize2, FileText } from 'lucide-react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";`
);

content = content.replace(
  `  const handleDownload = async () => {
    try {
      if (isDoc) {
        // Direct download for documents instead of mock generation
        const link = document.createElement('a');
        link.href = state.src;
        link.target = '_blank';
        link.download = state.title || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(state.src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      let extension = state.src.split('.').pop()?.split('?')[0].toLowerCase() || 'jpg';
      if (extension === 'jpeg' || extension.length > 4 || !['jpg', 'png', 'gif', 'webp'].includes(extension)) {
        extension = 'jpg';
      }
      
      let fileName = state.title || state.src.split('/').pop()?.split('?')[0] || 'image';
      fileName = fileName.replace(/[\\/\\\\?%*:|"<>]/g, '-').trim();
      
      if (!fileName.toLowerCase().endsWith(\`.\${extension}\`)) {
        fileName = \`\${fileName}.\${extension}\`;
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback if browser blocks fetch due to CORS
      const link = document.createElement('a');
      link.href = state.src;
      link.target = '_blank';
      link.download = state.title || 'downloaded_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };`,
  `  const handleDownload = async () => {
    try {
      const response = await fetch(state.src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      let extension = state.src.split('.').pop()?.split('?')[0].toLowerCase() || 'jpg';
      if (isDoc) {
         const titleExt = (state.title || '').split('.').pop()?.toLowerCase();
         if (titleExt && ['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(titleExt)) {
             extension = titleExt;
         } else if (state.src.toLowerCase().includes('pptx')) {
             extension = 'pptx';
         } else if (state.src.toLowerCase().includes('pdf')) {
             extension = 'pdf';
         }
      } else {
         if (extension === 'jpeg' || extension.length > 4 || !['jpg', 'png', 'gif', 'webp'].includes(extension)) {
           extension = 'jpg';
         }
      }
      
      let fileName = state.title || state.src.split('/').pop()?.split('?')[0] || (isDoc ? 'document' : 'image');
      fileName = fileName.replace(/[\\/\\\\?%*:|"<>]/g, '-').trim();
      
      if (!fileName.toLowerCase().endsWith(\`.\${extension}\`)) {
        fileName = \`\${fileName}.\${extension}\`;
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback if browser blocks fetch due to CORS
      const link = document.createElement('a');
      link.href = state.src;
      link.target = isDoc ? '_blank' : '';
      link.download = state.title || (isDoc ? 'downloaded_document' : 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };`
);

content = content.replace(
  `            {state.src.toLowerCase().endsWith('.pdf') || (state.title || '').toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={state.src}
                title={state.title}
                className="flex-1 w-full h-full border-0 bg-slate-50"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
                <FileText className="w-16 h-16 text-slate-300" />
                <div className="text-center">
                  <p className="font-bold text-slate-700 text-lg">Document Presentation</p>
                  <p className="text-sm">PowerPoint / Document viewer is in mock mode. Please download to view the actual file.</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl mt-4 shadow-md hover:bg-blue-500 cursor-pointer"
                >
                  Download File
                </button>
              </div>
            )}`,
  `            <div className="flex-1 w-full h-full bg-slate-50 relative overflow-hidden">
              <DocViewer 
                documents={[{ uri: state.src, fileName: state.title }]} 
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: { disableHeader: true },
                }}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
              />
            </div>`
);

fs.writeFileSync('src/components/common/GlobalImageViewer.tsx', content);
