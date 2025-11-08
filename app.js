// ===== GESTIÓN DE CLASES CON SISTEMA DE PAGOS - VERSIÓN CORREGIDA =====

// 🔧 FIX 1: Prevenir múltiples inicializaciones
let appInstancia = null;

class ClaseManager {
    constructor() {
        // Prevenir múltiples instancias
        if (appInstancia) {
            console.warn('Ya existe una instancia de ClaseManager');
            return appInstancia;
        }

        this.clases = this.cargarClases();
        this.claseEditando = null;
        this.fechaCalendario = new Date();
        this.fechaSeleccionada = null;
        this.claseAEliminar = null;
        this.clasePago = null;
        this.vistaCalendario = 'mes';
        this.vistaAnterior = 'mes';
        this.filtroEstadoPago = '';
        this.filtroMesPago = '';
        this.filtroTipoPago = 'todos';
        
        // 🔧 FIX 2: Flag para prevenir eventos duplicados
        this.eventListenersConfigurados = false;
        
        appInstancia = this;
        this.init();
    }

    // ===== GESTIÓN DE DATOS =====
    cargarClases() {
        try {
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
                    estadoPago: clase.estadoPago || 'pendiente',
                    metodoPago: clase.metodoPago || '',
                    notasPago: clase.notasPago || ''
                }));
            }
        } catch (error) {
            console.error('Error cargando clases:', error);
            this.mostrarToast('Error al cargar los datos. Se iniciará con datos vacíos.', 'error');
        }
        return [];
    }

    guardarClases() {
        try {
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage no disponible, datos no guardados');
                return;
            }
            
            localStorage.setItem('misClases', JSON.stringify(this.clases));
            console.log(`✅ Guardadas ${this.clases.length} clases`);
            
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error('Error guardando clases:', error);
            this.mostrarToast('Error al guardar los datos', 'error');
        }
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    agregarClase(datosClase) {
        try {
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
        } catch (error) {
            console.error('Error agregando clase:', error);
            this.mostrarToast('Error al agregar la clase', 'error');
        }
    }

    editarClase(id, datosClase) {
        try {
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
        } catch (error) {
            console.error('Error editando clase:', error);
            this.mostrarToast('Error al editar la clase', 'error');
        }
    }

    eliminarClase(id) {
        try {
            this.clases = this.clases.filter(clase => clase.id !== id);
            this.guardarClases();
            this.actualizarVistas();
            this.mostrarToast('Clase eliminada correctamente');
        } catch (error) {
            console.error('Error eliminando clase:', error);
            this.mostrarToast('Error al eliminar la clase', 'error');
        }
    }

    // ===== GESTIÓN DE PAGOS =====
    marcarComoPagado(id, datosPago) {
        try {
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
        } catch (error) {
            console.error('Error marcando como pagado:', error);
            this.mostrarToast('Error al registrar el pago', 'error');
        }
    }

    marcarComoPendiente(id) {
        try {
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
        } catch (error) {
            console.error('Error marcando como pendiente:', error);
            this.mostrarToast('Error al actualizar el pago', 'error');
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

    verificarDisponibilidadHorario(fecha, hora, claseIdExcluir = null) {
        try {
            const fechaHora = new Date(fecha + 'T' + hora);
            const conflictos = this.clases.filter(clase => {
                if (claseIdExcluir && clase.id === claseIdExcluir) return false;
                
                const fechaClase = new Date(clase.fecha);
                const diferenciaMinutos = Math.abs((fechaHora - fechaClase) / 60000);
                
                return diferenciaMinutos < 30;
            });
            
            return {
                disponible: conflictos.length === 0,
                conflictos: conflictos
            };
        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
            return { disponible: true, conflictos: [] };
        }
    }

    obtenerHorariosSugeridos(fecha) {
        const clasesDelDia = this.obtenerClasesPorFecha(fecha);
        const horariosOcupados = clasesDelDia.map(c => {
            const hora = c.fecha.getHours();
            const minutos = c.fecha.getMinutes();
            return `${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        });
        
        return {
            ocupados: horariosOcupados,
            sugeridos: this.generarHorariosSugeridos(horariosOcupados)
        };
    }

    generarHorariosSugeridos(ocupados) {
        const sugeridos = [];
        for (let hora = 8; hora <= 20; hora++) {
            ['00', '30'].forEach(minutos => {
                const horario = `${String(hora).padStart(2, '0')}:${minutos}`;
                if (!ocupados.includes(horario)) {
                    sugeridos.push(horario);
                }
            });
        }
        return sugeridos.slice(0, 8);
    }

    obtenerClasesFiltradas() {
        let clasesFiltradas = [...this.clases];
        
        if (this.filtroEstadoPago) {
            clasesFiltradas = clasesFiltradas.filter(clase => {
                return this.obtenerEstadoPago(clase) === this.filtroEstadoPago;
            });
        }
        
        if (this.filtroMesPago !== '') {
            const mesSeleccionado = parseInt(this.filtroMesPago);
            clasesFiltradas = clasesFiltradas.filter(clase => {
                return clase.fecha.getMonth() === mesSeleccionado;
            });
        }

        return clasesFiltradas;
    }

    obtenerClasesFiltradasPagos() {
        let clasesFiltradas = [...this.clases];
        
        if (this.filtroTipoPago !== 'todos') {
            clasesFiltradas = clasesFiltradas.filter(clase => {
                const estadoPago = this.obtenerEstadoPago(clase);
                return estadoPago === this.filtroTipoPago;
            });
        }
        
        if (this.filtroMesPago !== '') {
            const mesSeleccionado = parseInt(this.filtroMesPago);
            clasesFiltradas = clasesFiltradas.filter(clase => {
                return clase.fecha.getMonth() === mesSeleccionado;
            });
        }

        return clasesFiltradas;
    }

    obtenerInicioSemana(fecha) {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    init() {
        if (this.eventListenersConfigurados) {
            console.warn('Event listeners ya configurados, saltando...');
            this.actualizarVistas();
            return;
        }

        console.log('Iniciando configuración de la aplicación...');
        
        try {
            this.configurarEventListeners();
            this.configurarFechaDefault();
            this.configurarBusqueda();
            this.configurarFiltros();
            this.configurarSincronizacion();
            
            this.eventListenersConfigurados = true;
            
            setTimeout(() => {
                this.actualizarVistas();
                console.log('✅ Aplicación configurada correctamente');
            }, 100);
            
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            this.mostrarToast('Error al configurar la aplicación', 'error');
        }
    }

    configurarSincronizacion() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'misClases') {
                console.log('🔄 Datos actualizados en otra pestaña, recargando...');
                this.clases = this.cargarClases();
                this.actualizarVistas();
                this.mostrarToast('Datos sincronizados', 'success');
            }
        });

        setInterval(() => {
            const datosActuales = localStorage.getItem('misClases');
            const datosMemoria = JSON.stringify(this.clases);
            
            if (datosActuales !== datosMemoria) {
                console.log('🔄 Detectados cambios, sincronizando...');
                this.clases = this.cargarClases();
                this.actualizarVistas();
            }
        }, 5000);
    }

    configurarEventListeners() {
        this.removerEventListeners();

        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            const handler = (e) => {
                this.cambiarVista(e.currentTarget.dataset.view);
            };
            btn.addEventListener('click', handler);
            btn._clickHandler = handler;
        });

        const btnNuevaClase = document.getElementById('btn-nueva-clase');
        if (btnNuevaClase) {
            const handler = () => this.abrirModalClase();
            btnNuevaClase.addEventListener('click', handler);
            btnNuevaClase._clickHandler = handler;
        }

        this.configurarModales();

        const btnAnterior = document.getElementById('btn-calendario-anterior');
        const btnSiguiente = document.getElementById('btn-calendario-siguiente');
        
        if (btnAnterior) {
            const handler = () => this.navegarCalendario(-1);
            btnAnterior.addEventListener('click', handler);
            btnAnterior._clickHandler = handler;
        }
        if (btnSiguiente) {
            const handler = () => this.navegarCalendario(1);
            btnSiguiente.addEventListener('click', handler);
            btnSiguiente._clickHandler = handler;
        }

        const toggleMes = document.getElementById('toggle-mes');
        const toggleSemana = document.getElementById('toggle-semana');
        
        if (toggleMes) {
            const handler = () => this.cambiarVistaCalendario('mes');
            toggleMes.addEventListener('click', handler);
            toggleMes._clickHandler = handler;
        }
        if (toggleSemana) {
            const handler = () => this.cambiarVistaCalendario('semana');
            toggleSemana.addEventListener('click', handler);
            toggleSemana._clickHandler = handler;
        }

        const estadoPago = document.getElementById('estado-pago');
        if (estadoPago) {
            const handler = () => this.toggleFechaPago();
            estadoPago.addEventListener('change', handler);
            estadoPago._changeHandler = handler;
        }
    }

    removerEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn._clickHandler) {
                btn.removeEventListener('click', btn._clickHandler);
            }
        });

        const btnNuevaClase = document.getElementById('btn-nueva-clase');
        if (btnNuevaClase && btnNuevaClase._clickHandler) {
            btnNuevaClase.removeEventListener('click', btnNuevaClase._clickHandler);
        }
    }

    configurarModales() {
        const btnCerrar = document.getElementById('btn-cerrar-modal');
        const btnCancelar = document.getElementById('btn-cancelar');
        const btnCerrarPago = document.getElementById('btn-cerrar-modal-pago');
        const btnCancelarPago = document.getElementById('btn-cancelar-pago');
        
        if (btnCerrar) btnCerrar.addEventListener('click', () => this.cerrarModal());
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModal());
        if (btnCerrarPago) btnCerrarPago.addEventListener('click', () => this.cerrarModalPago());
        if (btnCancelarPago) btnCancelarPago.addEventListener('click', () => this.cerrarModalPago());

        const form = document.getElementById('form-clase');
        if (form) {
            if (form._submitHandler) {
                form.removeEventListener('submit', form._submitHandler);
            }
            
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const btnGuardar = document.getElementById('btn-guardar');
                if (btnGuardar) {
                    if (btnGuardar.disabled) {
                        console.log('⚠️ Guardado ya en progreso, ignorando...');
                        return;
                    }
                    btnGuardar.disabled = true;
                    btnGuardar.textContent = 'Guardando...';
                }
                
                try {
                    this.guardarClaseFormulario();
                } finally {
                    setTimeout(() => {
                        if (btnGuardar) {
                            btnGuardar.disabled = false;
                            btnGuardar.textContent = 'Guardar';
                        }
                    }, 1000);
                }
            };
            
            form.addEventListener('submit', handler);
            form._submitHandler = handler;
        }

        const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
        if (btnConfirmarPago) {
            btnConfirmarPago.addEventListener('click', () => this.confirmarPago());
        }

        const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
        const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
        
        if (btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', () => this.cerrarModalConfirmacion());
        if (btnConfirmarEliminar) btnConfirmarEliminar.addEventListener('click', () => this.confirmarEliminar());

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
        const filtroPago = document.getElementById('filtro-pago');
        if (filtroPago) {
            filtroPago.addEventListener('change', (e) => {
                this.filtroEstadoPago = e.target.value;
                this.renderizarListaClases();
            });
        }

        const filtroMesPago = document.getElementById('filtro-mes-pago');
        if (filtroMesPago) {
            filtroMesPago.addEventListener('change', (e) => {
                this.filtroMesPago = e.target.value;
                this.renderizarVistaPagos();
            });
        }

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                this.filtroTipoPago = e.currentTarget.dataset.filter;
                this.renderizarVistaPagos();
            });
        });
    }

    cambiarVista(vista) {
        console.log(`Cambiando a vista: ${vista}`);
        
        try {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            const navBtn = document.querySelector(`[data-view="${vista}"]`);
            if (navBtn) navBtn.classList.add('active');

            document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
            const targetView = document.getElementById(`vista-${vista}`);
            if (targetView) {
                targetView.classList.add('active');
            } else {
                console.error(`Vista no encontrada: vista-${vista}`);
                return;
            }

            if (vista === 'calendario') {
                this.renderizarCalendario();
            } else if (vista === 'estadisticas') {
                this.actualizarEstadisticas();
            } else if (vista === 'lista') {
                this.renderizarListaClases();
            } else if (vista === 'pagos') {
                this.renderizarVistaPagos();
            }
        } catch (error) {
            console.error('Error cambiando vista:', error);
        }
    }

    actualizarVistas() {
        try {
            this.actualizarEstadisticasHeader();
            this.renderizarListaClases();
            this.renderizarVistaPagos();
            this.actualizarEstadisticas();
        } catch (error) {
            console.error('Error actualizando vistas:', error);
        }
    }

    actualizarEstadisticasHeader() {
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        hoy.setHours(0, 0, 0, 0);

        const clasesMes = this.clases.filter(clase => {
            return clase.fecha >= primerDiaMes && clase.fecha <= ultimoDiaMes;
        });

        const totalMes = clasesMes
            .filter(clase => clase.estadoPago === 'pagado')
            .reduce((sum, clase) => sum + clase.precio, 0);

        const clasesHoy = this.clases.filter(clase => {
            const fechaClase = new Date(clase.fecha);
            fechaClase.setHours(0, 0, 0, 0);
            return fechaClase.getTime() === hoy.getTime();
        }).length;

        const pagosPendientes = this.clases.filter(clase => {
            const estadoPago = this.obtenerEstadoPago(clase);
            return estadoPago === 'pendiente' || estadoPago === 'vencido';
        }).length;

        this.actualizarElemento('total-mes', totalMes.toFixed(2));
        this.actualizarElemento('clases-hoy', clasesHoy);
        this.actualizarElemento('pagos-pendientes', pagosPendientes);
    }

    renderizarListaClases(clasesFiltradas = null) {
        const container = document.getElementById('lista-clases');
        if (!container) return;

        const clases = clasesFiltradas || this.obtenerClasesFiltradas();

        if (clases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay clases</h3>
                    <p>Haz clic en "Nueva Clase" para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = clases.map(clase => {
            const estadoPago = this.obtenerEstadoPago(clase);
            const tipoPago = this.obtenerTipoPago(clase);

            return `
                <div class="clase-card ${estadoPago}">
                    <div class="clase-header">
                        <h3>${this.escaparHtml(clase.estudiante)}</h3>
                        <span class="clase-precio">€${clase.precio}</span>
                    </div>
                    <div class="clase-info">
                        <span><i class="fas fa-calendar"></i> ${this.formatearFecha(clase.fecha)}</span>
                        <span><i class="fas fa-clock"></i> ${this.formatearHora(clase.fecha)}</span>
                    </div>
                    <div class="clase-estado">
                        ${estadoPago === 'pagado' ? `
                            <span class="badge-success">✓ Pagado</span>
                            ${tipoPago === 'adelantado' ? '<span class="badge-info">Adelantado</span>' : ''}
                            ${tipoPago === 'atrasado' ? '<span class="badge-warning">Atrasado</span>' : ''}
                        ` : estadoPago === 'vencido' ? 
                            '<span class="badge-danger">! Vencido</span>' : 
                            '<span class="badge-warning">○ Pendiente</span>'
                        }
                    </div>
                    ${clase.observaciones ? `<p class="clase-observaciones">${this.escaparHtml(clase.observaciones)}</p>` : ''}
                    <div class="clase-acciones">
                        ${estadoPago !== 'pagado' ? 
                            `<button class="btn-secondary btn-sm" onclick="app.abrirModalPago('${clase.id}')">
                                <i class="fas fa-euro-sign"></i> Marcar Pagado
                            </button>` : 
                            `<button class="btn-secondary btn-sm" onclick="app.marcarComoPendiente('${clase.id}')">
                                <i class="fas fa-undo"></i> Marcar Pendiente
                            </button>`
                        }
                        <button class="btn-secondary btn-sm" onclick="app.editarClaseModal('${clase.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-danger btn-sm" onclick="app.eliminarClaseModal('${clase.id}')">
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

        const clases = this.obtenerClasesFiltradasPagos();

        const pagosPagados = this.clases.filter(c => this.obtenerEstadoPago(c) === 'pagado').length;
        const pagosPendientes = this.clases.filter(c => this.obtenerEstadoPago(c) === 'pendiente').length;
        const pagosVencidos = this.clases.filter(c => this.obtenerEstadoPago(c) === 'vencido').length;

        this.actualizarElemento('pagos-al-dia', pagosPagados);
        this.actualizarElemento('pagos-pendientes-count', pagosPendientes);
        this.actualizarElemento('pagos-vencidos', pagosVencidos);

        if (clases.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No hay pagos para mostrar</h3>
                    <p>Cambia los filtros para ver más resultados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = clases.map(clase => {
            const estadoPago = this.obtenerEstadoPago(clase);
            const tipoPago = this.obtenerTipoPago(clase);

            return `
                <div class="pago-item ${estadoPago}">
                    <div class="pago-header">
                        <div class="pago-main-info">
                            <h3>${this.escaparHtml(clase.estudiante)}</h3>
                            <div class="pago-status">
                                ${estadoPago === 'pagado' ? `
                                    <span class="badge-success">✓ Pagado</span>
                                    ${tipoPago === 'adelantado' ? '<span class="badge-info">Adelantado</span>' : ''}
                                    ${tipoPago === 'atrasado' ? '<span class="badge-warning">Atrasado</span>' : ''}
                                ` : estadoPago === 'vencido' ? 
                                    '<span class="badge-danger">! Vencido</span>' : 
                                    '<span class="badge-warning">○ Pendiente</span>'
                                }
                            </div>
                        </div>
                        <div class="pago-precio">€${clase.precio}</div>
                    </div>
                    <div class="pago-detalles">
                        <div class="pago-fecha">
                            <i class="fas fa-calendar"></i>
                            <span>Clase: ${this.formatearFecha(clase.fecha)}</span>
                        </div>
                        ${clase.estadoPago === 'pagado' && clase.fechaPago ? `
                            <div class="pago-fecha">
                                <i class="fas fa-check-circle"></i>
                                <span>Pagado: ${this.formatearFecha(clase.fechaPago)}</span>
                            </div>
                        ` : ''}
                        ${clase.metodoPago ? `
                            <div class="pago-metodo">
                                <i class="fas fa-credit-card"></i>
                                <span>${clase.metodoPago}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${clase.notasPago ? `<div class="pago-notas">${this.escaparHtml(clase.notasPago)}</div>` : ''}
                    <div class="pago-acciones">
                        ${estadoPago !== 'pagado' ? 
                            `<button class="btn-primary btn-sm" onclick="app.abrirModalPago('${clase.id}')">
                                <i class="fas fa-euro-sign"></i> Marcar Pagado
                            </button>` : ''
                        }
                        <button class="btn-secondary btn-sm" onclick="app.editarClaseModal('${clase.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    cambiarVistaCalendario(vista) {
        this.vistaCalendario = vista;
        
        document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
        if (vista === 'mes') {
            document.getElementById('toggle-mes')?.classList.add('active');
        } else {
            document.getElementById('toggle-semana')?.classList.add('active');
        }
        
        this.renderizarCalendario();
    }

    renderizarCalendario() {
        if (this.vistaCalendario === 'mes') {
            this.renderizarVistaCompleta();
        } else if (this.vistaCalendario === 'semana') {
            this.renderizarVistaSemana();
        } else if (this.vistaCalendario === 'dia') {
            this.renderizarVistaDia();
        }
    }

    renderizarVistaCompleta() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        if (!container || !titulo) return;

        container.className = 'calendario-grid mes';
        
        const año = this.fechaCalendario.getFullYear();
        const mes = this.fechaCalendario.getMonth();
        
        titulo.textContent = `${this.fechaCalendario.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;

        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        const primerDiaSemana = primerDia.getDay();
        const diasMes = ultimoDia.getDate();

        let html = '';

        ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(dia => {
            html += `<div class="dia-cabecera">${dia}</div>`;
        });

        const diasVacios = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
        for (let i = 0; i < diasVacios; i++) {
            html += '<div class="dia-calendario vacio"></div>';
        }

        for (let dia = 1; dia <= diasMes; dia++) {
            const fecha = new Date(año, mes, dia);
            const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const clasesDelDia = this.obtenerClasesPorFecha(fecha);
            const esHoy = this.esFechaHoy(fecha);

            html += `
                <div class="dia-calendario ${esHoy ? 'hoy' : ''}" onclick="app.mostrarVistaDelDia('${fechaStr}')">
                    <div class="dia-numero">${dia}</div>
                    ${clasesDelDia.map(clase => {
                        const estadoPago = this.obtenerEstadoPago(clase);
                        return `<div class="clase-calendario ${estadoPago}">
                            ${this.escaparHtml(clase.estudiante)}
                        </div>`;
                    }).join('')}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    renderizarVistaSemana() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        if (!container || !titulo) return;

        container.className = 'calendario-grid semana';
        
        const inicioSemana = this.obtenerInicioSemana(this.fechaCalendario);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(finSemana.getDate() + 6);

        titulo.textContent = `${this.formatearFecha(inicioSemana)} - ${this.formatearFecha(finSemana)}`;

        let html = '';

        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(dia.getDate() + i);
            const clasesDelDia = this.obtenerClasesPorFecha(dia);
            const esHoy = this.esFechaHoy(dia);
            
            const año = dia.getFullYear();
            const mes = String(dia.getMonth() + 1).padStart(2, '0');
            const diaNum = String(dia.getDate()).padStart(2, '0');
            const fechaStr = `${año}-${mes}-${diaNum}`;

            html += `
                <div class="dia-semana ${esHoy ? 'hoy' : ''}" style="cursor: pointer;">
                    <div class="dia-semana-header" onclick="app.mostrarVistaDelDia('${fechaStr}')">
                        <div class="dia-semana-nombre">${dia.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                        <div class="dia-semana-numero">${dia.getDate()}</div>
                    </div>
                    <div class="clases-semana" onclick="app.mostrarVistaDelDia('${fechaStr}')">
                        ${clasesDelDia.length === 0 ? 
                            '<div class="sin-clases">Sin clases<br><small style="opacity: 0.7; font-size: 0.85em;">Click para agregar</small></div>' :
                            clasesDelDia.map(clase => {
                                const estadoPago = this.obtenerEstadoPago(clase);
                                return `
                                    <div class="clase-semana ${estadoPago}">
                                        <div class="hora-semana">${this.formatearHora(clase.fecha)}</div>
                                        <div class="estudiante-semana">${this.escaparHtml(clase.estudiante)}</div>
                                        <div class="precio-semana">€${clase.precio}</div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    esFechaHoy(fecha) {
        const hoy = new Date();
        return fecha.getDate() === hoy.getDate() &&
               fecha.getMonth() === hoy.getMonth() &&
               fecha.getFullYear() === hoy.getFullYear();
    }

    navegarCalendario(direccion) {
        if (this.vistaCalendario === 'mes') {
            this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + direccion);
        } else if (this.vistaCalendario === 'semana') {
            this.fechaCalendario.setDate(this.fechaCalendario.getDate() + (direccion * 7));
        } else if (this.vistaCalendario === 'dia') {
            this.fechaSeleccionada.setDate(this.fechaSeleccionada.getDate() + direccion);
        }
        
        this.renderizarCalendario();
    }

    mostrarVistaDelDia(fechaStr) {
        console.log('Mostrando día:', fechaStr);
        
        this.vistaAnterior = this.vistaCalendario;
        
        const partes = fechaStr.split('-');
        const año = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const dia = parseInt(partes[2]);
        
        this.fechaSeleccionada = new Date(año, mes, dia);
        this.vistaCalendario = 'dia';
        this.renderizarVistaDia();
    }

    renderizarVistaDia() {
        const container = document.getElementById('calendario');
        const titulo = document.getElementById('titulo-calendario');
        
        container.className = 'calendario-grid dia';
        
        const fechaFormato = `${this.fechaSeleccionada.getFullYear()}-${String(this.fechaSeleccionada.getMonth() + 1).padStart(2, '0')}-${String(this.fechaSeleccionada.getDate()).padStart(2, '0')}`;
        
        titulo.innerHTML = `
            <button onclick="app.volverAlCalendario()" style="background: none; border: none; cursor: pointer; padding: 0.5rem; color: white;">
                <i class="fas fa-arrow-left"></i>
            </button>
            ${this.fechaSeleccionada.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })}
            <button onclick="app.abrirModalClase('${fechaFormato}')" class="btn-primary btn-sm" style="margin-left: auto;">
                <i class="fas fa-plus"></i> Agregar
            </button>
        `;

        const clasesDelDia = this.obtenerClasesPorFecha(this.fechaSeleccionada);

        if (clasesDelDia.length === 0) {
            container.innerHTML = `
                <div class="dia-sin-clases">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay clases programadas</h3>
                    <p style="color: #64748b; margin-top: 0.5rem;">Haz clic en "Agregar" para programar una clase</p>
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
        this.vistaCalendario = this.vistaAnterior || 'mes';
        this.renderizarCalendario();
    }

    actualizarEstadisticas() {
        console.log('📊 Actualizando estadísticas...');
        const container = document.getElementById('estadisticas-container');
        if (!container) {
            console.error('❌ Container de estadísticas no encontrado');
            return;
        }

        try {
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

            console.log(`📅 Calculando para mes: ${hoy.getMonth() + 1}/${hoy.getFullYear()}`);
            console.log(`Total clases en sistema: ${this.clases.length}`);

            const clasesMes = this.clases.filter(clase => {
                const fechaClase = new Date(clase.fecha);
                return fechaClase >= primerDiaMes && fechaClase <= ultimoDiaMes;
            });

            console.log(`Clases del mes actual: ${clasesMes.length}`);

            const totalMes = clasesMes
                .filter(clase => clase.estadoPago === 'pagado')
                .reduce((sum, clase) => sum + clase.precio, 0);

            console.log(`💰 Total mes: €${totalMes.toFixed(2)}`);

            const totalEstudiantes = new Set(this.clases.map(c => c.estudiante)).size;
            console.log(`👥 Estudiantes únicos: ${totalEstudiantes}`);

            const clasesPagadas = this.clases.filter(c => this.obtenerEstadoPago(c) === 'pagado').length;
            const clasesPendientes = this.clases.filter(c => this.obtenerEstadoPago(c) === 'pendiente').length;
            const clasesVencidas = this.clases.filter(c => this.obtenerEstadoPago(c) === 'vencido').length;
            
            console.log(`✅ Pagadas: ${clasesPagadas}`);
            console.log(`⏳ Pendientes: ${clasesPendientes}`);
            console.log(`⚠️ Vencidas: ${clasesVencidas}`);

            const total = this.clases.length || 1;
            const porcentajePagado = Math.round((clasesPagadas / total) * 100);
            const porcentajePendiente = Math.round((clasesPendientes / total) * 100);
            const porcentajeVencido = Math.round((clasesVencidas / total) * 100);

            console.log(`📊 Porcentajes - Pagado: ${porcentajePagado}%, Pendiente: ${porcentajePendiente}%, Vencido: ${porcentajeVencido}%`);

            this.actualizarElemento('total-mes-stats', `€${totalMes.toFixed(2)}`);
            this.actualizarElemento('total-estudiantes', totalEstudiantes.toString());
            this.actualizarElemento('total-clases-stats', this.clases.length.toString());

            this.actualizarElemento('clases-pagadas', clasesPagadas.toString());
            this.actualizarElemento('clases-pendientes', clasesPendientes.toString());
            this.actualizarElemento('clases-vencidas', clasesVencidas.toString());

            const barPagados = document.getElementById('bar-pagados');
            const barPendientes = document.getElementById('bar-pendientes');
            const barVencidos = document.getElementById('bar-vencidos');

            if (barPagados) {
                barPagados.style.width = `${porcentajePagado}%`;
                console.log(`🟢 Barra pagados: ${porcentajePagado}%`);
            }
            if (barPendientes) {
                barPendientes.style.width = `${porcentajePendiente}%`;
                console.log(`🟡 Barra pendientes: ${porcentajePendiente}%`);
            }
            if (barVencidos) {
                barVencidos.style.width = `${porcentajeVencido}%`;
                console.log(`🔴 Barra vencidos: ${porcentajeVencido}%`);
            }

            this.actualizarElemento('porcentaje-pagados', `${porcentajePagado}%`);
            this.actualizarElemento('porcentaje-pendientes', `${porcentajePendiente}%`);
            this.actualizarElemento('porcentaje-vencidos', `${porcentajeVencido}%`);

            this.actualizarTopEstudiantes();

            console.log('✅ Estadísticas actualizadas correctamente');
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
            this.mostrarToast('Error al actualizar estadísticas', 'error');
        }
    }

    actualizarTopEstudiantes() {
        const container = document.getElementById('lista-top-estudiantes');
        if (!container) {
            console.error('❌ Container de top estudiantes no encontrado');
            return;
        }

        const estudianteStats = {};

        this.clases.forEach(clase => {
            if (!estudianteStats[clase.estudiante]) {
                estudianteStats[clase.estudiante] = {
                    total: 0,
                    clases: 0
                };
            }
            estudianteStats[clase.estudiante].clases++;
            if (clase.estadoPago === 'pagado') {
                estudianteStats[clase.estudiante].total += clase.precio;
            }
        });

        const topEstudiantes = Object.entries(estudianteStats)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5);

        console.log('🏆 Top 5 estudiantes:', topEstudiantes);

        if (topEstudiantes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b;">No hay datos</p>';
            return;
        }

        container.innerHTML = topEstudiantes.map((estud, index) => `
            <div class="top-estudiante-item">
                <div class="top-numero">${index + 1}</div>
                <div class="top-info">
                    <div class="top-nombre">${this.escaparHtml(estud[0])}</div>
                    <div class="top-detalles">${estud[1].clases} clases</div>
                </div>
                <div class="top-total">€${estud[1].total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    abrirModalClase(fechaPreseleccionada = null) {
        const modal = document.getElementById('modal-clase');
        if (!modal) return;

        this.claseEditando = null;
        this.limpiarFormulario();

        document.getElementById('modal-titulo').textContent = 'Nueva Clase';

        if (fechaPreseleccionada) {
            this.actualizarElemento('fecha', fechaPreseleccionada, 'value');
        }

        modal.classList.add('show');
    }

    editarClaseModal(id) {
        const clase = this.clases.find(c => c.id === id);
        if (!clase) return;

        this.claseEditando = id;

        const modal = document.getElementById('modal-clase');
        if (!modal) return;

        document.getElementById('modal-titulo').textContent = 'Editar Clase';

        this.actualizarElemento('estudiante', clase.estudiante, 'value');
        this.actualizarElemento('fecha', clase.fecha.toISOString().split('T')[0], 'value');
        this.actualizarElemento('hora', clase.fecha.toTimeString().slice(0, 5), 'value');
        this.actualizarElemento('precio', clase.precio, 'value');
        this.actualizarElemento('observaciones', clase.observaciones || '', 'value');
        this.actualizarElemento('estado-pago', clase.estadoPago, 'value');
        
        if (clase.fechaPago) {
            this.actualizarElemento('fecha-pago', clase.fechaPago.toISOString().split('T')[0], 'value');
        }

        this.toggleFechaPago();
        modal.classList.add('show');
    }

    eliminarClaseModal(id) {
        this.claseAEliminar = id;
        const modal = document.getElementById('modal-confirmacion');
        if (modal) modal.classList.add('show');
    }

    confirmarEliminar() {
        if (this.claseAEliminar) {
            this.eliminarClase(this.claseAEliminar);
            this.claseAEliminar = null;
        }
        this.cerrarModalConfirmacion();
    }

    abrirModalPago(id) {
        const clase = this.clases.find(c => c.id === id);
        if (!clase) return;

        this.clasePago = id;

        document.getElementById('pago-estudiante').textContent = clase.estudiante;
        document.getElementById('pago-fecha-clase').textContent = 
            `Clase del ${this.formatearFecha(clase.fecha)}`;
        document.getElementById('pago-importe').textContent = `Importe: €${clase.precio}`;

        const fechaPagoInput = document.getElementById('fecha-pago-modal');
        if (fechaPagoInput) {
            fechaPagoInput.value = new Date().toISOString().split('T')[0];
        }

        const modal = document.getElementById('modal-pago');
        if (modal) modal.classList.add('show');
    }

    confirmarPago() {
        if (!this.clasePago) return;

        const fechaPago = this.obtenerValorElemento('fecha-pago-modal');
        const metodoPago = this.obtenerValorElemento('metodo-pago');
        const notasPago = this.obtenerValorElemento('notas-pago');

        if (!fechaPago) {
            this.mostrarToast('Por favor selecciona una fecha de pago', 'error');
            return;
        }

        this.marcarComoPagado(this.clasePago, {
            fechaPago,
            metodoPago,
            notasPago
        });

        this.cerrarModalPago();
    }

    cerrarModal() {
        const modal = document.getElementById('modal-clase');
        if (modal) modal.classList.remove('show');
        this.claseEditando = null;
    }

    cerrarModalPago() {
        const modal = document.getElementById('modal-pago');
        if (modal) modal.classList.remove('show');
        this.clasePago = null;
    }

    cerrarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion');
        if (modal) modal.classList.remove('show');
        this.claseAEliminar = null;
    }

    toggleFechaPago() {
        const estadoPago = this.obtenerValorElemento('estado-pago');
        const grupoFechaPago = document.getElementById('grupo-fecha-pago');
        
        if (grupoFechaPago) {
            if (estadoPago === 'pagado') {
                grupoFechaPago.style.display = 'block';
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

        const disponibilidad = this.verificarDisponibilidadHorario(fecha, hora, this.claseEditando);
        if (!disponibilidad.disponible) {
            const conflicto = disponibilidad.conflictos[0];
            const horaConflicto = this.formatearHora(conflicto.fecha);
            const confirmar = confirm(
                `⚠️ ADVERTENCIA: Ya existe una clase a las ${horaConflicto} con ${conflicto.estudiante}.\n\n` +
                `¿Deseas programar otra clase en un horario tan cercano?\n\n` +
                `Haz clic en Aceptar para continuar o Cancelar para elegir otro horario.`
            );
            
            if (!confirmar) {
                const sugeridos = this.obtenerHorariosSugeridos(fecha);
                if (sugeridos.sugeridos.length > 0) {
                    this.mostrarToast(`Horarios disponibles: ${sugeridos.sugeridos.join(', ')}`, 'info');
                }
                return;
            }
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
        
        toast.style.background = tipo === 'error' ? '#dc2626' : tipo === 'info' ? '#0891b2' : '#059669';
        
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
            console.warn(`⚠️ Elemento no encontrado: ${id}`);
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
    console.log('🚀 Inicializando Mis Clases (Versión con Fixes de Calendario y Estadísticas)...');
    
    const elementosRequeridos = [
        'lista-clases', 'calendario', 'lista-pagos', 
        'total-mes', 'clases-hoy', 'pagos-pendientes',
        'total-mes-stats', 'total-estudiantes', 'total-clases-stats'
    ];
    
    const faltantes = elementosRequeridos.filter(id => !document.getElementById(id));
    if (faltantes.length > 0) {
        console.error('❌ Elementos faltantes:', faltantes);
        alert('Error: La aplicación no se cargó correctamente. Intenta refrescar la página.');
        return;
    }
    
    try {
        app = new ClaseManager();
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
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

console.log('📱 Versión con fixes aplicados - Calendario semanal clickable + Estadísticas corregidas');
