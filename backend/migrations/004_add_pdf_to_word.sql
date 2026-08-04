-- Migration 004: tambah tool_type/job_type 'pdf_to_word' (fitur baru: convert PDF ke Word)

ALTER TABLE processing_jobs
  MODIFY COLUMN job_type ENUM('pdf_compress','pdf_convert','pdf_protect','pdf_to_word') NOT NULL;

ALTER TABLE activity_log
  MODIFY COLUMN tool_type ENUM('pdf_merge','pdf_split','pdf_compress','pdf_convert','pdf_watermark','pdf_protect','qr_generate','image_to_pdf','pdf_to_word') NOT NULL;
