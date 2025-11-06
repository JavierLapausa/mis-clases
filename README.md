# 📚 Mis Clases - PWA para Seguimiento de Estudiantes

Una aplicación web progresiva (PWA) moderna para profesores y tutores que permite llevar un seguimiento completo de las clases impartidas, incluyendo estudiantes, horarios, precios y observaciones.

## ✨ Características

### 🎯 Funcionalidades principales
- **Gestión completa de clases**: Añadir, editar, eliminar y buscar clases
- **Calendario visual**: Vista mensual con todas las clases
- **Estadísticas detalladas**: Ingresos, top estudiantes, promedios
- **Búsqueda rápida**: Filtrar clases por nombre de estudiante
- **Almacenamiento local**: Datos seguros en tu dispositivo
- **Funciona offline**: Sin necesidad de internet constante

### 📱 Tecnología PWA
- **Instalable**: Se instala como app nativa en iPhone, Android y escritorio
- **Responsive**: Perfecta en móvil, tablet y ordenador
- **Offline**: Funciona sin conexión a internet
- **Rápida**: Carga instantánea desde cache
- **Actualizaciones automáticas**: Se actualiza sola

## 🚀 Instalación Rápida

### Opción 1: Usar desde GitHub Pages (Recomendado)

1. **Subir a GitHub:**
   - Crea un repositorio en GitHub llamado `mis-clases`
   - Sube todos los archivos del proyecto
   - Ve a Settings → Pages → Source: Deploy from a branch → main
   - Tu app estará en: `https://tu-usuario.github.io/mis-clases`

2. **Instalar en dispositivos:**
   - **iPhone/iPad**: Safari → Compartir → Agregar a pantalla de inicio
   - **Android**: Chrome → Menú → Instalar aplicación
   - **Escritorio**: Chrome → Instalar → Crear acceso directo

### Opción 2: Usar localmente

1. **Descargar archivos** en una carpeta
2. **Abrir terminal** en esa carpeta
3. **Ejecutar servidor local:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (si tienes npx)
   npx http-server
   ```
4. **Abrir en navegador:** `http://localhost:8000`

## 📝 Uso de la Aplicación

### ➕ Agregar una nueva clase

1. Toca el botón **"+ Nueva Clase"**
2. Completa la información:
   - **Estudiante**: Nombre del alumno
   - **Fecha**: Día de la clase
   - **Hora**: Hora de inicio
   - **Precio**: Coste en euros
   - **Observaciones**: Notas adicionales (opcional)
3. Toca **"Guardar"**

### ✏️ Editar una clase existente

1. En la lista de clases, toca el **icono de edición** (lápiz)
2. Modifica los campos necesarios
3. Toca **"Guardar"**

### 🗑️ Eliminar una clase

1. En la lista de clases, toca el **icono de papelera**
2. Confirma la eliminación

### 📅 Ver calendario

1. Toca **"Calendario"** en la navegación inferior
2. Navega entre meses con las flechas
3. Las clases aparecen como pequeñas tarjetas en cada día
4. Toca un día para agregar una clase rápidamente

### 📊 Ver estadísticas

1. Toca **"Stats"** en la navegación inferior
2. Ve información como:
   - Ingresos del mes actual
   - Número total de estudiantes
   - Promedio por clase
   - Top 5 estudiantes por ingresos

### 🔍 Buscar clases

1. En la vista de lista, usa la **barra de búsqueda**
2. Escribe el nombre del estudiante
3. Los resultados se filtran automáticamente

## 🎨 Personalización

### Cambiar moneda

En el archivo `app.js`, busca las líneas con `€` y cámbialas por tu moneda:

```javascript
// Cambiar de euros a dólares
Text: "€" → "$"
// O pesos mexicanos
Text: "€" → "$"
// O tu moneda local
```

### Modificar colores

En el archivo `styles.css`, cambia las variables de color:

```css
:root {
    --primary-color: #2563eb;     /* Color principal */
    --success-color: #059669;     /* Color de éxito */
    --danger-color: #dc2626;      /* Color de peligro */
    /* ... más colores */
}
```

### Cambiar hora por defecto

En `app.js`, busca la función `limpiarFormulario()` y modifica:

```javascript
if (horaInput) horaInput.value = '10:00'; // Cambiar hora
```

## 📱 Crear Iconos

### Método 1: Generar online
1. Ve a [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator)
2. Sube una imagen cuadrada (mínimo 512x512px)
3. Descarga el pack de iconos
4. Reemplaza los archivos `icon-*.png`

