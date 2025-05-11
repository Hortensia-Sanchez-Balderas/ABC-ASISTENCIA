document.addEventListener("DOMContentLoaded", function() {
    //Notas importantes 
    //Buscar palaabra "endpoint" para encontrar donde actualizar 
    // Se elimino la funcion de formatear hora y se movio a global, pero en este archivo tambien lo llama en otra funcion

    
    // Configuración global
    const API_BASE_URL = 'http://tu-api.com/api';
    
    // Variables de estado
    let allData = [];
    let datosFiltrados = [];
    let paginaActual = 1;
    let filasPorPagina = 10;
    let registroEditando = null;

    // Elementos del DOM
    const inputBusqueda = document.getElementById('buscarAsistencia');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const selectFilas = document.getElementById('filasPorPagina');
    const selectDepartamento = document.getElementById('filtroDepartamento');
    const selectRol = document.getElementById('filtroRol');

    // Elementos del modal de edición
    const modalEdicion = new bootstrap.Modal(document.getElementById('modalEdicion'));
    const formularioEdicion = document.getElementById('formularioEdicion');
    const campoId = document.getElementById('editId');
    const campoNombre = document.getElementById('editNombre');
    const campoDepartamento = document.getElementById('editDepartamento');
    const campoRol = document.getElementById('editRol');
    const campoHoraEntrada = document.getElementById('editHoraEntrada');
    const campoHoraSalida = document.getElementById('editHoraSalida');
    const btnGuardarCambios = document.getElementById('btnGuardarCambios');

    // Inicialización
    async function init() {
        try {
            showLoading(true, "Cargando datos...");
            await loadData();
            setupEventListeners();
            actualizarTabla();
            actualizarPaginacion();
        } catch (error) {
            console.error("Error inicializando:", error);
            showError("Error al cargar los datos iniciales");
        } finally {
            showLoading(false);
        }
    }

    // Carga todos los datos necesarios
    async function loadData() {
        try {
            const [eventos, turnos, empleados, departamentos] = await Promise.all([
                fetchEventosDiarios(),
                fetchTurnosDiarios(),
                fetchEmpleados(),
                fetchDepartamentos()
            ]);
            
            allData = processCombinedData(eventos, turnos, empleados);
            datosFiltrados = [...allData];
            
            populateDepartmentFilter(departamentos);
            populateEditDepartmentFilter(departamentos); // Llenar select del modal
        } catch (error) {
            console.error("Error cargando datos:", error);
            throw error;
        }
    }

    // Fetch endpoints específicos
    async function fetchEventosDiarios() {
        const response = await fetch(`${API_BASE_URL}/eventos-asistencia/diarios`);
        if (!response.ok) throw new Error("Error obteniendo eventos diarios");
        return await response.json();
    }

    async function fetchTurnosDiarios() {
        const response = await fetch(`${API_BASE_URL}/turnos-completos/diarios`);
        if (!response.ok) throw new Error("Error obteniendo turnos diarios");
        return await response.json();
    }

    async function fetchEmpleados() {
        const response = await fetch(`${API_BASE_URL}/empleados`);
        if (!response.ok) throw new Error("Error obteniendo empleados");
        return await response.json();
    }

    async function fetchDepartamentos() {
        const response = await fetch(`${API_BASE_URL}/departamentos`);
        if (!response.ok) throw new Error("Error obteniendo departamentos");
        return await response.json();
    }

    // Procesamiento de datos combinados
    function processCombinedData(eventos, turnos, empleados) {
        return empleados.map(empleado => {
            const eventosEmpleado = eventos.filter(e => e.id_empleado === empleado.id_empleado);
            const turnoEmpleado = turnos.find(t => t.id_empleado === empleado.id_empleado);
            
            return {
                id_empleado: empleado.id_empleado,
                nombre: empleado.nombre,
                id_departamento: empleado.id_departamento,
                departamento: empleado.departamento?.nombre || 'Sin departamento',
                id_rol: empleado.id_rol,
                rol: empleado.rol?.nombre || 'Sin rol',
                hora_entrada: getEventTime(eventosEmpleado, 'Entrada'),
                hora_salida: getEventTime(eventosEmpleado, 'Salida'),
                minutos_retardo: turnoEmpleado?.minutos_retardo || 0,
                tiempo_comida: turnoEmpleado?.tiempo_comida_minutos || 0,
                id_turno: turnoEmpleado?.id_turno || null
            };
        });
    }

    // Helper para obtener hora de evento
    function getEventTime(eventos, tipo) {
        const evento = eventos.find(e => e.tipo_evento?.nombre === tipo);
        return evento ? formatDateTime(evento.fecha_hora) : '-';
    }

    // Formatear fecha-hora
    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '--:--';
        const date = new Date(dateTimeStr);
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }

    // Llenar filtro de departamentos
    function populateDepartmentFilter(departamentos) {
        selectDepartamento.innerHTML = '<option value="">Todos los departamentos</option>';
        departamentos.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id_departamento;
            option.textContent = dept.nombre;
            selectDepartamento.appendChild(option);
        });
    }

    // Llenar select de departamentos en el modal
    function populateEditDepartmentFilter(departamentos) {
        campoDepartamento.innerHTML = '';
        departamentos.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id_departamento;
            option.textContent = dept.nombre;
            campoDepartamento.appendChild(option);
        });
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Búsqueda y filtros
        btnBuscar.addEventListener('click', aplicarFiltros);
        inputBusqueda.addEventListener('keypress', e => {
            if (e.key === 'Enter') aplicarFiltros();
        });
        btnLimpiar.addEventListener('click', limpiarFiltros);

        // Paginación
        selectFilas.addEventListener('change', function() {
            filasPorPagina = parseInt(this.value);
            paginaActual = 1;
            actualizarTabla();
            actualizarPaginacion();
        });

        document.querySelector('.pagination').addEventListener('click', function(e) {
            e.preventDefault();
            if (e.target.closest('#paginaAnterior')) {
                if (paginaActual > 1) cambiarPagina(paginaActual - 1);
            } else if (e.target.closest('#paginaSiguiente')) {
                if (paginaActual < Math.ceil(datosFiltrados.length / filasPorPagina)) {
                    cambiarPagina(paginaActual + 1);
                }
            } else if (e.target.hasAttribute('data-pagina')) {
                cambiarPagina(parseInt(e.target.getAttribute('data-pagina')));
            }
        });

        // Modal de edición
        formularioEdicion.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarCambios();
        });
    }

    // Aplicar filtros
    function aplicarFiltros() {
        const searchTerm = inputBusqueda.value.toLowerCase();
        const deptFilter = selectDepartamento.value;
        const rolFilter = selectRol.value;

        datosFiltrados = allData.filter(item => {
            const matchesSearch = 
                item.id_empleado.toString().includes(searchTerm) ||
                item.nombre.toLowerCase().includes(searchTerm);
            
            const matchesDept = deptFilter === "" || item.id_departamento.toString() === deptFilter;
            const matchesRol = rolFilter === "" || item.id_rol.toString() === rolFilter;
            
            return matchesSearch && matchesDept && matchesRol;
        });

        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    }

    // Limpiar filtros
    function limpiarFiltros() {
        inputBusqueda.value = "";
        selectDepartamento.value = "";
        selectRol.value = "";
        aplicarFiltros();
    }

    // Función para actualizar la tabla con los datos paginados
    function actualizarTabla() {
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const datosPaginados = datosFiltrados.slice(inicio, fin);
        
        const tbody = document.querySelector('#tablaAsistenciasdiario tbody');
        tbody.innerHTML = '';
        
        if (datosPaginados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No se encontraron registros</td></tr>';
            return;
        }
        
        datosPaginados.forEach(asistencia => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${asistencia.id_empleado}</td>
                <td>${asistencia.nombre}</td>
                <td>${asistencia.departamento}</td>
                <td>${asistencia.rol}</td>
                <td>${asistencia.hora_entrada}</td>
                <td>${asistencia.hora_salida}</td>
                <td>${asistencia.minutos_retardo} min</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${asistencia.id_empleado}">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${asistencia.id_turno || ''}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        addEditDeleteEvents();
    }

    // Función para actualizar la paginación
    function actualizarPaginacion() {
        const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
        const paginacion = document.querySelector('.pagination');
        paginacion.innerHTML = '';
        
        // Botón Anterior
        const liAnterior = document.createElement('li');
        liAnterior.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
        liAnterior.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous" id="paginaAnterior">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        paginacion.appendChild(liAnterior);
        
        // Números de página (mostrar máximo 5 páginas)
        const paginasVisibles = 5;
        let inicioPaginas = Math.max(1, paginaActual - Math.floor(paginasVisibles / 2));
        let finPaginas = Math.min(totalPaginas, inicioPaginas + paginasVisibles - 1);
        
        // Ajustar si estamos cerca del final
        if (finPaginas - inicioPaginas + 1 < paginasVisibles) {
            inicioPaginas = Math.max(1, finPaginas - paginasVisibles + 1);
        }
        
        // Primera página y elipsis si es necesario
        if (inicioPaginas > 1) {
            const liPrimera = document.createElement('li');
            liPrimera.className = 'page-item';
            liPrimera.innerHTML = `<a class="page-link" href="#" data-pagina="1">1</a>`;
            paginacion.appendChild(liPrimera);
            
            if (inicioPaginas > 2) {
                const liElipsis = document.createElement('li');
                liElipsis.className = 'page-item disabled';
                liElipsis.innerHTML = `<span class="page-link">...</span>`;
                paginacion.appendChild(liElipsis);
            }
        }
        
        // Páginas visibles
        for (let i = inicioPaginas; i <= finPaginas; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
            paginacion.appendChild(li);
        }
        
        // Última página y elipsis si es necesario
        if (finPaginas < totalPaginas) {
            if (finPaginas < totalPaginas - 1) {
                const liElipsis = document.createElement('li');
                liElipsis.className = 'page-item disabled';
                liElipsis.innerHTML = `<span class="page-link">...</span>`;
                paginacion.appendChild(liElipsis);
            }
            
            const liUltima = document.createElement('li');
            liUltima.className = 'page-item';
            liUltima.innerHTML = `<a class="page-link" href="#" data-pagina="${totalPaginas}">${totalPaginas}</a>`;
            paginacion.appendChild(liUltima);
        }
        
        // Botón Siguiente
        const liSiguiente = document.createElement('li');
        liSiguiente.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
        liSiguiente.innerHTML = `
            <a class="page-link" href="#" aria-label="Next" id="paginaSiguiente">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        paginacion.appendChild(liSiguiente);
        
        // Actualizar información de paginación
        const infoPaginacion = document.querySelector('.info-paginacion');
        if (infoPaginacion) {
            const inicio = (paginaActual - 1) * filasPorPagina + 1;
            const fin = Math.min(paginaActual * filasPorPagina, datosFiltrados.length);
            infoPaginacion.textContent = `Mostrando ${inicio}-${fin} de ${datosFiltrados.length} registros`;
        }
    }

    // Función para cambiar de página
    function cambiarPagina(nuevaPagina) {
        paginaActual = nuevaPagina;
        actualizarTabla();
        actualizarPaginacion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Agregar eventos a botones de editar/eliminar
    function addEditDeleteEvents() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                abrirModalEdicion(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (id) confirmarEliminacion(id);
                else showError("No se puede eliminar - turno no registrado");
            });
        });
    }

    // Abrir modal de edición
    function abrirModalEdicion(idEmpleado) {
        registroEditando = allData.find(e => e.id_empleado.toString() === idEmpleado);
        if (!registroEditando) return;

        // Llenar formulario con datos actuales
        campoId.value = registroEditando.id_empleado;
        campoNombre.value = registroEditando.nombre;
        campoDepartamento.value = registroEditando.id_departamento;
        campoRol.value = registroEditando.id_rol;
        campoHoraEntrada.value = formatearHoraEstandar(registroEditando.hora_entrada);
        campoHoraSalida.value = formatearHoraEstandar(registroEditando.hora_salida);
        
        // Mostrar modal
        modalEdicion.show();
    }

    // Guardar cambios desde el modal
    async function guardarCambios() {
        try {
            showLoading(true, "Guardando cambios...");
            
            // Validación básica
            if (!campoHoraEntrada.value || !campoHoraSalida.value) {
                throw new Error("Las horas de entrada y salida son obligatorias");
            }

            // Preparar datos para enviar
            const datosActualizados = {
                id_empleado: campoId.value,
                nombre: campoNombre.value,
                id_departamento: campoDepartamento.value,
                id_rol: campoRol.value,
                hora_entrada: campoHoraEntrada.value,
                hora_salida: campoHoraSalida.value
            };

            // Endpoint para actualizar
            const response = await fetch(`${API_BASE_URL}/asistencias/${campoId.value}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error en la actualización");
            }

            // Cerrar modal y recargar datos
            modalEdicion.hide();
            await loadData();
            showSuccess("Registro actualizado correctamente");
        } catch (error) {
            console.error("Error guardando cambios:", error);
            showError(error.message || "Error al guardar los cambios");
        } finally {
            showLoading(false);
        }
    }

    // Confirmar eliminación
    async function confirmarEliminacion(idTurno) {
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmacion.isConfirmed) {
            try {
                showLoading(true, "Eliminando registro...");
                
                const response = await fetch(`${API_BASE_URL}/turnos-completos/${idTurno}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error("Error en la eliminación");

                await loadData();
                showSuccess("Registro eliminado correctamente");
            } catch (error) {
                console.error("Error eliminando:", error);
                showError("Error al eliminar el registro");
            } finally {
                showLoading(false);
            }
        }
    }

    // Mostrar/ocultar loading
    function showLoading(show, message = "") {
        const loadingElement = document.getElementById('loadingIndicator') || createLoadingElement();
        if (message) loadingElement.textContent = message;
        loadingElement.style.display = show ? 'block' : 'none';
    }

    function createLoadingElement() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingDiv.style.color = 'white';
        loadingDiv.style.padding = '20px';
        loadingDiv.style.borderRadius = '5px';
        loadingDiv.style.zIndex = '1000';
        document.body.appendChild(loadingDiv);
        return loadingDiv;
    }

    // Mostrar mensaje de éxito
    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    // Mostrar mensaje de error
    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            timer: 3000
        });
    }

    // Iniciar la aplicación
    init();
});