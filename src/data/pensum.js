// Datos completos del Pensum de Ingeniería en Informática - UNET
// Cada materia tiene: nombre, semestre, fila (posición visual), UC, prelaciones

export const pensumMaterias = [
  // === SEMESTRE I ===
  { id: 'intro_ing', nombre: 'Introducción a la Ingeniería en Informática', semestre: 1, fila: 1, uc: 2, prelaciones: [] },
  { id: 'compu1', nombre: 'Computación 1', semestre: 1, fila: 2, uc: 3, prelaciones: [] },
  { id: 'mat_disc', nombre: 'Matemática Discreta', semestre: 1, fila: 3, uc: 4, prelaciones: [] },
  { id: 'mat1', nombre: 'Matemática 1', semestre: 1, fila: 4, uc: 5, prelaciones: [] },
  { id: 'efec_per', nombre: 'Efectividad Personal', semestre: 1, fila: 5, uc: 2, prelaciones: [] },
  { id: 'leng_com', nombre: 'Lenguaje y Comunicación', semestre: 1, fila: 6, uc: 2, prelaciones: [] },

  // === SEMESTRE II ===
  { id: 'quim1', nombre: 'Química General 1', semestre: 2, fila: 1, uc: 3, prelaciones: [] },
  { id: 'prog1', nombre: 'Programación 1', semestre: 2, fila: 2, uc: 4, prelaciones: ['compu1'] },
  { id: 'lab_fis1', nombre: 'Laboratorio de Física 1', semestre: 2, fila: 3, uc: 1, prelaciones: ['mat1'] },
  { id: 'fis1', nombre: 'Física 1', semestre: 2, fila: 4, uc: 4, prelaciones: ['mat1'] },
  { id: 'mat2', nombre: 'Matemática 2', semestre: 2, fila: 5, uc: 5, prelaciones: ['mat1'] },
  { id: 'ing1', nombre: 'Inglés 1', semestre: 2, fila: 6, uc: 2, prelaciones: [], ucRequeridas: 12 },

  // === SEMESTRE III ===
  { id: 'tgs', nombre: 'Teoría General de Sistemas', semestre: 3, fila: 1, uc: 3, prelaciones: ['intro_ing'] },
  { id: 'est_datos', nombre: 'Estructura de Datos', semestre: 3, fila: 2, uc: 4, prelaciones: ['prog1', 'mat_disc'] },
  { id: 'lab_fis2', nombre: 'Laboratorio de Física 2', semestre: 3, fila: 3, uc: 1, prelaciones: ['lab_fis1', 'fis1'] },
  { id: 'fis2', nombre: 'Física 2', semestre: 3, fila: 4, uc: 4, prelaciones: ['fis1', 'mat2'] },
  { id: 'mat3', nombre: 'Matemática 3', semestre: 3, fila: 5, uc: 4, prelaciones: ['mat2'] },
  { id: 'ing2', nombre: 'Inglés 2', semestre: 3, fila: 6, uc: 2, prelaciones: ['ing1'] },

  // === SEMESTRE IV ===
  { id: 'cien_soc', nombre: 'Ciencias y Sociedad 1', semestre: 4, fila: 1, uc: 2, prelaciones: [] },
  { id: 'prog2', nombre: 'Programación 2', semestre: 4, fila: 2, uc: 4, prelaciones: ['est_datos'] },
  { id: 'fund_log', nombre: 'Fundamentos de Lógica Digital', semestre: 4, fila: 3, uc: 4, prelaciones: ['mat_disc'] },
  { id: 'mat4', nombre: 'Matemática 4', semestre: 4, fila: 4, uc: 4, prelaciones: ['mat3'] },
  { id: 'est1', nombre: 'Estadística 1', semestre: 4, fila: 5, uc: 3, prelaciones: ['mat2'] },

  // === SEMESTRE V ===
  { id: 'nec_val', nombre: 'Necesidades, Valores y Proyecto de Vida', semestre: 5, fila: 1, uc: 2, prelaciones: [] },
  { id: 'bd1', nombre: 'Base de Datos 1', semestre: 5, fila: 2, uc: 4, prelaciones: ['prog2'] },
  { id: 'org_comp', nombre: 'Organización del Computador', semestre: 5, fila: 3, uc: 4, prelaciones: ['fund_log'] },
  { id: 'auto', nombre: 'Automatización', semestre: 5, fila: 4, uc: 3, prelaciones: ['prog2'] },
  { id: 'an_num', nombre: 'Análisis Numérico', semestre: 5, fila: 5, uc: 3, prelaciones: ['mat4'] },
  { id: 'est2', nombre: 'Estadística 2', semestre: 5, fila: 7, uc: 3, prelaciones: ['est1'] },
  { id: 'proy_sc', nombre: 'Proyecto Servicio Comunitario', semestre: 5, fila: 8, uc: 0, prelaciones: [], ucRequeridas: 78 },
  { id: 'sem_sc', nombre: 'Seminario Servicio Comunitario', semestre: 5, fila: 9, uc: 0, prelaciones: [], ucRequeridas: 78 },

  // === SEMESTRE VI ===
  { id: 'multi', nombre: 'Multimedia', semestre: 6, fila: 1, uc: 3, prelaciones: ['tgs'] },
  { id: 'si1', nombre: 'Sistemas de Información 1', semestre: 6, fila: 2, uc: 4, prelaciones: ['bd1'] },
  { id: 'so', nombre: 'Sistemas Operativos', semestre: 6, fila: 3, uc: 4, prelaciones: ['org_comp'] },
  { id: 'com1', nombre: 'Comunicaciones 1', semestre: 6, fila: 4, uc: 3, prelaciones: ['auto'] },
  { id: 'io1', nombre: 'Investigación de Operaciones 1', semestre: 6, fila: 5, uc: 3, prelaciones: ['an_num'] },
  { id: 'serv_com', nombre: 'Servicio Comunitario', semestre: 6, fila: 8, uc: 0, prelaciones: ['proy_sc', 'sem_sc'] },
  { id: 'econ', nombre: 'Economía', semestre: 6, fila: 9, uc: 3, prelaciones: [] },

  // === SEMESTRE VII ===
  { id: 'elect1', nombre: 'Electiva', semestre: 7, fila: 1, uc: 3, prelaciones: [], ucRequeridas: 90, esElectiva: true },
  { id: 'bd2', nombre: 'Base de Datos 2', semestre: 7, fila: 2, uc: 4, prelaciones: ['si1'] },
  { id: 'comp_int', nombre: 'Compiladores e Intérpretes', semestre: 7, fila: 3, uc: 4, prelaciones: ['so'] },
  { id: 'com2', nombre: 'Comunicaciones 2', semestre: 7, fila: 4, uc: 3, prelaciones: ['com1'] },
  { id: 'io2', nombre: 'Investigación de Operaciones 2', semestre: 7, fila: 5, uc: 3, prelaciones: ['io1'] },
  { id: 'ing_econ', nombre: 'Ingeniería Económica', semestre: 7, fila: 9, uc: 3, prelaciones: ['econ'] },

  // === SEMESTRE VIII ===
  { id: 'eco_cont', nombre: 'Ecología y Contaminación Ambiental', semestre: 8, fila: 1, uc: 2, prelaciones: [], ucRequeridas: 100 },
  { id: 'si2', nombre: 'Sistemas de Información 2', semestre: 8, fila: 2, uc: 4, prelaciones: ['bd2'] },
  { id: 'sist_dist', nombre: 'Sistemas Distribuidos', semestre: 8, fila: 3, uc: 4, prelaciones: ['comp_int'] },
  { id: 'elect2', nombre: 'Electiva', semestre: 8, fila: 4, uc: 3, prelaciones: [], ucRequeridas: 90, esElectiva: true },
  { id: 'sim_sist', nombre: 'Simulación de Sistemas', semestre: 8, fila: 5, uc: 3, prelaciones: ['io2'] },
  { id: 'fin_ing', nombre: 'Finanzas para Ingenieros', semestre: 8, fila: 9, uc: 3, prelaciones: ['ing_econ'] },

  // === SEMESTRE IX ===
  { id: 'met_inv', nombre: 'Metodología de la Investigación', semestre: 9, fila: 1, uc: 3, prelaciones: [], ucRequeridas: 110 },
  { id: 'ing_soft', nombre: 'Ingeniería de Software', semestre: 9, fila: 2, uc: 4, prelaciones: ['si2'] },
  { id: 'seminario', nombre: 'Seminario', semestre: 9, fila: 3, uc: 1, prelaciones: [], ucRequeridas: 126 },
  { id: 'elect3', nombre: 'Electiva', semestre: 9, fila: 4, uc: 3, prelaciones: [], ucRequeridas: 90, esElectiva: true },
  { id: 'elect4', nombre: 'Electiva', semestre: 9, fila: 5, uc: 3, prelaciones: [], ucRequeridas: 90, esElectiva: true },
  { id: 'leg_val', nombre: 'Legislación, Valores y Proyecto País', semestre: 9, fila: 9, uc: 2, prelaciones: [] },

  // === SEMESTRE X ===
  { id: 'tap_tesis', nombre: 'TAP Tesis', semestre: 10, fila: 1, uc: 0, prelaciones: [], ucRequeridas: '80%' },
  { id: 'tap_pas', nombre: 'TAP Pasantías', semestre: 10, fila: 2, uc: 0, prelaciones: [], ucRequeridas: '100%' },
]

