const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmWorkflowPipeline.tsx', 'utf8');

const docCheckFunc = `
  const isDocument = (url: string | undefined, title: string | undefined) => {
    if (!url) return false;
    const lUrl = url.toLowerCase();
    const lTitle = (title || '').toLowerCase();
    return lUrl.endsWith('.pdf') || lUrl.endsWith('.ppt') || lUrl.endsWith('.pptx') || lUrl.endsWith('.doc') || lUrl.endsWith('.docx') ||
           lTitle.endsWith('.pdf') || lTitle.endsWith('.ppt') || lTitle.endsWith('.pptx') || lTitle.endsWith('.doc') || lTitle.endsWith('.docx');
  };
`;

content = content.replace(
  `  const handleStepTabClick = (stepId: CrmWorkStep) => {`,
  docCheckFunc + `\n  const handleStepTabClick = (stepId: CrmWorkStep) => {`
);

content = content.replace(
  `{currentWork.designerRecePptUrl && (
                        <div 
                          className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs cursor-pointer shrink-0 group relative"
                          onClick={() => {
                            if (window.showGlobalImageViewer) {
                              window.showGlobalImageViewer(currentWork.designerRecePptUrl || '', currentWork.designerRecePptTitle || 'RECE Report Photo');
                            }
                          }}
                          title="Click to view full size"
                        >
                          <img 
                            src={currentWork.designerRecePptUrl} 
                            alt="RECE Report" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                      )}`,
  `{currentWork.designerRecePptUrl && (
                        <div 
                          className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs cursor-pointer shrink-0 group relative bg-slate-50 flex items-center justify-center"
                          onClick={() => {
                            if (window.showGlobalImageViewer) {
                              window.showGlobalImageViewer(currentWork.designerRecePptUrl || '', currentWork.designerRecePptTitle || 'RECE Report');
                            }
                          }}
                          title="Click to view full size"
                        >
                          {isDocument(currentWork.designerRecePptUrl, currentWork.designerRecePptTitle) ? (
                            <FileText className="w-6 h-6 text-blue-500" />
                          ) : (
                            <img 
                              src={currentWork.designerRecePptUrl} 
                              alt="RECE Report" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                      )}`
);

content = content.replace(
  `<Eye className="w-3.5 h-3.5" /> View Picture`,
  `{isDocument(currentWork.designerRecePptUrl, currentWork.designerRecePptTitle) ? <><FileText className="w-3.5 h-3.5" /> View Document</> : <><Eye className="w-3.5 h-3.5" /> View Picture</>}`
);

fs.writeFileSync('src/components/crm/CrmWorkflowPipeline.tsx', content);
