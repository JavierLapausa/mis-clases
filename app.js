// ===== GESTIÓN DE DATOS CORREGIDA ===== 
class ClaseManager {
    constructor() {
        this.clases = this.cargarClases();
        this.claseEditando = null;
        this.fechaCalendario = new Date();
        this.fechaSeleccionada = null;
        this.claseAEliminar = null;
        this.init();
    }

    // Cargar clases desde localStorage
    cargarClases() {
        const datos = localStorage.getItem('misClases');
        if (datos) {
            const clases = JSON.parse(datos);
            return clases.map(clase => ({
                ...clase,
                fecha: new Date(clase.fecha)
            }));
        }
        return [];
    }

    // Guardar clases en localStorage
    guardarClases() {
        localStorage.setItem('misClases', JSON.stringify(this.clases));
    }

    // Generar ID único
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Agregar nueva clase
    agregarClase(datosClase) {
        const nuevaClase = {
            id: this.generarId(),
            estudiante: datosClase.estudiante,
            fecha: new Date(datosClase.fecha + 'T' + datosClase.hora),
            precio: parseFloat(datosClase.precio),
            observaciones: datosClase.observaciones || ''
        };

        this.clases.push(nuevaClase);
        this.guardarClases();
        this.actualizarVistas();
        this.mostrarToast('Clase agregada correctamente');
    }

    // Editar clase existente
    editarClase(id, datosClase) {
        const index = this.clases.findIndex(clase => clase.id === id);
        if (index !== -1) {
            this.clases[index] = {
                ...this.clases[index],
                estudiante: datosClase.estudiante,
                fecha: new Date(datosClase.fecha + 'T' + datosClase.hora),
                precio: parseFloat(datosClase.precio),
                observaciones: datosClase.observaciones || ''
            };
            this.guardarClases();
            this.actualizarVistas();
            this.mostrarToast('Clase actualizada correctamente');
        }
    }

    // Eliminar clase
    eliminarClase(id) {
        this.clases = this.clases.filter(clase => clase.id !== id);
        this.guardarClases();
        this.actualizarVistas();
        this.mostrarToast('Clase eliminada correctamente');
    }

    // Obtener clases de una fecha específica (ORDENADAS POR HORA)
    obtenerClasesPorFecha(fecha) {
        return this.clases.filter(clase => {
            const fechaClase = new Date(clase.fecha);
            return fechaClase.toDateString() === fecha.toDateString();
        }).sort((a, b) => {
            const horaA = new Date(a.fecha).getHours() * 60 + new Date(a.fecha).getMinutes();
            const horaB = new Date(b.fecha).getHours() * 60 + new Date(b.fecha).getMinutes();
            return horaA - horaB;
        });
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('Inicializando app...');
        this.configurarEventListeners();
        this.configurarFechaDefault();
        this.actualizarVistas();
        this.configurarBusqueda();
        console.log('App inicializada correctamente');
    }

