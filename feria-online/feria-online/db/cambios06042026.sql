USE feria_online;

-- Tabla de asistencias (registro de entrada al evento)
CREATE TABLE IF NOT EXISTS asistencias_evento (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  compra_id     INT NOT NULL,
  evento_id     INT NOT NULL,
  usuario_id    INT NOT NULL,
  fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
  escaneado_por INT DEFAULT NULL,
  UNIQUE KEY uq_asistencia (compra_id),
  FOREIGN KEY (compra_id)     REFERENCES compras_tickets(id),
  FOREIGN KEY (evento_id)     REFERENCES eventos(id),
  FOREIGN KEY (usuario_id)    REFERENCES usuarios(id),
  FOREIGN KEY (escaneado_por) REFERENCES usuarios(id)
);

-- Columna para identificar staff escáner
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS 
  permite_escaneo TINYINT(1) DEFAULT 1;