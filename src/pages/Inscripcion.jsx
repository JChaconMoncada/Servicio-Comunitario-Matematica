import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, FileText, CheckCircle, AlertCircle, BookOpen, Layers } from 'lucide-react'
import { useInscripcion } from '../context/InscripcionContext'
import { pensumMaterias } from '../data/pensum'

function Inscripcion() {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    correo: ''
  })
  
  // Campo de cuántas materias va a solicitar (Página 1 del documento)
  const [cantidadMaterias, setCantidadMaterias] = useState(1)
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([''])
  
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  
  const { inscripcionHabilitada, getMateriasHabilitadas, agregarSolicitud } = useInscripcion()
  const materiasDisponibles = getMateriasHabilitadas()

  const validateEmail = (email) => {
    return email.endsWith('@unet.edu.ve')
  }

  // Obtener todas las prelaciones directas e indirectas de una materia
  const getAllPrelacionesIds = (materiaNombre) => {
    const materiaObj = pensumMaterias.find(p => p.nombre === materiaNombre)
    if (!materiaObj || !materiaObj.prelaciones) return []
    let ids = [...materiaObj.prelaciones]
    materiaObj.prelaciones.forEach(preId => {
      const preObj = pensumMaterias.find(p => p.id === preId)
      if (preObj) {
        ids = [...ids, ...getAllPrelacionesIds(preObj.nombre)]
      }
    })
    return [...new Set(ids)]
  }

  // Validar si entre las materias seleccionadas hay alguna que prela a otra
  const findPrerequisiteConflict = (seleccionadasNombres) => {
    const validas = seleccionadasNombres.filter(m => m && m.trim() !== '')
    for (let materiaNombre of validas) {
      const preIds = getAllPrelacionesIds(materiaNombre)
      const preNombres = preIds.map(id => {
        const obj = pensumMaterias.find(p => p.id === id)
        return obj ? obj.nombre : id
      })
      for (let otraMateria of validas) {
        if (otraMateria !== materiaNombre && preNombres.includes(otraMateria)) {
          return {
            materiaInferior: otraMateria,
            materiaSuperior: materiaNombre
          }
        }
      }
    }
    return null
  }

  const handleCantidadChange = (e) => {
    const num = parseInt(e.target.value) || 1
    const clamped = Math.max(1, Math.min(10, num))
    setCantidadMaterias(clamped)
    
    // Ajustar el arreglo de materias seleccionadas según la nueva cantidad
    setMateriasSeleccionadas(prev => {
      const copy = [...prev]
      if (clamped > copy.length) {
        while (copy.length < clamped) {
          copy.push('')
        }
      } else {
        return copy.slice(0, clamped)
      }
      return copy
    })
  }

  const handleMateriaChange = (index, value) => {
    setMateriasSeleccionadas(prev => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
    if (errors.materias) {
      setErrors(prev => ({ ...prev, materias: '' }))
    }
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
    
    const validas = materiasSeleccionadas.filter(m => m.trim() !== '')
    if (validas.length === 0) {
      newErrors.materias = 'Debe seleccionar al menos una materia'
    } else if (new Set(validas).size !== validas.length) {
      newErrors.materias = 'No debe seleccionar materias duplicadas'
    } else {
      const conflicto = findPrerequisiteConflict(validas)
      if (conflicto) {
        newErrors.materias = `No puedes solicitar "${conflicto.materiaSuperior}" y "${conflicto.materiaInferior}" al mismo tiempo, ya que "${conflicto.materiaInferior}" es prelación de "${conflicto.materiaSuperior}". Solo debes solicitar "${conflicto.materiaInferior}".`
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inscripcionHabilitada) {
      alert('Las inscripciones están deshabilitadas por el administrador.')
      return
    }
    
    if (validateForm()) {
      const validas = materiasSeleccionadas.filter(m => m.trim() !== '')
      const response = await agregarSolicitud({
        nombre: formData.nombre,
        cedula: formData.cedula,
        correo: formData.correo,
        materias: validas
      })
      
      if (response && response.success) {
        setSubmitted(true)
      } else {
        alert(response?.error || 'Ocurrió un error guardando la solicitud.')
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
            <div className="card shadow-xl border-t-4 border-unet-blue">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-unet-blue mb-4">¡Inscripción Tardía Recibida!</h1>
              <p className="text-gray-600 mb-6">
                Tu solicitud ha sido procesada y guardada correctamente en el sistema de la universidad.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left border border-gray-200">
                <h3 className="font-bold text-unet-blue mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" /> Datos del Estudiante:
                </h3>
                <p className="mb-2"><strong>Nombre Completo:</strong> {formData.nombre}</p>
                <p className="mb-2"><strong>Cédula de Identidad:</strong> {formData.cedula}</p>
                <p className="mb-4"><strong>Correo Institucional:</strong> {formData.correo}</p>
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-bold text-unet-blue mb-2 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" /> Materias Solicitadas ({materiasSeleccionadas.filter(Boolean).length}):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {materiasSeleccionadas.filter(Boolean).map((materia, index) => (
                      <li key={index} className="font-medium">{materia}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link to="/informatica" className="btn-primary inline-block">
                Volver al Departamento de Informática
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Encabezado según diseño del documento */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-unet-blue mb-2">Inscripción Tardía</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Completa el formulario para solicitar tu inscripción tardía en el Departamento de Informática
            </p>
          </div>

          {!inscripcionHabilitada && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6 flex items-center shadow">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-red-700 font-medium text-sm md:text-base">
                Las inscripciones están deshabilitadas temporalmente por el departamento.
              </p>
            </div>
          )}

          {/* Formulario Principal (Página 1 del documento PDF) */}
          <div className="card shadow-lg bg-white p-8 rounded-2xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-unet-blue" />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nombre completo"
                  disabled={!inscripcionHabilitada}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Cédula de Identidad */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-unet-blue" />
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.cedula ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu número de cédula (solo números)"
                  disabled={!inscripcionHabilitada}
                />
                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-unet-blue" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-unet-blue focus:border-transparent ${
                    errors.correo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="tu.correo@unet.edu.ve"
                  disabled={!inscripcionHabilitada}
                />
                {errors.correo ? (
                  <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">
                    Solo se aceptan correos institucionales @unet.edu.ve
                  </p>
                )}
              </div>

              {/* REQUERIMIENTO PÁGINA 1: Pregunta y campo de cuántas materias va a solicitar */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <label className="block text-sm font-bold text-unet-blue mb-2 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-unet-blue" />
                  ¿Cuántas materias va a solicitar?
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cantidadMaterias}
                  onChange={handleCantidadChange}
                  className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-gray-300 bg-white font-semibold text-unet-blue focus:ring-2 focus:ring-unet-blue"
                  disabled={!inscripcionHabilitada}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Al cambiar este número se desplegarán los campos necesarios para solicitar todas tus materias en un solo envío.
                </p>
              </div>

              {/* APARTADO: Materia a Inscribir (Generación dinámica de campos) */}
              <div className="space-y-4 pt-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-unet-blue" />
                  Materia(s) a Inscribir:
                </label>

                {materiasSeleccionadas.map((materiaActual, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 sm:w-24">
                      Materia {idx + 1}:
                    </span>
                    <select
                      value={materiaActual}
                      onChange={(e) => handleMateriaChange(idx, e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-unet-blue focus:border-transparent text-sm font-medium"
                      disabled={!inscripcionHabilitada}
                    >
                      <option value="">-- Selecciona una materia --</option>
                      {materiasDisponibles.map((m, mIdx) => (
                        <option key={mIdx} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {errors.materias && (
                  <p className="text-red-500 text-xs mt-1">{errors.materias}</p>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 text-base font-bold shadow-md hover:shadow-lg transition-all"
                  disabled={!inscripcionHabilitada}
                >
                  Enviar Solicitud
                </button>
                <Link
                  to="/informatica"
                  className="btn-secondary flex-1 py-3 text-base font-bold text-center border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Link>
              </div>

            </form>
          </div>

          <div className="mt-8 text-center">
            <Link to="/informatica" className="text-unet-blue font-semibold hover:underline flex items-center justify-center">
              ← Volver al Departamento de Informática
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Inscripcion

