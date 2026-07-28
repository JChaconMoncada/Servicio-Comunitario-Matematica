# UNET - Sistema de Inscripciones Tardías - Informática

Sistema web para el manejo de inscripciones tardías del Departamento de Informática de la UNET.

## Características

- 🎨 Diseño moderno con los colores oficiales de la UNET
- 📱 Diseño responsivo (desktop y móvil)
- 🏠 Página de inicio con selección de departamentos
- 💻 Página específica para el Departamento de Informática
- 📚 Listado completo de todas las materias del departamento
- 🔒 Información de requisitos y contacto

## Tecnologías Utilizadas

- **React 18** - Framework de JavaScript
- **Vite** - Herramienta de construcción
- **TailwindCSS** - Framework de CSS
- **React Router** - Enrutamiento
- **Lucide React** - Iconos

## Colores Oficiales UNET

- **Azul Principal**: #003366
- **Azul Claro**: #0056b3
- **Dorado**: #FFD700
- **Blanco**: #FFFFFF
- **Gris**: #F5F5F5
- **Oscuro**: #1a1a2e

## Instalación

### Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Abrir el navegador en `http://localhost:5173`

## Estructura del Proyecto

```
src/
├── components/
│   ├── Header.jsx      # Encabezado de navegación
│   └── Footer.jsx      # Pie de página
├── pages/
│   ├── Home.jsx        # Página de inicio
│   └── Informatica.jsx # Página del departamento
├── data/
│   └── subjects.js     # Lista de materias
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## Materias Incluidas

El sistema incluye todas las materias del Departamento de Informática:
- Introducción a la Ingeniería en Informática
- Computación 1, 2
- Programación 1, 2
- Estructura de Datos
- Bases de Datos 1, 2
- Sistemas Operativos
- Ingeniería de Software
- Inteligencia Artificial
- Y muchas más...

## Desarrollo

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza la construcción de producción

## Personalización

### Cambiar Colores

Los colores se configuran en `tailwind.config.js`:

```javascript
colors: {
  unet: {
    blue: '#003366',
    lightBlue: '#0056b3',
    gold: '#FFD700',
    // ...
  }
}
```

### Agregar Nuevas Materias

Editar el archivo `src/data/subjects.js` y agregar las materias al array.

## Contacto

Para cualquier pregunta o sugerencia, contactar al Departamento de Informática de la UNET.

---

© 2024 UNET - Todos los derechos reservados
