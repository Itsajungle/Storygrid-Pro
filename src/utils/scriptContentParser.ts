
export const parseGeneratedContent = (generatedContent: string) => {
  const lines = generatedContent.split('\n');
  let whereText = '';
  let earsText = '';
  let eyesText = '';
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.toLowerCase().includes('where:') || trimmedLine.toLowerCase().includes('location:')) {
      currentSection = 'where';
      whereText += trimmedLine.replace(/where:|location:/i, '').trim() + '\n';
    } else if (trimmedLine.toLowerCase().includes('ears:') || trimmedLine.toLowerCase().includes('audio:') || trimmedLine.toLowerCase().includes('dialogue:')) {
      currentSection = 'ears';
      earsText += trimmedLine.replace(/ears:|audio:|dialogue:/i, '').trim() + '\n';
    } else if (trimmedLine.toLowerCase().includes('eyes:') || trimmedLine.toLowerCase().includes('visual:') || trimmedLine.toLowerCase().includes('camera:')) {
      currentSection = 'eyes';
      eyesText += trimmedLine.replace(/eyes:|visual:|camera:/i, '').trim() + '\n';
    } else if (trimmedLine && currentSection) {
      if (currentSection === 'where') whereText += trimmedLine + '\n';
      else if (currentSection === 'ears') earsText += trimmedLine + '\n';
      else if (currentSection === 'eyes') eyesText += trimmedLine + '\n';
    } else if (trimmedLine && !currentSection) {
      earsText += trimmedLine + '\n';
    }
  }
  
  return {
    where: whereText.trim() || 'Location appropriate for content',
    ears: earsText.trim() || generatedContent,
    eyes: eyesText.trim() || 'Visual treatment for content'
  };
};