### Método 2: Crear manualmente
Necesitas estos tamaños:
- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

## 🔧 Configuración Avanzada

### Cambiar información de la app

En `manifest.json`:

```json
{
  "name": "Tu Nombre de App",
  "short_name": "Tu App",
  "description": "Tu descripción",
  "theme_color": "#tu-color"
}
```

### Habilitar notificaciones

Para agregar recordatorios (requiere servidor):

1. Modificar `sw.js` para manejar notificaciones
2. Pedir permisos en `app.js`:

```javascript
// Pedir permiso para notificaciones
if ('Notification' in window) {
    Notification.requestPermission();
}
```

## 💾 Backup y Restauración

### Hacer backup manual

```javascript
// Ejecutar en consola del navegador (F12)
const datos = {
    clases: JSON.parse(localStorage.getItem('misClases') || '[]'),
    fecha: new Date().toISOString()
};
console.log('Backup:', JSON.stringify(datos));
// Copiar y guardar el resultado
```

### Restaurar backup

```javascript
// En consola del navegador
const backup = `TU_BACKUP_AQUÍ`;
localStorage.setItem('misClases', JSON.stringify(JSON.parse(backup).clases));
location.reload(); // Recargar página
```

## 🌐 Subir a GitHub Pages

### Paso a paso:

1. **Crear repositorio en GitHub**
   - Ve a [github.com](https://github.com)
   - Clic en "New repository"
   - Nombre: `mis-clases` (o el que prefieras)
   - Público o privado (tu elección)
   - Crear repositorio

2. **Subir archivos**
   ```bash
   git clone https://github.com/TU-USUARIO/mis-clases.git
   cd mis-clases
   # Copiar todos los archivos de la app aquí
   git add .
   git commit -m "Primera versión de Mis Clases PWA"
   git push origin main
   ```

3. **Activar GitHub Pages**
   - En GitHub: Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. **Acceder a tu app**
   - URL: `https://TU-USUARIO.github.io/mis-clases`
   - Puede tardar unos minutos en estar disponible

### Actualizaciones

Para actualizar la app:

```bash
# Hacer cambios en los archivos
git add .
git commit -m "Actualización: descripción de cambios"
git push origin main
# GitHub Pages se actualiza automáticamente
```

## 🔍 Solución de Problemas

### La app no se instala

- **Safari (iOS)**: Debe abrirse en Safari, no en otros navegadores
- **Chrome**: Busca el ícono de instalación en la barra de direcciones
- **Verifica HTTPS**: GitHub Pages usa HTTPS automáticamente

### Los datos se pierden

- Los datos se guardan en `localStorage` del navegador
- **Backup regular**: Exporta tus datos periódicamente
- **No borrar datos del navegador** de la app

### La app no funciona offline

- Asegúrate de que el Service Worker esté registrado
- Abre Developer Tools → Application → Service Workers
- Debe aparecer registrado y activado

### Errores de JavaScript

1. Abre Developer Tools (F12)
2. Ve a Console
3. Busca errores en rojo
4. Verifica que todos los archivos se carguen correctamente

## 📈 Futuras Mejoras

Ideas para expandir la app:

- [ ] **Sincronización en la nube** (Google Drive, Dropbox)
- [ ] **Recordatorios automáticos** (notificaciones push)
- [ ] **Múltiples profesores** (sistema de usuarios)
- [ ] **Reportes avanzados** (gráficos, tendencias)
- [ ] **Exportar a PDF** (facturas, reportes)
- [ ] **Integración con calendario** (Google Calendar, Outlook)
- [ ] **Modo oscuro** (tema dark)
- [ ] **Múltiples monedas** (conversor automático)

## 📞 Soporte

### Problemas comunes:

1. **App lenta**: Limpia cache del navegador
2. **No se ven cambios**: Fuerza actualización (Ctrl+F5)
3. **Datos perdidos**: Verifica backup en localStorage

### Recursos útiles:

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Builder](https://www.pwabuilder.com/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

## 📄 Licencia

Este proyecto es de código abierto. Puedes modificarlo y distribuirlo libremente.

---

## 🎓 ¡Disfruta organizando tus clases!

Esta aplicación te ayudará a:
- ✅ Nunca olvidar una clase
- ✅ Mantener registro de ingresos
- ✅ Identificar tus mejores estudiantes
- ✅ Planificar tu calendario
- ✅ Trabajar desde cualquier dispositivo

**¿Tienes ideas para mejorar la app?** ¡Siéntete libre de modificar el código!
