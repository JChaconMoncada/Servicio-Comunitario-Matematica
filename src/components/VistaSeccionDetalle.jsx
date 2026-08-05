import React, { useState } from 'react'
import { Plus, CheckCircle, UserX, FileDown, Mail, RefreshCw, ArrowLeft, Users } from 'lucide-react'
import { useInscripcion } from '../context/InscripcionContext'

export default function VistaSeccionDetalle({ seccionId, onVolver }) {
  const {
    secciones,
    cargarEstudiantesASeccion,
    autocompletarSeccion,
    marcarVerificado,
    marcarNoInscrito,
    agregarFilaCupo
  } = useInscripcion()

  const [selectedRow, setSelectedRow] = useState(null)
  const [emailNotice, setEmailNotice] = useState(null)

  const seccion = secciones.find(s => s.id === seccionId)

  if (!seccion) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Sección no encontrada.</p>
        <button onClick={onVolver} className="mt-4 btn-primary">Volver</button>
      </div>
    )
  }

  const handleCargarPresencial = () => {
    cargarEstudiantesASeccion(seccion.id, 30)
  }

  const handleCargarVirtual = () => {
    cargarEstudiantesASeccion(seccion.id, 20)
  }

  const handleAutocompletar = () => {
    autocompletarSeccion(seccion.id)
  }


  const handleAgregarFila = () => {
    agregarFilaCupo(seccion.id)
  }

  const handleGuardarPDF = () => {
    window.print()
  }

  const handleEnviarCorreo = () => {
    if (selectedRow === null || !seccion.estudiantes[selectedRow]) {
      alert('Por favor selecciona un estudiante en la tabla para notificarle por correo.')
      return
    }

    const est = seccion.estudiantes[selectedRow]
    const mensaje = `Has sido inscrito correctamente para la materia ${seccion.materia}, sección ${seccion.seccion}, ${seccion.aula}, con el profesor ${seccion.profesor}`

    setEmailNotice({
      destinatario: est.correo,
      estudianteNombre: est.nombre,
      mensaje
    })
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Botón Volver */}
      <button 
        onClick={onVolver}
        className="flex items-center text-unet-blue hover:text-blue-800 font-semibold mb-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Volver al estado de secciones
      </button>

      {/* Encabezado de la Sección (Página 6 del documento PDF) */}
      <div className="bg-gradient-to-r from-unet-blue to-blue-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-extrabold">{seccion.materia}</h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                seccion.modalidad === 'Virtual' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {seccion.modalidad}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-blue-100 font-medium mt-2">
              <span><strong>Sección:</strong> {seccion.seccion}</span>
              <span>•</span>
              <span><strong>Aula / Lab:</strong> {seccion.aula}</span>
              <span>•</span>
              <span><strong>Profesor:</strong> {seccion.profesor}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
            <Users className="w-6 h-6 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200 uppercase font-bold">Capacidad Actual</p>
              <p className="text-lg font-bold">
                {seccion.estudiantes.length} / {seccion.capacidadMax} Estudiantes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón + para agregar fila/cupo adicional (Página 6 y 7) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-bold text-gray-800">Listado de Inscritos en la Sección</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
            (Haz clic en una fila para seleccionarla)
          </span>
        </div>
        <button
          onClick={handleAgregarFila}
          title="Agregar fila para aumentar cupo"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Cupo (+)</span>
        </button>
      </div>

      {/* Tabla de la Sección (Página 6) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-unet-blue text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Nro</th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-4">Cédula</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4 text-center">Estudiante</th>
                <th className="py-3.5 px-4 text-center">Estado Verificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {Array.from({ length: seccion.capacidadMax }).map((_, index) => {
                const est = seccion.estudiantes[index]
                const isSelected = selectedRow === index

                return (
                  <tr 
                    key={index}
                    onClick={() => setSelectedRow(index)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100/80 border-l-4 border-unet-blue font-semibold' : 
                      index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-gray-50/50 hover:bg-blue-50/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-bold text-gray-500">
                      {index + 1}
                    </td>

                    {est ? (
                      <>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {est.nombre}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {est.cedula}
                        </td>
                        <td className="py-3 px-4 text-unet-blue underline">
                          {est.correo}
                        </td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); marcarVerificado(seccion.id, index); }}
                            className="inline-flex items-center justify-center py-1 px-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold shadow transition-all"
                            title="Inscrito"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Inscrito
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if(window.confirm('¿Deseas marcar que no se pudo inscribir y eliminarlo de la lista?')) {
                                marcarNoInscrito(seccion.id, index); 
                              }
                            }}
                            className="inline-flex items-center justify-center py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow transition-all"
                            title="No se pudo inscribir"
                          >
                            <UserX className="w-3 h-3 mr-1" /> No inscrito
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {est.verificado ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                              Sí, verificado (Verde)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-gray-400 italic font-normal" colSpan={3}>
                          (Cupo disponible - Vacío)
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs text-gray-400">-</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs text-gray-400">-</span>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botonera de Acciones (Página 6 y Página 7 del documento PDF) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-6">
        <h3 className="text-lg font-bold text-unet-blue border-b border-gray-100 pb-2">
          Acciones y Operaciones de la Sección
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Cargar Sección Presencial (30 Estudiantes) */}
          <button
            onClick={handleCargarPresencial}
            className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all font-bold hover:shadow-lg"
          >
            <Users className="w-6 h-6 mb-1" />
            <span>Cargar Sección Presencial</span>
            <span className="text-xs text-blue-200 font-normal">(30 Estudiantes)</span>
          </button>

          {/* Cargar Sección Virtual (20 Estudiantes) */}
          <button
            onClick={handleCargarVirtual}
            className="flex flex-col items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all font-bold hover:shadow-lg"
          >
            <Users className="w-6 h-6 mb-1" />
            <span>Cargar Sección Virtual</span>
            <span className="text-xs text-emerald-200 font-normal">(20 Estudiantes)</span>
          </button>

          {/* Autocompletar Sección */}
          <button
            onClick={handleAutocompletar}
            className="flex flex-col items-center justify-center p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all font-bold hover:shadow-lg"
          >
            <RefreshCw className="w-6 h-6 mb-1" />
            <span>Autocompletar Sección</span>
            <span className="text-xs text-indigo-200 font-normal">(Llenar celdas vacías)</span>
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-2">

          {/* Botón Guardar PDF */}
          <button
            onClick={handleGuardarPDF}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold shadow transition-all"
          >
            <FileDown className="w-5 h-5" />
            <span>Guardar PDF</span>
          </button>

          {/* Botón Enviar Correo */}
          <button
            onClick={handleEnviarCorreo}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold shadow transition-all"
          >
            <Mail className="w-5 h-5" />
            <span>Enviar Correo</span>
          </button>

        </div>

      </div>

      {/* Modal / Toast emergente de confirmación de envío de Correo */}
      {emailNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 text-left animate-fadeIn">
            <div className="flex items-center space-x-3 mb-4 text-unet-blue">
              <Mail className="w-7 h-7" />
              <h4 className="text-xl font-bold">Correo Enviado al Estudiante</h4>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-2 mb-6">
              <p><strong>Destinatario:</strong> {emailNotice.destinatario}</p>
              <p><strong>Estudiante:</strong> {emailNotice.estudianteNombre}</p>
              <div className="mt-3 pt-3 border-t border-gray-200 text-gray-700 font-medium">
                <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Mensaje enviado:</p>
                <p className="italic bg-white p-3 rounded border border-gray-200">
                  "{emailNotice.mensaje}"
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setEmailNotice(null)}
                className="btn-primary py-2 px-6"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
