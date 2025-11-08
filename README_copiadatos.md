# Mis Clases - Guía de Configuración de Sincronización con GitHub

## 📋 Contenido

1. [Características de la Aplicación](#características)
2. [Configuración de Sincronización con GitHub](#configuración-github)
3. [Uso de la Aplicación](#uso)
4. [Gestión de Datos](#gestión-de-datos)
5. [Resolución de Problemas](#problemas)

---

## 🎯 Características

**Mis Clases** es una aplicación web completa para gestionar clases particulares con:

- ✅ Gestión de clases y estudiantes
- 💰 Control de pagos (pagado, pendiente, vencido)
- 📅 Calendario mensual y semanal
- 📊 Estadísticas detalladas
- ☁️ Sincronización en la nube con GitHub
- 💾 Exportación/importación de datos
- 📱 Diseño responsive para móviles

---

## ⚙️ Configuración GitHub

### Paso 1: Crear un Token de Acceso Personal

1. Ve a GitHub.com e inicia sesión
2. Click en tu avatar (arriba derecha) → **Settings**
3. En el menú izquierdo, scroll hasta el final → **Developer settings**
4. Click en **Personal access tokens** → **Tokens (classic)**
5. Click en **Generate new token** → **Generate new token (classic)**
6. Configura el token:
   - **Note**: `Mis Clases Sync` (o cualquier nombre descriptivo)
   - **Expiration**: Selecciona `No expiration` (o el tiempo que prefieras)
   - **Scopes**: Marca SOLO la casilla **`gist`**
7. Click en **Generate token** (abajo de la página)
8. **⚠️ MUY IMPORTANTE**: Copia el token generado (empieza con `ghp_`)
   - **No lo cierres aún**, lo necesitarás en el paso 3
   - **No podrás verlo de nuevo**, guárdalo en un lugar seguro

### Paso 2: Crear un Gist

1. Ve a [gist.github.com](https://gist.github.com)
2. Click en el **+** (arriba derecha) o en **New gist**
3. Configura el gist:
   - **Gist description**: `Mis Clases - Backup de datos`
   - **Filename**: `mis-clases-data.json`
   - **Content**: Escribe `[]` (dos corchetes, nada más)
4. Click en **Create public gist** o **Create secret gist** (recomendado: secret)
5. **Copia el ID del gist**:
   - Está en la URL: `https://gist.github.com/tu-usuario/`**`abc123def456...`**
   - El ID es la parte larga después de tu nombre de usuario
   - Ejemplo: Si la URL es `https://gist.github.com/usuario/57ae63fcdfc49cefe7d5e5fd9e2b0a64`
   - El ID es: `57ae63fcdfc49cefe7d5e5fd9e2b0a64`

### Paso 3: Configurar la Aplicación

1. Abre el archivo **`github-sync.js`** con un editor de texto
2. Busca estas líneas (están al principio, líneas ~15-16):

```javascript
this.GITHUB_TOKEN = '';  // ← Pega aquí tu token de GitHub
this.GIST_ID = '';        // ← Pega aquí el ID del Gist
```

3. Pega tus valores:

```javascript
this.GITHUB_TOKEN = 'ghp_tu_token_aqui';  // ← Tu token del Paso 1
this.GIST_ID = 'abc123def456...';          // ← El ID del Paso 2
```

4. **Guarda el archivo**
5. **Recarga la aplicación** en el navegador

### Paso 4: Verificar la Configuración

1. Abre la aplicación en tu navegador
2. Ve a la pestaña **Config** (última pestaña en la navegación)
3. Click en **Ver Estado** en la sección de sincronización
4. Si está bien configurado, verás información sobre tu gist
5. Si no está configurado, verás un mensaje de error

---

## 📖 Uso de la Aplicación

### Sincronizar con GitHub

#### Guardar en GitHub (Backup)

1. Ve a la pestaña **Config**
2. Click en **Guardar en GitHub**
3. Tus datos se guardarán en la nube
4. ✅ Recibirás una notificación de éxito

**¿Cuándo guardar?**
- Después de agregar varias clases nuevas
- Antes de cerrar sesión
- Si vas a usar otro dispositivo
- Como backup regular (recomendado: diariamente)

#### Cargar desde GitHub (Restaurar)

1. Ve a la pestaña **Config**
2. Click en **Cargar desde GitHub**
3. ⚠️ **ATENCIÓN**: Esto reemplazará tus datos locales
4. Confirma la acción
5. Tus datos se restaurarán

**¿Cuándo cargar?**
- Al usar un nuevo dispositivo
- Para sincronizar datos entre dispositivos
- Para restaurar un backup anterior

### Ver Estado de Sincronización

1. Ve a la pestaña **Config**
2. Click en **Ver Estado**
3. Verás:
   - Fecha de última sincronización
   - Tamaño de los datos
   - Link al Gist (si está configurado)

---

## 💾 Gestión de Datos

### Exportar Datos (Backup Local)

1. Ve a la pestaña **Config**
2. En "Copias de Seguridad Locales" → **Exportar JSON**
3. Se descargará un archivo: `mis-clases-backup-YYYY-MM-DD.json`
4. Guarda este archivo en un lugar seguro

**Ventajas del backup local:**
- No requiere internet
- No requiere configuración de GitHub
- Útil para migraciones
- Puedes tener múltiples versiones

### Importar Datos

1. Ve a la pestaña **Config**
2. En "Copias de Seguridad Locales" → **Importar JSON**
3. Selecciona tu archivo `.json`
4. Confirma la importación
5. Tus datos se restaurarán

### Borrar Todos los Datos

⚠️ **PRECAUCIÓN**: Esta acción es irreversible

1. Ve a la pestaña **Config**
2. Scroll hasta "Datos y Almacenamiento"
3. Click en **Borrar Todo**
4. Confirma DOS veces
5. Todos los datos se eliminarán

**Recomendación**: Exporta tus datos ANTES de borrar

---

## 🔧 Resolución de Problemas

### Error: "Configuración incompleta"

**Causa**: No has configurado el token o el ID del Gist

**Solución**:
1. Verifica que hayas seguido los Pasos 1 y 2
2. Abre `github-sync.js` y verifica que:
   - `GITHUB_TOKEN` tenga un valor (empieza con `ghp_`)
   - `GIST_ID` tenga un valor (string largo de números y letras)
3. Recarga la página

### Error: "Error HTTP 401" o "Bad credentials"

**Causa**: El token es inválido o ha expirado

**Solución**:
1. Crea un nuevo token siguiendo el Paso 1
2. Actualiza el valor en `github-sync.js`
3. Recarga la página

### Error: "Error HTTP 404" o "Not Found"

**Causa**: El ID del Gist es incorrecto

**Solución**:
1. Ve a tu Gist en GitHub
2. Verifica el ID en la URL
3. Actualiza el valor en `github-sync.js`
4. Recarga la página

### Los datos no se sincronizan

**Posibles causas y soluciones**:

1. **Sin conexión a internet**
   - Verifica tu conexión
   - La app funciona offline, pero no sincroniza

2. **Token sin permisos**
   - El token debe tener el scope `gist`
   - Crea un nuevo token con los permisos correctos

3. **Gist eliminado**
   - Si borraste el Gist, crea uno nuevo
   - Actualiza el `GIST_ID`

### Perdí mis datos

**Si tenías sincronización con GitHub:**
1. Ve a Config → Cargar desde GitHub
2. Tus datos se restaurarán

**Si tenías backup local:**
1. Ve a Config → Importar JSON
2. Selecciona tu archivo de backup

**Si no tenías backup:**
- Lamentablemente, los datos no se pueden recuperar
- **Lección aprendida**: Haz backups regularmente 😊

---

## 📱 Uso Multi-dispositivo

### Configuración Inicial

**En cada dispositivo:**
1. Abre la aplicación
2. Configura `github-sync.js` con el MISMO token y Gist ID
3. Carga los datos desde GitHub

### Flujo de Trabajo Recomendado

**Al iniciar sesión:**
1. Cargar desde GitHub
2. Trabajar normalmente
3. Guardar en GitHub al terminar

**⚠️ Importante**: Siempre carga ANTES de trabajar y guarda DESPUÉS

### Resolución de Conflictos

Si editaste en dos dispositivos sin sincronizar:
1. Exporta los datos del dispositivo 1 (backup)
2. Carga desde GitHub en el dispositivo 1
3. Importa manualmente los datos del backup si es necesario

---

## 🔒 Seguridad y Privacidad

### Sobre el Token de GitHub

- **Nunca compartas tu token** con nadie
- Si sospechas que está comprometido, revócalo inmediatamente:
  1. GitHub → Settings → Developer settings
  2. Personal access tokens → Encuentra tu token
  3. Click en Delete

### Sobre los Gists

- **Secret Gist**: Solo accesible con el link directo
- **Public Gist**: Visible en búsquedas de Google
- **Recomendación**: Usa Secret Gist para tus datos privados

### Datos Almacenados Localmente

- Los datos se guardan en `localStorage` del navegador
- Se borran si:
  - Limpias el caché del navegador
  - Usas modo incógnito (al cerrar)
- **Solución**: Sincroniza con GitHub regularmente

---

## 📞 Soporte

### Logs de Depuración

Para ver logs detallados:
1. Presiona F12 (abre DevTools)
2. Ve a la pestaña "Console"
3. Verás mensajes como:
   - `✅ Datos guardados en GitHub`
   - `❌ Error guardando en GitHub`

### Información Útil para Reportar Problemas

Si tienes un problema, incluye:
- Navegador y versión
- Sistema operativo
- Mensaje de error completo (de la consola)
- Pasos para reproducir el error

---

## 🎉 ¡Listo!

Ya tienes tu aplicación completamente configurada con sincronización en la nube. 

**Próximos pasos:**
1. Agrega tus primeras clases
2. Guarda en GitHub
3. Disfruta de tus datos siempre disponibles

**¿Preguntas?** Revisa la sección de Resolución de Problemas.

---

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente para gestionar tus clases.

---

**Versión**: 2.0.0  
**Última actualización**: Noviembre 2025