export const electivasDisponibles = [
  'Redes Neurales y Lógica Difusa',
  'Aprendizaje Automático',
  'Formación de Emprendedores',
  'Introducción a la Inteligencia Artificial',
  'Análisis y Procesamiento de Datos',
  'Introducción a las Telecomunicaciones',
  'Interfaces Digitales Biomédicas',
  'Gestión Tecnológica',
  'Organización',
  'Administración de Base de Datos',
  'Desarrollo de Aplicaciones Web',
  'Gerencia de Proyectos',
  'Administración de Redes',
  'Computación Aplicada a la Psicología'
]

export const materiasNoInformatica = [
  'Computación 2',
  'Computación Aplicada'
]

export const prelacionesPorUC = [
  { uc: 12, materia: 'Inglés 1' },
  { uc: 78, materia: 'Seminario Servicio Comunitario' },
  { uc: 78, materia: 'Proyecto Servicio Comunitario' },
  { uc: 90, materia: 'Electiva' },
  { uc: 100, materia: 'Ecología y Contaminación Ambiental' },
  { uc: 110, materia: 'Metodología de la Investigación' },
  { uc: 126, materia: 'Seminario' },
  { uc: '80%', materia: 'TAP Tesis' },
  { uc: '100%', materia: 'TAP Pasantías' },
]

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
