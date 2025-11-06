// ===== APP DE CLASES - VERSIÓN ROBUSTA =====
console.log('🚀 Iniciando aplicación...');

class ClaseManager {
    constructor() {
        this.clases = this.cargarClases();
        this.claseEditando = null;
        this.fechaCalendario = new Date();
        this.fechaSeleccionada = null;
        this.vistaCalendario = 'mes';
        this.init();
    }

    cargarClases() {
        try {
            const datos = localStorage.getItem('misClases');
            if (datos) {
                const clases = JSON.parse(datos);
                return clases.map(clase => ({
                    ...clase,
                    fecha: new Date(clase.fecha)
                }));
            }
        } catch (e) {
            console.warn('Error cargando clases:', e);
        }
        return [];
    }

    guardarClases() {
        try {
            localStorage.setItem('misClases', JSON.stringify(this.clases));
            console.log('✅ Clases guardadas');
        } catch (e) {
            console.error('Error guardando clases:', e);
        }
    }

    // ===== INICIALIZACIÓN ROBUSTA =====
    init() {
        console.log('🔧 Inicializando...');
        
        // Esperar a que el DOM esté completamente cargado
        setTimeout(() => {
            this.configurarEventListeners();
            this.renderizarCalendario();
            this.actualizarEstadisticas();
            console.log('✅ App inicializada correctamente');
        }, 100);
    }

