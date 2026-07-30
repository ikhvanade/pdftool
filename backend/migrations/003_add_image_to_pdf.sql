-- Migration 003: tambah tool_type 'image_to_pdf' (fitur baru: convert gambar ke PDF)

ALTER TABLE activity_log
  MODIFY COLUMN tool_type ENUM('pdf_merge','pdf_split','pdf_compress','pdf_convert','pdf_watermark','pdf_protect','qr_generate','image_to_pdf') NOT NULL;
