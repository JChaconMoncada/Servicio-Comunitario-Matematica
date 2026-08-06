import React from 'react'
import { X, UserCheck, Mail, CreditCard, BookOpen, AlertTriangle } from 'lucide-react'
import { useInscripcion } from '../context/InscripcionContext'
import { pensumMaterias } from '../data/pensum'

export default function ModalDetalleEstudiante({ estudiante, onClose }) {
  const { rechazarEstudiante } = useInscripcion()
  const [razonRechazo, setRazonRechazo] = React.useState('')
  const [reglaUC, setReglaUC] = React.useState('')
  const [motivoRechazo, setMotivoRechazo] = React.useState('exceso_uc')
  const [procesando, setProcesando] = React.useState(false)

  if (!estudiante) return null

  const handleRechazar = async () => {
    if (!reglaUC && motivoRechazo !== 'choque_horario') {
      alert("Por favor selecciona una regla de restricción de UC.")
      return
    }
    if (!razonRechazo.trim()) {
      alert("Por favor ingresa una razón para el rechazo que será enviada al estudiante.")
      return
    }

    setProcesando(true)
    let ucsProhibidas = []
    if (motivoRechazo === 'choque_horario') {
      // Para choque de horario, rechazar TODAS las materias solicitadas
      const todasLasUC = [...new Set(estudiante.materiasSolicitadas.map(m => {
        const info = pensumMaterias.find(p => p.nombre === m.materia)
        return info ? info.uc : -1
      }).filter(uc => uc >= 0))]
      ucsProhibidas = todasLasUC
    } else {
      if (reglaUC === '4') ucsProhibidas = [4]
      else if (reglaUC === '3_y_4') ucsProhibidas = [3, 4]
      else if (reglaUC === '2_3_y_4') ucsProhibidas = [2, 3, 4]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all">
        
        {/* Header Modal */}
        <div className="bg-unet-blue px-6 py-4 flex justify-between items-center text-white">
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

        {/* Body Modal */}
        <div className="p-6 space-y-6">
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

          {/* Materias Solicitadas Breakdown (Página 4 del documento PDF) */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-unet-blue" />
              Materias Solicitadas
            </h5>

            <div className="space-y-2">
              {estudiante.materiasSolicitadas && estudiante.materiasSolicitadas.length > 0 ? (
                estudiante.materiasSolicitadas.map((item, idx) => {
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

                  return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-800">
                        • {item.materia}
                      </span>
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

        {/* Sección de Rechazo (Nueva Funcionalidad) */}
        <div className="bg-orange-50 p-6 border-t border-orange-100 space-y-4">
          <h5 className="text-sm font-bold text-orange-800 uppercase tracking-wider flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Rechazar Solicitudes
          </h5>
          <p className="text-xs text-orange-700">
            Si el estudiante no cumple con las UC requeridas, puedes bloquear sus solicitudes para materias pesadas. Se le enviará un correo automáticamente.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Motivo del rechazo:</label>
              <select 
                value={motivoRechazo} 
                onChange={(e) => setMotivoRechazo(e.target.value)}
                className="w-full text-sm p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="exceso_uc">Exceso de Unidades de Crédito (Anaranjado)</option>
                <option value="bajo_indice">Bajo Índice (Rojo)</option>
                <option value="choque_horario">Choque de Horario (Morado)</option>
              </select>
            </div>

            {motivoRechazo !== 'choque_horario' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Restricción a aplicar:</label>
              <select 
                value={reglaUC} 
                onChange={(e) => setReglaUC(e.target.value)}
                className="w-full text-sm p-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Selecciona una restricción --</option>
                <option value="4">No puede ver materias de 4 UC</option>
                <option value="3_y_4">No puede ver materias de 3 y 4 UC</option>
                <option value="2_3_y_4">No puede ver materias de 2, 3 y 4 UC</option>
              </select>
            </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Razón del rechazo (para el correo):</label>
              <textarea 
                value={razonRechazo}
                onChange={(e) => setRazonRechazo(e.target.value)}
                placeholder="Ej. Según tu expediente, no cuentas con las UC requeridas para inscribir materias de este nivel."
                className="w-full text-sm p-2 border border-orange-200 rounded-lg h-20 resize-none focus:ring-2 focus:ring-orange-500"
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

        {/* Footer Modal */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
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
