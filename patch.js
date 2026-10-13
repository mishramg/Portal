const fs = require('fs');
let content = fs.readFileSync('src/components/designer/DesignerPortal.tsx', 'utf8');
content = content.replace(
  `  // Step 2 Handler: Upload RECE PPT
  const handleSubmitRecePpt = () => {
    if (!currentWork) return;
    const sitePic = currentWork.receSubmission?.imageUrls?.[0] || 
                    currentWork.visitReport?.images?.[0] || 
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';

    const updated: WorkAssignment = {
      ...currentWork,
      designerRecePptUrl: sitePic, // Use the actual uploaded picture of RECE report/visit report
      designerRecePptTitle: recePptTitle || \`\${currentWork.brandName}_RECE_Presentation.pptx\`,
      designerRecePptComments: recePptComments || 'Uploaded complete RECE PowerPoint slides.',
      designerRecePptSubmittedAt: new Date().toLocaleString(),`,
  `  // Step 2 Handler: Upload RECE PPT
  const handleSubmitRecePpt = () => {
    if (!currentWork) return;
    const sitePic = currentWork.receSubmission?.imageUrls?.[0] || 
                    currentWork.visitReport?.images?.[0] || 
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
    
    let pptUrl = sitePic;
    let pptTitle = \`\${currentWork.brandName}_RECE_Presentation.pptx\`;
    
    if (recePptFile) {
      pptUrl = URL.createObjectURL(recePptFile);
      pptTitle = recePptFile.name;
    }

    const updated: WorkAssignment = {
      ...currentWork,
      designerRecePptUrl: pptUrl,
      designerRecePptTitle: pptTitle,
      designerRecePptComments: recePptComments || 'Uploaded complete RECE PowerPoint slides.',
      designerRecePptSubmittedAt: new Date().toLocaleString(),`
);
fs.writeFileSync('src/components/designer/DesignerPortal.tsx', content);
