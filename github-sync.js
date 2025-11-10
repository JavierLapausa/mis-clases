// ===== MÓDULO DE SINCRONIZACIÓN CON GITHUB GIST - VERSIÓN MULTI-DISPOSITIVO =====

class GistSync {
    constructor() {
        // 🔑 CONFIGURACIÓN DE TOKEN (3 métodos, en orden de prioridad):
        // 1. localStorage (configurado desde la UI) ← RECOMENDADO para multi-dispositivo
        // 2. github-config.js (si existe)
        // 3. Hardcodeado aquí (NO RECOMENDADO para repos públicos)
        
        // Intentar obtener token de localStorage
        const tokenGuardado = localStorage.getItem('githubToken');
        
        // Prioridad: localStorage > GITHUB_CONFIG > hardcodeado
        this.GITHUB_TOKEN = tokenGuardado || 
                           (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.TOKEN ? GITHUB_CONFIG.TOKEN : '') ||
                           '';  // ← Dejar vacío y configurar desde la UI
        
        this.GIST_ID = 'ebc2ac85f2294d5839cba0e35e8b7429';
        this.FILENAME = 'mis-clases-data.json';
        this.sincronizando = false;
        
        // Log para debugging
        if (this.GITHUB_TOKEN) {
            console.log('✅ Token configurado (longitud:', this.GITHUB_TOKEN.length, ')');
        } else {
            console.log('ℹ️ Token no configurado. Ve a Config para configurarlo.');
        }
    }

    // ===== GESTIÓN DE TOKEN =====
    
