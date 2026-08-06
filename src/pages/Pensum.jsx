import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, Unlock, BookOpen, GraduationCap, Info, Sparkles, X, Layers } from 'lucide-react'
import Xarrow, { Xwrapper } from 'react-xarrows'
import { pensumMaterias, electivasDisponibles, materiasNoInformatica, prelacionesPorUC, coloresSemestre, semestresLabels } from '../data/pensum'

function Pensum() {
  const [selectedMateria, setSelectedMateria] = useState(null)

  // Agrupar materias por semestre
  const materiasPorSemestre = {}
  for (let i = 1; i <= 10; i++) {
    materiasPorSemestre[i] = pensumMaterias.filter(m => m.semestre === i)
  }

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

  // Renderizar tarjeta de materia
  const MateriaCard = ({ materia }) => {
    const [isHovered, setIsHovered] = useState(false)
    const isSelected = selectedMateria?.id === materia.id
    const color = getColor(materia.semestre)
    const prelNombres = getPrelacionesNombres(materia)
    const tieneReqUC = materia.ucRequeridas
    const esElectiva = materia.esElectiva

    return (
      <div
        id={`materia-${materia.id}`}
        className="relative group cursor-pointer z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setSelectedMateria(materia)}
      >
        <div
          className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
            isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-xl' :
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

        {/* Tooltip al hacer hover (smart position for top row) */}
        {isHovered && (
          <div className={`absolute z-50 left-1/2 -translate-x-1/2 w-56 bg-gray-900 text-white rounded-xl p-3 shadow-2xl text-xs pointer-events-none ${
            materia.fila <= 2 ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}>
            <p className="font-bold text-sm mb-1">{materia.nombre}</p>
            <div className="space-y-1.5 text-gray-300">
              <p><span className="text-white font-semibold">Semestre:</span> {materia.semestre}</p>
              {materia.uc > 0 && <p><span className="text-white font-semibold">UC:</span> {materia.uc}</p>}
              {prelNombres.length > 0 && (
                <div>
                  <span className="text-white font-semibold">Prelaciones:</span>
                  <ul className="mt-0.5 space-y-0.5">
                    {prelNombres.map((p, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {materia.corequisito && (
                <p className="text-cyan-300 text-[11px] font-semibold">
                  * Debe cursarse simultáneamente con {pensumMaterias.find(m => m.id === materia.corequisito)?.nombre}
                </p>
              )}
              {tieneReqUC && (
                <p className="flex items-center gap-1 text-amber-300">
                  <Lock className="w-3 h-3" />
                  Requiere {typeof tieneReqUC === 'string' ? tieneReqUC : `${tieneReqUC} UC aprobadas`}
                </p>
              )}
            </div>
            <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 ${
              materia.fila <= 2 ? '-top-1.5' : '-bottom-1.5'
            }`} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link to="/informatica" className="flex items-center text-unet-blue hover:underline mb-4 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Departamento
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-unet-blue mb-1">
                  Pensum de Ingeniería en Informática
                </h1>
                <p className="text-gray-600 text-sm">
                  Plan de estudios oficial — UNET · Haz clic en una materia para ver detalles
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Requiere UC</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Electiva</span>
              </div>
            </div>
          </div>

          {/* ====== MAPA CURRICULAR - CUADRÍCULA ====== */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-8">
            
            {/* Encabezado de semestres */}
            <div className="overflow-x-auto relative">
              <div className="min-w-[1200px]">
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

                {/* Cuerpo de la cuadrícula */}
                <div className="grid grid-cols-10 gap-0">
                  {Array.from({ length: 10 }).map((_, semIdx) => {
                    const semestre = semIdx + 1
                    const materias = materiasPorSemestre[semestre]
                    return (
                      <div
                        key={semestre}
                        className="border-r border-gray-100 p-2 space-y-4 min-h-[400px] flex flex-col justify-start"
                        style={{ borderLeft: semestre === 1 ? 'none' : undefined }}
                      >
                        {materias.map((mat) => (
                          <MateriaCard key={mat.id} materia={mat} />
                        ))}
                      </div>
                    )
                  })}
                </div>

                {/* Flechas de Prelaciones */}
                {pensumMaterias.map((materia) => {
                  if (!materia.prelaciones || materia.prelaciones.length === 0) return null;
                  return materia.prelaciones.map((preId) => {
                    // Only draw arrow if both the source and target elements exist in the DOM
                    // Since all subjects are rendered, we can safely draw them
                    return (
                      <Xarrow
                        key={`${preId}-${materia.id}`}
                        start={`materia-${preId}`}
                        end={`materia-${materia.id}`}
                        color="#000000" // Negro puro para máxima visibilidad
                        strokeWidth={3.5}
                        path="grid"
                        showHead={true}
                        headSize={4}
                        startAnchor="right"
                        endAnchor="left"
                        curveness={0.8}
                        zIndex={0}
                      />
                    )
                  })
                })}
                </Xwrapper>
              </div>
            </div>
          </div>

          {/* ====== SECCIÓN INFERIOR: Prelaciones UC + Electivas + No-Informática ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Tabla de Prelaciones por UC */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="bg-unet-blue text-white px-5 py-3 font-bold text-sm flex items-center gap-2">
                <Unlock className="w-4 h-4" /> Prelaciones por Unidades Curriculares
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase">
                      <th className="py-2 px-2 text-center">UC</th>
                      <th className="py-2 px-2 text-left">Materia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {prelacionesPorUC.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-2 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-7 bg-unet-blue text-white rounded-md text-xs font-bold">
                            {item.uc}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-800 font-medium text-xs">
                          {item.materia}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Materias Electivas Disponibles */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Materias Electivas Disponibles
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3">
                  Se desbloquean con 90 UC aprobadas. Selecciona hasta 4 durante la carrera.
                </p>
                <div className="space-y-1.5">
                  {electivasDisponibles.map((electiva, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
                    >
                      <span className="w-5 h-5 flex items-center justify-center bg-purple-500 text-white text-[9px] font-bold rounded-full flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-gray-800">{electiva}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Materias que no son de Informática */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 font-bold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Materias Tramitadas en Informática (No son de la carrera)
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3">
                  Estas materias se gestionan a través del Departamento de Informática aunque pertenecen a otras carreras.
                </p>
                <div className="space-y-2">
                  {materiasNoInformatica.map((mat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <GraduationCap className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-800">{mat}</span>
                    </div>
                  ))}
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
          </div>

          {/* CTA */}
          <div className="text-center pb-4">
            <Link to="/inscripcion" className="btn-primary inline-block text-sm">
              Realizar Inscripción Tardía
            </Link>
          </div>

        </div>
      </div>

      {/* ====== MODAL DE DETALLE DE MATERIA ====== */}
      {selectedMateria && (
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
      )}
    </div>
  )
}

export default Pensum
