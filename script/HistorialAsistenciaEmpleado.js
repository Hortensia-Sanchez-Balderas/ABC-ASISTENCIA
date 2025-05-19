// Notas
//Al final del codigo se requiere una funcion para identificar el empleado que esta iniciando sesion
//en base a es modificamos el archivo segun se requiera
//verificar el formateo de  hora
// Variables globales para manejar el estado
let datosCompletos = [];
let datosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// URL base de la API (ajusta según tu entorno)
const API_BASE_URL = 'https://api.abcd-asistencia.com/v1';

/**
 * Función para obtener datos del empleado actual desde la API
 * @param {Date} fechaInicio - Fecha de inicio para el filtro
 * @param {Date} fechaFin - Fecha de fin para el filtro
 * @returns {Promise<Array>} - Promesa con los datos de asistencia del empleado
 */
async function obtenerDatosEmpleado(fechaInicio = null, fechaFin = null) {
    try {
        // Obtener ID del empleado del localStorage o de la sesión
        const empleadoId = localStorage.getItem('empleadoId') || obtenerIdEmpleadoDeSesion();
        
        if (!empleadoId) {
            throw new Error('No se pudo identificar al empleado');
        }

        // Construir la URL con parámetros
        let url = `${API_BASE_URL}/empleados/${empleadoId}/asistencias`;
        
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio.toISOString().split('T')[0]);
        if (fechaFin) params.append('fechaFin', fechaFin.toISOString().split('T')[0]);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        // ENDPOINT: GET /empleados/{id}/asistencias
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Mapear los datos al formato de tu tabla
        return data.map(item => ({
            dia: new Date(item.fecha).toLocaleDateString('es-ES'),
            horaEntrada: item.hora_entrada || '--:--',
            horaSalida: item.hora_salida || '--:--',
            horasTrabajadas: formatearHorasTrabajadas(item.minutos_trabajados),
            departamento: item.departamento || 'No asignado'
        }));
        
    } catch (error) {
        console.error('Error al obtener datos del empleado:', error);
        mostrarError('No se pudieron cargar tus datos de asistencia. Intente nuevamente.');
        return [];
    }
}

/**
 * Función para formatear minutos a horas trabajadas
 * @param {number} minutos - Minutos trabajados
 * @returns {string} - Horas formateadas (ej. "8h 30m")
 */
function formatearHorasTrabajadas(minutos) {
    if (!minutos || isNaN(minutos)) return '--';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
}

/**
 * Función para mostrar un mensaje de error al usuario
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
    const toast = `<div class="toast align-items-center text-white bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>`;

    document.getElementById('toastContainer').innerHTML = toast;
    $('.toast').toast('show');
}

/**
 * Función para mostrar/ocultar indicador de carga
 * @param {boolean} mostrar - True para mostrar, false para ocultar
 */
function mostrarCargando(mostrar) {
    const tabla = document.querySelector('#tablaAsistencias tbody');
    if (mostrar) {
        tabla.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
    }
}

/**
 * Función para aplicar filtros y obtener datos de la API
 */
async function aplicarFiltros() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    mostrarCargando(true);
    
    try {
        const fechaInicioObj = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinObj = fechaFin ? new Date(fechaFin) : null;
        
        // Obtener solo los datos del empleado actual
        datosCompletos = await obtenerDatosEmpleado(fechaInicioObj, fechaFinObj);
        datosFiltrados = [...datosCompletos];
        
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
        
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        mostrarError('Error al aplicar los filtros. Intente nuevamente.');
    } finally {
        mostrarCargando(false);
    }
}

/**
 * Función para actualizar la tabla con los datos paginados
 */
function actualizarTabla() {
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const datosPaginados = datosFiltrados.slice(inicio, fin);
    
    const tbody = document.querySelector('#tablaAsistencias tbody');
    tbody.innerHTML = '';
    
    if (datosPaginados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron registros en el período seleccionado</td></tr>';
        return;
    }
    
    datosPaginados.forEach(asistencia => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${asistencia.dia}</td>
            <td>${asistencia.horaEntrada}</td>
            <td>${asistencia.horaSalida}</td>
            <td>${asistencia.horasTrabajadas}</td>
            <td>${asistencia.departamento}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Función para actualizar la paginación
 */
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
    const paginacion = document.querySelector('.pagination');
    
    paginacion.innerHTML = `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Previous" id="paginaAnterior">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
        <li class="page-item ${paginaActual === 1 ? 'active' : ''}">
            <a class="page-link" href="#" data-pagina="1">1</a>
        </li>
        <li class="page-item ${paginaActual === 2 ? 'active' : ''}">
            <a class="page-link" href="#" data-pagina="2">2</a>
        </li>
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Next" id="paginaSiguiente">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    document.querySelector('.info-paginacion').textContent = 
        `Mostrando ${((paginaActual - 1) * filasPorPagina) + 1}-${Math.min(paginaActual * filasPorPagina, datosFiltrados.length)} de ${datosFiltrados.length} registros`;
}


/**
 * Función para cambiar de página
 * @param {number} nuevaPagina - Número de la nueva página
 */
function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    actualizarTabla();
    actualizarPaginacion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Función para limpiar filtros y recargar datos
 */
async function limpiarFiltros() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    
    mostrarCargando(true);
    
    try {
        // Obtener todos los datos sin filtros de fecha
        datosCompletos = await obtenerDatosEmpleado();
        datosFiltrados = [...datosCompletos];
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error al limpiar filtros:', error);
        mostrarError('Error al limpiar los filtros. Intente nuevamente.');
    } finally {
        mostrarCargando(false);
    }
}

/**
 * Función para inicializar la página para empleados
 */
async function inicializarPagina() {
    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);
    
    document.getElementById('fechaInicio').valueAsDate = mesPasado;
    document.getElementById('fechaFin').valueAsDate = hoy;
    
    // Cargar datos iniciales
    await aplicarFiltros();
}

// IMPLEMENTAR ESTA FUNCIÓN SEGÚN EL SISTEMA DE AUTENTICACIÓN
function obtenerIdEmpleadoDeSesion() {
    // Ejemplo: Extraer de un token JWT
    // const token = localStorage.getItem('token');
    // if (token) {
    //     const payload = JSON.parse(atob(token.split('.')[1]));
    //     return payload.userId;
    // }
    return null; // Reemplazar con implementación real
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la página
    inicializarPagina();
    
    // Botón Buscar
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltros);
    
    // Botón Limpiar
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
    
    // Cambiar número de filas por página
    document.getElementById('filasPorPagina').addEventListener('change', function() {
        filasPorPagina = parseInt(this.value);
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    });
    
    // Delegación de eventos para la paginación
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
});

