import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useInscripcion } from '../context/InscripcionContext'

function Inscripcion() {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    correo: '',
    materia: ''
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  
  const { inscripcionHabilitada, getMateriasHabilitadas } = useInscripcion()
  const materiasDisponibles = getMateriasHabilitadas()

  const validateEmail = (email) => {
    return email.endsWith('@unet.edu.ve')
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre completo es requerido'
    }
    
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida'
    } else if (!/^\d+$/.test(formData.cedula)) {
      newErrors.cedula = 'La cédula debe contener solo números'
    }
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido'
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = 'El correo debe ser del dominio @unet.edu.ve'
    }
    
    if (!formData.materia) {
      newErrors.materia = 'Debe seleccionar una materia'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!inscripcionHabilitada) {
      alert('Las inscripciones están deshabilitadas por el administrador.')
      return
    }
    
    if (validateForm()) {
      console.log('Formulario enviado:', formData)
      setSubmitted(true)
      // Aquí se enviaría la data al backend
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-unet-blue mb-4">¡Inscripción Exitosa!</h1>
              <p className="text-gray-600 mb-6">
                Tu solicitud de inscripción tardía ha sido recibida. Recibirás una confirmación en tu correo electrónico.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-bold text-unet-blue mb-4">Detalles de la inscripción:</h3>
                <p><strong>Nombre:</strong> {formData.nombre}</p>
                <p><strong>Cédula:</strong> {formData.cedula}</p>
                <p><strong>Correo:</strong> {formData.correo}</p>
                <p><strong>Materia:</strong> {formData.materia}</p>
              </div>
              <Link to="/informatica" className="btn-primary inline-block">
                Volver al Departamento
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-unet-blue mb-4">Inscripción Tardía</h1>
            <p className="text-gray-600">
              Completa el formulario para solicitar tu inscripción tardía en el Departamento de Informática
            </p>
          </div>

          {!inscripcionHabilitada && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <p className="text-red-700">
                Las inscripciones están deshabilitadas temporalmente. Contacte al administrador.
              </p>
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nombre completo"
                  disabled={!inscripcionHabilitada}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.cedula ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu número de cédula (solo números)"
                  disabled={!inscripcionHabilitada}
                />
                {errors.cedula && (
                  <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.correo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="tu.correo@unet.edu.ve"
                  disabled={!inscripcionHabilitada}
                />
                {errors.correo && (
                  <p className="text-red-500 text-sm mt-1">{errors.correo}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Solo se aceptan correos institucionales @unet.edu.ve
                </p>
              </div>

              {/* Selección de Materia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Materia a Inscribir
                </label>
                <select
                  name="materia"
                  value={formData.materia}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.materia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!inscripcionHabilitada}
                >
                  <option value="">Selecciona una materia</option>
                  {materiasDisponibles.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {errors.materia && (
                  <p className="text-red-500 text-sm mt-1">{errors.materia}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={!inscripcionHabilitada}
                >
                  Enviar Solicitud
                </button>
                <Link
                  to="/informatica"
                  className="btn-secondary flex-1 inline-block text-center"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link to="/informatica" className="text-unet-blue hover:underline">
              ← Volver al Departamento de Informática
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inscripcion
