-- Migration 005: rebrand ke "PDFTool by Vann" + fitur Image Compressor/Resizer
-- Sesuai PRD.md v2 & design.md v2 (light/dark mode, settings profile lengkap)

ALTER TABLE users
  ADD COLUMN full_name VARCHAR(100) NULL AFTER username,
  ADD COLUMN avatar_path VARCHAR(500) NULL AFTER email,
  ADD COLUMN theme ENUM('light', 'dark') NOT NULL DEFAULT 'dark' AFTER avatar_path;

ALTER TABLE processing_jobs
  MODIFY COLUMN job_type ENUM(
    'pdf_compress','pdf_convert','pdf_protect','pdf_to_word',
    'image_compress','image_resize','image_convert'
  ) NOT NULL;

ALTER TABLE activity_log
  MODIFY COLUMN tool_type ENUM(
    'pdf_merge','pdf_split','pdf_compress','pdf_convert','pdf_watermark','pdf_protect',
    'qr_generate','image_to_pdf','pdf_to_word',
    'image_compress','image_resize','image_convert'
  ) NOT NULL;

ALTER TABLE presets
  MODIFY COLUMN tool_type ENUM('pdf_compress','qr_generate','image_compress','image_resize') NOT NULL;

-- files_temp.user_id sebelumnya NOT NULL secara gak sengaja kena constraint FK
-- CASCADE - pastiin tetep nullable buat guest (sesuai desain awal §7 PRD).
-- (No-op kalau udah nullable, MySQL/MariaDB gak protes ALTER ke kondisi yang sama)
ALTER TABLE files_temp MODIFY COLUMN user_id INT NULL;
