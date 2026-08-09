import React from 'react'
import { X, UserCheck, Mail, CreditCard, BookOpen, AlertTriangle } from 'lucide-react'
import { useInscripcion } from '../context/InscripcionContext'
import { pensumMaterias } from '../data/pensum'

export default function ModalDetalleEstudiante({ estudiante, materiaContext, onClose }) {
  const { rechazarEstudiante } = useInscripcion()
  const [razonRechazo, setRazonRechazo] = React.useState('')
  const [reglaUC, setReglaUC] = React.useState('')
  const [motivoRechazo, setMotivoRechazo] = React.useState('exceso_uc')
  const [procesando, setProcesando] = React.useState(false)

  // Obtener UC de cualquier materia (del pensum o fallback)
  const getUCForMateria = (nombreMateria) => {
    const info = pensumMaterias.find(p => p.nombre === nombreMateria)
    if (info) return info.uc
    if (nombreMateria.includes('Computación 2') || nombreMateria.includes('Computación Aplicada') || nombreMateria.includes('Programación 2') || nombreMateria.includes('Base de Datos')) return 3
    if (nombreMateria.includes('Introducción') || nombreMateria.includes('Efectividad') || nombreMateria.includes('Laboratorio')) return 1
    return 3
  }

  const infoMateriaContext = materiaContext ? pensumMaterias.find(p => p.nombre === materiaContext) : null
  const ucContext = materiaContext ? (infoMateriaContext ? infoMateriaContext.uc : getUCForMateria(materiaContext)) : null

  // Bloquear el scroll de la página de fondo solo mientras el modal esté realmente abierto
  React.useEffect(() => {
    if (!estudiante) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [estudiante])

  if (!estudiante) return null

  const handleRechazar = async () => {
    if (!reglaUC && motivoRechazo === 'exceso_uc') {
      alert("Por favor selecciona una regla de restricción de UC.")
      return
    }
    if (!razonRechazo.trim()) {
      alert("Por favor ingresa una razón para el rechazo que será enviada al estudiante.")
      return
    }

    setProcesando(true)
    let ucsProhibidas = []
    if (motivoRechazo === 'choque_horario' || motivoRechazo === 'bajo_indice' || reglaUC === 'todas') {
      // Para choque de horario, bajo índice o si no le quedan UC, rechazar TODAS las materias
      const todasLasUC = [...new Set(estudiante.materiasSolicitadas.map(m => {
        return getUCForMateria(m.materia)
      }).filter(uc => uc >= 0))]
      ucsProhibidas = todasLasUC
    } else {
      if (reglaUC === '4') ucsProhibidas = [4]
      else if (reglaUC === '3') ucsProhibidas = [3]
      else if (reglaUC === '2') ucsProhibidas = [2]
      else if (reglaUC === '1') ucsProhibidas = [1]
    }

    const result = await rechazarEstudiante(estudiante, ucsProhibidas, razonRechazo, motivoRechazo)
    setProcesando(false)

    if (result.success) {
      alert(`Se han rechazado ${result.count} materia(s) que el estudiante había solicitado y se ha enviado un correo.`)
      setRazonRechazo('')
      setReglaUC('')
    } else {
      alert(result.error || "Ocurrió un error al rechazar las materias.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 transform transition-all">
        
        {/* Header Modal */}
        <div className="bg-unet-blue px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6" />
            <h3 className="text-xl font-bold">Detalle de Estudiante</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-blue-800 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Body Modal */}
          <div className="p-6 space-y-6">
          
          {/* Título de la materia que se está consultando */}
          {materiaContext && (
            <div className="bg-blue-50 border-2 border-unet-blue/30 rounded-xl p-3.5 flex items-center justify-between text-unet-blue shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-unet-blue text-white px-2 py-0.5 rounded">
                  Materia en Consulta
                </span>
                <h4 className="font-extrabold text-sm sm:text-base">{materiaContext}</h4>
              </div>
              {ucContext !== null && (
                <span className="text-xs font-extrabold bg-blue-200 text-blue-900 px-2.5 py-1 rounded-full border border-blue-300">
                  {ucContext} UC
                </span>
              )}
            </div>
          )}

          {/* Avatar and Main Info Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div className="w-16 h-16 flex-shrink-0 rounded-full bg-unet-blue text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {estudiante.nombre.charAt(0)}
            </div>
            <div className="w-full">
              <h4 className="text-lg font-bold text-unet-blue break-words">{estudiante.nombre}</h4>
              <div className="text-sm text-gray-600 space-y-1 mt-1">
                <p className="flex items-center justify-center sm:justify-start flex-wrap">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold mr-1">Cédula:</span> {estudiante.cedula}
                </p>
                <p className="flex items-center justify-center sm:justify-start flex-wrap break-all">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold mr-1">Correo:</span> {estudiante.correo}
                </p>
              </div>
            </div>
          </div>

          {/* Materias Solicitadas Breakdown */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-unet-blue" />
              Materias Solicitadas
            </h5>

            <div className="space-y-2">
              {estudiante.materiasSolicitadas && estudiante.materiasSolicitadas.length > 0 ? (
                estudiante.materiasSolicitadas.map((item, idx) => {
                  const ucMateria = getUCForMateria(item.materia)
                  let badgeColor = 'bg-gray-200 text-gray-800 border-gray-300'
                  let badgeText = 'No se ha asignado sesión aún'

                  if (item.estado === 'verde') {
                    badgeColor = 'bg-green-500 text-white font-bold'
                    badgeText = 'Con Cupo'
                  } else if (item.estado === 'rojo') {
                    badgeColor = 'bg-red-500 text-white font-bold'
                    badgeText = 'Rechazado (Bajo Índice)'
                  } else if (item.estado === 'anaranjado') {
                    badgeColor = 'bg-orange-500 text-white font-bold'
                    badgeText = 'Rechazado (Exceso UC)'
                  } else if (item.estado === 'morado') {
                    badgeColor = 'bg-purple-600 text-white font-bold'
                    badgeText = 'Rechazado (Choque de Horario)'
                  }

                  const esMateriaConsulta = materiaContext === item.materia

                  return (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        esMateriaConsulta ? 'bg-blue-50 border-unet-blue/40 ring-1 ring-unet-blue/30' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">
                          • {item.materia}
                        </span>
                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {ucMateria} UC
                        </span>
                        {esMateriaConsulta && (
                          <span className="text-[10px] font-extrabold bg-unet-blue text-white px-1.5 py-0.5 rounded">
                            En consulta
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full shadow-sm ${badgeColor}`}>
                        ({badgeText})
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500 italic">No tiene materias registradas</p>
              )}
            </div>
          </div>
          </div>

        {/* Sección de Rechazo */}
        <div className="bg-orange-50 p-6 border-t border-orange-100 space-y-4">
          <h5 className="text-sm font-bold text-orange-800 uppercase tracking-wider flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Rechazar Solicitudes
          </h5>
          <p className="text-xs text-orange-700">
            Si el estudiante no cumple con las UC requeridas, puedes bloquear sus solicitudes. Se le enviará un correo automáticamente.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Motivo del rechazo:</label>
              <select 
                value={motivoRechazo} 
                onChange={(e) => setMotivoRechazo(e.target.value)}
                className="w-full text-sm p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="exceso_uc">Exceso de Unidades de Crédito</option>
                <option value="bajo_indice">Bajo Índice</option>
                <option value="choque_horario">Choque de Horario</option>
              </select>
            </div>

            {motivoRechazo === 'exceso_uc' && (() => {
              const opciones = [
                { value: '4', uc: 4, label: 'No puede ver materias de 4 UC' },
                { value: '3', uc: 3, label: 'No puede ver materias de 3 UC' },
                { value: '2', uc: 2, label: 'No puede ver materias de 2 UC' },
                { value: '1', uc: 1, label: 'No puede ver materias de 1 UC' },
                { value: 'todas', uc: null, label: 'No le quedan UC para ver otras materias' },
              ]

              return (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Restricción a aplicar:</label>
                  <select 
                    value={reglaUC} 
                    onChange={(e) => setReglaUC(e.target.value)}
                    className="w-full text-sm p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="">-- Selecciona una restricción --</option>
                    {opciones.map(op => {
                      let isDisabled = false
                      let labelExtra = ''

                      if (op.value !== 'todas') {
                        if (ucContext !== null) {
                          // Si hay materia en consulta, bloquear opciones de UC distintas a ucContext
                          if (op.uc !== ucContext) {
                            isDisabled = true
                            labelExtra = ` (Bloqueado - La materia en consulta es de ${ucContext} UC)`
                          }
                        } else {
                          // Si no hay materiaContext, bloquear UCs que el estudiante no haya solicitado
                          const ucsEstudiante = estudiante.materiasSolicitadas.map(m => getUCForMateria(m.materia))
                          if (!ucsEstudiante.includes(op.uc)) {
                            isDisabled = true
                            labelExtra = ` (Bloqueado - Sin materias de ${op.uc} UC)`
                          }
                        }
                      }

                      return (
                        <option key={op.value} value={op.value} disabled={isDisabled}>
                          {op.label}{labelExtra}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )
            })()}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Razón del rechazo (para el correo):</label>
              <textarea 
                value={razonRechazo}
                onChange={(e) => setRazonRechazo(e.target.value)}
                placeholder="Ej. Según tu expediente, no cuentas con las UC requeridas para inscribir materias de este nivel."
                className="w-full text-sm p-2 border border-orange-200 rounded-lg h-20 resize-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            <button
              onClick={handleRechazar}
              disabled={procesando}
              className={`w-full py-2 font-bold text-white rounded-lg shadow-sm transition-all text-sm ${
                procesando ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:shadow'
              }`}
            >
              {procesando ? 'Procesando y enviando correo...' : 'Rechazar Materias'}
            </button>
          </div>
        </div>

        </div>

        {/* Footer Modal */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  )
}
