-- ============================================
-- MIGRACIÓN: Feria del Chicharrón
-- Fecha: 19-04-2026
-- ============================================

USE feria_online;

-- Agregar slug a la tabla eventos (para URLs amigables por evento)
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE DEFAULT NULL AFTER titulo;

-- Tabla de inscripciones de feria (registro sin pago previo)
-- El QR se genera y envía solo cuando el admin marca el pago como confirmado
CREATE TABLE IF NOT EXISTS inscripciones_feria (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  evento_id         INT NOT NULL,
  nombre            VARCHAR(100) NOT NULL,
  apellido          VARCHAR(100) NOT NULL,
  celular           VARCHAR(30)  NOT NULL,
  ciudad            VARCHAR(100) NOT NULL,
  email             VARCHAR(150) NOT NULL,
  genero            ENUM('masculino','femenino','otro','prefiero_no_decir') NOT NULL,
  codigo_qr         VARCHAR(100) UNIQUE DEFAULT NULL,
  estado_pago       ENUM('pendiente','pagado') DEFAULT 'pendiente',
  qr_enviado        TINYINT(1) DEFAULT 0,
  asistio           TINYINT(1) DEFAULT 0,
  fecha_asistencia  DATETIME DEFAULT NULL,
  escaneado_por     INT DEFAULT NULL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id)     REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (escaneado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Insertar el evento "Feria del Chicharrón"
-- Ajusta las fechas, ubicación y descripción según necesidad
INSERT INTO eventos (titulo, slug, descripcion, fecha_inicio, fecha_fin, ubicacion, modalidad, estado, creado_por)
SELECT
  'Feria del Chicharrón',
  'feria-chicharron',
  'El espacio donde encontrarás los mejores chicharrones de Bolivia. Un evento gastronómico único que celebra la tradición, el sabor y la cultura del chicharrón boliviano. Productores locales, gastronomía auténtica y una experiencia que no puedes perderte.',
  '2026-05-10 10:00:00',
  '2026-05-10 18:00:00',
  'Plaza Principal, Cochabamba, Bolivia',
  'presencial',
  'publicado',
  (SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM eventos WHERE slug = 'feria-chicharron');
