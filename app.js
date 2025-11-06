// ===== GESTIÓN DE DATOS CORREGIDA ===== 
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

    // Obtener inicio de semana (lunes)
    obtenerInicioSemana(fecha) {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('Inicializando app...');
        this.configurarEventListeners();
        this.configurarFechaDefault();
        this.actualizarVistas();
        
        // Configurar vista inicial
        const toggleMes = document.querySelector('.toggle-btn[data-view="mes"]');
        if (toggleMes) toggleMes.classList.add('active');
        
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

        // Event listeners dinámicos con delegación
        document.addEventListener('click', (e) => {
            // Toggle vista calendario
            if (e.target.closest('.toggle-btn')) {
                const btn = e.target.closest('.toggle-btn');
                const vista = btn.dataset.view;
                this.cambiarVistaCalendario(vista);
            }

            // Nueva clase desde vista día
            if (e.target.closest('#btn-nueva-clase-dia')) {
                this.abrirModalClase(this.fechaSeleccionada);
            }

            // Volver al calendario
            if (e.target.closest('#btn-volver-calendario')) {
                this.volverAlCalendario();
            }

            // Navegación días
            if (e.target.closest('#btn-dia-anterior')) {
                this.navegarDia(-1);
            }
            if (e.target.closest('#btn-dia-siguiente')) {
                this.navegarDia(1);
            }
        });

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
        }
    }

    // Cambiar entre vista mensual y semanal
    cambiarVistaCalendario(vista) {
        console.log('Cambiando vista calendario a:', vista);
        this.vistaCalendario = vista;
        
        // Actualizar botones toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.toggle-btn[data-view="${vista}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Mostrar vista correspondiente
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetCalendarView = document.getElementById(`vista-${vista === 'mes' ? 'mensual' : 'semanal'}`);
        if (targetCalendarView) {
            targetCalendarView.classList.add('active');
        }

        // Renderizar vista correspondiente
        this.renderizarCalendario();
    }

    // Navegar calendario (anterior/siguiente)
    navegarCalendario(direccion) {
        if (this.vistaCalendario === 'mes') {
            this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + direccion);
        } else {
            this.fechaCalendario.setDate(this.fechaCalendario.getDate() + (direccion * 7));
        }
        this.renderizarCalendario();
    }

    // ===== VISTA DÍA =====
    mostrarVistaDelDia(fecha) {
        console.log('Mostrando vista del día:', fecha);
        
        if (typeof fecha === 'string') {
            this.fechaSeleccionada = new Date(fecha + 'T12:00:00');
        } else {
            this.fechaSeleccionada = new Date(fecha);
        }
        
        // Mostrar botón día en navegación
        const navDia = document.querySelector('[data-view="dia"]');
        if (navDia) {
            navDia.style.display = 'flex';
        }
        
        // Cambiar a vista día
        this.cambiarVista('dia');
        
        // Renderizar vista del día
        this.renderizarVistaDelDia(this.fechaSeleccionada);
    }

    volverAlCalendario() {
        console.log('Volviendo al calendario');
        
        // Ocultar botón día en navegación
        const navDia = document.querySelector('[data-view="dia"]');
        if (navDia) {
            navDia.style.display = 'none';
        }
        
        // Cambiar a vista calendario
        this.cambiarVista('calendario');
        
        this.fechaSeleccionada = null;
    }

    navegarDia(direccion) {
        if (!this.fechaSeleccionada) return;
        
        console.log('Navegando día:', direccion);
        
        this.fechaSeleccionada.setDate(this.fechaSeleccionada.getDate() + direccion);
        this.renderizarVistaDelDia(this.fechaSeleccionada);
    }

    // ===== RENDERIZADO =====
    renderizarCalendario() {
        if (this.vistaCalendario === 'mes') {
            this.renderizarCalendarioMensual();
        } else {
            this.renderizarCalendarioSemanal();
        }
    }

    renderizarCalendarioMensual() {
        const calendar = document.getElementById('calendario');
        const mesActual = document.getElementById('mes-actual');
        
        if (!calendar || !mesActual) return;
        
        // Actualizar título del mes
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        mesActual.textContent = `${meses[this.fechaCalendario.getMonth()]} ${this.fechaCalendario.getFullYear()}`;

        // Obtener datos del mes
        const primerDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth(), 1);
        const ultimoDia = new Date(this.fechaCalendario.getFullYear(), this.fechaCalendario.getMonth() + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const diaSemanaInicio = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

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
            const clasesDelDia = this.obtenerClasesPorFecha(fechaDia);
            const esHoy = fechaDia.toDateString() === new Date().toDateString();
            const fechaStr = fechaDia.toISOString().split('T')[0];
            
            html += `<div class="dia-calendario ${esHoy ? 'hoy' : ''} ${clasesDelDia.length > 0 ? 'tiene-clases' : ''}" 
                          data-fecha="${fechaStr}">
                <div class="dia-numero">${dia}</div>
                ${clasesDelDia.map(clase => `
                    <div class="clase-calendario" title="${this.escaparHtml(clase.estudiante)} - €${clase.precio}">
                        ${this.formatearHora(clase.fecha)} ${this.escaparHtml(clase.estudiante)}
                    </div>
                `).join('')}
            </div>`;
        }

        // Días del mes siguiente
        const diasRestantes = 42 - (diaSemanaInicio + diasEnMes);
        for (let dia = 1; dia <= diasRestantes; dia++) {
            html += `<div class="dia-calendario otro-mes">
                <div class="dia-numero">${dia}</div>
            </div>`;
        }

        calendar.innerHTML = html;
        
        // Agregar event listeners
        setTimeout(() => this.agregarEventListenersDias(), 100);
    }

    renderizarCalendarioSemanal() {
        const semanaHeader = document.getElementById('semana-header');
        const calendarioSemana = document.getElementById('calendario-semana');
        const mesActual = document.getElementById('mes-actual');
        
        if (!semanaHeader || !calendarioSemana || !mesActual) return;
        
        // Obtener inicio de semana
        const inicioSemana = this.obtenerInicioSemana(this.fechaCalendario);
        
        // Actualizar título
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(finSemana.getDate() + 6);
        
        const inicioMes = inicioSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const finMes = finSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        if (inicioMes === finMes) {
            mesActual.textContent = inicioMes;
        } else {
            mesActual.textContent = `${inicioSemana.toLocaleDateString('es-ES', { month: 'short' })} - ${finSemana.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
        }

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
            const esMesActual = fecha.getMonth() === this.fechaCalendario.getMonth();
            const fechaStr = fecha.toISOString().split('T')[0];
            
            htmlSemana += `<div class="dia-semana ${esHoy ? 'hoy' : ''} ${!esMesActual ? 'otro-mes' : ''}" 
                                data-fecha="${fechaStr}">
                <div class="dia-numero-semana">${fecha.getDate()}</div>
                ${clasesDelDia.map(clase => `
                    <div class="clase-semana" title="${this.escaparHtml(clase.estudiante)} - €${clase.precio}">
                        ${this.formatearHora(clase.fecha)} ${this.escaparHtml(clase.estudiante)}
                    </div>
                `).join('')}
            </div>`;
        }

        calendarioSemana.innerHTML = htmlSemana;
        
        // Agregar event listeners
        setTimeout(() => this.agregarEventListenersDiasSemana(), 100);
    }

    renderizarVistaDelDia(fecha) {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha + 'T12:00:00') : new Date(fecha);
        console.log('Renderizando vista del día:', fechaObj);
        
        // Obtener clases del día ORDENADAS
        const clasesDelDia = this.obtenerClasesPorFecha(fechaObj);
        console.log('Clases ordenadas:', clasesDelDia);
        
        // Título
        const titulo = fechaObj.toLocaleDateString('es-ES', { 
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
        
        // Clases
        const container = document.getElementById('clases-del-dia');
        if (!container) return;
        
        if (clasesDelDia.length === 0) {
            container.innerHTML = `
                <div class="dia-vacio">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay clases programadas</h3>
                    <p>Toca el botón + para agregar una clase</p>
                    <button class="btn-primary" onclick="app.abrirModalClase('${fechaObj.toISOString().split('T')[0]}')">
                        <i class="fas fa-plus"></i> Agregar Clase
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = clasesDelDia.map(clase => `
            <div class="clase-dia-card">
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
                    <button class="btn-accion" onclick="app.editarClaseModal('${clase.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion danger" onclick="app.eliminarClaseModal('${clase.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Event listeners para días
    agregarEventListenersDias() {
        document.querySelectorAll('.dia-calendario[data-fecha]').forEach(dia => {
            dia.addEventListener('click', (e) => {
                const fecha = e.currentTarget.dataset.fecha;
                if (fecha && !e.currentTarget.classList.contains('otro-mes')) {
                    console.log('Click en día:', fecha);
                    this.mostrarVistaDelDia(fecha);
                }
            });
        });
    }

    agregarEventListenersDiasSemana() {
        document.querySelectorAll('.dia-semana[data-fecha]').forEach(dia => {
            dia.addEventListener('click', (e) => {
                const fecha = e.currentTarget.dataset.fecha;
                if (fecha && !e.currentTarget.classList.contains('otro-mes')) {
                    console.log('Click en día semana:', fecha);
                    this.mostrarVistaDelDia(fecha);
                }
            });
        });
    }

    // ===== OTRAS FUNCIONES =====
    actualizarVistas() {
        this.renderizarCalendario();
        this.actualizarEstadisticas();
        this.actualizarHeaderStats();
        
        if (this.fechaSeleccionada) {
            this.renderizarVistaDelDia(this.fechaSeleccionada);
        }
    }

    // ===== ESTADÍSTICAS =====
    actualizarEstadisticas() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        const clasesDelMes = this.clases.filter(clase => clase.fecha >= inicioMes);
        const ingresosMes = clasesDelMes.reduce((total, clase) => total + clase.precio, 0);
        const estudiantesUnicos = new Set(this.clases.map(clase => clase.estudiante)).size;
        const promedioClase = this.clases.length > 0 ? 
            this.clases.reduce((total, clase) => total + clase.precio, 0) / this.clases.length : 0;

        const elementos = {
            'ingresos-mes': `€${ingresosMes.toFixed(2)}`,
            'total-estudiantes': estudiantesUnicos,
            'total-clases': this.clases.length,
            'promedio-clase': `€${promedioClase.toFixed(2)}`
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        });

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
        
        this.claseEditando = null;
        titulo.textContent = 'Nueva Clase';
        this.limpiarFormulario();
        
        if (fecha) {
            if (typeof fecha === 'string') {
                document.getElementById('fecha').value = fecha;
            } else {
                document.getElementById('fecha').value = fecha.toISOString().split('T')[0];
            }
        } else if (this.fechaSeleccionada) {
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
        const hoy = new Date();
        document.getElementById('fecha').value = hoy.toISOString().split('T')[0];
        document.getElementById('hora').value = '09:00';
    }

    configurarFechaDefault() {
        this.limpiarFormulario();
    }

    guardarClaseFormulario() {
        const datosClase = {
            estudiante: document.getElementById('estudiante').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            precio: document.getElementById('precio').value,
            observaciones: document.getElementById('observaciones').value
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
    editarClaseModal: (id) => app.editarClaseModal(id),
    eliminarClaseModal: (id) => app.eliminarClaseModal(id),
    abrirModalClase: (fecha) => app.abrirModalClase(fecha),
    mostrarVistaDelDia: (fecha) => app.mostrarVistaDelDia(fecha)
};
