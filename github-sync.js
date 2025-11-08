// ===== MÓDULO DE SINCRONIZACIÓN CON GITHUB GIST Y GESTIÓN DE DATOS =====

class GistSync {
    constructor() {
        // 🔑 CONFIGURA ESTOS VALORES:
        // Instrucciones para obtener tu token:
        // 1. Ve a https://github.com/settings/tokens
        // 2. Click en "Generate new token" > "Generate new token (classic)"
        // 3. Dale un nombre (ej: "Mis Clases Sync")
        // 4. Selecciona el scope "gist"
        // 5. Click en "Generate token"
        // 6. Copia el token y pégalo aquí abajo
        
        this.GITHUB_TOKEN = '';  // ← Pega aquí tu token de GitHub
        this.GIST_ID = '';        // ← Pega aquí el ID del Gist
        
        this.FILENAME = 'mis-clases-data.json';
        this.sincronizando = false;
    }

    // Verificar configuración
    verificarConfiguracion() {
        if (!this.GITHUB_TOKEN || !this.GIST_ID) {
            console.error('❌ Debes configurar GITHUB_TOKEN y GIST_ID en github-sync.js');
            return false;
        }
        return true;
    }

    // Guardar datos en GitHub
    async guardarEnNube() {
        if (!this.verificarConfiguracion()) {
            alert(
                '⚠️ Configuración incompleta\n\n' +
                'Para usar la sincronización con GitHub, debes:\n\n' +
                '1. Crear un token en GitHub (Settings > Developer settings > Personal access tokens)\n' +
                '2. Crear un Gist en https://gist.github.com\n' +
                '3. Configurar GITHUB_TOKEN y GIST_ID en el archivo github-sync.js\n\n' +
                'Consulta la documentación para más detalles.'
            );
            return false;
        }

        if (this.sincronizando) {
            console.log('⏳ Ya hay una sincronización en curso...');
            return false;
        }

        this.sincronizando = true;
        console.log('☁️ Guardando en GitHub Gist...');

        try {
            // Obtener datos actuales de localStorage
            const datos = localStorage.getItem('misClases') || '[]';
            
            // Validar JSON
            JSON.parse(datos);
            
            // Preparar la petición
            const url = `https://api.github.com/gists/${this.GIST_ID}`;
            const body = {
                description: `Mis Clases - Backup ${new Date().toLocaleString('es-ES')}`,
                files: {
                    [this.FILENAME]: {
                        content: datos
                    }
                }
            };

            // Enviar a GitHub
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error HTTP ${response.status}: ${errorData.message || 'Error desconocido'}`);
            }

            const result = await response.json();
            const fechaGuardado = new Date(result.updated_at);
            console.log('✅ Datos guardados en GitHub:', fechaGuardado.toLocaleString('es-ES'));
            
            // Guardar timestamp en localStorage
            localStorage.setItem('ultimaSincronizacion', fechaGuardado.toISOString());
            
            this.sincronizando = false;
            return true;

        } catch (error) {
            console.error('❌ Error guardando en GitHub:', error);
            this.sincronizando = false;
            throw error;
        }
    }

    // Cargar datos desde GitHub
    async cargarDesdeNube() {
        if (!this.verificarConfiguracion()) {
            alert(
                '⚠️ Configuración incompleta\n\n' +
                'Para usar la sincronización con GitHub, debes:\n\n' +
                '1. Crear un token en GitHub (Settings > Developer settings > Personal access tokens)\n' +
                '2. Crear un Gist en https://gist.github.com\n' +
                '3. Configurar GITHUB_TOKEN y GIST_ID en el archivo github-sync.js\n\n' +
                'Consulta la documentación para más detalles.'
            );
            return false;
        }

        if (this.sincronizando) {
            console.log('⏳ Ya hay una sincronización en curso...');
            return false;
        }

        this.sincronizando = true;
        console.log('🔄 Cargando desde GitHub Gist...');

        try {
            // Obtener datos de GitHub
            const url = `https://api.github.com/gists/${this.GIST_ID}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error HTTP ${response.status}: ${errorData.message || 'Error desconocido'}`);
            }

            const result = await response.json();
            const contenido = result.files[this.FILENAME]?.content;

            if (!contenido) {
                throw new Error('Archivo no encontrado en el Gist');
            }

            // Validar que sea JSON válido
            const datosValidados = JSON.parse(contenido);
            
            // Verificar que sea un array
            if (!Array.isArray(datosValidados)) {
                throw new Error('Formato de datos inválido');
            }

            // Guardar en localStorage
            localStorage.setItem('misClases', contenido);
            localStorage.setItem('ultimaSincronizacion', result.updated_at);
            
            const fechaCarga = new Date(result.updated_at);
            console.log('✅ Datos cargados desde GitHub:', fechaCarga.toLocaleString('es-ES'));
            
            this.sincronizando = false;
            return true;

        } catch (error) {
            console.error('❌ Error cargando desde GitHub:', error);
            this.sincronizando = false;
            throw error;
        }
    }

    // Obtener información del último guardado
    async obtenerInfoUltimaSync() {
        if (!this.verificarConfiguracion()) {
            // Intentar obtener info local
            const ultimaSync = localStorage.getItem('ultimaSincronizacion');
            if (ultimaSync) {
                return {
                    ultimaActualizacion: ultimaSync,
                    tamaño: new Blob([localStorage.getItem('misClases') || '[]']).size,
                    tipo: 'local'
                };
            }
            return null;
        }

        try {
            const url = `https://api.github.com/gists/${this.GIST_ID}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) return null;

            const result = await response.json();
            return {
                ultimaActualizacion: result.updated_at,
                tamaño: result.files[this.FILENAME]?.size || 0,
                url: result.html_url,
                tipo: 'github'
            };

        } catch (error) {
            console.error('Error obteniendo info:', error);
            return null;
        }
    }
}

// Crear instancia global
const gistSync = new GistSync();

// ===== FUNCIONES GLOBALES PARA EL HTML =====

// Sincronizar con GitHub (guardar)
async function sincronizarConGitHub() {
    if (!window.app) {
        console.error('App no inicializada');
        return;
    }

    const boton = event?.target;
    const textoOriginal = boton?.innerHTML;
    
    try {
        if (boton) {
            boton.disabled = true;
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }

        const exito = await gistSync.guardarEnNube();
        
        if (exito) {
            app.mostrarToast('✅ Datos guardados en GitHub correctamente', 'success');
            actualizarInfoConfig();
        }
    } catch (error) {
        app.mostrarToast('❌ Error al guardar: ' + error.message, 'error');
        console.error(error);
    } finally {
        if (boton && textoOriginal) {
            boton.disabled = false;
            boton.innerHTML = textoOriginal;
        }
    }
}

// Cargar desde GitHub
async function cargarDesdeGitHub() {
    if (!window.app) {
        console.error('App no inicializada');
        return;
    }

    // Verificar si hay datos locales
    const datosLocales = localStorage.getItem('misClases');
    const tieneClasesLocales = datosLocales && JSON.parse(datosLocales).length > 0;

    if (tieneClasesLocales) {
        const confirmar = confirm(
            '⚠️ ATENCIÓN: Esto reemplazará tus datos locales con los de GitHub.\n\n' +
            `Actualmente tienes ${JSON.parse(datosLocales).length} clases guardadas localmente.\n\n` +
            '¿Estás seguro de que quieres continuar?\n\n' +
            'Recomendación: Exporta tus datos antes de continuar.'
        );
        
        if (!confirmar) {
            return;
        }
    }

    const boton = event?.target;
    const textoOriginal = boton?.innerHTML;
    
    try {
        if (boton) {
            boton.disabled = true;
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        }

        const exito = await gistSync.cargarDesdeNube();
        
        if (exito) {
            // Recargar datos en la app
            app.clases = app.cargarClases();
            app.actualizarVistas();
            app.mostrarToast('✅ Datos cargados desde GitHub correctamente', 'success');
            actualizarInfoConfig();
        }
    } catch (error) {
        app.mostrarToast('❌ Error al cargar: ' + error.message, 'error');
        console.error(error);
    } finally {
        if (boton && textoOriginal) {
            boton.disabled = false;
            boton.innerHTML = textoOriginal;
        }
    }
}

// Ver información de sincronización
async function verInfoSync() {
    const info = await gistSync.obtenerInfoUltimaSync();
    
    if (info) {
        const fecha = new Date(info.ultimaActualizacion);
        const tamañoKB = (info.tamaño / 1024).toFixed(2);
        
        let mensaje = `📊 Información de sincronización:\n\n`;
        mensaje += `Última actualización:\n${fecha.toLocaleString('es-ES')}\n\n`;
        mensaje += `Tamaño: ${tamañoKB} KB\n`;
        mensaje += `Origen: ${info.tipo === 'github' ? 'GitHub Gist' : 'Local'}\n`;
        
        if (info.url) {
            mensaje += `\n🔗 Ver en GitHub: ${info.url}`;
        }
        
        alert(mensaje);
    } else {
        alert('⚠️ No se pudo obtener información de sincronización.\n\nVerifica tu configuración de GitHub.');
    }
}

// Exportar datos localmente
function exportarDatos() {
    try {
        const datos = localStorage.getItem('misClases') || '[]';
        const clases = JSON.parse(datos);
        
        if (clases.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        // Crear blob con los datos
        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `mis-clases-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.app) {
            app.mostrarToast(`✅ Exportados ${clases.length} clases correctamente`, 'success');
        }
        
        console.log(`✅ Exportadas ${clases.length} clases`);
    } catch (error) {
        console.error('Error exportando datos:', error);
        if (window.app) {
            app.mostrarToast('❌ Error al exportar datos', 'error');
        }
    }
}

