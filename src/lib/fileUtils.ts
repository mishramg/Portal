export const compressImageFile = (
  file: File, 
  maxWidth = 1000, 
  maxHeight = 1000, 
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          resolve((event.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((event.target?.result as string) || '');
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const isDocument = (url: string | undefined, title: string | undefined) => {
  if (!url) return false;
  const lUrl = url.toLowerCase();
  const lTitle = (title || '').toLowerCase();
  return (
    lUrl.endsWith('.pdf') ||
    lUrl.endsWith('.ppt') ||
    lUrl.endsWith('.pptx') ||
    lUrl.endsWith('.doc') ||
    lUrl.endsWith('.docx') ||
    lTitle.endsWith('.pdf') ||
    lTitle.endsWith('.ppt') ||
    lTitle.endsWith('.pptx') ||
    lTitle.endsWith('.doc') ||
    lTitle.endsWith('.docx')
  );
};

export const downloadFile = (url: string, title?: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.download = title || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
