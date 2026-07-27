-- Migration 002: tambah pdf_protect job type
-- Sesuai keputusan: compress=Ghostscript, convert=poppler-utils, protect=qpdf

ALTER TABLE processing_jobs
  MODIFY COLUMN job_type ENUM('pdf_compress','pdf_convert','pdf_protect') NOT NULL;

ALTER TABLE activity_log
  MODIFY COLUMN tool_type ENUM('pdf_merge','pdf_split','pdf_compress','pdf_convert','pdf_watermark','pdf_protect','qr_generate') NOT NULL;
