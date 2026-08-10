// Datos completos del Departamento de Matemática y Física - UNET
// Cada materia tiene: nombre, semestre, fila (posición visual), UC, prelaciones

export const pensumMaterias = [
  // === SEMESTRE I ===
  { id: 'mat1', nombre: 'Matemática 1', semestre: 1, fila: 1, uc: 4, prelaciones: [], carrera: 'Ingeniería' },
  { id: 'mat_disc', nombre: 'Matemática Discreta', semestre: 1, fila: 2, uc: 3, prelaciones: [], carrera: 'Ingeniería' },

  // === SEMESTRE II ===
  { id: 'mat2', nombre: 'Matemática 2', semestre: 2, fila: 1, uc: 4, prelaciones: ['mat1'], carrera: 'Ingeniería' },
  { id: 'fis1', nombre: 'Física 1', semestre: 2, fila: 2, uc: 4, prelaciones: ['mat1'], carrera: 'Ingeniería' },
  { id: 'lab_fis1', nombre: 'Laboratorio de Física 1', semestre: 2, fila: 3, uc: 1, prelaciones: [], corequisito: 'fis1', carrera: 'Ingeniería' },

  // === SEMESTRE III ===
  { id: 'mat3', nombre: 'Matemática 3', semestre: 3, fila: 1, uc: 4, prelaciones: ['mat2'], carrera: 'Ingeniería' },
  { id: 'fis2', nombre: 'Física 2', semestre: 3, fila: 2, uc: 4, prelaciones: ['fis1', 'lab_fis1', 'mat2'], carrera: 'Ingeniería' },
  { id: 'lab_fis2', nombre: 'Laboratorio de Física 2', semestre: 3, fila: 3, uc: 1, prelaciones: [], corequisito: 'fis2', carrera: 'Ingeniería' },

  // === SEMESTRE IV ===
  { id: 'mat4', nombre: 'Matemática 4', semestre: 4, fila: 1, uc: 4, prelaciones: ['mat3'], carrera: 'Ingeniería' },
  { id: 'est1', nombre: 'Estadística 1', semestre: 4, fila: 2, uc: 3, prelaciones: ['mat3'], carrera: 'Ingeniería' },
  { id: 'est_apli1', nombre: 'Estadística Aplicada I', semestre: 4, fila: 3, uc: 3, prelaciones: [], carrera: 'Psicología' },

  // === SEMESTRE V ===
  { id: 'an_num', nombre: 'Métodos Numéricos', semestre: 5, fila: 1, uc: 3, prelaciones: ['mat4'], carrera: 'Ingeniería' },
  { id: 'est2', nombre: 'Estadística 2', semestre: 5, fila: 2, uc: 3, prelaciones: ['est1'], carrera: 'Ingeniería' },
  { id: 'est_prob', nombre: 'Estadística y Probabilidad', semestre: 5, fila: 3, uc: 3, prelaciones: ['mat3'], carrera: 'Ingeniería' },
  { id: 'est_apli2', nombre: 'Estadística Aplicada II', semestre: 5, fila: 4, uc: 3, prelaciones: ['est_apli1'], carrera: 'Psicología' },

  // === SEMESTRE VI ===
  { id: 'psicometria', nombre: 'Psicometría', semestre: 6, fila: 3, uc: 3, prelaciones: ['est_apli2'], carrera: 'Psicología' },

  // === SEMESTRE VII ===
]

export const electivasDisponibles = []

export const materiasNoDepartamento = []

export const prelacionesPorUC = []

// Colores por filas temáticas para la cuadrícula visual
export const coloresSemestre = {
  1: '#1e40af',  // Azul oscuro
  2: '#1d4ed8',  // Azul
  3: '#2563eb',  // Azul medio
  4: '#3b82f6',  // Azul claro
  5: '#0ea5e9',  // Cyan
  6: '#0891b2',  // Teal
  7: '#0d9488',  // Teal oscuro
  8: '#059669',  // Verde
  9: '#16a34a',  // Verde medio
  10: '#ca8a04', // Dorado
}

export const semestresLabels = [
  'Semestre I', 'Semestre II', 'Semestre III', 'Semestre IV', 'Semestre V',
  'Semestre VI', 'Semestre VII', 'Semestre VIII', 'Semestre IX', 'Semestre X'
]
