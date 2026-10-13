// Kelompokin tool_type dari activity_log jadi 3 kategori utama (PDF / QR / Image)
export function categoryOf(toolType) {
  if (toolType === 'qr_generate') return 'qr';
  if (toolType.startsWith('image_') && toolType !== 'image_to_pdf') return 'image';
  return 'pdf'; // termasuk image_to_pdf, itu fitur PDF Toolkit
}
