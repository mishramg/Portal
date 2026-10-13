const fs = require('fs');
let content = fs.readFileSync('src/components/common/GlobalImageViewer.tsx', 'utf8');
content = content.replace(
  `import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, FileText } from 'lucide-react';`,
  `import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, FileText } from 'lucide-react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";`
);
fs.writeFileSync('src/components/common/GlobalImageViewer.tsx', content);
