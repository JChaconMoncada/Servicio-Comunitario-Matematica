import React from 'react'
import { X, UserCheck, Mail, CreditCard, BookOpen } from 'lucide-react'

export default function ModalDetalleEstudiante({ estudiante, onClose }) {
  if (!estudiante) return null

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
                    badgeText = 'Sin Cupo'
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