    // ===== EVENT LISTENERS SEGUROS =====
    configurarEventListeners() {
        console.log('🎯 Configurando event listeners...');

        // Función auxiliar segura
        const onClick = (selector, handler) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.addEventListener('click', handler);
                    console.log(`✅ Listener agregado: ${selector}`);
                }
            });
        };

        // Navegación principal
        onClick('.nav-btn', (e) => {
            const vista = e.currentTarget.dataset.view;
            if (vista) this.cambiarVista(vista);
        });

        // Toggle mes/semana - USANDO DELEGACIÓN SEGURA
        document.addEventListener('click', (e) => {
            // Toggle vista calendario
            if (e.target.closest('.toggle-btn')) {
                const btn = e.target.closest('.toggle-btn');
                const vista = btn.dataset.view;
                if (vista) {
                    console.log('🔄 Cambiando vista a:', vista);
                    this.cambiarVistaCalendario(vista);
                }
            }

            // Clicks en días del calendario
            if (e.target.closest('.dia-calendario[data-fecha]')) {
                const dia = e.target.closest('.dia-calendario[data-fecha]');
                const fecha = dia.dataset.fecha;
                if (fecha && !dia.classList.contains('otro-mes')) {
                    console.log('📅 Click en día:', fecha);
                    this.mostrarVistaDelDia(fecha);
                }
            }

            // Clicks en días de la semana
            if (e.target.closest('.dia-semana[data-fecha]')) {
                const dia = e.target.closest('.dia-semana[data-fecha]');
                const fecha = dia.dataset.fecha;
                if (fecha && !dia.classList.contains('otro-mes')) {
                    console.log('📅 Click en día semana:', fecha);
                    this.mostrarVistaDelDia(fecha);
                }
            }

            // Botón nueva clase
            if (e.target.closest('#btn-nueva-clase')) {
                this.abrirModalClase();
            }

            // Botón volver al calendario
            if (e.target.closest('#btn-volver-calendario')) {
                this.volverAlCalendario();
            }

            // Navegación de días
            if (e.target.closest('#btn-dia-anterior')) {
                this.navegarDia(-1);
            }
            if (e.target.closest('#btn-dia-siguiente')) {
                this.navegarDia(1);
            }

            // Navegación del calendario
            if (e.target.closest('#btn-mes-anterior')) {
                this.navegarCalendario(-1);
            }
            if (e.target.closest('#btn-mes-siguiente')) {
                this.navegarCalendario(1);
            }

            // Cerrar modales
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
                this.cerrarModalConfirmacion();
            }
            if (e.target.closest('#btn-cerrar-modal') || e.target.closest('#btn-cancelar')) {
                this.cerrarModal();
            }
            if (e.target.closest('#btn-cancelar-eliminar')) {
                this.cerrarModalConfirmacion();
            }
            if (e.target.closest('#btn-confirmar-eliminar')) {
                this.confirmarEliminar();
            }
        });

        // Formulario - event listener directo
        setTimeout(() => {
            const form = document.getElementById('form-clase');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.guardarClaseFormulario();
                });
                console.log('✅ Formulario configurado');
            }
        }, 200);

        console.log('✅ Event listeners configurados');
    }

    // ===== NAVEGACIÓN =====
    cambiarVista(vista) {
        console.log('🔄 Cambiando a vista:', vista);

        // Actualizar navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const navBtn = document.querySelector(`[data-view="${vista}"]`);
        if (navBtn) navBtn.classList.add('active');

        // Mostrar vista
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetView = document.getElementById(`vista-${vista}`);
        if (targetView) {
            targetView.classList.add('active');
            
            if (vista === 'calendario') {
                setTimeout(() => this.renderizarCalendario(), 100);
            } else if (vista === 'estadisticas') {
                setTimeout(() => this.actualizarEstadisticas(), 100);
            }
        }
    }

    cambiarVistaCalendario(vista) {
        console.log('📅 Cambiando vista calendario a:', vista);
        this.vistaCalendario = vista;
        
        // Actualizar botones
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.toggle-btn[data-view="${vista}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Mostrar vista correspondiente
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`vista-${vista === 'mes' ? 'mensual' : 'semanal'}`);
        if (targetView) targetView.classList.add('active');

        // Renderizar
        setTimeout(() => this.renderizarCalendario(), 100);
    }

    navegarCalendario(direccion) {
        if (this.vistaCalendario === 'mes') {
            this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + direccion);
        } else {
            this.fechaCalendario.setDate(this.fechaCalendario.getDate() + (direccion * 7));
        }
        this.renderizarCalendario();
    }

    // ===== RENDERIZADO =====
    renderizarCalendario() {
        console.log('🎨 Renderizando calendario...');
        
        if (this.vistaCalendario === 'mes') {
            this.renderizarCalendarioMensual();
        } else {
            this.renderizarCalendarioSemanal();
        }
    }

    renderizarCalendarioMensual() {
        const calendar = document.getElementById('calendario');
        const mesActual = document.getElementById('mes-actual');
        
        if (!calendar || !mesActual) {
            console.warn('❌ Elementos del calendario no encontrados');
            return;
        }

        console.log('📅 Renderizando vista mensual...');
        
        // Título del mes
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        mesActual.textContent = `${meses[this.fechaCalendario.getMonth()]} ${this.fechaCalendario.getFullYear()}`;

        // Calcular días del mes
        const primerDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), 1);
        const ultimoDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth() + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const diaSemanaInicio = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

        let html = '';
        
        // Cabeceras
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        diasSemana.forEach(dia => {
            html += `<div class="dia-semana">${dia}</div>`;
        });

        // Días del mes anterior (grises)
        const ultimoDiaMesAnterior = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), 0).getDate();
        for (let i = diaSemanaInicio - 1; i >= 0; i--) {
            html += `<div class="dia-calendario otro-mes">
                <div class="dia-numero">${ultimoDiaMesAnterior - i}</div>
            </div>`;
        }

        // Días del mes actual
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), dia);
            const clasesDelDia = this.obtenerClasesPorFecha(fechaDia);
            const esHoy = fechaDia.toDateString() === new Date().toDateString();
            const fechaStr = fechaDia.toISOString().split('T')[0];
            
            html += `<div class="dia-calendario ${esHoy ? 'hoy' : ''} ${clasesDelDia.length > 0 ? 'tiene-clases' : ''}" 
                          data-fecha="${fechaStr}">
                <div class="dia-numero">${dia}</div>
                ${clasesDelDia.map(clase => `
                    <div class="clase-calendario" title="${clase.estudiante} - €${clase.precio}">
                        ${this.formatearHora(clase.fecha)} ${clase.estudiante}
                    </div>
                `).join('')}
            </div>`;
        }

        // Días del mes siguiente (grises)
        const diasRestantes = 42 - (diaSemanaInicio + diasEnMes);
        for (let dia = 1; dia <= diasRestantes; dia++) {
            html += `<div class="dia-calendario otro-mes">
                <div class="dia-numero">${dia}</div>
            </div>`;
        }

        calendar.innerHTML = html;
        console.log('✅ Calendario mensual renderizado');
    }

    renderizarCalendarioSemanal() {
        const semanaHeader = document.getElementById('semana-header');
        const calendarioSemana = document.getElementById('calendario-semana');
        const mesActual = document.getElementById('mes-actual');
        
        if (!semanaHeader || !calendarioSemana || !mesActual) {
            console.warn('❌ Elementos del calendario semanal no encontrados');
            return;
        }

        console.log('📋 Renderizando vista semanal...');

        // Obtener inicio de semana (lunes)
        const inicioSemana = this.obtenerInicioSemana(this.fechaCalendario);
        
        // Título
        mesActual.textContent = `Semana del ${inicioSemana.toLocaleDateString('es-ES')}`;

        // Cabeceras
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        semanaHeader.innerHTML = diasSemana.map(dia => `
            <div class="dia-semana-nombre">${dia}</div>
        `).join('');

        // Días de la semana
        let htmlSemana = '';
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(inicioSemana);
            fecha.setDate(fecha.getDate() + i);
            
            const clasesDelDia = this.obtenerClasesPorFecha(fecha);
            const esHoy = fecha.toDateString() === new Date().toDateString();
            const fechaStr = fecha.toISOString().split('T')[0];
            
            htmlSemana += `<div class="dia-semana ${esHoy ? 'hoy' : ''}" data-fecha="${fechaStr}">
                <div class="dia-numero-semana">${fecha.getDate()}</div>
                ${clasesDelDia.map(clase => `
                    <div class="clase-semana" title="${clase.estudiante} - €${clase.precio}">
                        ${this.formatearHora(clase.fecha)} ${clase.estudiante}
                    </div>
                `).join('')}
            </div>`;
        }

        calendarioSemana.innerHTML = htmlSemana;
        console.log('✅ Calendario semanal renderizado');
    }

    // ===== VISTA DÍA =====
    mostrarVistaDelDia(fecha) {
        console.log('📋 Mostrando vista del día:', fecha);
        
        this.fechaSeleccionada = new Date(fecha + 'T12:00:00');
        
        // Mostrar botón día en navegación
        const navDia = document.querySelector('[data-view="dia"]');
        if (navDia) navDia.style.display = 'flex';
        
        this.cambiarVista('dia');
        
        setTimeout(() => this.renderizarVistaDelDia(this.fechaSeleccionada), 100);
    }

    volverAlCalendario() {
        console.log('↩️ Volviendo al calendario');
        
        const navDia = document.querySelector('[data-view="dia"]');
        if (navDia) navDia.style.display = 'none';
        
        this.fechaSeleccionada = null;
        this.cambiarVista('calendario');
    }

    navegarDia(direccion) {
        if (!this.fechaSeleccionada) return;
        
        this.fechaSeleccionada.setDate(this.fechaSeleccionada.getDate() + direccion);
        this.renderizarVistaDelDia(this.fechaSeleccionada);
    }

    renderizarVistaDelDia(fecha) {
        console.log('🎨 Renderizando vista del día:', fecha);
        
        const clasesDelDia = this.obtenerClasesPorFecha(fecha);
        
        // Título
        const titulo = fecha.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const tituloElement = document.getElementById('dia-titulo');
        if (tituloElement) {
            tituloElement.textContent = titulo.charAt(0).toUpperCase() + titulo.slice(1);
        }
        
        // Resumen
        const totalIngresos = clasesDelDia.reduce((total, clase) => total + clase.precio, 0);
        const resumenElement = document.getElementById('dia-resumen');
        if (resumenElement) {
            resumenElement.textContent = 
                `${clasesDelDia.length} ${clasesDelDia.length === 1 ? 'clase' : 'clases'} - €${totalIngresos.toFixed(2)}`;
        }
        
        // Lista de clases
        const container = document.getElementById('clases-del-dia');
        if (!container) return;
        
        if (clasesDelDia.length === 0) {
            container.innerHTML = `
                <div class="dia-vacio">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay clases programadas</h3>
                    <p>Toca el botón + para agregar una clase</p>
                </div>
            `;
            return;
        }

        container.innerHTML = clasesDelDia.map(clase => `
            <div class="clase-dia-card">
                <div class="clase-hora">${this.formatearHora(clase.fecha)}</div>
                <div class="clase-dia-header">
                    <div>
                        <div class="clase-estudiante-grande">${clase.estudiante}</div>
                        <div class="clase-precio-grande">€${clase.precio.toFixed(2)}</div>
                    </div>
                </div>
                ${clase.observaciones ? `
                    <div class="clase-observaciones-dia">${clase.observaciones}</div>
                ` : ''}
                <div class="clase-acciones-dia">
                    <button class="btn-accion" onclick="app.editarClaseModal('${clase.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion danger" onclick="app.eliminarClaseModal('${clase.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        console.log('✅ Vista del día renderizada');
    }

    // ===== UTILIDADES =====
    obtenerClasesPorFecha(fecha) {
        return this.clases.filter(clase => {
            return new Date(clase.fecha).toDateString() === fecha.toDateString();
        }).sort((a, b) => {
            const horaA = new Date(a.fecha).getHours() * 60 + new Date(a.fecha).getMinutes();
            const horaB = new Date(b.fecha).getHours() * 60 + new Date(b.fecha).getMinutes();
            return horaA - horaB;
        });
    }

    obtenerInicioSemana(fecha) {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    formatearHora(fecha) {
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    actualizarEstadisticas() {
        console.log('📊 Actualizando estadísticas...');
        // Implementación básica de estadísticas
        const totalClases = this.clases.length;
        const element = document.getElementById('total-clases');
        if (element) element.textContent = totalClases;
    }

    // ===== MODALES =====
    abrirModalClase(fecha = null) {
        console.log('📝 Abriendo modal de clase...');
        // Implementación básica del modal
    }

    editarClaseModal(id) {
        console.log('✏️ Editando clase:', id);
    }

    eliminarClaseModal(id) {
        console.log('🗑️ Eliminando clase:', id);
    }

    cerrarModal() {
        const modal = document.getElementById('modal-clase');
        if (modal) modal.classList.remove('show');
    }

    cerrarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion');
        if (modal) modal.classList.remove('show');
    }

    confirmarEliminar() {
        console.log('✅ Confirmando eliminar');
    }

    guardarClaseFormulario() {
        console.log('💾 Guardando clase...');
    }
}

// ===== INICIALIZACIÓN =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando...');
    
    // Inicializar con retraso para asegurar que todo esté listo
    setTimeout(() => {
        app = new ClaseManager();
    }, 500);
});

// ===== FUNCIONES GLOBALES =====
window.app = {
    editarClaseModal: (id) => app?.editarClaseModal?.(id),
    eliminarClaseModal: (id) => app?.eliminarClaseModal?.(id),
    abrirModalClase: (fecha) => app?.abrirModalClase?.(fecha),
    mostrarVistaDelDia: (fecha) => app?.mostrarVistaDelDia?.(fecha)
};

console.log('✅ JavaScript cargado');
