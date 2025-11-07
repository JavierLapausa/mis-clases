# Mis Clases - Gestión de Clases con Control de Pagos

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat&logo=css3&logoColor=white)  
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Una aplicación web completa para gestionar clases particulares con seguimiento automático de pagos. Sin dependencias externas, funciona completamente offline.

## ✨ Características

- 📋 **Gestión completa de clases** - Crear, editar, eliminar y organizar
- 💳 **Control automático de pagos** - Estados automáticos (pendiente, vencido, pagado)  
- 🗓️ **Calendario intuitivo** - Vistas mensual, semanal y diaria
- 📊 **Estadísticas detalladas** - Análisis de ingresos y rendimiento
- 🎨 **Indicadores visuales** - Códigos de color para estados de pago
- 📱 **Totalmente responsivo** - Optimizado para móviles
- 🔒 **Privacidad total** - Todos los datos se guardan localmente
- ⚡ **Sin servidor** - Funciona sin conexión a internet

## 🚀 Inicio Rápido

### Instalación
1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/mis-clases.git
cd mis-clases
```

2. Abre `index.html` en tu navegador
3. ¡Empieza a gestionar tus clases!

### Uso Online
También puedes usar la aplicación directamente desde GitHub Pages: [Demo en vivo](https://tu-usuario.github.io/mis-clases)

## 📱 Navegación Principal

La aplicación tiene 4 secciones principales:

### 📋 **Lista** - Gestión de Clases
- **Ver todas tus clases** organizadas por fecha (más recientes primero)
- **Filtrar por estudiante** usando la barra de búsqueda
- **Filtrar por estado de pago** (Todos, Pagado, Pendiente, Vencido)
- **Indicadores visuales** de estado de pago en cada clase

### 🗓️ **Calendario** - Vista Temporal
- **Vista Mensual**: Ver todas las clases del mes con hora
- **Vista Semanal**: Detalle de la semana actual
- **Vista Diaria**: Al hacer clic en un día específico
- **Colores por estado**: Verde (pagado), Amarillo (pendiente), Rojo (vencido)

### 💳 **Pagos** - Control Financiero  
- **Vista dedicada** para gestionar todos los pagos
- **Filtros rápidos**: Todos, Pendientes, Vencidos, Pagados
- **Filtro por mes** para análisis temporal
- **Estadísticas en tiempo real** de estado de pagos

### 📊 **Stats** - Estadísticas
- **Ingresos del mes** (solo clases pagadas)
- **Número de estudiantes** únicos
- **Total de clases** impartidas
- **Promedio por clase**
- **Top estudiantes** por ingresos
- **Gráfico de estado de pagos**

## ➕ Gestionar Clases

### Crear Nueva Clase
1. Haz clic en **"+ Nueva Clase"** (en Lista) o en un día del calendario
2. Completa los datos:
   - **Estudiante**: Nombre del alumno
   - **Fecha y Hora**: Cuándo es la clase  
   - **Precio**: Importe de la clase
   - **Estado de Pago**: Pendiente (por defecto) o Pagado
   - **Observaciones**: Notas adicionales (opcional)
3. Clic en **"Guardar"**

### Editar Clase Existente
1. Haz clic en el icono **✏️ (Editar)** en cualquier clase
2. Modifica los datos necesarios
3. Clic en **"Guardar"**

### Eliminar Clase
1. Haz clic en el icono **🗑️ (Eliminar)** en cualquier clase
2. Confirma la eliminación

## 💰 Gestionar Pagos

### Estados Automáticos de Pago
- **🟢 Pagado**: Clase marcada manualmente como pagada
- **🟡 Pendiente**: Clase sin pagar dentro de los 7 días posteriores
- **🔴 Vencido**: Clase sin pagar después de 7 días

### Marcar como Pagado
1. Haz clic en el botón **€** junto a una clase pendiente/vencida
2. En el modal de pago:
   - **Fecha de Pago**: Por defecto hoy, puedes cambiarla
   - **Método de Pago**: Efectivo, Transferencia, Tarjeta, Bizum, Otro
   - **Notas**: Información adicional (opcional)
3. Clic en **"Confirmar Pago"**

### Marcar como Pendiente
1. En una clase pagada, haz clic en **🔄 (Marcar Pendiente)**
2. La clase vuelve a estado pendiente/vencido según corresponda

### Filtrar Pagos
En la pestaña **Pagos**:
- **Todos**: Muestra todas las clases
- **Pendientes**: Solo clases sin pagar dentro de plazo
- **Vencidos**: Solo clases sin pagar fuera de plazo  
- **Pagados**: Solo clases con pago confirmado
- **Por Mes**: Selecciona un mes específico

## 📈 Tipos de Pago por Timing

Cuando una clase está pagada, se clasifica automáticamente:

- **⬆️ Adelantado**: Pagado antes de la fecha de clase
- **✅ Normal**: Pagado dentro de los 7 días posteriores a la clase
- **⬇️ Atrasado**: Pagado después de 7 días de la clase

## 📊 Interpretar Estadísticas

### Cabecera (siempre visible)
- **€**: Ingresos reales del período (solo clases pagadas)
- **Clases**: Número de clases del período
- **⚠️**: Total de pagos pendientes + vencidos

### Vista Estadísticas
- **Gráfico de barras**: Distribución porcentual de estados de pago
- **Top Estudiantes**: Ranking por ingresos generados
- **Métricas generales**: Resúmenes mensuales y promedios

## 🔄 Flujo de Trabajo Recomendado

### Planificación Semanal
1. Ve al **Calendario** → Vista Semanal
2. Revisa las clases de la semana
3. Agrega nuevas clases haciendo clic en días vacíos

### Control Diario
1. Revisa el número de **⚠️ Pendientes** en la cabecera
2. Ve a **Pagos** para gestionar cobros
3. Marca como pagados los recibidos

### Análisis Mensual  
1. Ve a **Stats** para revisar el rendimiento
2. Usa filtros en **Pagos** para análisis por mes
3. Identifica patrones de pago de estudiantes

## 💡 Consejos de Uso

### Organización
- **Nombra estudiantes consistentemente** (ej: "Juan Pérez", no "juan" o "Juanito")
- **Marca pagos inmediatamente** al recibirlos para mantener estadísticas actualizadas
- **Usa las observaciones** para notas importantes (material necesario, cambios de horario, etc.)

### Seguimiento
- **Revisa semanalmente** la pestaña Pagos para identificar cobros pendientes
- **Usa los filtros** para análisis específicos (ej: pagos de octubre)
- **Observa los indicadores de color** en el calendario para una vista rápida

### Análisis
- **Compara meses** usando el filtro por mes en la vista Pagos
- **Identifica estudiantes regulares** en el Top Estudiantes
- **Revisa patrones** de adelantos/atrasos en pagos

## 🔒 Datos y Privacidad

- **Almacenamiento local**: Todos los datos se guardan en tu navegador
- **Sin envío externo**: La información no se comparte con ningún servidor
- **Backup manual**: Para respaldar, exporta/importa desde las herramientas del navegador
- **Compatibilidad**: Funciona sin conexión a internet

## 📱 Dispositivos Móviles

La aplicación está optimizada para móviles:
- **Navegación táctil** intuitiva
- **Diseño responsivo** que se adapta a pantallas pequeñas  
- **Formularios optimizados** para teclados móviles
- **Iconos grandes** para fácil navegación

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Almacenamiento**: LocalStorage API
- **Iconos**: Font Awesome 6.0
- **Sin dependencias**: No requiere frameworks ni librerías externas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

¡Gestiona tus clases de manera eficiente y mantén un control perfecto de tus ingresos! 🎓💰