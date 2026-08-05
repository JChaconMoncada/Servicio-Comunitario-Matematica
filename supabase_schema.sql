-- Crear tabla de Configuracion (para mantener estado global como periodo activo, inscripcion habilitada, etc.)
CREATE TABLE IF NOT EXISTS configuracion (
  id SERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL
);

-- Crear tabla de Materias Habilitadas
CREATE TABLE IF NOT EXISTS materias_habilitadas (
  nombre TEXT PRIMARY KEY,
  habilitada BOOLEAN DEFAULT true
);

-- Crear tabla de Solicitudes (Estudiantes que han llenado el form)
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nro SERIAL,
  nombre TEXT NOT NULL,
  cedula TEXT NOT NULL UNIQUE,
  correo TEXT NOT NULL,
  periodo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Materias Solicitadas por cada estudiante
CREATE TABLE IF NOT EXISTS solicitudes_materias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  materia TEXT NOT NULL,
  estado TEXT DEFAULT 'gris', -- 'gris', 'verde', 'rojo'
  seccion_asignada TEXT,
  UNIQUE(solicitud_id, materia)
);

-- Crear tabla de Secciones
CREATE TABLE IF NOT EXISTS secciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  materia TEXT NOT NULL,
  seccion TEXT NOT NULL,
  modalidad TEXT NOT NULL,
  aula TEXT,
  profesor TEXT,
  capacidad_max INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Estudiantes en Secciones
CREATE TABLE IF NOT EXISTS secciones_estudiantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seccion_id UUID REFERENCES secciones(id) ON DELETE CASCADE,
  nro INT,
  nombre TEXT NOT NULL,
  cedula TEXT NOT NULL,
  correo TEXT NOT NULL,
  verificado BOOLEAN DEFAULT false,
  UNIQUE(seccion_id, cedula)
);

-- Configuración Inicial de Prueba (opcional, insertar valores por defecto)
INSERT INTO configuracion (clave, valor) VALUES 
('periodoActivo', '"Semestre 2026-1"'),
('inscripcionHabilitada', 'true')
ON CONFLICT (clave) DO NOTHING;

-- Omitiendo el RLS (Row Level Security) para pruebas rápidas
-- En producción, se deben habilitar políticas RLS.
