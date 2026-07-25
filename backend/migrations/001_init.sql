-- Migration 001: initial schema
-- Jalankan via: mysql -u root -p pdfqr_dashboard < migrations/001_init.sql
-- atau via npm run migrate (lihat src/config/migrate.js)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS guest_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_token VARCHAR(64) NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_guest_token (guest_token)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tool_type ENUM('pdf_merge','pdf_split','pdf_compress','pdf_convert','pdf_watermark','pdf_protect','qr_generate') NOT NULL,
  file_name VARCHAR(255) NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activity_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tool_type ENUM('pdf_compress','qr_generate') NOT NULL,
  config_json JSON NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_preset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_preset_user_tool (user_id, tool_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS files_temp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  file_path VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_filetemp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_filetemp_expires (expires_at)
) ENGINE=InnoDB;

-- Job tracking untuk operasi berat (compress/convert) yang diproses async
-- (tidak ada di draft PRD, tapi wajib biar endpoint gak blocking - lihat catatan review)
CREATE TABLE IF NOT EXISTS processing_jobs (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NULL,
  guest_token VARCHAR(64) NULL,
  job_type ENUM('pdf_compress','pdf_convert') NOT NULL,
  status ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  input_path VARCHAR(500) NOT NULL,
  output_path VARCHAR(500) NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_job_status (status)
) ENGINE=InnoDB;
