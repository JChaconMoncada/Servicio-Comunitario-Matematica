import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Settings, BarChart3, Users, BookOpen, ToggleLeft, ToggleRight, 
  AlertCircle, CheckCircle, Lock, LogOut, Search, PlusCircle, 
  Calendar, ChevronRight, Eye, Grid, FileSpreadsheet
} from 'lucide-react'
import { informaticaSubjects } from '../data/subjects'
import { useInscripcion } from '../context/InscripcionContext'
import ModalDetalleEstudiante from '../components/ModalDetalleEstudiante'
import VistaSeccionDetalle from '../components/VistaSeccionDetalle'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Pestaña o vista activa en el panel admin:
  // 'panel' | 'hojas_calculo' | 'listado_materia' | 'crear_secciones' | 'estado_sesiones' | 'detalle_seccion'
  const [activeTab, setActiveTab] = useState('panel')

  // Estado para la materia seleccionada en la vista de listado general
  const [materiaSeleccionadaDetalle, setMateriaSeleccionadaDetalle] = useState('Programación I')

  // Estado para el modal de detalle de estudiante
  const [estudianteModal, setEstudianteModal] = useState(null)

  // Estado para la sección seleccionada en vista de detalle de sección
  const [seccionSeleccionadaId, setSeccionSeleccionadaId] = useState(null)

  // Buscador y filtros para Vista de Estado de Sesiones (Página 5)
  const [searchMateria, setSearchMateria] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('Todas') // 'Todas' | 'Presenciales' | 'Virtuales'
  const [paginaActual, setPaginaActual] = useState(1)

  // Formulario para Crear Sección (Página 4)
  const [formSeccionPresencial, setFormSeccionPresencial] = useState({
    materia: informaticaSubjects[0],
    seccion: '01',
    aula: '15C',
    profesor: 'Desiree Suarez'
  })

  const [formSeccionVirtual, setFormSeccionVirtual] = useState({
    materia: informaticaSubjects[0],
    seccion: '10',
    aula: 'Aula Virtual 1',
    profesor: 'Miguel Urbina'
  })

  const { 
    periodoActivo,
    setPeriodoActivo,
    inscripcionHabilitada, 
    toggleInscripciones, 
    materiasHabilitadas, 
    toggleMateria,
    solicitudes,
    secciones,
    crearSeccion
  } = useInscripcion()

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true)
      setLoginError('')
    } else {
      setLoginError('Usuario o contraseña incorrectos')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  const materiasDisponiblesCount = Object.values(materiasHabilitadas).filter(Boolean).length

  // Manejo de creación de sección presencial
  const handleCrearPresencial = (e) => {
    e.preventDefault()
    crearSeccion({
      ...formSeccionPresencial,
      modalidad: 'Presencial'
    })
    alert(`Sección Presencial ${formSeccionPresencial.seccion} de ${formSeccionPresencial.materia} creada con éxito (30 cupos).`)
  }

  // Manejo de creación de sección virtual
  const handleCrearVirtual = (e) => {
    e.preventDefault()
    crearSeccion({
      ...formSeccionVirtual,
      modalidad: 'Virtual'
    })
    alert(`Sección Virtual ${formSeccionVirtual.seccion} de ${formSeccionVirtual.materia} creada con éxito (20 cupos).`)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="card shadow-xl bg-white p-8 rounded-2xl border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-unet-blue rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold text-unet-blue mb-2">Acceso Administrativo</h1>
                <p className="text-gray-600 text-sm">
                  Departamento de Informática - UNET
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent text-sm"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent text-sm"
                    placeholder="admin123"
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs font-semibold">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full py-3 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Iniciar Sesión
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/" className="text-sm text-unet-blue hover:underline font-semibold">
                  ← Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filtrado de secciones para la Vista de Estado de las Sesiones (Página 5)
  const seccionesFiltradas = secciones.filter(sec => {
    const coincideBusqueda = sec.materia.toLowerCase().includes(searchMateria.toLowerCase())
    if (filtroModalidad === 'Presenciales') return coincideBusqueda && sec.modalidad === 'Presencial'
    if (filtroModalidad === 'Virtuales') return coincideBusqueda && sec.modalidad === 'Virtual'
    return coincideBusqueda
  })

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header del Panel con Logout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-extrabold text-unet-blue">Panel de Administrador</h1>
                <span className="bg-blue-100 text-unet-blue text-xs px-3 py-1 rounded-full font-bold">
                  UNET
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Gestiona el sistema de inscripciones tardías del Departamento de Informática
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-4 py-2 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm self-start md:self-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>

          {/* Menú Superior de Navegación de Vistas del Administrador (Navegación del Documento) */}
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('panel')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'panel'
                  ? 'bg-unet-blue text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" /> Control General
            </button>

            <button
              onClick={() => setActiveTab('hojas_calculo')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'hojas_calculo' || activeTab === 'listado_materia'
                  ? 'bg-unet-blue text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Inscriptos por Materias
            </button>

            <button
              onClick={() => setActiveTab('crear_secciones')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'crear_secciones'
                  ? 'bg-unet-blue text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Crear Secciones
            </button>

            <button
              onClick={() => setActiveTab('estado_sesiones')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'estado_sesiones' || activeTab === 'detalle_seccion'
                  ? 'bg-unet-blue text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4 mr-2" /> Estado de las Sesiones
            </button>
          </div>

          {/* VISTA 1: CONTROL GENERAL / PANEL PRINCIPAL (Página 2) */}
          {activeTab === 'panel' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* REQUERIMIENTO PÁGINA 2: Control de Periodos (Semestre / Intensivo) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-8 h-8 text-unet-blue" />
                    <div>
                      <h2 className="text-xl font-bold text-unet-blue">Periodo Académico de Inscripciones</h2>
                      <p className="text-gray-600 text-sm">
                        Indica qué semestre o intensivo están solicitando los estudiantes (datos separados por periodo)
                      </p>
                    </div>
                  </div>

                  <select
                    value={periodoActivo}
                    onChange={(e) => setPeriodoActivo(e.target.value)}
                    className="px-4 py-3 font-bold text-unet-blue bg-blue-50 border-2 border-unet-blue rounded-xl focus:ring-2 focus:ring-unet-blue text-sm"
                  >
                    <option value="Semestre 2026-1">Semestre 2026-1</option>
                    <option value="Semestre 2026-2">Semestre 2026-2</option>
                    <option value="Intensivo 2026">Intensivo 2026</option>
                  </select>
                </div>
              </div>

              {/* REQUERIMIENTO PÁGINA 2: Control de Inscripciones (Habilita y Deshabilita) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="w-8 h-8 text-unet-blue mr-4" />
                    <div>
                      <h2 className="text-2xl font-bold text-unet-blue">Control de Inscripciones</h2>
                      <p className="text-gray-600 text-sm">
                        {inscripcionHabilitada 
                          ? 'Las inscripciones están actualmente HABILITADAS para los estudiantes' 
                          : 'Las inscripciones están actualmente DESHABILITADAS'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleInscripciones}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all shadow ${
                      inscripcionHabilitada
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {inscripcionHabilitada ? (
                      <>
                        <ToggleRight className="w-6 h-6 mr-2" />
                        Habilitadas
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 mr-2" />
                        Deshabilitadas
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!inscripcionHabilitada && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-center shadow-sm">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">
                    Los estudiantes no podrán enviar solicitudes mientras el sistema esté deshabilitado.
                  </p>
                </div>
              )}

              {/* Estadísticas del Panel (Página 2) */}
              <div>
                <h2 className="text-2xl font-bold text-center mb-6 text-unet-blue">Estadísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="card text-center bg-white p-6 rounded-2xl shadow border border-gray-200">
                    <Users className="w-12 h-12 text-unet-blue mx-auto mb-3" />
                    <div className="text-4xl font-extrabold text-unet-blue mb-1">
                      {solicitudes.length}
                    </div>
                    <div className="text-gray-600 text-sm font-semibold">Total de Inscritos ({periodoActivo})</div>
                  </div>

                  <div className="card text-center bg-white p-6 rounded-2xl shadow border border-gray-200">
                    <BookOpen className="w-12 h-12 text-unet-blue mx-auto mb-3" />
                    <div className="text-4xl font-extrabold text-unet-blue mb-1">
                      {materiasDisponiblesCount}
                    </div>
                    <div className="text-gray-600 text-sm font-semibold">Materias Habilitadas</div>
                  </div>
                </div>
              </div>

              {/* REQUERIMIENTO PÁGINA 2: Control de Disponibilidad de Materias */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-unet-blue mb-2">Control de Disponibilidad de Materias</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Habilita o deshabilita las materias disponibles para la inscripción tardía
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {informaticaSubjects.map((materia, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        materiasHabilitadas[materia]
                          ? 'border-green-500 bg-green-50/50 hover:bg-green-50'
                          : 'border-red-300 bg-red-50/40 opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => toggleMateria(materia)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-gray-800">{materia}</span>
                        {materiasHabilitadas[materia] ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        <span>
                          {solicitudes.filter(s => s.materiasSolicitadas.some(m => m.materia === materia)).length} solicitudes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VISTA 2: CONTROL DE INSCRIPTOS POR MATERIAS - HOJAS DE CÁLCULO (Página 2 & Página 3) */}
          {(activeTab === 'hojas_calculo' || activeTab === 'listado_materia') && (
            <div className="space-y-8 animate-fadeIn">
              
              {activeTab === 'hojas_calculo' ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-unet-blue">Control de Inscriptos por Materias</h2>
                    <p className="text-gray-600 text-sm">
                      Previsualización en formato de hoja de cálculo de los primeros 10 estudiantes por materia. Haz clic en una tabla para abrir el listado completo.
                    </p>
                  </div>

                  {/* Grilla de Hojas de Cálculo por Materia (Vista de Página 2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {["Programación I", "Sistemas Distribuidos", "Compiladores e Intérpretes", "Matemática Discreta"].map((materiaNombre, idx) => {
                      const filtrados = solicitudes.filter(s => s.materiasSolicitadas.some(m => m.materia === materiaNombre))
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            setMateriaSeleccionadaDetalle(materiaNombre)
                            setActiveTab('listado_materia')
                          }}
                          className="bg-white rounded-2xl border border-gray-300 shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:border-unet-blue transition-all group"
                        >
                          <div className="bg-unet-blue px-4 py-3 text-white flex justify-between items-center">
                            <h3 className="font-extrabold text-base">{materiaNombre}</h3>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold group-hover:bg-white group-hover:text-unet-blue transition-colors">
                              Ver Completo →
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                                <tr>
                                  <th className="py-2 px-3">Nro</th>
                                  <th className="py-2 px-3">Nombre</th>
                                  <th className="py-2 px-3">Cédula</th>
                                  <th className="py-2 px-3">Correo Electrónico</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {filtrados.slice(0, 6).map((est, eIdx) => (
                                  <tr key={eIdx} className="hover:bg-blue-50/50">
                                    <td className="py-2 px-3 font-semibold text-gray-500">{eIdx + 1}</td>
                                    <td className="py-2 px-3 font-medium text-gray-900 truncate max-w-[120px]">{est.nombre}</td>
                                    <td className="py-2 px-3 text-gray-700">{est.cedula}</td>
                                    <td className="py-2 px-3 text-unet-blue truncate max-w-[140px]">{est.correo}</td>
                                  </tr>
                                ))}
                                {filtrados.length === 0 && (
                                  <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-400 italic">
                                      Sin solicitudes registradas
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* VISTA COMPLETA DE LISTADO GENERAL POR MATERIA (Página 3 y Página 4 top) */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('hojas_calculo')}
                      className="text-unet-blue hover:underline font-bold text-sm flex items-center"
                    >
                      ← Volver al control de hojas de cálculo
                    </button>
                    <span className="text-xs bg-blue-100 text-unet-blue font-bold px-3 py-1 rounded-full">
                      Materia: {materiaSeleccionadaDetalle}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-unet-blue text-white p-5">
                      <h3 className="text-2xl font-extrabold text-center">
                        Vista Completa: {materiaSeleccionadaDetalle}
                      </h3>
                      <p className="text-center text-xs text-blue-100 mt-1">
                        Estudiantes que solicitaron cupo en esta materia
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-blue-50 text-unet-blue font-bold border-b border-gray-200">
                          <tr>
                            <th className="py-3.5 px-4 text-center w-16">Nro</th>
                            <th className="py-3.5 px-4">Nombre</th>
                            <th className="py-3.5 px-4">Cédula</th>
                            <th className="py-3.5 px-4">Correo Electrónico</th>
                            <th className="py-3.5 px-4 text-center">Estado</th>
                            <th className="py-3.5 px-4 text-center">Detalle de Estudiante</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {solicitudes
                            .filter(s => s.materiasSolicitadas.some(m => m.materia === materiaSeleccionadaDetalle))
                            .map((sol, index) => {
                              const matObj = sol.materiasSolicitadas.find(m => m.materia === materiaSeleccionadaDetalle)
                              const estado = matObj ? matObj.estado : 'gris'

                              return (
                                <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                                  <td className="py-3 px-4 text-center font-bold text-gray-500">{index + 1}</td>
                                  <td className="py-3 px-4 font-semibold text-gray-900">{sol.nombre}</td>
                                  <td className="py-3 px-4 text-gray-700">{sol.cedula}</td>
                                  <td className="py-3 px-4 text-unet-blue underline">{sol.correo}</td>
                                  
                                  {/* Columna Estado (Página 4: Verde=Asignado sin problema, Rojo=Choque/Sin cupo, Gris=Pendiente) */}
                                  <td className="py-3 px-4 text-center">
                                    {estado === 'verde' && (
                                      <span className="w-6 h-6 rounded-full bg-green-500 inline-block shadow-sm" title="Asignado a sección disponible"></span>
                                    )}
                                    {estado === 'rojo' && (
                                      <span className="w-6 h-6 rounded-full bg-red-500 inline-block shadow-sm" title="Choque de horario o sin cupo"></span>
                                    )}
                                    {estado === 'gris' && (
                                      <span className="w-6 h-6 rounded-full bg-gray-300 inline-block shadow-sm" title="Sin asignar aún"></span>
                                    )}
                                  </td>

                                  {/* Columna Detalle de Estudiante (Icono modal emergente - Página 4) */}
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      onClick={() => setEstudianteModal(sol)}
                                      className="p-2 bg-blue-100 text-unet-blue rounded-xl hover:bg-unet-blue hover:text-white transition-all shadow-sm"
                                      title="Ver detalle del estudiante"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VISTA 3: CONTROL Y CREACIÓN DE SECCIONES (Página 4 Bottom) */}
          {activeTab === 'crear_secciones' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-unet-blue">Control y Creación de Secciones</h2>
                <p className="text-gray-600 text-sm">
                  Crea secciones presenciales (30 cupos) o virtuales (20 cupos) para el departamento
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Formulario Sección Presencial (Azul) - Página 4 */}
                <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-lg overflow-hidden">
                  <div className="bg-blue-600 text-white p-4 font-bold text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" /> Formulario Sección Presencial (Azul) - (30 Cupos)
                  </div>
                  <form onSubmit={handleCrearPresencial} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la materia</label>
                      <select
                        value={formSeccionPresencial.materia}
                        onChange={(e) => setFormSeccionPresencial({ ...formSeccionPresencial, materia: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {informaticaSubjects.map((m, i) => (
                          <option key={i} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Modalidad</label>
                      <input
                        type="text"
                        value="Presencial"
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-bold text-blue-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sección</label>
                      <input
                        type="text"
                        value={formSeccionPresencial.seccion}
                        onChange={(e) => setFormSeccionPresencial({ ...formSeccionPresencial, seccion: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Ej. 01, 04, 15"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Aula o Laboratorio</label>
                      <input
                        type="text"
                        value={formSeccionPresencial.aula}
                        onChange={(e) => setFormSeccionPresencial({ ...formSeccionPresencial, aula: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Ej. 15C, Lab 3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Profesor</label>
                      <input
                        type="text"
                        value={formSeccionPresencial.profesor}
                        onChange={(e) => setFormSeccionPresencial({ ...formSeccionPresencial, profesor: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Nombre del profesor"
                      />
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all">
                      Crear Sección Presencial
                    </button>
                  </form>
                </div>

                {/* Formulario Sección Virtual (Verde) - Página 4 */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-lg overflow-hidden">
                  <div className="bg-emerald-600 text-white p-4 font-bold text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" /> Formulario Sección Virtual (Verde) - (20 Cupos)
                  </div>
                  <form onSubmit={handleCrearVirtual} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la materia</label>
                      <select
                        value={formSeccionVirtual.materia}
                        onChange={(e) => setFormSeccionVirtual({ ...formSeccionVirtual, materia: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {informaticaSubjects.map((m, i) => (
                          <option key={i} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Modalidad</label>
                      <input
                        type="text"
                        value="Virtual"
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-bold text-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sección</label>
                      <input
                        type="text"
                        value={formSeccionVirtual.seccion}
                        onChange={(e) => setFormSeccionVirtual({ ...formSeccionVirtual, seccion: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Ej. 10, 12"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Aula Virtual</label>
                      <input
                        type="text"
                        value={formSeccionVirtual.aula}
                        onChange={(e) => setFormSeccionVirtual({ ...formSeccionVirtual, aula: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Ej. Aula Virtual 1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Profesor</label>
                      <input
                        type="text"
                        value={formSeccionVirtual.profesor}
                        onChange={(e) => setFormSeccionVirtual({ ...formSeccionVirtual, profesor: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
                        placeholder="Nombre del profesor"
                      />
                    </div>

                    <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all">
                      Crear Sección Virtual
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* VISTA 4: VISTA DEL ESTADO DE LAS SESIONES (Página 5) */}
          {activeTab === 'estado_sesiones' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-unet-blue">Vista del Estado de las Sesiones</h2>
                <p className="text-gray-600 text-sm">
                  Explora las secciones creadas por buscador y filtro de modalidad. Haz clic en una sección para gestionarla.
                </p>
              </div>

              {/* Buscador de Materias (Página 5) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <label className="block text-sm font-bold text-gray-700">Buscador de materias</label>
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={searchMateria}
                    onChange={(e) => setSearchMateria(e.target.value)}
                    placeholder="Buscar materia por nombre..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-unet-blue text-sm"
                  />
                </div>

                {/* Filtro por Modalidad: Todas, Presenciales, Virtuales (Página 5) */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Modalidad</label>
                  <div className="flex gap-3">
                    {['Todas', 'Presenciales', 'Virtuales'].map((mod, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFiltroModalidad(mod)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                          filtroModalidad === mod
                            ? mod === 'Presenciales' 
                              ? 'bg-blue-600 text-white border-blue-600 shadow'
                              : mod === 'Virtuales'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                              : 'bg-gray-700 text-white border-gray-700 shadow'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grilla de Tarjetas de Secciones (Página 5) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seccionesFiltradas.map((sec) => (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setSeccionSeleccionadaId(sec.id)
                      setActiveTab('detalle_seccion')
                    }}
                    className={`bg-white rounded-2xl border-2 shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all group ${
                      sec.modalidad === 'Virtual' ? 'border-emerald-400' : 'border-blue-400'
                    }`}
                  >
                    <div className={`p-4 text-white font-bold flex justify-between items-start ${
                      sec.modalidad === 'Virtual' ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}>
                      <div>
                        <h4 className="text-base leading-tight font-extrabold">{sec.materia}</h4>
                        <div className="text-xs text-white/90 font-medium mt-1">
                          Seccion:{sec.seccion} | {sec.aula} | Prof: {sec.profesor}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="p-3">
                      <table className="w-full text-left text-xs">
                        <thead className="text-gray-500 font-bold border-b border-gray-100">
                          <tr>
                            <th className="py-1 px-2">Nro</th>
                            <th className="py-1 px-2">Nombre</th>
                            <th className="py-1 px-2">Cédula</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sec.estudiantes.slice(0, 5).map((e, ei) => (
                            <tr key={ei} className="hover:bg-gray-50">
                              <td className="py-1.5 px-2 font-bold text-gray-400">{e.nro}</td>
                              <td className="py-1.5 px-2 font-medium text-gray-800 truncate max-w-[100px]">{e.nombre}</td>
                              <td className="py-1.5 px-2 text-gray-600">{e.cedula}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 text-center text-xs font-bold text-unet-blue pt-2 border-t border-gray-100">
                        Ver sección completa ({sec.estudiantes.length} / {sec.capacidadMax})
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginador (Página 5) */}
              <div className="flex justify-center space-x-2 pt-4">
                {[1, 2, 3, 4, 5].map((pag) => (
                  <button
                    key={pag}
                    onClick={() => setPaginaActual(pag)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm border ${
                      paginaActual === pag
                        ? 'bg-unet-blue text-white border-unet-blue shadow'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 5: DETALLE OPERATIVO DE SECCIÓN (Página 6 & Página 7) */}
          {activeTab === 'detalle_seccion' && seccionSeleccionadaId && (
            <VistaSeccionDetalle
              seccionId={seccionSeleccionadaId}
              onVolver={() => setActiveTab('estado_sesiones')}
            />
          )}

        </div>
      </div>

      {/* Modal Emergente de Detalle de Estudiante (Página 4 Top) */}
      <ModalDetalleEstudiante
        estudiante={estudianteModal}
        onClose={() => setEstudianteModal(null)}
      />
    </div>
  )
}

export default Admin

