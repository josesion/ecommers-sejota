CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL, -- Ej: Vestido Midi Satinado
    slug VARCHAR(170) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    guia_talles TEXT NULL, -- Descripción o texto/HTML con las medidas (busto, cintura, cadera)
    precio_base DECIMAL(10, 2) NOT NULL, -- Precio de referencia
    precio_oferta DECIMAL(10, 2) NULL,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria) ON DELETE RESTRICT
);