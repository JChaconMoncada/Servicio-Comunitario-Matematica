import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, Unlock, BookOpen, GraduationCap, Info, Sparkles, X, Layers } from 'lucide-react'
import Xarrow, { Xwrapper } from 'react-xarrows'
import { pensumMaterias, electivasDisponibles, materiasNoDepartamento, prelacionesPorUC, coloresSemestre, semestresLabels } from '../data/pensum'

// Obtener prelaciones de una materia (nombres)
const getPrelacionesNombres = (materia) => {
  if (!materia.prelaciones || materia.prelaciones.length === 0) return []
  return materia.prelaciones.map(preId => {
    const pre = pensumMaterias.find(m => m.id === preId)
    return pre ? pre.nombre : preId
  })
}

// Color por semestre
const getColor = (semestre) => coloresSemestre[semestre] || '#6b7280'

// Tarjeta de materia. Se define FUERA de Pensum para que React conserve la
// misma identidad de componente entre renders: si se definiera dentro de
// Pensum, cada re-render (p. ej. al abrir el modal) crearía una función
// nueva y forzaría el desmontaje/remontaje de todas las tarjetas, haciendo
// que react-xarrows perdiera las referencias de los elementos y las
// flechas desaparecieran.
function MateriaCard({ materia, isSelected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)
  const color = getColor(materia.semestre)
  const tieneReqUC = materia.ucRequeridas
  const esElectiva = materia.esElectiva

  return (
    <div
      id={`materia-${materia.id}`}
      className="relative group cursor-pointer z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(materia)}
    >
      <div
        className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-xl' :
            isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm hover:shadow-md'
          }`}
        style={{ borderColor: color }}
      >
        {/* Barra superior de color */}
        <div
          className="px-2 py-1 text-white text-[10px] font-bold flex items-center justify-between"
          style={{ backgroundColor: color }}
        >
          <span>{materia.uc > 0 ? `${materia.uc} UC` : ''}</span>
          {tieneReqUC && (
            <span className="flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" />
              {typeof tieneReqUC === 'string' ? tieneReqUC : `${tieneReqUC} UC`}
            </span>
          )}
          {esElectiva && <Sparkles className="w-2.5 h-2.5" />}
        </div>
        {/* Cuerpo */}
        <div className="px-2 py-1.5 bg-white min-h-[36px] flex items-center">
          <p className="text-[11px] font-semibold text-gray-800 leading-tight">
            {materia.nombre}
          </p>
        </div>
      </div>
    </div>
  )
}

function Pensum() {
  const [selectedMateria, setSelectedMateria] = useState(null)

  // Agrupar materias por semestre
  const materiasPorSemestre = {}
  for (let i = 1; i <= 10; i++) {
    materiasPorSemestre[i] = pensumMaterias.filter(m => m.semestre === i)
  }

  // Cantidad máxima de filas usadas en todo el pensum (para definir las filas del grid CSS)
  const MAX_FILA = Math.max(...pensumMaterias.map(m => m.fila))

  return (
    <>
      <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="mb-6">
            <Link to="/" className="flex items-center text-unet-blue hover:underline mb-4 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Departamento
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-unet-blue mb-1">
                  Pensum del Departamento de Matemática y Física
                </h1>
                <p className="text-gray-600 text-sm">
                  Plan de estudios oficial — UNET · Haz clic en una materia para ver detalles
                </p>
              </div>
            </div>
          </div>

          {/* ====== MAPA CURRICULAR - CUADRÍCULA ====== */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-8">

            {/* Encabezado de semestres */}
            <div className="overflow-x-auto relative">
              <div className="min-w-[1200px] relative">
                <Xwrapper>
                  <div className="grid grid-cols-10 border-b border-gray-200">
                    {semestresLabels.map((label, idx) => (
                      <div
                        key={idx}
                        className="py-3 px-2 text-center text-white font-bold text-xs"
                        style={{ backgroundColor: coloresSemestre[idx + 1] }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Cuerpo de la cuadrícula: cada columna usa CSS Grid con filas explícitas
                    basadas en materia.fila, para que materias relacionadas por prelación
                    queden alineadas horizontalmente entre semestres (igual que el flujograma oficial) */}
                  <div className="grid grid-cols-10 gap-x-2">
                    {Array.from({ length: 10 }).map((_, semIdx) => {
                      const semestre = semIdx + 1
                      const materias = materiasPorSemestre[semestre]
                      return (
                        <div
                          key={semestre}
                          className="border-r border-gray-100 p-2 grid"
                          style={{
                            borderLeft: semestre === 1 ? 'none' : undefined,
                            gridTemplateRows: `repeat(${MAX_FILA}, minmax(48px, auto))`,
                            rowGap: '20px'
                          }}
                        >
                          {materias.map((mat) => (
                            <div key={mat.id} style={{ gridRow: mat.fila, alignSelf: 'center' }}>
                              <MateriaCard materia={mat} isSelected={selectedMateria?.id === mat.id} onSelect={setSelectedMateria} />
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>

                  {/* Flechas de Prelaciones */}
                  {pensumMaterias.map((materia) => {
                    if (!materia.prelaciones || materia.prelaciones.length === 0) return null;
                    return materia.prelaciones.map((preId) => {
                      const preObj = pensumMaterias.find(m => m.id === preId)
                      const mismaFila = preObj && preObj.fila === materia.fila

                      // Cuando ambas materias están en la misma fila, la flecha es una línea recta
                      // horizontal simple. Si están en filas distintas, se ancla por arriba/abajo
                      // para que el tramo vertical viaje por el espacio vacío entre tarjetas
                      // (rowGap) en vez de atravesar otras materias.
                      // Color de la flecha según el semestre de la materia de origen (la prelación),
                      // así se distingue visualmente de dónde viene cada línea.
                      const colorFlecha = preObj ? getColor(preObj.semestre) : '#334155'

                      return (
                        <Xarrow
                          key={`${preId}-${materia.id}`}
                          start={`materia-${preId}`}
                          end={`materia-${materia.id}`}
                          color={colorFlecha}
                          strokeWidth={2}
                          path={mismaFila ? 'straight' : 'grid'}
                          showHead={true}
                          headSize={3.5}
                          startAnchor="right"
                          endAnchor="left"
                          curveness={mismaFila ? 0 : 0.6}
                          zIndex={0}
                        />
                      )
                    })
                  })}
                </Xwrapper>
              </div>
            </div>
          </div>


            {/* Info Importante */}
            <div className="border-t border-gray-200 p-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Información Relevante
              </h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-unet-blue mt-1 flex-shrink-0" />
                  <a href="http://www.unet.edu.ve/institucion/historia.html" target="_blank" rel="noreferrer" className="text-unet-blue hover:underline">
                    Historia UNET
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-unet-blue mt-1 flex-shrink-0" />
                  <a href="https://controlestudio.unet.edu.ve/campus/matricula/pensum.php" target="_blank" rel="noreferrer" className="text-unet-blue hover:underline">
                    Consulta Índice — Control de Estudios
                  </a>
                </li>
              </ul>
            </div>
        </div>

        {/* CTA */}
        <div className="text-center pb-4">
          <Link to="/inscripcion" className="btn-primary inline-block text-sm">
            Realizar Inscripción Tardía
          </Link>
        </div>

      </div>
    </div>

      {/* ====== MODAL DE DETALLE DE MATERIA ====== */ }
  {
    selectedMateria && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={() => setSelectedMateria(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-gray-100 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 text-white flex justify-between items-center"
            style={{ backgroundColor: getColor(selectedMateria.semestre) }}
          >
            <div>
              <h3 className="text-lg font-bold leading-tight">{selectedMateria.nombre}</h3>
              <p className="text-xs text-white/80 mt-0.5">Semestre {selectedMateria.semestre}</p>
            </div>
            <button
              onClick={() => setSelectedMateria(null)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">

            {selectedMateria.uc > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-semibold text-gray-700">Unidades de Crédito (UC)</span>
                <span className="text-2xl font-extrabold text-unet-blue">{selectedMateria.uc}</span>
              </div>
            )}

            {selectedMateria.ucRequeridas && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Requisito de UC</p>
                  <p className="text-xs text-amber-700">
                    Necesitas {typeof selectedMateria.ucRequeridas === 'string' ? selectedMateria.ucRequeridas : `${selectedMateria.ucRequeridas} UC aprobadas`} para cursar esta materia
                  </p>
                </div>
              </div>
            )}

            {getPrelacionesNombres(selectedMateria).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Prelaciones (debes aprobar primero):</h4>
                <div className="space-y-1.5">
                  {getPrelacionesNombres(selectedMateria).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getPrelacionesNombres(selectedMateria).length === 0 && !selectedMateria.ucRequeridas && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                <Unlock className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">Esta materia no tiene prelaciones</p>
              </div>
            )}

            {selectedMateria.esElectiva && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-800">Esta es una materia electiva — escoge entre las disponibles</p>
              </div>
            )}

            {selectedMateria.corequisito && (
              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-200">
                <Layers className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <p className="text-sm font-medium text-cyan-800">
                  Debe cursarse simultáneamente con {pensumMaterias.find(m => m.id === selectedMateria.corequisito)?.nombre}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
            <button
              onClick={() => setSelectedMateria(null)}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }
    </>
  )
}

export default Pensum
