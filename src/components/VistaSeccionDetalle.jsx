import React, { useState } from 'react'
import { Plus, Minus, CheckCircle, UserX, FileDown, Mail, RefreshCw, ArrowLeft, Users, CheckSquare, Square, Lock, ShieldCheck, Zap, ChevronDown, X as XIcon } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { useInscripcion } from '../context/InscripcionContext'
import { pensumMaterias } from '../data/pensum'

export default function VistaSeccionDetalle({ seccionId, onVolver }) {
  const {
    secciones,
    solicitudes,
    cargarEstudiantesASeccion,
    autocompletarSeccion,
    marcarVerificado,
    marcarNoInscrito,
    agregarFilaCupo,
    rechazarEstudiante,
    resolverChoqueHorario,
    aprobarSeccion,
    generarDatosPrueba
  } = useInscripcion()

  const [selectedRows, setSelectedRows] = useState([])
  const [emailNotice, setEmailNotice] = useState(null)
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [isGenerandoDemo, setIsGenerandoDemo] = useState(false)
  // Índice de la fila cuyo menú de "No se puede inscribir" está desplegado
  const [filaExpandida, setFilaExpandida] = useState(null)

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
    if (seccion?.aprobada) return
    agregarFilaCupo(seccion.id)
  }

  const handleQuitarFila = async () => {
    if (seccion?.aprobada) return
    const capacidadActual = seccion.capacidadMax || seccion.capacidad_max
    if (capacidadActual <= seccion.estudiantes.length) {
      alert('No puedes quitar cupos. Hay estudiantes ocupando todos los cupos actuales.')
      return
    }
    if (capacidadActual <= 1) {
      alert('La capacidad mínima es 1.')
      return
    }
    const { supabase } = await import('../lib/supabase')
    const nuevaCapacidad = capacidadActual - 1
    await supabase.from('secciones').update({ capacidad_max: nuevaCapacidad }).eq('id', seccion.id)
    window.location.reload()
  }

  const handleAprobarSeccion = async () => {
    if (seccion?.aprobada) return
    if (!window.confirm(`¿Estás seguro de APROBAR y CERRAR la Sección ${seccion.seccion} de ${seccion.materia}?\n\n- La sección quedará bloqueada con candado 🔒.\n- Los estudiantes con Choque de Horario (morado) de esta materia volverán a estar 'sin asignar' para ser colocados en otra sección.`)) {
      return
    }

    const res = await aprobarSeccion(seccion.id)
    if (res.success) {
      alert(`¡Sección Aprobada y Bloqueada! 🔒\n\nSe han reseteado ${res.countChoquesReseteados} estudiante(s) con Choque de Horario a estado 'sin asignar' para ser ubicados en otras secciones.`)
    } else {
      alert(res.error || 'Error al aprobar la sección')
    }
  }

  const handleGenerarDatosPrueba = async () => {
    if (!window.confirm(`¿Deseas generar 60 solicitudes ficticias de prueba para "${seccion.materia}"?`)) return
    setIsGenerandoDemo(true)
    const res = await generarDatosPrueba(seccion.materia, 60)
    setIsGenerandoDemo(false)
    if (res.success) {
      alert(`¡Éxito! Se han creado ${res.count} solicitudes de prueba para "${seccion.materia}". Ahora puedes hacer clic en 'Autocompletar Sección'.`)
    } else {
      alert(res.error || 'Error creando datos de prueba')
    }
  }

  // --- Selección Múltiple ---
  const estudiantesValidosIdx = seccion?.estudiantes
    .map((est, index) => est ? index : -1)
    .filter(index => index !== -1) || []

  const handleSelectAll = () => {
    if (estudiantesValidosIdx.length === 0) return
    if (selectedRows.length === estudiantesValidosIdx.length) {
      setSelectedRows([]) // Deseleccionar todos
    } else {
      setSelectedRows(estudiantesValidosIdx) // Seleccionar todos
    }
  }

  const toggleRowSelection = (index, est) => {
    if (!est) return;
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index))
    } else {
      setSelectedRows([...selectedRows, index])
    }
  }
  // -------------------------

  const handleGuardarPDF = () => {
    window.print()
  }

  const handleEnviarCorreo = async () => {
    if (selectedRows.length === 0) {
      alert('Por favor selecciona al menos un estudiante en la tabla para notificarle por correo.')
      return
    }

    if (!window.confirm(`¿Estás seguro de enviar un correo a los ${selectedRows.length} estudiante(s) seleccionado(s)?`)) return;

    setIsSendingEmails(true)
    let enviados = 0;
    const mensaje = `Has sido inscrito correctamente para la materia ${seccion.materia}, sección ${seccion.seccion}, ${seccion.aula}, con el profesor ${seccion.profesor}`

    for (let idx of selectedRows) {
      const est = seccion.estudiantes[idx]
      try {
        await emailjs.send(
          'service_omar_angola',
          'template_UNET',
          {
            destinatario: est.correo,
            mensaje: mensaje,
            message: mensaje,
          },
          'p3KE-_nNVZb3wCTBE'
        )
        enviados++;
      } catch (error) {
        console.error('Error enviando el correo a:', est.correo, error)
      }
    }

    setIsSendingEmails(false)
    setEmailNotice({
      destinatario: `${enviados} estudiante(s)`,
      estudianteNombre: 'Envío Masivo / Múltiple',
      mensaje
    })
    setSelectedRows([]) // Limpiar selección
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Botón Volver */}
      <button 
        onClick={onVolver}
        className="flex items-center text-unet-blue hover:text-blue-800 font-semibold mb-2 transition-colors print:hidden"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Volver al estado de secciones
      </button>

      {/* Título de Impresión */}
      <div className="hidden print:block text-center mb-8">
        <h2 className="text-3xl font-extrabold text-black mb-2">{seccion.materia}</h2>
        <div className="text-gray-700 font-medium text-lg">
          <span>Sección: {seccion.seccion}</span>
          <span className="mx-2">•</span>
          <span>Aula: {seccion.aula}</span>
          <span className="mx-2">•</span>
          <span>Profesor: {seccion.profesor}</span>
        </div>
      </div>

      {/* Encabezado de la Sección (Página 6 del documento PDF) */}
      <div className="bg-gradient-to-r from-unet-blue to-blue-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-extrabold">{seccion.materia}</h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                seccion.modalidad === 'Virtual' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {seccion.modalidad}
              </span>
              {seccion.aprobada && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-sm uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" /> Sección Full Aprobada
                </span>
              )}
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

      {/* Banner de Sección Aprobada */}
      {seccion.aprobada && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center space-x-3 text-amber-900 shadow-sm print:hidden animate-fadeIn">
          <Lock className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-1">
              Sección Full Aprobada (Cerrada)
            </h4>
            <p className="text-xs text-amber-700 font-medium">
              Esta sección está aprobada y bloqueada en modo de solo lectura. Los estudiantes con Choque de Horario de esta materia han sido reseteados a estado sin asignar para ingresar a otras secciones.
            </p>
          </div>
        </div>
      )}

      {/* Botón + para agregar fila/cupo adicional (Página 6 y 7) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-bold text-gray-800">Listado de Inscritos en la Sección</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
            (Haz clic en una fila para seleccionarla)
          </span>
        </div>
        {!seccion.aprobada && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuitarFila}
              title="Quitar un cupo"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow"
            >
              <Minus className="w-4 h-4" />
              <span>Quitar Cupo (-)</span>
            </button>
            <button
              onClick={handleAgregarFila}
              title="Agregar fila para aumentar cupo"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Cupo (+)</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabla de la Sección (Página 6) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-unet-blue print:text-black print:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16 print:hidden cursor-pointer hover:bg-blue-800 transition-colors" onClick={handleSelectAll} title="Seleccionar/Deseleccionar todos">
                  <div className="flex flex-col items-center justify-center gap-1">
                    {estudiantesValidosIdx.length > 0 && selectedRows.length === estudiantesValidosIdx.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span>Sel.</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-12">Nro</th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-4">Cédula</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4 text-center print:hidden">Estudiante</th>
                <th className="py-3.5 px-4 text-center print:hidden">Estado Verificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {Array.from({ length: seccion.capacidadMax }).map((_, index) => {
                const est = seccion.estudiantes[index]
                const isSelected = selectedRows.includes(index)

                return (
                  <tr 
                    key={index}
                    onClick={() => toggleRowSelection(index, est)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100/80 border-l-4 border-unet-blue font-semibold' : 
                      index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-gray-50/50 hover:bg-blue-50/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-unet-blue print:hidden">
                      {est ? (isSelected ? <CheckSquare className="w-5 h-5 mx-auto" /> : <Square className="w-5 h-5 mx-auto text-gray-300" />) : null}
                    </td>
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
                        <td className="py-3 px-4 text-center print:hidden">
                          {(() => {
                            const sol = solicitudes.find(s => s.cedula === est.cedula)
                            const infoMateria = pensumMaterias.find(p => p.nombre === seccion.materia)
                            const uc = infoMateria ? infoMateria.uc : 0

                            if (seccion.aprobada) {
                              return <span className="text-xs text-gray-400 italic">Sección cerrada</span>
                            }

                            // --- Menú desplegado con las 3 razones de rechazo ---
                            if (filaExpandida === index) {
                              return (
                                <div className="flex flex-col items-center gap-1.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-1 flex-wrap justify-center">
                                    <button
                                      onClick={async () => {
                                        if (!sol) return
                                        if (window.confirm(`¿Rechazar a ${est.nombre} por Exceso de UC para materias de ${uc} UC? Se eliminará de esta lista.`)) {
                                          await rechazarEstudiante(sol, [uc], `Rechazado por exceso de UC para materias de ${uc} UC en la materia ${seccion.materia}.`, 'exceso_uc', seccion.id, index)
                                          setFilaExpandida(null)
                                        }
                                      }}
                                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm bg-orange-500 hover:bg-orange-600 transition-all cursor-pointer"
                                      title="Rechazar por Exceso de UC"
                                    >
                                      UC
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm(`¿Rechazar a ${est.nombre} por Bajo Índice para materias de ${uc} UC? Se eliminará de esta lista.`)) {
                                          if (!sol) return
                                          await rechazarEstudiante(sol, [uc], `Rechazado por bajo índice académico para materias de ${uc} UC en la materia ${seccion.materia}.`, 'bajo_indice', seccion.id, index)
                                          setFilaExpandida(null)
                                        }
                                      }}
                                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm bg-red-500 hover:bg-red-600 transition-all cursor-pointer"
                                      title="Rechazar por Bajo Índice"
                                    >
                                      Índice
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm(`¿Marcar a ${est.nombre} con Choque de Horario? Se intentará reubicar automáticamente en otra sección de ${seccion.materia} con cupo disponible.`)) {
                                          const res = await resolverChoqueHorario(seccion.id, index)
                                          setFilaExpandida(null)
                                          if (res.success && res.transferido) {
                                            alert(`${est.nombre} fue transferido automáticamente a la Sección ${res.nuevaSeccion} de ${seccion.materia} (tenía cupo disponible).`)
                                          } else if (res.success) {
                                            alert(`${est.nombre} quedó marcado con Choque de Horario. No hay otra sección de ${seccion.materia} con cupo disponible por ahora; quedará pendiente de reubicación.`)
                                          } else {
                                            alert(res.error || 'Ocurrió un error al resolver el choque de horario.')
                                          }
                                        }
                                      }}
                                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm bg-purple-500 hover:bg-purple-600 transition-all cursor-pointer"
                                      title="Rechazar por Choque de Horario"
                                    >
                                      Choque
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => setFilaExpandida(null)}
                                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
                                  >
                                    <XIcon className="w-3 h-3" /> Cancelar
                                  </button>
                                </div>
                              )
                            }

                            // --- Dos botones principales ---
                            return (
                              <div className="flex flex-col items-stretch gap-1.5 w-32 mx-auto">
                                <button
                                  onClick={(e) => { e.stopPropagation(); marcarVerificado(seccion.id, index); }}
                                  className="inline-flex items-center justify-center py-1.5 px-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow transition-all"
                                  title="Verificado"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verificado
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setFilaExpandida(index); }}
                                  className="inline-flex items-center justify-center py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow transition-all"
                                  title="No se puede inscribir"
                                >
                                  <UserX className="w-3.5 h-3.5 mr-1" /> No se puede <ChevronDown className="w-3 h-3 ml-1" />
                                </button>
                              </div>
                            )
                          })()}
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
                          {est.verificado ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                              Sí, verificado
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
                        <td className="py-3 px-4 text-gray-400 italic font-normal" colSpan={4}>
                          (Cupo disponible - Vacío)
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
                          <span className="text-xs text-gray-400">-</span>
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
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
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-6 print:hidden">
        <h3 className="text-lg font-bold text-unet-blue border-b border-gray-100 pb-2">
          Acciones y Operaciones de la Sección
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Cargar Sección Presencial o Virtual dependiendo de la modalidad */}
          {seccion.modalidad === 'Presencial' ? (
            <button
              onClick={handleCargarPresencial}
              disabled={seccion.aprobada}
              className={`flex flex-col items-center justify-center p-4 text-white rounded-xl shadow-md transition-all font-bold ${
                seccion.aprobada ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              <Users className="w-6 h-6 mb-1" />
              <span>Cargar Sección Presencial</span>
              <span className="text-xs text-blue-200 font-normal">(30 Estudiantes)</span>
            </button>
          ) : (
            <button
              onClick={handleCargarVirtual}
              disabled={seccion.aprobada}
              className={`flex flex-col items-center justify-center p-4 text-white rounded-xl shadow-md transition-all font-bold ${
                seccion.aprobada ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
              }`}
            >
              <Users className="w-6 h-6 mb-1" />
              <span>Cargar Sección Virtual</span>
              <span className="text-xs text-emerald-200 font-normal">(20 Estudiantes)</span>
            </button>
          )}

          {/* Autocompletar Sección */}
          <button
            onClick={handleAutocompletar}
            disabled={seccion.aprobada}
            className={`flex flex-col items-center justify-center p-4 text-white rounded-xl shadow-md transition-all font-bold ${
              seccion.aprobada ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
            }`}
          >
            <RefreshCw className="w-6 h-6 mb-1" />
            <span>Autocompletar Sección</span>
            <span className="text-xs text-indigo-200 font-normal">(Llenar celdas vacías)</span>
          </button>

        </div>

        {/* Botón de Aprobar Sección y Botón de Datos de Prueba */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <button
            onClick={handleAprobarSeccion}
            disabled={seccion.aprobada}
            className={`flex items-center justify-center space-x-2 py-3.5 px-4 font-extrabold rounded-xl shadow-md transition-all ${
              seccion.aprobada
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
            }`}
          >
            {seccion.aprobada ? <Lock className="w-5 h-5 text-amber-700" /> : <ShieldCheck className="w-5 h-5" />}
            <span>{seccion.aprobada ? '🔒 Sección Full Aprobada' : 'Aprobar y Cerrar Sección ✓'}</span>
          </button>

          <button
            onClick={handleGenerarDatosPrueba}
            disabled={isGenerandoDemo}
            className={`flex items-center justify-center space-x-2 py-3.5 px-4 font-extrabold rounded-xl shadow-md transition-all text-white ${
              isGenerandoDemo ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800 hover:shadow-lg'
            }`}
          >
            {isGenerandoDemo ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-yellow-300" />}
            <span>{isGenerandoDemo ? 'Generando...' : '⚡ Generar 60 Datos de Prueba'}</span>
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
            disabled={isSendingEmails}
            className={`flex items-center justify-center space-x-2 py-3 px-4 text-white rounded-xl font-bold shadow transition-all ${
              isSendingEmails ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900'
            }`}
          >
            {isSendingEmails ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            <span>{isSendingEmails ? 'Enviando Correos...' : `Enviar Correo (${selectedRows.length})`}</span>
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