    // Guardar token en localStorage
    guardarToken(token) {
        try {
            if (!token || !token.trim()) {
                throw new Error('Token vacío');
            }
            
            const tokenLimpio = token.trim();
            
            // Validar formato básico
            if (!tokenLimpio.startsWith('ghp_')) {
                throw new Error('El token debe empezar con "ghp_"');
            }
            
            if (tokenLimpio.length !== 40) {
                throw new Error(`El token debe tener 40 caracteres (tiene ${tokenLimpio.length})`);
            }
            
            localStorage.setItem('githubToken', tokenLimpio);
            this.GITHUB_TOKEN = tokenLimpio;
            
            console.log('✅ Token guardado correctamente');
            return { success: true, message: 'Token guardado correctamente' };
            
        } catch (error) {
            console.error('❌ Error guardando token:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Obtener token actual (ocultando parte por seguridad)
    obtenerTokenOculto() {
        if (!this.GITHUB_TOKEN || this.GITHUB_TOKEN.length < 10) {
            return '';
        }
        return this.GITHUB_TOKEN.substring(0, 7) + '...' + this.GITHUB_TOKEN.substring(this.GITHUB_TOKEN.length - 4);
    }
    
    // Verificar si hay token configurado
    tieneToken() {
        return this.GITHUB_TOKEN && this.GITHUB_TOKEN.length === 40;
    }
    
    // Eliminar token guardado
    eliminarToken() {
        localStorage.removeItem('githubToken');
        this.GITHUB_TOKEN = '';
        console.log('🗑️ Token eliminado');
        return { success: true, message: 'Token eliminado correctamente' };
    }

    // Verificar configuración
    verificarConfiguracion() {
        if (!this.GITHUB_TOKEN || !this.GIST_ID) {
            console.error('❌ Configuración incompleta');
            return false;
        }
        return true;
    }

    // ===== SINCRONIZACIÓN CON GITHUB =====
    
    // Guardar datos en GitHub
    async guardarEnNube() {
        if (!this.verificarConfiguracion()) {
            const mensaje = !this.GITHUB_TOKEN ? 
                'Token no configurado. Ve a Config → Configurar Token de GitHub' :
                'ID del Gist no configurado';
            
            if (window.app) {
                window.app.mostrarToast(mensaje, 'error');
            }
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
                if (response.status === 401) {
                    throw new Error('Token inválido o revocado. Por favor, configura un nuevo token.');
                } else if (response.status === 404) {
                    throw new Error('Gist no encontrado. Verifica el ID del Gist.');
                }
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
            const mensaje = !this.GITHUB_TOKEN ? 
                'Token no configurado. Ve a Config → Configurar Token de GitHub' :
                'ID del Gist no configurado';
            
            if (window.app) {
                window.app.mostrarToast(mensaje, 'error');
            }
            return false;
        }

        if (this.sincronizando) {
            console.log('⏳ Ya hay una sincronización en curso...');
            return false;
        }

        this.sincronizando = true;
        console.log('📥 Cargando desde GitHub Gist...');

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
                if (response.status === 401) {
                    throw new Error('Token inválido o revocado. Por favor, configura un nuevo token.');
                } else if (response.status === 404) {
                    throw new Error('Gist no encontrado. Verifica el ID del Gist.');
                }
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
    }
}

// Crear instancia global
const gistSync = new GistSync();

// ===== FUNCIONES GLOBALES PARA EL HTML =====

// Configurar token desde la UI
function configurarTokenGitHub() {
    const token = document.getElementById('input-github-token')?.value;
    
    if (!token || !token.trim()) {
        if (window.app) {
            window.app.mostrarToast('Por favor ingresa un token', 'error');
        }
        return;
    }
    
    const resultado = gistSync.guardarToken(token);
    
    if (window.app) {
        window.app.mostrarToast(resultado.message, resultado.success ? 'success' : 'error');
    }
    
    if (resultado.success) {
        actualizarInfoToken();
        // Limpiar el input por seguridad
        const input = document.getElementById('input-github-token');
        if (input) input.value = '';
    }
}

// Eliminar token configurado
function eliminarTokenGitHub() {
    if (!confirm('¿Estás seguro de eliminar el token configurado?\n\nDeberás configurarlo nuevamente para usar la sincronización.')) {
        return;
    }
    
    const resultado = gistSync.eliminarToken();
    
    if (window.app) {
        window.app.mostrarToast(resultado.message, resultado.success ? 'success' : 'error');
    }
    
    actualizarInfoToken();
}

// Actualizar información del token en la UI
function actualizarInfoToken() {
    const tokenInfoDiv = document.getElementById('info-token-actual');
    if (!tokenInfoDiv) return;
    
    if (gistSync.tieneToken()) {
        tokenInfoDiv.innerHTML = `
            <div class="config-info">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Token configurado:</strong> ${gistSync.obtenerTokenOculto()}<br>
                    <small>La sincronización con GitHub está disponible</small>
                </div>
            </div>
        `;
    } else {
        tokenInfoDiv.innerHTML = `
            <div class="config-info warning">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Token no configurado</strong><br>
                    <small>Configura tu token para usar la sincronización con GitHub</small>
                </div>
            </div>
        `;
    }
}

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

// [El resto del código de exportarDatos, importarDatos, etc. permanece igual...]
// Exportar datos localmente
function exportarDatos() {
    try {
        const datos = localStorage.getItem('misClases') || '[]';
        const clases = JSON.parse(datos);
        
        if (clases.length === 0) {
            alert('⚠️ No hay datos para exportar');
            return;
        }

        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mis-clases-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.app) {
            app.mostrarToast(`✅ Exportadas ${clases.length} clases correctamente`, 'success');
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

    if (!file.name.endsWith('.json')) {
        alert('⚠️ Por favor selecciona un archivo JSON válido');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const contenido = e.target.result;
            const datos = JSON.parse(contenido);
            
            if (!Array.isArray(datos)) {
                throw new Error('Formato de datos inválido');
            }

            const datosActuales = localStorage.getItem('misClases');
            const clasesActuales = datosActuales ? JSON.parse(datosActuales).length : 0;
            
            let mensaje = `Se importarán ${datos.length} clases.\n\n`;
            if (clasesActuales > 0) {
                mensaje += `⚠️ ATENCIÓN: Esto reemplazará tus ${clasesActuales} clases actuales.\n\n`;
            }
            mensaje += '¿Deseas continuar?';
            
            if (!confirm(mensaje)) {
                event.target.value = '';
                return;
            }

            localStorage.setItem('misClases', contenido);
            
            if (window.app) {
                app.clases = app.cargarClases();
                app.actualizarVistas();
                app.mostrarToast(`✅ Importadas ${datos.length} clases correctamente`, 'success');
            }
            
            actualizarInfoConfig();
            
            console.log(`✅ Importadas ${datos.length} clases`);
            
        } catch (error) {
            console.error('Error importando datos:', error);
            alert('❌ Error al importar datos:\n\n' + error.message + '\n\nAsegúrate de seleccionar un archivo de backup válido.');
        } finally {
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

    const confirmar2 = confirm(
        `⚠️ ÚLTIMA CONFIRMACIÓN\n\n` +
        `Escribe OK si realmente quieres BORRAR TODO.\n\n` +
        `¿Continuar con el borrado completo?`
    );
    
    if (!confirmar2) return;

    try {
        localStorage.removeItem('misClases');
        localStorage.removeItem('ultimaSincronizacion');
        
        if (window.app) {
            app.clases = [];
            app.guardarClases();
            app.actualizarVistas();
            app.mostrarToast('✅ Todos los datos han sido eliminados', 'success');
        }
        
        actualizarInfoConfig();
        
        console.log('✅ Datos borrados correctamente');
        
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
        
        const totalClasesElem = document.getElementById('total-clases-config');
        if (totalClasesElem) {
            totalClasesElem.textContent = clases.length;
        }
        
        const tamañoDatosElem = document.getElementById('tamaño-datos');
        if (tamañoDatosElem) {
            tamañoDatosElem.textContent = (tamaño / 1024).toFixed(2) + ' KB';
        }
        
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
        
        actualizarInfoToken();
        
    } catch (error) {
        console.error('Error actualizando info de configuración:', error);
    }
}

// Inicializar cuando se carga la vista de configuración
document.addEventListener('DOMContentLoaded', () => {
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

console.log('☁️ Módulo de sincronización con GitHub Gist cargado (versión multi-dispositivo)');
console.log('💡 Configura tu token desde Config → Configurar Token de GitHub');
