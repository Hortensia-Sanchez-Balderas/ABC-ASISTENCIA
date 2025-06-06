document.addEventListener("DOMContentLoaded", function() {
    // Configuración global
    const API_BASE_URL = 'https://abcd-asistencia.onrender.com/';
    
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
            setupEventListeners(); // Nombre corregido
            actualizarTabla();
            actualizarPaginacion();
            limpiarFiltros();
        } catch (error) {
            console.error("Error inicializando:", error);
            showError("Error al cargar los datos iniciales");
        } finally {
            showLoading(false);
        }
    }

    // Función para llenar el filtro de departamentos
    function populateDepartmentFilter(departamentos) {
        if (!selectDepartamento) return;
        
        selectDepartamento.innerHTML = '<option value="">Todos los departamentos</option>';
        departamentos.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id_departamento;
            option.textContent = dept.nombre;
            selectDepartamento.appendChild(option);
        });
    }

    // Función para llenar el select de departamentos en el modal
    function populateEditDepartmentFilter(departamentos) {
        if (!campoDepartamento) return;
        
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
        if (btnBuscar) btnBuscar.addEventListener('click', aplicarFiltros);
        if (inputBusqueda) inputBusqueda.addEventListener('keypress', e => {
            if (e.key === 'Enter') aplicarFiltros();
        });
        if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);

        if (selectFilas) selectFilas.addEventListener('change', function() {
            filasPorPagina = parseInt(this.value);
            paginaActual = 1;
            actualizarTabla();
            actualizarPaginacion();
        });

        const paginacion = document.querySelector('.pagination');
        if (paginacion) {
            paginacion.addEventListener('click', function(e) {
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
        }

        if (formularioEdicion) {
            formularioEdicion.addEventListener('submit', function(e) {
                e.preventDefault();
                guardarCambios();
            });
        }
    }

    // Función para aplicar filtros
    function aplicarFiltros() {
        const searchTerm = inputBusqueda.value.toLowerCase();
        const deptFilter = selectDepartamento ? selectDepartamento.value : "";
        const rolFilter = selectRol ? selectRol.value : "";

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

    function limpiarFiltros() {
    // Limpiar input de búsqueda
    const inputBusqueda = document.getElementById('buscarAsistencia');
    if (inputBusqueda) inputBusqueda.value = '';

    // Limpiar filtro de departamento
    const selectDepartamento = document.getElementById('filtroDepartamento');
    if (selectDepartamento) selectDepartamento.value = '';

    // Limpiar filtro de rol
    const selectRol = document.getElementById('filtroRol');
    if (selectRol) selectRol.value = '';

    // Restaurar datos filtrados a todos los datos originales
    if (typeof allData !== 'undefined') {
        datosFiltrados = [...allData];
    }

    // Reiniciar paginación
    paginaActual = 1;

    // Actualizar la tabla y la paginación
    actualizarTabla();
    actualizarPaginacion();
}
    // Carga todos los datos necesarios
    async function loadData() {
        try {
            // Obtener asistencias diarias
            const response = await fetch(`${API_BASE_URL}asistencias/obtener-asistencia-diaria`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                   
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            allData = procesarEventos(data);
            console.log({ data, allData })
            
            // allData = data.map(item => ({
            //     id_empleado: item.Empleado?.id_empleado ?? '',
            //     nombre: item.Empleado?.nombre ?? '',
            //     departamento: item.Empleado?.Departamento?.nombre ?? 'Sin departamento',
            //     id_departamento: item.Empleado?.Departamento?.id_departamento ?? '',
            //     rol: item.Empleado?.Rol?.nombre ?? 'Sin rol',
            //     id_rol: item.Empleado?.Rol?.id_rol ?? '',
            //     hora_entrada: item.tipo_evento === 1 ? extraerHora(item.fecha_hora) : '-', 
            //     hora_salida: item.tipo_evento === 4 ? extraerHora(item.fecha_hora) : '-',  
            //     id_evento: item.id_evento ?? null,
            //     fecha_hora: item.fecha_hora ?? null,
            // }));

            datosFiltrados = [...allData];
            
            await loadDepartamentosYRoles();
            
        } catch (error) {
            console.error("Error cargando datos:", error);
            showError("Error al cargar datos desde el servidor");
        } finally {
            showLoading(false);
        }
    }

    //Funcion para cabiar formato ISO a  "HH:mm"
    function extraerHora(valor) {
    if (!valor || valor === "1970-01-01T00:00:00.000Z") return "";
    // Si ya viene en formato "HH:mm:ss" o "HH:mm"
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(valor)) return valor.substr(0, 5);
    // Si viene en formato ISO
    const d = new Date(valor);
    return d.toISOString().substr(11, 5); // "HH:mm"
}

    // Cargar departamentos y roles 
    async function loadDepartamentosYRoles() {
        try {
            const [deptResponse, rolesResponse] = await Promise.all([
                fetch(`${API_BASE_URL}departamentos`), 
                fetch(`${API_BASE_URL}roles`) 
            ]);

            const departamentos = await deptResponse.json();
            const roles = await rolesResponse.json();

            populateDepartmentFilter(departamentos);
            populateEditDepartmentFilter(departamentos);
            
            if (selectRol) {
                selectRol.innerHTML = '<option value="">Todos los roles</option>';
                roles.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id_rol;
                    option.textContent = rol.nombre;
                    selectRol.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error cargando departamentos/roles:", error);
        }
    }

    // Guardar cambios desde el modal
   async function guardarCambios() {
    try {
        showLoading(true, "Guardando cambios...");

        if (!campoHoraEntrada.value || !campoHoraSalida.value) {
            throw new Error("Las horas de entrada y salida son obligatorias");
        }

        const fechaBase = registroEditando.fecha_hora
            ? registroEditando.fecha_hora.split('T')[0]
            : new Date().toISOString().split('T')[0];

        // Actualizar hora de entrada
        const datosEntrada = {
            idEventoAsistencia: registroEditando.id_evento,
            fechaHora: `${fechaBase}T${campoHoraEntrada.value}:00Z`
        };

        let response = await fetch(`${API_BASE_URL}asistencias/actualizar-asistencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosEntrada)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Error al actualizar entrada: ${response.status}`);
        }

        // Actualizar hora de salida
        const datosSalida = {
            idEventoAsistencia: registroEditando.id_evento,
            fechaHora: `${fechaBase}T${campoHoraSalida.value}:00Z`
        };

        response = await fetch(`${API_BASE_URL}asistencias/actualizar-asistencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosSalida)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Error al actualizar salida: ${response.status}`);
        }

        const index = allData.findIndex(e => e.id_empleado.toString() === campoId.value);
        if (index !== -1) {
            allData[index].hora_entrada = campoHoraEntrada.value;
            allData[index].hora_salida = campoHoraSalida.value;
            datosFiltrados = [...allData];
            actualizarTabla();
        }

        modalEdicion.hide();
        showSuccess("Horas actualizadas correctamente");
    } catch (error) {
        console.error("Error guardando cambios:", error);
        showError(error.message || "Error al guardar los cambios");
    } finally {
        showLoading(false);
    }
}
    // Confirmar eliminación (SOLO ESTA PANTALLA TIENE ESTE ESTILO DE MENSAJE)
    async function confirmarEliminacion(idAsistencia) {
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
                
                // Llamada a la API para eliminar
                const response = await fetch(`${API_BASE_URL}asistencias/eliminar-asistencia/${idAsistencia}`, {
                    method: 'DELETE',
                    headers: {
                        // 'Authorization': 'Bearer ' + token
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error al eliminar: ${response.status}`);
                }

                // Actualizar la UI
                allData = allData.filter(item => item.id_evento !== parseInt(idAsistencia));
                datosFiltrados = [...allData];
                actualizarTabla();
                
                showSuccess("Registro eliminado correctamente");
            } catch (error) {
                console.error("Error eliminando:", error);
                showError("Error al eliminar el registro");
            } finally {
                showLoading(false);
            }
        }
    }

    // Abrir modal de edición - ajustado para usar id_asistencia
    function abrirModalEdicion(idEmpleado) {
        registroEditando = allData.find(e => e.id_empleado.toString() === idEmpleado);
        if (!registroEditando) return;

        // Llenar formulario con datos actuales
        campoId.value = registroEditando.id_empleado;
        campoNombre.value = registroEditando.nombre;
        campoDepartamento.value = registroEditando.id_departamento;
        campoRol.value = registroEditando.id_rol;
        campoHoraEntrada.value = registroEditando.hora_entrada !== '-' ? registroEditando.hora_entrada : '';
        campoHoraSalida.value = registroEditando.hora_salida !== '-' ? registroEditando.hora_salida : '';
        
        // Deshabilitar campos que no se pueden editar
        campoNombre.disabled = true;
        campoDepartamento.disabled = true;
        campoRol.disabled = true;

        // Mostrar modal
        modalEdicion.show();
    }


    function actualizarTabla() {
    const tbody = document.querySelector('#tablaAsistenciasdiario tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (datosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No hay datos disponibles</td></tr>';
        return;
    }

    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const datosPagina = datosFiltrados.slice(inicio, fin);

    datosPagina.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id_empleado}</td>
            <td>${item.nombre}</td>
            <td>${item.departamento}</td>
            <td>${item.rol}</td>
            <td>${item.hora_entrada}</td>
            <td>${item.hora_salida}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEdicion('${item.id_empleado}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminacion('${item.id_evento ?? item.id_turno}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
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

    function actualizarPaginacion() {
    const paginacion = document.querySelector('.pagination');
    const infoPaginacion = document.querySelector('.info-paginacion');
    if (!paginacion || !infoPaginacion) return;

    const totalRegistros = datosFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / filasPorPagina);

    // Actualiza la info de paginación
    const inicio = totalRegistros === 0 ? 0 : ((paginaActual - 1) * filasPorPagina) + 1;
    const fin = Math.min(paginaActual * filasPorPagina, totalRegistros);
    infoPaginacion.textContent = `Mostrando ${inicio}-${fin} de ${totalRegistros} registros`;

    // Limpia la paginación
    paginacion.innerHTML = '';

    // Botón anterior
    const liPrev = document.createElement('li');
    liPrev.className = `page-item${paginaActual === 1 ? ' disabled' : ''}`;
    liPrev.innerHTML = `<a class="page-link" href="#" id="paginaAnterior" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    paginacion.appendChild(liPrev);

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item${paginaActual === i ? ' active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
        paginacion.appendChild(li);
    }

    // Botón siguiente
    const liNext = document.createElement('li');
    liNext.className = `page-item${paginaActual === totalPaginas || totalPaginas === 0 ? ' disabled' : ''}`;
    liNext.innerHTML = `<a class="page-link" href="#" id="paginaSiguiente" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    paginacion.appendChild(liNext);
    }
    
    window.abrirModalEdicion = abrirModalEdicion;
    window.confirmarEliminacion = confirmarEliminacion;
    // Iniciar la aplicación
    init();
});

// Función para extraer la hora de una fecha ISO
function extraerHora(fechaISO) {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    fecha.setHours(fecha.getHours() + 6); // Ajuste de 6 horas

    return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

// Función principal para procesar los eventos
function procesarEventos(eventos) {
    // 1. Ordenar por id_empleado y luego por fecha
    const eventosOrdenados = eventos.sort((a, b) => {
        // Primero por id_empleado
        const empleadoA = a.Empleado?.id_empleado || 0;
        const empleadoB = b.Empleado?.id_empleado || 0;
        
        if (empleadoA !== empleadoB) {
            return empleadoA - empleadoB;
        }
        
        // Luego por fecha
        const fechaA = new Date(a.fecha_hora);
        const fechaB = new Date(b.fecha_hora);
        return fechaA - fechaB;
    });
    
    // 2. Agrupar eventos por empleado y fecha (día)
    const grupos = {};
    
    eventosOrdenados.forEach(evento => {
        const idEmpleado = evento.Empleado?.id_empleado;
        const fecha = new Date(evento.fecha_hora);
        const fechaKey = fecha.toISOString().split('T')[0]; // Solo la fecha (YYYY-MM-DD)
        
        const key = `${idEmpleado}-${fechaKey}`;
        
        if (!grupos[key]) {
            grupos[key] = {
                empleado: evento.Empleado,
                fecha: fechaKey,
                eventos: []
            };
        }
        
        grupos[key].eventos.push(evento);
    });
    
    // 3. Procesar cada grupo para crear los objetos finales
    const resultado = [];
    
    Object.values(grupos).forEach(grupo => {
        // Buscar eventos de entrada (tipo 1) y salida (tipo 4)
        const entradas = grupo.eventos.filter(e => e.tipo_evento === 1);
        const salidas = grupo.eventos.filter(e => e.tipo_evento === 4);
        
        // Si hay entradas y salidas, emparejarlas
        const maxPares = Math.max(entradas.length, salidas.length);
        
        for (let i = 0; i < maxPares; i++) {
            const entrada = entradas[i];
            const salida = salidas[i];
            
            // Usar la entrada como base, o la salida si no hay entrada
            const eventoBase = entrada || salida;
            
            const objeto = {
                id_empleado: eventoBase.Empleado?.id_empleado ?? '',
                nombre: eventoBase.Empleado?.nombre ?? '',
                departamento: eventoBase.Empleado?.Departamento?.nombre ?? 'Sin departamento',
                id_departamento: eventoBase.Empleado?.Departamento?.id_departamento ?? '',
                rol: eventoBase.Empleado?.Rol?.nombre ?? 'Sin rol',
                id_rol: eventoBase.Empleado?.Rol?.id_rol ?? '',
                hora_entrada: entrada ? extraerHora(entrada.fecha_hora) : '-',
                hora_salida: salida ? extraerHora(salida.fecha_hora) : '-',
                id_evento: eventoBase.id_evento ?? null,
                fecha_hora: eventoBase.fecha_hora ?? null,
                fecha: grupo.fecha
            };
            
            resultado.push(objeto);
        }
    });
    
    return resultado;
}