-- ============================================
-- SCHEMA: feria_online
-- Sistema de Ferias Online
-- ============================================

CREATE DATABASE IF NOT EXISTS feria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE feria_online;

-- ─── USUARIOS ────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  apellido    VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  rol         ENUM('admin','admin_evento','participante','empresa') NOT NULL DEFAULT 'participante',
  avatar      VARCHAR(255) DEFAULT NULL,
  activo      TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── EMPRESAS ────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL UNIQUE,
  nombre_empresa  VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  sector          VARCHAR(100),
  sitio_web       VARCHAR(255),
  logo            VARCHAR(255),
  telefono        VARCHAR(30),
  pais            VARCHAR(80),
  ciudad          VARCHAR(80),
  verificada      TINYINT(1) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ─── PRODUCTOS DE EMPRESA ────────────────────
CREATE TABLE IF NOT EXISTS productos_empresa (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id    INT NOT NULL,
  nombre        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(12,2),
  imagen        VARCHAR(255),
  activo        TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- ─── EVENTOS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  titulo          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  imagen_banner   VARCHAR(255),
  fecha_inicio    DATETIME NOT NULL,
  fecha_fin       DATETIME NOT NULL,
  ubicacion       VARCHAR(255),
  modalidad       ENUM('presencial','virtual','hibrido') DEFAULT 'virtual',
  estado          ENUM('borrador','publicado','finalizado','cancelado') DEFAULT 'borrador',
  creado_por      INT NOT NULL,
  admin_evento_id INT DEFAULT NULL,
  max_participantes INT DEFAULT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por)      REFERENCES usuarios(id),
  FOREIGN KEY (admin_evento_id) REFERENCES usuarios(id)
);

-- ─── CHARLAS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS charlas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  evento_id     INT NOT NULL,
  titulo        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  ponente       VARCHAR(150),
  fecha_hora    DATETIME NOT NULL,
  duracion_min  INT DEFAULT 60,
  sala          VARCHAR(100),
  enlace_stream VARCHAR(255),
  capacidad     INT DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- ─── REUNIONES PRIVADAS ──────────────────────
CREATE TABLE IF NOT EXISTS reuniones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  evento_id     INT NOT NULL,
  titulo        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  fecha_hora    DATETIME NOT NULL,
  duracion_min  INT DEFAULT 30,
  max_asistentes INT DEFAULT 10,
  precio        DECIMAL(12,2) DEFAULT 0.00,
  enlace_meet   VARCHAR(255),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- ─── TICKETS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  evento_id     INT NOT NULL,
  nombre        VARCHAR(150) NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cantidad_total INT NOT NULL,
  cantidad_vendida INT DEFAULT 0,
  fecha_limite  DATETIME DEFAULT NULL,
  tipo          ENUM('general','vip','empresa') DEFAULT 'general',
  activo        TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- ─── COMPRAS DE TICKETS ──────────────────────
CREATE TABLE IF NOT EXISTS compras_tickets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id     INT NOT NULL,
  usuario_id    INT NOT NULL,
  cantidad      INT NOT NULL DEFAULT 1,
  total_pagado  DECIMAL(12,2) NOT NULL,
  codigo_qr     VARCHAR(100) UNIQUE,
  estado        ENUM('pendiente','confirmado','cancelado') DEFAULT 'confirmado',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id)  REFERENCES tickets(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ─── INSCRIPCIONES A CHARLAS ─────────────────
CREATE TABLE IF NOT EXISTS inscripciones_charlas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  charla_id   INT NOT NULL,
  usuario_id  INT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_charla_usuario (charla_id, usuario_id),
  FOREIGN KEY (charla_id)  REFERENCES charlas(id)  ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ─── RESERVAS DE REUNIONES ───────────────────
CREATE TABLE IF NOT EXISTS reservas_reuniones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reunion_id    INT NOT NULL,
  usuario_id    INT NOT NULL,
  estado        ENUM('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reunion_usuario (reunion_id, usuario_id),
  FOREIGN KEY (reunion_id)  REFERENCES reuniones(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE
);

-- ─── PARTICIPACION EN EVENTOS ────────────────
CREATE TABLE IF NOT EXISTS participacion_eventos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  evento_id   INT NOT NULL,
  usuario_id  INT NOT NULL,
  tipo        ENUM('participante','empresa','ponente') DEFAULT 'participante',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_evento_usuario (evento_id, usuario_id),
  FOREIGN KEY (evento_id)  REFERENCES eventos(id)   ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE CASCADE
);

-- ─── SEED: Usuario admin por defecto ─────────
-- Password: Admin1234!
INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES
('Super', 'Admin', 'admin@feria.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id=id;
