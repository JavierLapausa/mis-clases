// ===== GESTIÓN DE DATOS MEJORADA ===== 
class ClaseManager {
    constructor() {
        this.clases = this.cargarClases();
        this.claseEditando = null;
        this.fechaCalendario = new Date();
        this.fechaSeleccionada = null;
        this.vistaCalendario = 'mes'; // 'mes' o 'semana'
        this.init();
    }

    // Cargar clases desde localStorage
    cargarClases() {
        const datos = localStorage.getItem('misClases');
        if (datos) {
            const clases = JSON.parse(datos);
            // Convertir strings de fecha a objetos Date
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
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // ← ORDENAMIENTO POR HORA
    }

    // Obtener clases de una semana específica
    obtenerClasesPorSemana(fecha) {
        const inicioSemana = this.obtenerInicioSemana(fecha);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(finSemana.getDate() + 6);
        finSemana.setHours(23, 59, 59, 999);

        return this.clases.filter(clase => {
            const fechaClase = new Date(clase.fecha);
            return fechaClase >= inicioSemana && fechaClase <= finSemana;
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    // Obtener inicio de semana (lunes)
    obtenerInicioSemana(fecha) {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Actualizar todas las vistas
    actualizarVistas() {
        this.renderizarCalendario();
        this.actualizarEstadisticas();
        this.actualizarHeaderStats();
        
        // Si estamos en vista día, actualizar también
        if (this.fechaSeleccionada) {
            this.renderizarVistaDelDia(this.fechaSeleccionada);
        }
    }

    // Inicializar la aplicación
    init() {
        this.configurarEventListeners();
        this.actualizarVistas();
        this.configurarFechaDefault();
    }

    // ===== EVENT LISTENERS ACTUALIZADOS =====
    configurarEventListeners() {
        // Navegación principal
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarVista(e.currentTarget.dataset.view);
            });
        });

        // Toggle vista calendario (mes/semana)
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarVistaCalendario(e.currentTarget.dataset.view);
            });
        });

        // Modal nueva clase (botones múltiples)
        document.getElementById('btn-nueva-clase').addEventListener('click', () => {
            this.abrirModalClase();
        });

        document.getElementById('btn-nueva-clase-dia').addEventListener('click', () => {
            this.abrirModalClase(this.fechaSeleccionada);
        });

        // Cerrar modal
        document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
            this.cerrarModal();
        });

        document.getElementById('btn-cancelar').addEventListener('click', () => {
            this.cerrarModal();
        });

        // Formulario clase
        document.getElementById('form-clase').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarClaseFormulario();
        });

        // Confirmación eliminar
        document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => {
            this.cerrarModalConfirmacion();
        });

        document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
            this.confirmarEliminar();
        });

        // Navegación calendario
        document.getElementById('btn-mes-anterior').addEventListener('click', () => {
            this.navegarCalendario(-1);
        });

        document.getElementById('btn-mes-siguiente').addEventListener('click', () => {
            this.navegarCalendario(1);
        });

        // Vista día - navegación
        document.getElementById('btn-volver-calendario').addEventListener('click', () => {
            this.volverAlCalendario();
        });

        document.getElementById('btn-dia-anterior').addEventListener('click', () => {
            this.navegarDia(-1);
        });

        document.getElementById('btn-dia-siguiente').addEventListener('click', () => {
            this.navegarDia(1);
        });

        // Cerrar modal al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
                this.cerrarModalConfirmacion();
            }
        });
    }

    // ===== NAVEGACIÓN MEJORADA =====
    cambiarVista(vista) {
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

        // Actualizar vista específica si es necesario
        if (vista === 'calendario') {
            this.renderizarCalendario();
        } else if (vista === 'estadisticas') {
            this.actualizarEstadisticas();
        }
    }

    // Cambiar entre vista mensual y semanal
    cambiarVistaCalendario(vista) {
        this.vistaCalendario = vista;
        
        // Actualizar botones toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${vista}"]`).classList.add('active');

        // Mostrar vista correspondiente
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`vista-${vista === 'mes' ? 'mensual' : 'semanal'}`).classList.add('active');

        // Renderizar vista correspondiente
        if (vista === 'mes') {
            this.renderizarCalendarioMensual();
        } else {
            this.renderizarCalendarioSemanal();
        }
    }

    // Navegar calendario (anterior/siguiente)
    navegarCalendario(direccion) {
        if (this.vistaCalendario === 'mes') {
            this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + direccion);
            this.renderizarCalendarioMensual();
        } else {
            this.fechaCalendario.setDate(this.fechaCalendario.getDate() + (direccion * 7));
            this.renderizarCalendarioSemanal();
        }
    }

    // Mostrar vista día específico
    mostrarVistaDelDia(fecha) {
        this.fechaSeleccionada = new Date(fecha);
        
        // Mostrar botón día en navegación
        const navDia = document.querySelector('[data-view="dia"]');
        navDia.style.display = 'flex';
        
        // Cambiar a vista día
        this.cambiarVista('dia');
        
        // Renderizar vista del día
        this.renderizarVistaDelDia(fecha);
    }

    // Volver al calendario desde vista día
    volverAlCalendario() {
        // Ocultar botón día en navegación
        const navDia = document.querySelector('[data-view="dia"]');
        navDia.style.display = 'none';
        
        // Cambiar a vista calendario
        this.cambiarVista('calendario');
        
        this.fechaSeleccionada = null;
    }

    // Navegar entre días en vista día
    navegarDia(direccion) {
        if (!this.fechaSeleccionada) return;
        
        this.fechaSeleccionada.setDate(this.fechaSeleccionada.getDate() + direccion);
        this.renderizarVistaDelDia(this.fechaSeleccionada);
    }

    // ===== RENDERIZADO DE CALENDARIO PRINCIPAL =====
    renderizarCalendario() {
        if (this.vistaCalendario === 'mes') {
            this.renderizarCalendarioMensual();
        } else {
            this.renderizarCalendarioSemanal();
        }
    }

    // ===== RENDERIZADO CALENDARIO MENSUAL =====
    renderizarCalendarioMensual() {
        const calendar = document.getElementById('calendario');
        const mesActual = document.getElementById('mes-actual');
        
        // Actualizar título del mes
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        mesActual.textContent = `${meses[this.fechaCalendario.getMonth()]} ${this.fechaCalendario.getFullYear()}`;

        // Obtener primer día del mes y días en el mes
        const primerDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), 1);
        const ultimoDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth() + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const diaSemanaInicio = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1; // Lunes = 0

        // Generar calendario
        let html = '';
        
        // Cabeceras de días
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        diasSemana.forEach(dia => {
            html += `<div class="dia-semana">${dia}</div>`;
        });

        // Días del mes anterior
        const ultimoDiaMesAnterior = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), 0).getDate();
        for (let i = diaSemanaInicio - 1; i >= 0; i--) {
            const diaAnterior = ultimoDiaMesAnterior - i;
            html += `<div class="dia-calendario otro-mes">
                <div class="dia-numero">${diaAnterior}</div>
            </div>`;
        }

        // Días del mes actual
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), dia);
            const clasesDelDia = this.obtenerClasesPorFecha(fechaDia); // Ya ordenadas por hora
            const esHoy = fechaDia.toDateString() === new Date().toDateString();
            
            html += `<div class="dia-calendario ${esHoy ? 'hoy' : ''} ${clasesDelDia.length > 0 ? 'tiene-clases' : ''}" 
                          onclick="app.mostrarVistaDelDia('${fechaDia.toISOString().split('T')[0]}')">
                <div class="dia-numero">${dia}</div>
                ${clasesDelDia.map(clase => `
                    <div class="clase-calendario" title="${this.escaparHtml(clase.estudiante)} - €${clase.precio}">
                        ${this.formatearHora(clase.fecha)} ${this.escaparHtml(clase.estudiante)}
                    </div>
                `).join('')}
            </div>`;
        }

        // Días del mes siguiente
        const diasRestantes = 42 - (diaSemanaInicio + diasEnMes); // 6 semanas = 42 días
        for (let dia = 1; dia <= diasRestantes; dia++) {
            html += `<div class="dia-calendario otro-mes">
                <div class="dia-numero">${dia}</div>
            </div>`;
        }

        calendar.innerHTML = html;
    }

    // ===== RENDERIZADO CALENDARIO SEMANAL =====
    renderizarCalendarioSemanal() {
        const semanaHeader = document.getElementById('semana-header');
        const calendarioSemana = document.getElementById('calendario-semana');
        const mesActual = document.getElementById('mes-actual');
        
        // Obtener inicio de semana
        const inicioSemana = this.obtenerInicioSemana(this.fechaCalendario);
        
        // Actualizar título
        const inicioMes = inicioSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(finSemana.getDate() + 6);
        const finMes = finSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        if (inicioMes === finMes) {
            mesActual.textContent = inicioMes;
        } else {
            mesActual.textContent = `${inicioSemana.toLocaleDateString('es-ES', { month: 'short' })} - ${finSemana.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
        }

        // Generar cabeceras de días
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        semanaHeader.innerHTML = diasSemana.map(dia => `
            <div class="dia-semana-nombre">${dia}</div>
        `).join('');

        // Generar días de la semana
        let htmlSemana = '';
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(inicioSemana);
            fecha.setDate(fecha.getDate() + i);
            
            const clasesDelDia = this.obtenerClasesPorFecha(fecha); // Ya ordenadas por hora
            const esHoy = fecha.toDateString() === new Date().toDateString();
            const esMesActual = fecha.getMonth() === this.fechaCalendario.getMonth();
            
            htmlSemana += `<div class="dia-semana ${esHoy ? 'hoy' : ''} ${!esMesActual ? 'otro-mes' : ''}" 
                                onclick="app.mostrarVistaDelDia('${fecha.toISOString().split('T')[0]}')">
                <div class="dia-numero-semana">${fecha.getDate()}</div>
                ${clasesDelDia.map(clase => `
                    <div class="clase-semana" title="${this.escaparHtml(clase.estudiante)} - €${clase.precio}">
                        ${this.formatearHora(clase.fecha)} ${this.escaparHtml(clase.estudiante)}
                    </div>
                `).join('')}
            </div>`;
        }

        calendarioSemana.innerHTML = htmlSemana;
    }

    // ===== RENDERIZADO VISTA DEL DÍA =====
    renderizarVistaDelDia(fecha) {
        const fechaObj = new Date(fecha);
        const clasesDelDia = this.obtenerClasesPorFecha(fechaObj); // Ya ordenadas por hora
        
        // Actualizar título del día
        const titulo = fechaObj.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('dia-titulo').textContent = titulo.charAt(0).toUpperCase() + titulo.slice(1);
        
        // Actualizar resumen
        const totalIngresos = clasesDelDia.reduce((total, clase) => total + clase.precio, 0);
        document.getElementById('dia-resumen').textContent = 
            `${clasesDelDia.length} ${clasesDelDia.length === 1 ? 'clase' : 'clases'} - €${totalIngresos.toFixed(2)}`;
        
        // Renderizar clases del día
        const container = document.getElementById('clases-del-dia');
        
        if (clasesDelDia.length === 0) {
            container.innerHTML = `
                <div class="dia-vacio">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay clases programadas</h3>
                    <p>Toca el botón + para agregar una clase</p>
                    <button class="btn-primary" onclick="app.abrirModalClase('${fecha}')">
                        <i class="fas fa-plus"></i> Agregar Clase
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = clasesDelDia.map(clase => `
            <div class="clase-dia-card" onclick="app.editarClaseModal('${clase.id}')">
                <div class="clase-hora">${this.formatearHora(clase.fecha)}</div>
                <div class="clase-dia-header">
                    <div>
                        <div class="clase-estudiante-grande">${this.escaparHtml(clase.estudiante)}</div>
                        <div class="clase-precio-grande">€${clase.precio.toFixed(2)}</div>
                    </div>
                </div>
                
                ${clase.observaciones ? `
                    <div class="clase-observaciones-dia">
                        ${this.escaparHtml(clase.observaciones)}
                    </div>
                ` : ''}
                
                <div class="clase-acciones-dia">
                    <button class="btn-accion" onclick="event.stopPropagation(); app.editarClaseModal('${clase.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion danger" onclick="event.stopPropagation(); app.eliminarClaseModal('${clase.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ===== ESTADÍSTICAS =====
    actualizarEstadisticas() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        // Clases e ingresos del mes
        const clasesDelMes = this.clases.filter(clase => clase.fecha >= inicioMes);
        const ingresosMes = clasesDelMes.reduce((total, clase) => total + clase.precio, 0);
        
        // Estudiantes únicos
        const estudiantesUnicos = new Set(this.clases.map(clase => clase.estudiante)).size;
        
        // Promedio por clase
        const promedioClase = this.clases.length > 0 ? 
            this.clases.reduce((total, clase) => total + clase.precio, 0) / this.clases.length : 0;

        // Actualizar elementos
        document.getElementById('ingresos-mes').textContent = `€${ingresosMes.toFixed(2)}`;
        document.getElementById('total-estudiantes').textContent = estudiantesUnicos;
        document.getElementById('total-clases').textContent = this.clases.length;
        document.getElementById('promedio-clase').textContent = `€${promedioClase.toFixed(2)}`;

        // Top estudiantes
        this.renderizarTopEstudiantes();
    }

    renderizarTopEstudiantes() {
        const container = document.getElementById('lista-top-estudiantes');
        
        // Agrupar por estudiante
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

        // Ordenar por total y tomar top 5
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

    // ===== HEADER STATS =====
    actualizarHeaderStats() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        
        // Ingresos del mes
        const ingresosMes = this.clases
            .filter(clase => clase.fecha >= inicioMes)
            .reduce((total, clase) => total + clase.precio, 0);
        
        // Clases de hoy
        const clasesHoy = this.clases.filter(clase => {
            const fechaClase = new Date(clase.fecha);
            return fechaClase.toDateString() === hoy.toDateString();
        }).length;

        document.getElementById('total-mes').textContent = ingresosMes.toFixed(0);
        document.getElementById('clases-hoy').textContent = clasesHoy;
    }

    // ===== MODALES ACTUALIZADOS =====
    abrirModalClase(fecha = null) {
        const modal = document.getElementById('modal-clase');
        const titulo = document.getElementById('modal-titulo');
        
        this.claseEditando = null;
        titulo.textContent = 'Nueva Clase';
        this.limpiarFormulario();
        
        // Si se especifica una fecha, usarla
        if (fecha) {
            if (typeof fecha === 'string') {
                document.getElementById('fecha').value = fecha;
            } else {
                document.getElementById('fecha').value = fecha.toISOString().split('T')[0];
            }
        } else if (this.fechaSeleccionada) {
            // Si estamos en vista día, usar esa fecha
            document.getElementById('fecha').value = this.fechaSeleccionada.toISOString().split('T')[0];
        }
        
        modal.classList.add('show');
    }

    editarClaseModal(id) {
        const clase = this.clases.find(c => c.id === id);
        if (!clase) return;

        const modal = document.getElementById('modal-clase');
        const titulo = document.getElementById('modal-titulo');
        
        this.claseEditando = id;
        titulo.textContent = 'Editar Clase';
        
        // Llenar formulario con datos existentes
        document.getElementById('estudiante').value = clase.estudiante;
        document.getElementById('fecha').value = clase.fecha.toISOString().split('T')[0];
        document.getElementById('hora').value = clase.fecha.toTimeString().split(':').slice(0,2).join(':');
        document.getElementById('precio').value = clase.precio;
        document.getElementById('observaciones').value = clase.observaciones;
        
        modal.classList.add('show');
    }

    eliminarClaseModal(id) {
        this.claseAEliminar = id;
        document.getElementById('modal-confirmacion').classList.add('show');
    }

    cerrarModal() {
        document.getElementById('modal-clase').classList.remove('show');
        this.limpiarFormulario();
        this.claseEditando = null;
    }

    cerrarModalConfirmacion() {
        document.getElementById('modal-confirmacion').classList.remove('show');
        this.claseAEliminar = null;
    }

    confirmarEliminar() {
        if (this.claseAEliminar) {
            this.eliminarClase(this.claseAEliminar);
            this.cerrarModalConfirmacion();
        }
    }

    // ===== FORMULARIOS =====
    limpiarFormulario() {
        document.getElementById('form-clase').reset();
        // Establecer fecha actual por defecto
        const hoy = new Date();
        document.getElementById('fecha').value = hoy.toISOString().split('T')[0];
        document.getElementById('hora').value = '09:00';
    }

    configurarFechaDefault() {
        this.limpiarFormulario();
    }

    guardarClaseFormulario() {
        const form = document.getElementById('form-clase');
        const formData = new FormData(form);
        
        const datosClase = {
            estudiante: formData.get('estudiante') || document.getElementById('estudiante').value,
            fecha: formData.get('fecha') || document.getElementById('fecha').value,
            hora: formData.get('hora') || document.getElementById('hora').value,
            precio: formData.get('precio') || document.getElementById('precio').value,
            observaciones: formData.get('observaciones') || document.getElementById('observaciones').value
        };

        // Validar datos
        if (!datosClase.estudiante || !datosClase.fecha || !datosClase.hora || !datosClase.precio) {
            this.mostrarToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        if (parseFloat(datosClase.precio) <= 0) {
            this.mostrarToast('El precio debe ser mayor a 0', 'error');
            return;
        }

        // Guardar o editar
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
        
        toastMessage.textContent = mensaje;
        toast.classList.add('show');
        
        // Cambiar color según tipo
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

// Esperar a que se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    app = new ClaseManager();
    
    // Registrar Service Worker para PWA
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

// ===== FUNCIONES GLOBALES PARA EVENTOS =====
// Estas funciones son necesarias para los eventos onclick en el HTML
window.app = {
    editarClaseModal: (id) => app.editarClaseModal(id),
    eliminarClaseModal: (id) => app.eliminarClaseModal(id),
    abrirModalClase: (fecha) => app.abrirModalClase(fecha),
    mostrarVistaDelDia: (fecha) => app.mostrarVistaDelDia(fecha)
};

// ===== EXPORTAR DATOS =====
function exportarCSV() {
    if (app.clases.length === 0) {
        app.mostrarToast('No hay clases para exportar', 'error');
        return;
    }

    const csv = [
        'Estudiante,Fecha,Hora,Precio,Observaciones',
        ...app.clases.map(clase => {
            const fecha = clase.fecha.toLocaleDateString('es-ES');
            const hora = clase.fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const observaciones = clase.observaciones.replace(/,/g, ';'); // Reemplazar comas
            return `"${clase.estudiante}","${fecha}","${hora}",${clase.precio},"${observaciones}"`;
        })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mis-clases-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    app.mostrarToast('Datos exportados correctamente');
}

// ===== BACKUP DE DATOS =====
function respaldarDatos() {
    const datos = {
        clases: app.clases,
        fechaRespaldo: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `respaldo-clases-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    app.mostrarToast('Respaldo creado correctamente');
}

// ===== RESTAURAR DATOS =====
function restaurarDatos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    if (datos.clases && Array.isArray(datos.clases)) {
                        if (confirm('¿Estás seguro de que quieres restaurar los datos? Esto reemplazará todas las clases actuales.')) {
                            app.clases = datos.clases.map(clase => ({
                                ...clase,
                                fecha: new Date(clase.fecha)
                            }));
                            app.guardarClases();
                            app.actualizarVistas();
                            app.mostrarToast('Datos restaurados correctamente');
                        }
                    } else {
                        app.mostrarToast('Archivo de respaldo inválido', 'error');
                    }
                } catch (error) {
                    app.mostrarToast('Error al leer el archivo', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}