    // ===== EVENT LISTENERS =====
    configurarEventListeners() {
        console.log('Configurando event listeners...');

        // Navegación principal
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarVista(e.currentTarget.dataset.view);
            });
        });

        // Modal nueva clase
        const btnNuevaClase = document.getElementById('btn-nueva-clase');
        if (btnNuevaClase) {
            btnNuevaClase.addEventListener('click', () => {
                this.abrirModalClase();
            });
        }

        // Cerrar modal
        const btnCerrarModal = document.getElementById('btn-cerrar-modal');
        if (btnCerrarModal) {
            btnCerrarModal.addEventListener('click', () => {
                this.cerrarModal();
            });
        }

        const btnCancelar = document.getElementById('btn-cancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.cerrarModal();
            });
        }

        // Formulario clase
        const formClase = document.getElementById('form-clase');
        if (formClase) {
            formClase.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarClaseFormulario();
            });
        }

        // Confirmación eliminar
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        if (btnCancelarEliminar) {
            btnCancelarEliminar.addEventListener('click', () => {
                this.cerrarModalConfirmacion();
            });
        }

        const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
        if (btnConfirmarEliminar) {
            btnConfirmarEliminar.addEventListener('click', () => {
                this.confirmarEliminar();
            });
        }

        // Navegación calendario
        const btnMesAnterior = document.getElementById('btn-mes-anterior');
        if (btnMesAnterior) {
            btnMesAnterior.addEventListener('click', () => {
                this.navegarCalendario(-1);
            });
        }

        const btnMesSiguiente = document.getElementById('btn-mes-siguiente');
        if (btnMesSiguiente) {
            btnMesSiguiente.addEventListener('click', () => {
                this.navegarCalendario(1);
            });
        }

        // Cerrar modal al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
                this.cerrarModalConfirmacion();
            }
        });

        console.log('Event listeners configurados');
    }

    // ===== NAVEGACIÓN =====
    cambiarVista(vista) {
        console.log('Cambiando a vista:', vista);
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const navBtn = document.querySelector(`[data-view="${vista}"]`);
        if (navBtn) navBtn.classList.add('active');

        // Mostrar vista correspondiente
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetView = document.getElementById(`vista-${vista}`);
        if (targetView) targetView.classList.add('active');

        // Actualizar vista específica
        if (vista === 'calendario') {
            this.renderizarCalendario();
        } else if (vista === 'estadisticas') {
            this.actualizarEstadisticas();
        } else if (vista === 'lista') {
            this.renderizarListaClases();
        }
    }

    navegarCalendario(direccion) {
        this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + direccion);
        this.renderizarCalendario();
    }

    // ===== BÚSQUEDA =====
    configurarBusqueda() {
        const buscarInput = document.getElementById('buscar-clase');
        if (buscarInput) {
            buscarInput.addEventListener('input', (e) => {
                this.filtrarClases(e.target.value);
            });
        }
    }

    filtrarClases(termino) {
        const clasesFiltradas = this.clases.filter(clase => 
            clase.estudiante.toLowerCase().includes(termino.toLowerCase())
        );
        this.renderizarListaClases(clasesFiltradas);
    }

    // ===== RENDERIZADO =====
    actualizarVistas() {
        this.renderizarListaClases();
        this.renderizarCalendario();
        this.actualizarEstadisticas();
        this.actualizarHeaderStats();
    }

    renderizarListaClases(clasesParaMostrar = null) {
        const container = document.getElementById('lista-clases');
        if (!container) return;

        const clases = clasesParaMostrar || this.clases;
        
        // Ordenar clases por fecha (más recientes primero)
        const clasesOrdenadas = [...clases].sort((a, b) => b.fecha - a.fecha);

        if (clasesOrdenadas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>No hay clases registradas</h3>
                    <p>Comienza agregando tu primera clase</p>
                </div>
            `;
            return;
        }

        container.innerHTML = clasesOrdenadas.map(clase => `
            <div class="clase-card">
                <div class="clase-header">
                    <div class="estudiante-nombre">${this.escaparHtml(clase.estudiante)}</div>
                    <div class="clase-precio">€${clase.precio.toFixed(2)}</div>
                </div>
                <div class="clase-info">
                    <span><i class="fas fa-calendar-day"></i> ${this.formatearFecha(clase.fecha)}</span>
                    <span><i class="fas fa-clock"></i> ${this.formatearHora(clase.fecha)}</span>
                </div>
                ${clase.observaciones ? `<div class="clase-observaciones">${this.escaparHtml(clase.observaciones)}</div>` : ''}
                <div class="clase-acciones">
                    <button class="btn-accion" onclick="app.editarClaseModal('${clase.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion danger" onclick="app.eliminarClaseModal('${clase.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderizarCalendario() {
        const container = document.getElementById('calendario');
        const mesActualElement = document.getElementById('mes-actual');
        if (!container || !mesActualElement) return;

        // Actualizar título del mes
        mesActualElement.textContent = this.fechaCalendario.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });

        // Obtener primer y último día del mes
        const primerDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), 1);
        const ultimoDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth() + 1, 0);
        
        // Ajustar para que la semana comience en lunes
        const primerLunes = new Date(primerDia);
        primerLunes.setDate(primerDia.getDate() - (primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1));

        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        let html = diasSemana.map(dia => `<div class="dia-semana">${dia}</div>`).join('');

        // Generar días del calendario
        const fecha = new Date(primerLunes);
        for (let i = 0; i < 42; i++) { // 6 semanas máximo
            const esOtroMes = fecha.getMonth() !== this.fechaCalendario.getMonth();
            const clasesDelDia = this.obtenerClasesPorFecha(fecha);
            
            html += `
                <div class="dia-calendario ${esOtroMes ? 'otro-mes' : ''}" onclick="app.abrirModalClase('${fecha.toISOString().split('T')[0]}')">
                    <div class="dia-numero">${fecha.getDate()}</div>
                    ${clasesDelDia.map(clase => `
                        <div class="clase-calendario">${this.escaparHtml(clase.estudiante)}</div>
                    `).join('')}
                </div>
            `;
            
            fecha.setDate(fecha.getDate() + 1);
        }

        container.innerHTML = html;
    }

    actualizarEstadisticas() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        const ingresosMes = this.clases
            .filter(clase => clase.fecha >= inicioMes)
            .reduce((total, clase) => total + clase.precio, 0);
        
        const estudiantesUnicos = [...new Set(this.clases.map(clase => clase.estudiante))];
        const totalClases = this.clases.length;
        const promedioClase = totalClases > 0 ? ingresosMes / this.clases.filter(clase => clase.fecha >= inicioMes).length : 0;

        // Actualizar elementos
        const ingresosMesElement = document.getElementById('ingresos-mes');
        const totalEstudiantesElement = document.getElementById('total-estudiantes');
        const totalClasesElement = document.getElementById('total-clases');
        const promedioClaseElement = document.getElementById('promedio-clase');
        
        if (ingresosMesElement) ingresosMesElement.textContent = `€${ingresosMes.toFixed(0)}`;
        if (totalEstudiantesElement) totalEstudiantesElement.textContent = estudiantesUnicos.length;
        if (totalClasesElement) totalClasesElement.textContent = totalClases;
        if (promedioClaseElement) promedioClaseElement.textContent = `€${(promedioClase || 0).toFixed(0)}`;

        this.renderizarTopEstudiantes();
    }

    renderizarTopEstudiantes() {
        const container = document.getElementById('lista-top-estudiantes');
        if (!container) return;
        
        const estudiantesStats = {};
        this.clases.forEach(clase => {
            if (!estudiantesStats[clase.estudiante]) {
                estudiantesStats[clase.estudiante] = {
                    nombre: clase.estudiante,
                    clases: 0,
                    total: 0
                };
            }
            estudiantesStats[clase.estudiante].clases++;
            estudiantesStats[clase.estudiante].total += clase.precio;
        });

        const topEstudiantes = Object.values(estudiantesStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        if (topEstudiantes.length === 0) {
            container.innerHTML = '<p class="text-center">No hay datos disponibles</p>';
            return;
        }

        container.innerHTML = topEstudiantes.map((estudiante, index) => `
            <div class="estudiante-top">
                <div class="estudiante-info">
                    <div class="estudiante-ranking">${index + 1}</div>
                    <div class="estudiante-datos">
                        <h4>${this.escaparHtml(estudiante.nombre)}</h4>
                        <p>${estudiante.clases} clases</p>
                    </div>
                </div>
                <div class="estudiante-total">€${estudiante.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    actualizarHeaderStats() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        
        const ingresosMes = this.clases
            .filter(clase => clase.fecha >= inicioMes)
            .reduce((total, clase) => total + clase.precio, 0);
        
        const clasesHoy = this.clases.filter(clase => {
            const fechaClase = new Date(clase.fecha);
            return fechaClase.toDateString() === hoy.toDateString();
        }).length;

        const totalMesElement = document.getElementById('total-mes');
        const clasesHoyElement = document.getElementById('clases-hoy');
        
        if (totalMesElement) totalMesElement.textContent = ingresosMes.toFixed(0);
        if (clasesHoyElement) clasesHoyElement.textContent = clasesHoy;
    }

    // ===== MODALES =====
    abrirModalClase(fecha = null) {
        const modal = document.getElementById('modal-clase');
        const titulo = document.getElementById('modal-titulo');
        
        if (!modal || !titulo) return;
        
        this.claseEditando = null;
        titulo.textContent = 'Nueva Clase';
        this.limpiarFormulario();
        
        if (fecha) {
            if (typeof fecha === 'string') {
                document.getElementById('fecha').value = fecha;
            } else {
                document.getElementById('fecha').value = fecha.toISOString().split('T')[0];
            }
        }
        
        modal.classList.add('show');
    }

    editarClaseModal(id) {
        const clase = this.clases.find(c => c.id === id);
        if (!clase) return;

        const modal = document.getElementById('modal-clase');
        const titulo = document.getElementById('modal-titulo');
        
        if (!modal || !titulo) return;
        
        this.claseEditando = id;
        titulo.textContent = 'Editar Clase';
        
        document.getElementById('estudiante').value = clase.estudiante;
        document.getElementById('fecha').value = clase.fecha.toISOString().split('T')[0];
        document.getElementById('hora').value = clase.fecha.toTimeString().split(':').slice(0,2).join(':');
        document.getElementById('precio').value = clase.precio;
        document.getElementById('observaciones').value = clase.observaciones;
        
        modal.classList.add('show');
    }

    eliminarClaseModal(id) {
        this.claseAEliminar = id;
        const modalConfirmacion = document.getElementById('modal-confirmacion');
        if (modalConfirmacion) {
            modalConfirmacion.classList.add('show');
        }
    }

    cerrarModal() {
        const modal = document.getElementById('modal-clase');
        if (modal) {
            modal.classList.remove('show');
            this.limpiarFormulario();
            this.claseEditando = null;
        }
    }

    cerrarModalConfirmacion() {
        const modalConfirmacion = document.getElementById('modal-confirmacion');
        if (modalConfirmacion) {
            modalConfirmacion.classList.remove('show');
            this.claseAEliminar = null;
        }
    }

    confirmarEliminar() {
        if (this.claseAEliminar) {
            this.eliminarClase(this.claseAEliminar);
            this.cerrarModalConfirmacion();
        }
    }

    // ===== FORMULARIOS =====
    limpiarFormulario() {
        const formClase = document.getElementById('form-clase');
        if (formClase) {
            formClase.reset();
            const hoy = new Date();
            const fechaInput = document.getElementById('fecha');
            const horaInput = document.getElementById('hora');
            
            if (fechaInput) fechaInput.value = hoy.toISOString().split('T')[0];
            if (horaInput) horaInput.value = '09:00';
        }
    }

    configurarFechaDefault() {
        this.limpiarFormulario();
    }

    guardarClaseFormulario() {
        const estudiante = document.getElementById('estudiante')?.value;
        const fecha = document.getElementById('fecha')?.value;
        const hora = document.getElementById('hora')?.value;
        const precio = document.getElementById('precio')?.value;
        const observaciones = document.getElementById('observaciones')?.value;

        const datosClase = {
            estudiante,
            fecha,
            hora,
            precio,
            observaciones
        };

        if (!datosClase.estudiante || !datosClase.fecha || !datosClase.hora || !datosClase.precio) {
            this.mostrarToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        if (parseFloat(datosClase.precio) <= 0) {
            this.mostrarToast('El precio debe ser mayor a 0', 'error');
            return;
        }

        if (this.claseEditando) {
            this.editarClase(this.claseEditando, datosClase);
        } else {
            this.agregarClase(datosClase);
        }

        this.cerrarModal();
    }

    // ===== UTILIDADES =====
    formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatearHora(fecha) {
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    mostrarToast(mensaje, tipo = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = mensaje;
        toast.classList.add('show');
        
        if (tipo === 'error') {
            toast.style.background = '#dc2626';
        } else {
            toast.style.background = '#059669';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ===== INICIALIZACIÓN =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando app...');
    app = new ClaseManager();
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Error al registrar Service Worker:', error);
            });
    }
});

// ===== FUNCIONES GLOBALES =====
window.app = {
    editarClaseModal: (id) => app?.editarClaseModal(id),
    eliminarClaseModal: (id) => app?.eliminarClaseModal(id),
    abrirModalClase: (fecha) => app?.abrirModalClase(fecha)
};
