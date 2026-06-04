export async function uploadContractFile(file: File): Promise<{ url: string; fileName: string; fileType: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/contract', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response.json();
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isValidContractFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 10 * 1024 * 1024;
  
  return validTypes.includes(file.type) && file.size <= maxSize;
}