// Importar datos
function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar que sea un archivo JSON
    if (!file.name.endsWith('.json')) {
        alert('⚠️ Por favor selecciona un archivo JSON válido');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const contenido = e.target.result;
            const datos = JSON.parse(contenido);
            
            // Validar que sea un array
            if (!Array.isArray(datos)) {
                throw new Error('Formato de datos inválido');
            }

            // Preguntar confirmación
            const datosActuales = localStorage.getItem('misClases');
            const clasesActuales = datosActuales ? JSON.parse(datosActuales).length : 0;
            
            let mensaje = `Se importarán ${datos.length} clases.\n\n`;
            if (clasesActuales > 0) {
                mensaje += `⚠️ ATENCIÓN: Esto reemplazará tus ${clasesActuales} clases actuales.\n\n`;
            }
            mensaje += '¿Deseas continuar?';
            
            if (!confirm(mensaje)) {
                // Limpiar el input
                event.target.value = '';
                return;
            }

            // Guardar datos
            localStorage.setItem('misClases', contenido);
            
            // Recargar app
            if (window.app) {
                app.clases = app.cargarClases();
                app.actualizarVistas();
                app.mostrarToast(`✅ Importadas ${datos.length} clases correctamente`, 'success');
            }
            
            // Actualizar info de configuración
            actualizarInfoConfig();
            
            console.log(`✅ Importadas ${datos.length} clases`);
            
        } catch (error) {
            console.error('Error importando datos:', error);
            alert('❌ Error al importar datos:\n\n' + error.message + '\n\nAsegúrate de seleccionar un archivo de backup válido.');
        } finally {
            // Limpiar el input
            event.target.value = '';
        }
    };
    
    reader.onerror = function() {
        alert('❌ Error al leer el archivo');
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Borrar todos los datos
function borrarTodosDatos() {
    const datosActuales = localStorage.getItem('misClases');
    const clases = datosActuales ? JSON.parse(datosActuales) : [];
    
    if (clases.length === 0) {
        alert('ℹ️ No hay datos para borrar');
        return;
    }

    const confirmar1 = confirm(
        `⚠️ ADVERTENCIA: Estás a punto de eliminar TODAS tus clases.\n\n` +
        `Se borrarán permanentemente ${clases.length} clases.\n\n` +
        `Esta acción NO SE PUEDE DESHACER.\n\n` +
        `¿Estás absolutamente seguro de que quieres continuar?`
    );
    
    if (!confirmar1) return;

    // Segunda confirmación
    const confirmar2 = confirm(
        `⚠️ ÚLTIMA CONFIRMACIÓN\n\n` +
        `Escribe OK si realmente quieres BORRAR TODO.\n\n` +
        `¿Continuar con el borrado completo?`
    );
    
    if (!confirmar2) return;

    try {
        // Borrar datos
        localStorage.removeItem('misClases');
        localStorage.removeItem('ultimaSincronizacion');
        
        // Recargar app
        if (window.app) {
            app.clases = [];
            app.guardarClases();
            app.actualizarVistas();
            app.mostrarToast('✅ Todos los datos han sido eliminados', 'success');
        }
        
        // Actualizar info de configuración
        actualizarInfoConfig();
        
        console.log('✅ Datos borrados correctamente');
        
        // Cambiar a vista lista
        if (window.app) {
            app.cambiarVista('lista');
        }
        
    } catch (error) {
        console.error('Error borrando datos:', error);
        if (window.app) {
            app.mostrarToast('❌ Error al borrar datos', 'error');
        }
    }
}

// Actualizar información en la vista de configuración
function actualizarInfoConfig() {
    try {
        const datos = localStorage.getItem('misClases') || '[]';
        const clases = JSON.parse(datos);
        const tamaño = new Blob([datos]).size;
        const ultimaSync = localStorage.getItem('ultimaSincronizacion');
        
        // Total de clases
        const totalClasesElem = document.getElementById('total-clases-config');
        if (totalClasesElem) {
            totalClasesElem.textContent = clases.length;
        }
        
        // Tamaño de datos
        const tamañoDatosElem = document.getElementById('tamaño-datos');
        if (tamañoDatosElem) {
            tamañoDatosElem.textContent = (tamaño / 1024).toFixed(2) + ' KB';
        }
        
        // Última actualización
        const ultimaActElem = document.getElementById('ultima-actualizacion');
        if (ultimaActElem) {
            if (ultimaSync) {
                const fecha = new Date(ultimaSync);
                ultimaActElem.textContent = fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                ultimaActElem.textContent = 'Nunca';
            }
        }
    } catch (error) {
        console.error('Error actualizando info de configuración:', error);
    }
}

// ===== INTEGRACIÓN CON CLASEMANAGER =====

// Agregar métodos al ClaseManager cuando esté disponible
if (typeof ClaseManager !== 'undefined') {
    
    // Sincronización automática después de guardar
    const guardarOriginal = ClaseManager.prototype.guardarClases;
    ClaseManager.prototype.guardarClases = function() {
        guardarOriginal.call(this);
        
        // Actualizar info de configuración si estamos en esa vista
        const vistaConfig = document.getElementById('vista-config');
        if (vistaConfig && vistaConfig.classList.contains('active')) {
            actualizarInfoConfig();
        }
    };
    
    console.log('✅ Integración con ClaseManager completada');
}

// Actualizar info cuando se carga la vista de configuración
document.addEventListener('DOMContentLoaded', () => {
    // Observar cambios de vista
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'vista-config' && mutation.target.classList.contains('active')) {
                actualizarInfoConfig();
            }
        });
    });
    
    const vistaConfig = document.getElementById('vista-config');
    if (vistaConfig) {
        observer.observe(vistaConfig, { attributes: true, attributeFilter: ['class'] });
    }
});

console.log('☁️ Módulo de sincronización con GitHub Gist cargado');
console.log('📝 Configura GITHUB_TOKEN y GIST_ID en github-sync.js para usar la sincronización');
