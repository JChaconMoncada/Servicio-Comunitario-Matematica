import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Carrusel genérico y reutilizable.
 *
 * - Avanza solo cada `intervalo` milisegundos.
 * - El usuario puede desplazarlo manualmente con las flechas o los puntos.
 * - Al interactuar (hover o clic en un control) se pausa el avance automático
 *   para no arrebatarle el control al usuario mientras está leyendo.
 *
 * @param {Array<React.ReactNode>} slides - Contenido de cada lámina.
 * @param {number} intervalo - Milisegundos entre avances automáticos.
 * @param {boolean} mostrarFlechas - Si se muestran las flechas laterales.
 */
export default function Carrusel({ slides, intervalo = 7000, mostrarFlechas = true, className = '' }) {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const total = slides.length
  const timerRef = useRef(null)

  const irA = (idx) => setActual(((idx % total) + total) % total)
  const siguiente = () => irA(actual + 1)
  const anterior = () => irA(actual - 1)

  useEffect(() => {
    if (pausado || total <= 1) return
    timerRef.current = setTimeout(() => {
      setActual(prev => (prev + 1) % total)
    }, intervalo)
    return () => clearTimeout(timerRef.current)
  }, [actual, pausado, total, intervalo])

  if (total === 0) return null

  return (
    <div
      className={`relative px-7 md:px-11 ${className}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Láminas */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${actual * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full flex-shrink-0 px-1">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Flechas laterales (separadas del contenido) */}
      {mostrarFlechas && total > 1 && (
        <>
          <button
            onClick={anterior}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-unet-blue border-2 border-unet-blue/20 shadow-lg flex items-center justify-center hover:bg-unet-blue hover:text-white transition-all z-10 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={siguiente}
            aria-label="Siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-unet-blue text-white shadow-lg flex items-center justify-center hover:bg-unet-lightBlue transition-all z-10 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Puntos de navegación */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => irA(idx)}
              aria-label={`Ir a la lámina ${idx + 1}`}
              className={`rounded-full transition-all ${
                idx === actual
                  ? 'w-3.5 h-3.5 bg-unet-blue'
                  : 'w-3 h-3 bg-unet-blue/30 hover:bg-unet-blue/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
