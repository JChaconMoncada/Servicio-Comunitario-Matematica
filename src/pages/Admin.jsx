import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, BarChart3, Users, BookOpen, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Lock, LogOut } from 'lucide-react'
import { informaticaSubjects } from '../data/subjects'
import { useInscripcion } from '../context/InscripcionContext'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [estadisticas] = useState({
    totalInscripciones: 45
  })
  
  const { 
    inscripcionHabilitada, 
    toggleInscripciones, 
    materiasHabilitadas, 
    toggleMateria,
    estudiantesPorMateria
  } = useInscripcion()

  const handleLogin = (e) => {
    e.preventDefault()
    // Credenciales hardcoded (en producción deberían estar en backend)
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="card">
              <div className="text-center mb-8">
                <Lock className="w-16 h-16 text-unet-blue mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-unet-blue mb-4">Acceso Administrativo</h1>
                <p className="text-gray-600">
                  Ingresa tus credenciales para acceder al panel de administración
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent"
                    placeholder="Ingresa tu usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent"
                    placeholder="Ingresa tu contraseña"
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Iniciar Sesión
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/" className="text-unet-blue hover:underline">
                  ← Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-unet-blue mb-2">Panel de Administrador</h1>
              <p className="text-gray-600">
                Gestiona el sistema de inscripciones tardías del Departamento de Informática
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>

          {/* Control de Inscripciones */}
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-unet-blue mr-4" />
                <div>
                  <h2 className="text-2xl font-bold text-unet-blue">Control de Inscripciones</h2>
                  <p className="text-gray-600">
                    {inscripcionHabilitada 
                      ? 'Las inscripciones están habilitadas' 
                      : 'Las inscripciones están deshabilitadas'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleInscripciones}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  inscripcionHabilitada
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {inscripcionHabilitada ? (
                  <>
                    <ToggleRight className="w-5 h-5 mr-2" />
                    Habilitadas
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 mr-2" />
                    Deshabilitadas
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alerta cuando está deshabilitado */}
          {!inscripcionHabilitada && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <p className="text-red-700">
                Los estudiantes no pueden realizar inscripciones mientras el sistema esté deshabilitado.
              </p>
            </div>
          )}

          {/* Estadísticas */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-unet-blue">Estadísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="card text-center">
                <Users className="w-12 h-12 text-unet-blue mx-auto mb-4" />
                <div className="text-4xl font-bold text-unet-blue mb-2">
                  {estadisticas.totalInscripciones}
                </div>
                <div className="text-gray-600">Total de Inscritos</div>
              </div>

              <div className="card text-center">
                <BookOpen className="w-12 h-12 text-unet-blue mx-auto mb-4" />
                <div className="text-4xl font-bold text-unet-blue mb-2">
                  {materiasDisponiblesCount}
                </div>
                <div className="text-gray-600">Materias Habilitadas</div>
              </div>
            </div>
          </div>

          {/* Control de Materias */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-unet-blue mb-6">Habilitar/Deshabilitar Materias</h2>
            <p className="text-gray-600 mb-6">
              Selecciona las materias que estarán disponibles para inscripción tardía
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {informaticaSubjects.map((materia, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    materiasHabilitadas[materia]
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-300 bg-red-50 opacity-60'
                  }`}
                  onClick={() => toggleMateria(materia)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{materia}</span>
                    {materiasHabilitadas[materia] ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{estudiantesPorMateria[materia]} estudiantes necesitan esta materia</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="card">
            <h2 className="text-2xl font-bold text-unet-blue mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/informatica"
                className="flex items-center justify-center p-4 border-2 border-unet-blue rounded-lg hover:bg-unet-blue hover:text-white transition-all"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Ver Departamento
              </Link>
              <Link
                to="/pensum"
                className="flex items-center justify-center p-4 border-2 border-unet-blue rounded-lg hover:bg-unet-blue hover:text-white transition-all"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Ver Pensum
              </Link>
              <Link
                to="/inscripcion"
                className="flex items-center justify-center p-4 border-2 border-unet-blue rounded-lg hover:bg-unet-blue hover:text-white transition-all"
              >
                <Users className="w-5 h-5 mr-2" />
                Ver Formulario
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-unet-blue hover:underline">
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
