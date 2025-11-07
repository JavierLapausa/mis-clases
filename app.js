// ===== GESTIÓN DE CLASES CON SISTEMA DE PAGOS =====
class ClaseManager {
    constructor() {
        this.clases = this.cargarClases();
        this.claseEditando = null;
        this.fechaCalendario = new Date();
        this.fechaSeleccionada = null;
        this.claseAEliminar = null;
        this.clasePago = null;
        this.vistaCalendario = 'mes';
        this.filtroEstadoPago = '';
        this.filtroMesPago = '';
        this.filtroTipoPago = 'todos';
        this.init();
    }

    // ===== GESTIÓN DE DATOS =====
    cargarClases() {
        try {
            // Verificar que localStorage esté disponible
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage no está disponible');
                return [];
            }
            
            const datos = localStorage.getItem('misClases');
            if (datos) {
                const clases = JSON.parse(datos);
                console.log(`Cargadas ${clases.length} clases desde localStorage`);
                return clases.map(clase => ({
                    ...clase,
                    fecha: new Date(clase.fecha),
                    fechaPago: clase.fechaPago ? new Date(clase.fechaPago) : null,
                    // Migrar datos existentes
                    estadoPago: clase.estadoPago || 'pendiente',
                    metodoPago: clase.metodoPago || '',
                    notasPago: clase.notasPago || ''
                }));
            }
        } catch (error) {
            console.error('Error cargando clases:', error);
            alert('Error al cargar los datos. Se iniciará con datos vacíos.');
        }
        return [];
    }

    guardarClases() {
        try {
            localStorage.setItem('misClases', JSON.stringify(this.clases));
        } catch (error) {
            console.error('Error guardando clases:', error);
        }
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    agregarClase(datosClase) {
        const nuevaClase = {
            id: this.generarId(),
            estudiante: datosClase.estudiante,
            fecha: new Date(datosClase.fecha + 'T' + datosClase.hora),
            precio: parseFloat(datosClase.precio),
            observaciones: datosClase.observaciones || '',
            estadoPago: datosClase.estadoPago || 'pendiente',
            fechaPago: datosClase.fechaPago ? new Date(datosClase.fechaPago) : null,
            metodoPago: datosClase.metodoPago || '',
            notasPago: datosClase.notasPago || ''
        };

        this.clases.push(nuevaClase);
        this.guardarClases();
        this.actualizarVistas();
        this.mostrarToast('Clase agregada correctamente');
    }

    editarClase(id, datosClase) {
        const index = this.clases.findIndex(clase => clase.id === id);
        if (index !== -1) {
            this.clases[index] = {
                ...this.clases[index],
                estudiante: datosClase.estudiante,
                fecha: new Date(datosClase.fecha + 'T' + datosClase.hora),
                precio: parseFloat(datosClase.precio),
                observaciones: datosClase.observaciones || '',
                estadoPago: datosClase.estadoPago,
                fechaPago: datosClase.fechaPago ? new Date(datosClase.fechaPago) : null,
                metodoPago: datosClase.metodoPago || '',
                notasPago: datosClase.notasPago || ''
            };
            this.guardarClases();
            this.actualizarVistas();
            this.mostrarToast('Clase actualizada correctamente');
        }
    }

    eliminarClase(id) {
        this.clases = this.clases.filter(clase => clase.id !== id);
        this.guardarClases();
        this.actualizarVistas();
        this.mostrarToast('Clase eliminada correctamente');
    }

    // ===== GESTIÓN DE PAGOS =====
    marcarComoPagado(id, datosPago) {
        const index = this.clases.findIndex(clase => clase.id === id);
        if (index !== -1) {
            this.clases[index].estadoPago = 'pagado';
            this.clases[index].fechaPago = new Date(datosPago.fechaPago);
            this.clases[index].metodoPago = datosPago.metodoPago;
            this.clases[index].notasPago = datosPago.notasPago || '';
            
            this.guardarClases();
            this.actualizarVistas();
            this.mostrarToast('Pago registrado correctamente', 'success');
        }
    }

    marcarComoPendiente(id) {
        const index = this.clases.findIndex(clase => clase.id === id);
        if (index !== -1) {
            this.clases[index].estadoPago = 'pendiente';
            this.clases[index].fechaPago = null;
            this.clases[index].metodoPago = '';
            this.clases[index].notasPago = '';
            
            this.guardarClases();
            this.actualizarVistas();
            this.mostrarToast('Pago marcado como pendiente');
        }
    }

    obtenerEstadoPago(clase) {
        if (clase.estadoPago === 'pagado') {
            return 'pagado';
        }
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaClase = new Date(clase.fecha);
        fechaClase.setHours(0, 0, 0, 0);
        
        // Si la clase fue hace más de 7 días y no está pagada, está vencida
        const diasDiferencia = Math.floor((hoy - fechaClase) / (1000 * 60 * 60 * 24));
        
        if (diasDiferencia > 7) {
            return 'vencido';
        }
        
        return 'pendiente';
    }

    obtenerTipoPago(clase) {
        if (clase.estadoPago !== 'pagado' || !clase.fechaPago) {
            return 'ninguno';
        }
        
        const fechaClase = new Date(clase.fecha);
        const fechaPago = new Date(clase.fechaPago);
        fechaClase.setHours(0, 0, 0, 0);
        fechaPago.setHours(0, 0, 0, 0);
        
        const diferenciaDias = Math.floor((fechaPago - fechaClase) / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias < 0) {
            return 'adelantado';
        } else if (diferenciaDias > 7) {
            return 'atrasado';
        } else {
            return 'normal';
        }
    }

    // ===== OBTENER CLASES CON FILTROS =====
    obtenerClasesPorFecha(fecha) {
        const clasesFiltradas = this.clases.filter(clase => {
            const fechaClase = new Date(clase.fecha);
            const fechaComparar = new Date(fecha);
            
            return fechaClase.getFullYear() === fechaComparar.getFullYear() &&
                   fechaClase.getMonth() === fechaComparar.getMonth() &&
                   fechaClase.getDate() === fechaComparar.getDate();
        });

        return clasesFiltradas.sort((a, b) => {
            return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });
    }

    obtenerClasesFiltradas() {
        let clasesFiltradas = [...this.clases];
        
        // Filtro por estado de pago (para vista lista)
        if (this.filtroEstadoPago) {
            clasesFiltradas = clasesFiltradas.filter(clase => {
                return this.obtenerEstadoPago(clase) === this.filtroEstadoPago;
            });
        }
        
        // Filtro por mes (para vista de pagos)
        if (this.filtroMesPago !== '') {
            const mesSeleccionado = parseInt(this.filtroMesPago);
            clasesFiltradas = clasesFiltradas.filter(clase => {
                return clase.fecha.getMonth() === mesSeleccionado;
            });
        }

        return clasesFiltradas;
    }

    // Nueva función específica para filtrar en vista de pagos
    obtenerClasesFiltradasPagos() {
        let clasesFiltradas = [...this.clases];
        
        // Debug básico
        if (this.filtroTipoPago !== 'todos') {
            console.log('Aplicando filtro:', this.filtroTipoPago);
        }
        
        // Filtro por tipo de pago (todos, pendiente, vencido, pagado)
        if (this.filtroTipoPago !== 'todos') {
            clasesFiltradas = clasesFiltradas.filter(clase => {
                const estadoPago = this.obtenerEstadoPago(clase);
                return estadoPago === this.filtroTipoPago;
            });
        }
        
        // Filtro por mes 
        if (this.filtroMesPago !== '') {
            const mesSeleccionado = parseInt(this.filtroMesPago);
            clasesFiltradas = clasesFiltradas.filter(clase => {
                return clase.fecha.getMonth() === mesSeleccionado;
            });
        }

        console.log(`Mostrando ${clasesFiltradas.length} clases de ${this.clases.length} totales`);
        return clasesFiltradas;
    }

    // Utilidades de fecha
    obtenerInicioSemana(fecha) {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    obtenerDiasSemana(fecha) {
        const inicioSemana = this.obtenerInicioSemana(fecha);
        const dias = [];
        
        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(inicioSemana.getDate() + i);
            dias.push(dia);
        }
        
        return dias;
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('Iniciando configuración de la aplicación...');
        
        // Verificar elementos críticos antes de continuar
        const elementosCriticos = ['lista-clases', 'calendario'];
        const faltantes = elementosCriticos.filter(id => !document.getElementById(id));
        
        if (faltantes.length > 0) {
            console.error('Elementos críticos faltantes:', faltantes);
            return;
        }
        
        try {
            this.configurarEventListeners();
            this.configurarFechaDefault();
            this.configurarBusqueda();
            this.configurarFiltros();
            
            // Pequeño delay para asegurar que el DOM esté completamente listo
            setTimeout(() => {
                this.actualizarVistas();
                console.log('Aplicación configurada correctamente');
            }, 100);
            
        } catch (error) {
            console.error('Error en inicialización:', error);
            alert('Error al configurar la aplicación: ' + error.message);
        }
    }

    configurarEventListeners() {
        // Navegación principal
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarVista(e.currentTarget.dataset.view);
            });
        });

        // Modal nueva clase
        const btnNuevaClase = document.getElementById('btn-nueva-clase');
        if (btnNuevaClase) {
            btnNuevaClase.addEventListener('click', () => this.abrirModalClase());
        }

        // Modales
        this.configurarModales();

        // Navegación calendario
        const btnAnterior = document.getElementById('btn-calendario-anterior');
        const btnSiguiente = document.getElementById('btn-calendario-siguiente');
        
        if (btnAnterior) btnAnterior.addEventListener('click', () => this.navegarCalendario(-1));
        if (btnSiguiente) btnSiguiente.addEventListener('click', () => this.navegarCalendario(1));

        // Toggle vista mes/semana
        const toggleMes = document.getElementById('toggle-mes');
        const toggleSemana = document.getElementById('toggle-semana');
        
        if (toggleMes) {
            toggleMes.addEventListener('click', () => this.cambiarVistaCalendario('mes'));
        }
        if (toggleSemana) {
            toggleSemana.addEventListener('click', () => this.cambiarVistaCalendario('semana'));
        }

        // Estado de pago en formulario
        const estadoPago = document.getElementById('estado-pago');
        if (estadoPago) {
            estadoPago.addEventListener('change', () => this.toggleFechaPago());
        }
    }

    configurarModales() {
        // Cerrar modales
        const btnCerrar = document.getElementById('btn-cerrar-modal');
        const btnCancelar = document.getElementById('btn-cancelar');
        const btnCerrarPago = document.getElementById('btn-cerrar-modal-pago');
        const btnCancelarPago = document.getElementById('btn-cancelar-pago');
        
        if (btnCerrar) btnCerrar.addEventListener('click', () => this.cerrarModal());
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModal());
        if (btnCerrarPago) btnCerrarPago.addEventListener('click', () => this.cerrarModalPago());
        if (btnCancelarPago) btnCancelarPago.addEventListener('click', () => this.cerrarModalPago());

        // Formularios
        const form = document.getElementById('form-clase');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarClaseFormulario();
            });
        }

        const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
        if (btnConfirmarPago) {
            btnConfirmarPago.addEventListener('click', () => this.confirmarPago());
        }

        // Confirmación eliminar
        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
        
        if (btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', () => this.cerrarModalConfirmacion());
        if (btnConfirmarEliminar) btnConfirmarEliminar.addEventListener('click', () => this.confirmarEliminar());

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
                this.cerrarModalConfirmacion();
                this.cerrarModalPago();
            }
        });
    }

    configurarBusqueda() {
        const buscar = document.getElementById('buscar-clase');
        if (buscar) {
            buscar.addEventListener('input', (e) => {
                this.filtrarClases(e.target.value);
            });
        }
    }

    configurarFiltros() {
        // Filtro estado de pago
        const filtroPago = document.getElementById('filtro-pago');
        if (filtroPago) {
            filtroPago.addEventListener('change', (e) => {
                this.filtroEstadoPago = e.target.value;
                this.renderizarListaClases();
            });
        }

        // Filtro mes para pagos
        const filtroMesPago = document.getElementById('filtro-mes-pago');
        if (filtroMesPago) {
            filtroMesPago.addEventListener('change', (e) => {
                this.filtroMesPago = e.target.value;
                this.renderizarVistaPagos();
            });
        }

        // Filtros de tabs en vista pagos - CORREGIDO
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remover active de todos los tabs
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                // Añadir active al clickeado
                e.currentTarget.classList.add('active');
                
                // Actualizar filtro
                this.filtroTipoPago = e.currentTarget.dataset.filter;
                this.renderizarVistaPagos();
            });
        });
    }

    // ===== NAVEGACIÓN =====
    cambiarVista(vista) {
        console.log(`Cambiando a vista: ${vista}`);
        
        try {
            // Actualizar navegación
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            const navBtn = document.querySelector(`[data-view="${vista}"]`);
            if (navBtn) navBtn.classList.add('active');

            // Mostrar vista
            document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
            const targetView = document.getElementById(`vista-${vista}`);
            if (targetView) {
                targetView.classList.add('active');
            } else {
                console.error(`Vista no encontrada: vista-${vista}`);
                return;
            }

            // Actualizar contenido
            if (vista === 'calendario') {
                this.renderizarCalendario();
            } else if (vista === 'estadisticas') {
                this.actualizarEstadisticas();
            } else if (vista === 'lista') {
                this.renderizarListaClases();
            } else if (vista === 'pagos') {
                this.renderizarVistaPagos();
            }
            
            console.log(`Vista ${vista} cargada correctamente`);
            
        } catch (error) {
            console.error(`Error al cambiar a vista ${vista}:`, error);
        }
    }

    cambiarVistaCalendario(vista) {
        this.vistaCalendario = vista;
        
        // Actualizar botones
        document.getElementById('toggle-mes').classList.remove('active');
        document.getElementById('toggle-semana').classList.remove('active');
        document.getElementById(`toggle-${vista}`).classList.add('active');
        
        this.renderizarCalendario();
    }

    // ===== RENDERIZADO =====
    renderizarListaClases(clasesFiltradas = null) {
        const container = document.getElementById('lista-clases');
        if (!container) return;

        const clases = clasesFiltradas || this.obtenerClasesFiltradas();
        
        if (clases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay clases</h3>
                    <p>Agrega tu primera clase para comenzar</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha (más recientes primero)
        clases.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        container.innerHTML = clases.map(clase => {
            const estadoPago = this.obtenerEstadoPago(clase);
            const tipoPago = this.obtenerTipoPago(clase);
            
            let badgePago = '';
            let iconoPago = '';
            
            switch (estadoPago) {
                case 'pagado':
                    badgePago = 'badge-success';
                    iconoPago = 'fas fa-check-circle';
                    break;
                case 'vencido':
                    badgePago = 'badge-danger';
                    iconoPago = 'fas fa-exclamation-triangle';
                    break;
                default:
                    badgePago = 'badge-warning';
                    iconoPago = 'fas fa-clock';
            }

            let tipopagoInfo = '';
            if (estadoPago === 'pagado') {
                switch (tipoPago) {
                    case 'adelantado':
                        tipopagoInfo = '<small class="tipo-pago adelantado"><i class="fas fa-arrow-up"></i> Adelantado</small>';
                        break;
                    case 'atrasado':
                        tipopagoInfo = '<small class="tipo-pago atrasado"><i class="fas fa-arrow-down"></i> Atrasado</small>';
                        break;
                }
            }

            return `
                <div class="clase-card" data-estado-pago="${estadoPago}">
                    <div class="clase-header">
                        <div class="estudiante-info">
                            <div class="estudiante-nombre">${this.escaparHtml(clase.estudiante)}</div>
                            <div class="pago-status">
                                <span class="payment-badge ${badgePago}">
                                    <i class="${iconoPago}"></i>
                                    ${estadoPago.charAt(0).toUpperCase() + estadoPago.slice(1)}
                                </span>
                                ${tipopagoInfo}
                            </div>
                        </div>
                        <div class="clase-precio">€${clase.precio}</div>
                    </div>
                    
                    <div class="clase-info">
                        <span><i class="fas fa-calendar"></i> ${this.formatearFecha(clase.fecha)}</span>
                        <span><i class="fas fa-clock"></i> ${this.formatearHora(clase.fecha)}</span>
                        ${clase.fechaPago ? `<span><i class="fas fa-euro-sign"></i> Pagado ${this.formatearFecha(clase.fechaPago)}</span>` : ''}
                    </div>
                    
                    ${clase.observaciones ? `<div class="clase-observaciones">${this.escaparHtml(clase.observaciones)}</div>` : ''}
                    ${clase.metodoPago ? `<div class="metodo-pago"><i class="fas fa-credit-card"></i> ${this.escaparHtml(clase.metodoPago)}</div>` : ''}
                    
                    <div class="clase-acciones">
                        ${estadoPago !== 'pagado' ? 
                            `<button class="btn-accion" onclick="app.abrirModalPago('${clase.id}')" title="Marcar como pagado">
                                <i class="fas fa-euro-sign"></i>
                            </button>` : 
                            `<button class="btn-accion" onclick="app.marcarComoPendiente('${clase.id}')" title="Marcar como pendiente">
                                <i class="fas fa-undo"></i>
                            </button>`
                        }
                        <button class="btn-accion" onclick="app.editarClaseModal('${clase.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion danger" onclick="app.eliminarClaseModal('${clase.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderizarVistaPagos() {
        const container = document.getElementById('lista-pagos');
        if (!container) return;

        // Actualizar estadísticas de pagos
        this.actualizarEstadisticasPagos();

        const clases = this.obtenerClasesFiltradasPagos(); // Usar la función específica para pagos
        
        if (clases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>No hay clases para mostrar</h3>
                    <p>Ajusta los filtros o agrega nuevas clases</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha
        clases.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        container.innerHTML = clases.map(clase => {
            const estadoPago = this.obtenerEstadoPago(clase);
            const tipoPago = this.obtenerTipoPago(clase);
            
            return `
                <div class="pago-item ${estadoPago}">
                    <div class="pago-main-info">
                        <div class="pago-estudiante">
                            <h4>${this.escaparHtml(clase.estudiante)}</h4>
                            <p><i class="fas fa-calendar"></i> ${this.formatearFecha(clase.fecha)} a las ${this.formatearHora(clase.fecha)}</p>
                        </div>
                        
                        <div class="pago-status">
                            <div class="pago-importe">€${clase.precio}</div>
                            <div class="pago-estado ${estadoPago}">
                                ${estadoPago === 'pagado' ? 
                                    `<i class="fas fa-check-circle"></i> Pagado` :
                                    estadoPago === 'vencido' ? 
                                    `<i class="fas fa-exclamation-triangle"></i> Vencido` :
                                    `<i class="fas fa-clock"></i> Pendiente`
                                }
                            </div>
                        </div>
                    </div>
                    
                    ${estadoPago === 'pagado' && clase.fechaPago ? `
                        <div class="pago-detalles">
                            <span><i class="fas fa-calendar-check"></i> Pagado: ${this.formatearFecha(clase.fechaPago)}</span>
                            ${clase.metodoPago ? `<span><i class="fas fa-credit-card"></i> ${clase.metodoPago}</span>` : ''}
                            ${tipoPago === 'adelantado' ? '<span class="tipo-pago adelantado"><i class="fas fa-arrow-up"></i> Adelantado</span>' : ''}
                            ${tipoPago === 'atrasado' ? '<span class="tipo-pago atrasado"><i class="fas fa-arrow-down"></i> Atrasado</span>' : ''}
                        </div>
                    ` : ''}
                    
                    <div class="pago-acciones">
                        ${estadoPago !== 'pagado' ? 
                            `<button class="btn-primary btn-sm" onclick="app.abrirModalPago('${clase.id}')">
                                <i class="fas fa-euro-sign"></i> Marcar Pagado
                            </button>` : 
                            `<button class="btn-secondary btn-sm" onclick="app.marcarComoPendiente('${clase.id}')">
                                <i class="fas fa-undo"></i> Marcar Pendiente
                            </button>`
                        }
                        <button class="btn-secondary btn-sm" onclick="app.editarClaseModal('${clase.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    actualizarEstadisticasPagos() {
        const totalClases = this.clases.length;
        let pagados = 0;
        let pendientes = 0;
        let vencidos = 0;

        this.clases.forEach(clase => {
            const estado = this.obtenerEstadoPago(clase);
            switch (estado) {
                case 'pagado': pagados++; break;
                case 'vencido': vencidos++; break;
                default: pendientes++; break;
            }
        });

        // Actualizar contadores en la vista de pagos
        this.actualizarElemento('pagos-al-dia', pagados);
        this.actualizarElemento('pagos-pendientes-count', pendientes);
        this.actualizarElemento('pagos-vencidos', vencidos);

        // Actualizar header
        this.actualizarElemento('pagos-pendientes', pendientes + vencidos);

        // Actualizar barras de progreso en estadísticas
        if (totalClases > 0) {
            const porcentajePagados = Math.round((pagados / totalClases) * 100);
            const porcentajePendientes = Math.round((pendientes / totalClases) * 100);
            const porcentajeVencidos = Math.round((vencidos / totalClases) * 100);

            this.actualizarElemento('porcentaje-pagados', `${porcentajePagados}%`);
            this.actualizarElemento('porcentaje-pendientes', `${porcentajePendientes}%`);
            this.actualizarElemento('porcentaje-vencidos', `${porcentajeVencidos}%`);

            // Actualizar barras
            const barPagados = document.getElementById('bar-pagados');
            const barPendientes = document.getElementById('bar-pendientes');
            const barVencidos = document.getElementById('bar-vencidos');

            if (barPagados) barPagados.style.width = `${porcentajePagados}%`;
            if (barPendientes) barPendientes.style.width = `${porcentajePendientes}%`;
            if (barVencidos) barVencidos.style.width = `${porcentajeVencidos}%`;
        }
    }

    renderizarCalendario() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        if (!container || !titulo) {
            console.error('Elementos del calendario no encontrados');
            return;
        }

        try {
            if (this.vistaCalendario === 'mes') {
                this.renderizarCalendarioMes();
            } else if (this.vistaCalendario === 'semana') {
                this.renderizarCalendarioSemana();
            }
            
            this.actualizarEstadisticasHeader();
        } catch (error) {
            console.error('Error al renderizar calendario:', error);
            container.innerHTML = '<div class="empty-state"><h3>Error al cargar el calendario</h3><p>Intenta refrescar la página</p></div>';
        }
    }

    renderizarCalendarioMes() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        container.className = 'calendario-grid mes';
        
        const año = this.fechaCalendario.getFullYear();
        const mes = this.fechaCalendario.getMonth();
        
        titulo.textContent = new Date(año, mes).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });

        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        const diasDelMes = ultimoDia.getDate();
        
        let inicioSemana = primerDia.getDay() - 1;
        if (inicioSemana < 0) inicioSemana = 6;

        const diasAnteriores = inicioSemana;
        const totalCeldas = Math.ceil((diasDelMes + diasAnteriores) / 7) * 7;

        let html = `
            <div class="dias-semana-header">
                ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => 
                    `<div class="dia-semana-nombre">${dia}</div>`
                ).join('')}
            </div>
        `;

        for (let i = 0; i < totalCeldas; i++) {
            const diaNumero = i - diasAnteriores + 1;
            const esDiaDelMes = diaNumero > 0 && diaNumero <= diasDelMes;
            const fecha = new Date(año, mes, diaNumero);
            
            let clasesDia = '';
            let clasesCSS = 'dia-calendario';
            
            if (esDiaDelMes) {
                const clasesDelDia = this.obtenerClasesPorFecha(fecha);
                
                if (clasesDelDia.length > 0) {
                    clasesCSS += ' con-clases';
                    clasesDia = clasesDelDia.slice(0, 3).map(clase => {
                        const estadoPago = this.obtenerEstadoPago(clase);
                        const iconoPago = estadoPago === 'pagado' ? '✓' : estadoPago === 'vencido' ? '!' : '○';
                        const hora = this.formatearHora(clase.fecha);
                        const nombreCorto = this.escaparHtml(clase.estudiante.split(' ')[0]);
                        return `<div class="clase-calendario ${estadoPago}" title="${this.escaparHtml(clase.estudiante)} - ${hora} - €${clase.precio}">${iconoPago} ${hora} ${nombreCorto}</div>`;
                    }).join('');
                    
                    if (clasesDelDia.length > 3) {
                        clasesDia += `<div class="mas-clases">+${clasesDelDia.length - 3} más</div>`;
                    }
                }
                
                // Marcar día actual
                const hoy = new Date();
                if (fecha.toDateString() === hoy.toDateString()) {
                    clasesCSS += ' dia-actual';
                }
            } else {
                clasesCSS += ' dia-otro-mes';
            }

            // Generar fecha string sin problemas de zona horaria
            let fechaStr = '';
            if (esDiaDelMes) {
                const año = fecha.getFullYear();
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const dia = String(fecha.getDate()).padStart(2, '0');
                fechaStr = `${año}-${mes}-${dia}`;
            }

            html += `
                <div class="${clasesCSS}" ${esDiaDelMes ? `onclick="app.mostrarVistaDelDia('${fechaStr}')"` : ''}>
                    ${esDiaDelMes ? `<div class="dia-numero">${diaNumero}</div>` : ''}
                    <div class="clases-del-dia">${clasesDia}</div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    renderizarCalendarioSemana() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        container.className = 'calendario-grid semana';
        
        const diasSemana = this.obtenerDiasSemana(this.fechaCalendario);
        const inicioSemana = diasSemana[0];
        const finSemana = diasSemana[6];
        
        titulo.textContent = `${inicioSemana.getDate()} - ${finSemana.getDate()} ${finSemana.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;

        const html = diasSemana.map(dia => {
            const clasesDelDia = this.obtenerClasesPorFecha(dia);
            const esHoy = dia.toDateString() === new Date().toDateString();
            
            return `
                <div class="dia-semana ${esHoy ? 'dia-actual' : ''}">
                    <div class="dia-semana-header">
                        <div class="dia-nombre">${dia.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                        <div class="dia-numero">${dia.getDate()}</div>
                    </div>
                    <div class="clases-semana">
                        ${clasesDelDia.map(clase => {
                            const estadoPago = this.obtenerEstadoPago(clase);
                            const iconoPago = estadoPago === 'pagado' ? '✓' : estadoPago === 'vencido' ? '!' : '○';
                            return `
                                <div class="clase-semana ${estadoPago}" onclick="app.editarClaseModal('${clase.id}')">
                                    <span class="pago-icon">${iconoPago}</span>
                                    <span class="hora-semana">${this.formatearHora(clase.fecha)}</span>
                                    <span class="estudiante-semana">${this.escaparHtml(clase.estudiante.split(' ')[0])}</span>
                                    <span class="precio-semana">€${clase.precio}</span>
                                </div>
                            `;
                        }).join('')}
                        ${clasesDelDia.length === 0 ? `
                            <div class="sin-clases" onclick="app.abrirModalClase('${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}')">
                                <i class="fas fa-plus"></i> Agregar clase
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    navegarCalendario(direccion) {
        if (this.vistaCalendario === 'mes') {
            this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + direccion);
        } else if (this.vistaCalendario === 'semana') {
            this.fechaCalendario.setDate(this.fechaCalendario.getDate() + (direccion * 7));
        }
        
        this.renderizarCalendario();
    }

    mostrarVistaDelDia(fechaStr) {
        console.log('Mostrando día:', fechaStr);
        
        // Crear fecha directamente desde string YYYY-MM-DD
        const partes = fechaStr.split('-');
        const año = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1; // JavaScript usa 0-11 para meses
        const dia = parseInt(partes[2]);
        
        this.fechaSeleccionada = new Date(año, mes, dia);
        this.vistaCalendario = 'dia';
        this.renderizarVistaDia();
    }

    renderizarVistaDia() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        container.className = 'calendario-grid dia';
        titulo.innerHTML = `
            <button onclick="app.volverAlCalendario()">
                <i class="fas fa-arrow-left"></i>
            </button>
            ${this.fechaSeleccionada.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })}
        `;

        const clasesDelDia = this.obtenerClasesPorFecha(this.fechaSeleccionada);

        if (clasesDelDia.length === 0) {
            container.innerHTML = `
                <div class="dia-sin-clases">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay clases programadas</h3>
                    <button class="btn-primary" onclick="app.abrirModalClase('${this.fechaSeleccionada.getFullYear()}-${String(this.fechaSeleccionada.getMonth() + 1).padStart(2, '0')}-${String(this.fechaSeleccionada.getDate()).padStart(2, '0')}')">
                        <i class="fas fa-plus"></i> Agregar clase
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = clasesDelDia.map(clase => {
            const estadoPago = this.obtenerEstadoPago(clase);
            const tipoPago = this.obtenerTipoPago(clase);
            
            return `
                <div class="clase-dia ${estadoPago}">
                    <div class="hora-dia">${this.formatearHora(clase.fecha)}</div>
                    <div class="info-dia">
                        <div class="estudiante-dia">${this.escaparHtml(clase.estudiante)}</div>
                        <div class="precio-dia">€${clase.precio}</div>
                        <div class="estado-pago-dia">
                            ${estadoPago === 'pagado' ? `
                                <span class="badge-success">✓ Pagado</span>
                                ${tipoPago === 'adelantado' ? '<span class="badge-info">Adelantado</span>' : ''}
                                ${tipoPago === 'atrasado' ? '<span class="badge-warning">Atrasado</span>' : ''}
                            ` : estadoPago === 'vencido' ? 
                                '<span class="badge-danger">! Vencido</span>' : 
                                '<span class="badge-warning">○ Pendiente</span>'
                            }
                        </div>
                        ${clase.observaciones ? `<div class="observaciones-dia">${this.escaparHtml(clase.observaciones)}</div>` : ''}
                    </div>
                    <div class="acciones-dia">
                        ${estadoPago !== 'pagado' ? 
                            `<button class="btn-accion" onclick="app.abrirModalPago('${clase.id}')" title="Marcar como pagado">
                                <i class="fas fa-euro-sign"></i>
                            </button>` : ''
                        }
                        <button class="btn-accion" onclick="app.editarClaseModal('${clase.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion danger" onclick="app.eliminarClaseModal('${clase.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    volverAlCalendario() {
        this.vistaCalendario = 'mes';
        this.renderizarCalendario();
    }

    actualizarVistas() {
        this.renderizarListaClases();
        this.actualizarEstadisticasHeader();
        
        const vistaActiva = document.querySelector('.view-section.active');
        if (vistaActiva && vistaActiva.id === 'vista-calendario') {
            this.renderizarCalendario();
        } else if (vistaActiva && vistaActiva.id === 'vista-pagos') {
            this.renderizarVistaPagos();
        } else if (vistaActiva && vistaActiva.id === 'vista-estadisticas') {
            this.actualizarEstadisticas();
        }
    }

    actualizarEstadisticas() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

        // Clases de este mes
        const clasesMes = this.clases.filter(clase => 
            clase.fecha >= inicioMes && clase.fecha <= finMes
        );

        const ingresosMes = clasesMes.reduce((total, clase) => total + clase.precio, 0);
        const totalClases = this.clases.length;
        const estudiantesUnicos = [...new Set(this.clases.map(clase => clase.estudiante))].length;
        const promedioClase = totalClases > 0 ? (this.clases.reduce((total, clase) => total + clase.precio, 0) / totalClases) : 0;

        // Actualizar valores
        this.actualizarElemento('ingresos-mes', `€${ingresosMes.toFixed(0)}`);
        this.actualizarElemento('total-estudiantes', estudiantesUnicos);
        this.actualizarElemento('total-clases', totalClases);
        this.actualizarElemento('promedio-clase', `€${promedioClase.toFixed(0)}`);

        // Actualizar estadísticas de pagos
        this.actualizarEstadisticasPagos();

        // Top estudiantes
        this.actualizarTopEstudiantes();
    }

    actualizarTopEstudiantes() {
        const estudiantes = {};
        
        this.clases.forEach(clase => {
            if (!estudiantes[clase.estudiante]) {
                estudiantes[clase.estudiante] = { clases: 0, total: 0 };
            }
            estudiantes[clase.estudiante].clases++;
            estudiantes[clase.estudiante].total += clase.precio;
        });

        const topEstudiantes = Object.entries(estudiantes)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5);

        const container = document.getElementById('lista-top-estudiantes');
        if (!container) return;

        if (topEstudiantes.length === 0) {
            container.innerHTML = '<p class="text-center">No hay datos suficientes</p>';
            return;
        }

        container.innerHTML = topEstudiantes.map((estudiante, index) => `
            <div class="estudiante-top">
                <div class="estudiante-info">
                    <div class="estudiante-ranking">${index + 1}</div>
                    <div class="estudiante-datos">
                        <h4>${this.escaparHtml(estudiante[0])}</h4>
                        <p>${estudiante[1].clases} clases</p>
                    </div>
                </div>
                <div class="estudiante-total">€${estudiante[1].total.toFixed(0)}</div>
            </div>
        `).join('');
    }

    actualizarEstadisticasHeader() {
        const hoy = new Date();
        let ingresos = 0;
        let numClases = 0;
        let pagosPendientes = 0;

        if (this.vistaCalendario === 'mes') {
            const año = this.fechaCalendario.getFullYear();
            const mes = this.fechaCalendario.getMonth();
            const inicioMes = new Date(año, mes, 1);
            const finMes = new Date(año, mes + 1, 0, 23, 59, 59, 999);
            
            const clasesMes = this.clases.filter(clase => 
                clase.fecha >= inicioMes && clase.fecha <= finMes
            );
            
            ingresos = clasesMes.reduce((total, clase) => {
                // Solo contar ingresos si está pagado
                return total + (clase.estadoPago === 'pagado' ? clase.precio : 0);
            }, 0);
            numClases = clasesMes.length;
            
        } else if (this.vistaCalendario === 'semana') {
            const inicioSemana = this.obtenerInicioSemana(this.fechaCalendario);
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);
            
            const clasesSemana = this.clases.filter(clase => 
                clase.fecha >= inicioSemana && clase.fecha <= finSemana
            );
            
            ingresos = clasesSemana.reduce((total, clase) => {
                // Solo contar ingresos si está pagado
                return total + (clase.estadoPago === 'pagado' ? clase.precio : 0);
            }, 0);
            numClases = clasesSemana.length;
            
        } else if (this.vistaCalendario === 'dia' && this.fechaSeleccionada) {
            const clasesDia = this.obtenerClasesPorFecha(this.fechaSeleccionada);
            
            ingresos = clasesDia.reduce((total, clase) => {
                // Solo contar ingresos si está pagado
                return total + (clase.estadoPago === 'pagado' ? clase.precio : 0);
            }, 0);
            numClases = clasesDia.length;
        } else {
            // Vista por defecto: mes actual
            const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const finMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
            
            const clasesMesActual = this.clases.filter(clase => 
                clase.fecha >= inicioMesActual && clase.fecha <= finMesActual
            );
            
            ingresos = clasesMesActual.reduce((total, clase) => {
                // Solo contar ingresos si está pagado
                return total + (clase.estadoPago === 'pagado' ? clase.precio : 0);
            }, 0);
            numClases = clasesMesActual.length;
        }

        // Contar pagos pendientes y vencidos globalmente
        this.clases.forEach(clase => {
            const estado = this.obtenerEstadoPago(clase);
            if (estado === 'pendiente' || estado === 'vencido') {
                pagosPendientes++;
            }
        });

        // Actualizar elementos del header
        this.actualizarElemento('total-mes', `${ingresos.toFixed(0)}`);
        this.actualizarElemento('clases-hoy', numClases);
        this.actualizarElemento('pagos-pendientes', pagosPendientes);
    }

    // ===== MODALES Y FORMULARIOS =====
    abrirModalClase(fecha = null) {
        const modal = document.getElementById('modal-clase');
        const titulo = document.getElementById('modal-titulo');
        
        if (!modal || !titulo) return;
        
        this.claseEditando = null;
        titulo.textContent = 'Nueva Clase';
        this.limpiarFormulario();
        
        if (fecha) {
            const fechaInput = document.getElementById('fecha');
            if (fechaInput) {
                let fechaFormato;
                if (typeof fecha === 'string') {
                    fechaFormato = fecha;
                } else {
                    // Si es un objeto Date, formatear correctamente
                    const año = fecha.getFullYear();
                    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                    const dia = String(fecha.getDate()).padStart(2, '0');
                    fechaFormato = `${año}-${mes}-${dia}`;
                }
                fechaInput.value = fechaFormato;
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
        
        this.actualizarElemento('estudiante', clase.estudiante, 'value');
        this.actualizarElemento('fecha', clase.fecha.toISOString().split('T')[0], 'value');
        this.actualizarElemento('hora', clase.fecha.toTimeString().split(':').slice(0,2).join(':'), 'value');
        this.actualizarElemento('precio', clase.precio, 'value');
        this.actualizarElemento('observaciones', clase.observaciones, 'value');
        this.actualizarElemento('estado-pago', clase.estadoPago, 'value');
        
        if (clase.fechaPago) {
            this.actualizarElemento('fecha-pago', clase.fechaPago.toISOString().split('T')[0], 'value');
        }
        
        this.toggleFechaPago();
        modal.classList.add('show');
    }

    abrirModalPago(id) {
        const clase = this.clases.find(c => c.id === id);
        if (!clase) return;

        this.clasePago = id;
        
        const modal = document.getElementById('modal-pago');
        if (!modal) return;

        // Rellenar información de la clase
        this.actualizarElemento('pago-estudiante', clase.estudiante);
        this.actualizarElemento('pago-fecha-clase', this.formatearFecha(clase.fecha));
        this.actualizarElemento('pago-importe', `€${clase.precio}`);
        
        // Fecha por defecto: hoy
        const hoy = new Date().toISOString().split('T')[0];
        this.actualizarElemento('fecha-pago-modal', hoy, 'value');
        
        // Limpiar formulario
        this.actualizarElemento('metodo-pago', 'efectivo', 'value');
        this.actualizarElemento('notas-pago', '', 'value');
        
        modal.classList.add('show');
    }

    confirmarPago() {
        const fechaPago = this.obtenerValorElemento('fecha-pago-modal');
        const metodoPago = this.obtenerValorElemento('metodo-pago');
        const notasPago = this.obtenerValorElemento('notas-pago');

        if (!fechaPago) {
            this.mostrarToast('Selecciona la fecha de pago', 'error');
            return;
        }

        const datosPago = {
            fechaPago,
            metodoPago,
            notasPago
        };

        this.marcarComoPagado(this.clasePago, datosPago);
        this.cerrarModalPago();
    }

    eliminarClaseModal(id) {
        this.claseAEliminar = id;
        const modal = document.getElementById('modal-confirmacion');
        if (modal) modal.classList.add('show');
    }

    cerrarModal() {
        const modal = document.getElementById('modal-clase');
        if (modal) {
            modal.classList.remove('show');
            this.limpiarFormulario();
            this.claseEditando = null;
        }
    }

    cerrarModalPago() {
        const modal = document.getElementById('modal-pago');
        if (modal) {
            modal.classList.remove('show');
            this.clasePago = null;
        }
    }

    cerrarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion');
        if (modal) {
            modal.classList.remove('show');
            this.claseAEliminar = null;
        }
    }

    confirmarEliminar() {
        if (this.claseAEliminar) {
            this.eliminarClase(this.claseAEliminar);
            this.cerrarModalConfirmacion();
        }
    }

    toggleFechaPago() {
        const estadoPago = this.obtenerValorElemento('estado-pago');
        const grupoFechaPago = document.getElementById('grupo-fecha-pago');
        
        if (grupoFechaPago) {
            if (estadoPago === 'pagado') {
                grupoFechaPago.style.display = 'block';
                // Poner fecha de hoy por defecto
                const fechaInput = document.getElementById('fecha-pago');
                if (fechaInput && !fechaInput.value) {
                    fechaInput.value = new Date().toISOString().split('T')[0];
                }
            } else {
                grupoFechaPago.style.display = 'none';
            }
        }
    }

    limpiarFormulario() {
        const form = document.getElementById('form-clase');
        if (form) {
            form.reset();
            const hoy = new Date();
            this.actualizarElemento('fecha', hoy.toISOString().split('T')[0], 'value');
            this.actualizarElemento('hora', '09:00', 'value');
            this.actualizarElemento('estado-pago', 'pendiente', 'value');
            this.toggleFechaPago();
        }
    }

    configurarFechaDefault() {
        this.limpiarFormulario();
    }

    guardarClaseFormulario() {
        const estudiante = this.obtenerValorElemento('estudiante');
        const fecha = this.obtenerValorElemento('fecha');
        const hora = this.obtenerValorElemento('hora');
        const precio = this.obtenerValorElemento('precio');
        const observaciones = this.obtenerValorElemento('observaciones');
        const estadoPago = this.obtenerValorElemento('estado-pago');
        const fechaPago = this.obtenerValorElemento('fecha-pago');

        if (!estudiante || !fecha || !hora || !precio) {
            this.mostrarToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        if (parseFloat(precio) <= 0) {
            this.mostrarToast('El precio debe ser mayor a 0', 'error');
            return;
        }

        const datosClase = { 
            estudiante, 
            fecha, 
            hora, 
            precio, 
            observaciones,
            estadoPago,
            fechaPago: estadoPago === 'pagado' && fechaPago ? fechaPago : null
        };

        if (this.claseEditando) {
            this.editarClase(this.claseEditando, datosClase);
        } else {
            this.agregarClase(datosClase);
        }

        this.cerrarModal();
    }

    // ===== UTILIDADES =====
    filtrarClases(termino) {
        const clasesFiltradas = this.clases.filter(clase => 
            clase.estudiante.toLowerCase().includes(termino.toLowerCase())
        );
        this.renderizarListaClases(clasesFiltradas);
    }

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
        
        toast.style.background = tipo === 'error' ? '#dc2626' : '#059669';
        
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    actualizarElemento(id, valor, propiedad = 'textContent') {
        const elemento = document.getElementById(id);
        if (elemento) {
            try {
                elemento[propiedad] = valor;
            } catch (error) {
                console.error(`Error actualizando elemento ${id}:`, error);
            }
        } else {
            console.warn(`Elemento no encontrado: ${id}`);
        }
    }

    obtenerValorElemento(id) {
        const elemento = document.getElementById(id);
        return elemento ? elemento.value : '';
    }
}

// ===== INICIALIZACIÓN =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Mis Clases con Sistema de Pagos...');
    
    // Verificar que todos los elementos necesarios estén presentes
    const elementosRequeridos = [
        'lista-clases', 'calendario', 'lista-pagos', 
        'total-mes', 'clases-hoy', 'pagos-pendientes'
    ];
    
    const faltantes = elementosRequeridos.filter(id => !document.getElementById(id));
    if (faltantes.length > 0) {
        console.error('Elementos faltantes en el DOM:', faltantes);
        alert('Error: La aplicación no se cargó correctamente. Intenta refrescar la página.');
        return;
    }
    
    try {
        app = new ClaseManager();
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        alert('Error al inicializar la aplicación: ' + error.message);
    }
});

// ===== FUNCIONES GLOBALES =====
window.app = {
    editarClaseModal: (id) => app?.editarClaseModal(id),
    eliminarClaseModal: (id) => app?.eliminarClaseModal(id),
    abrirModalClase: (fecha) => app?.abrirModalClase(fecha),
    abrirModalPago: (id) => app?.abrirModalPago(id),
    marcarComoPendiente: (id) => app?.marcarComoPendiente(id),
    mostrarVistaDelDia: (fecha) => app?.mostrarVistaDelDia(fecha),
    volverAlCalendario: () => app?.volverAlCalendario()
};