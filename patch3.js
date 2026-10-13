const fs = require('fs');
let content = fs.readFileSync('src/components/common/GlobalImageViewer.tsx', 'utf8');

content = content.replace(
  `<iframe
              src={state.src}
              title={state.title}
              className="flex-1 w-full h-full border-0 bg-slate-50"
            />`,
  `{state.src.toLowerCase().endsWith('.pdf') || (state.title || '').toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={state.src}
                title={state.title}
                className="flex-1 w-full h-full border-0 bg-slate-50"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
                <FileText className="w-16 h-16 text-slate-300" />
                <div className="text-center">
                  <p className="font-bold text-slate-700 text-lg">Document Preview Unavailable</p>
                  <p className="text-sm">This file format cannot be previewed natively in the browser.</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl mt-4 shadow-md hover:bg-blue-500"
                >
                  Download File
                </button>
              </div>
            )}`
);

fs.writeFileSync('src/components/common/GlobalImageViewer.tsx', content);
