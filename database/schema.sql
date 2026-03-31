-- Mental Wellness & Therapy Booking — MySQL Schema
-- Charset & engine
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS availability_slots;
DROP TABLE IF EXISTS therapist_issue_types;
DROP TABLE IF EXISTS therapist_profiles;
DROP TABLE IF EXISTS session_status;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient','therapist') NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(40) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE therapist_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  specialization VARCHAR(200) NOT NULL,
  bio TEXT NULL,
  years_experience SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL,
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_therapist_user (user_id),
  CONSTRAINT fk_tp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue types for search/filter (many-to-many with therapists)
CREATE TABLE therapist_issue_types (
  therapist_profile_id BIGINT UNSIGNED NOT NULL,
  issue_type VARCHAR(80) NOT NULL,
  PRIMARY KEY (therapist_profile_id, issue_type),
  CONSTRAINT fk_tit_profile FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE session_status (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL,
  label VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_session_status_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE availability_slots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  therapist_profile_id BIGINT UNSIGNED NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_av_therapist_date (therapist_profile_id, slot_date),
  CONSTRAINT fk_av_therapist FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  therapist_profile_id BIGINT UNSIGNED NOT NULL,
  slot_id BIGINT UNSIGNED NOT NULL,
  session_status_id TINYINT UNSIGNED NOT NULL,
  patient_notes VARCHAR(500) NULL,
  therapist_notes VARCHAR(500) NULL,
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_appointments_slot (slot_id),
  KEY idx_appt_patient (patient_id),
  KEY idx_appt_therapist (therapist_profile_id),
  KEY idx_appt_status (session_status_id),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_appt_therapist FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_appt_slot FOREIGN KEY (slot_id) REFERENCES availability_slots (id) ON DELETE RESTRICT,
  CONSTRAINT fk_appt_status FOREIGN KEY (session_status_id) REFERENCES session_status (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  method ENUM('card_simulated','wallet_simulated') NOT NULL DEFAULT 'card_simulated',
  transaction_ref VARCHAR(64) NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_appointment (appointment_id),
  CONSTRAINT fk_pay_appt FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  therapist_profile_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment VARCHAR(2000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_appointment (appointment_id),
  KEY idx_rev_therapist (therapist_profile_id),
  CONSTRAINT fk_rev_appt FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_patient FOREIGN KEY (patient_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_therapist FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO session_status (code, label) VALUES
  ('PENDING', 'Pending confirmation'),
  ('CONFIRMED', 'Confirmed'),
  ('COMPLETED', 'Completed'),
  ('CANCELLED', 'Cancelled'),
  ('RESCHEDULED', 'Rescheduled');
