let datosCompletos = [];
let datosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

const API_BASE_URL = 'https://abcd-asistencia.onrender.com';

function obtenerIdEmpleadoDeSesion() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
        const payload = jwt_decode(token);
        return payload.id_empleado;
    } catch (e) {
        return null;
    }
}

// Obtiene el historial real del empleado autenticado
async function obtenerDatosEmpleado() {
    const empleadoId = obtenerIdEmpleadoDeSesion();
    if (!empleadoId) return [];

    const url = `${API_BASE_URL}/asistencias/obtener-asistencias-empleado?id=${empleadoId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener historial');
        const data = await response.json();
        return data;
    } catch (error) {
        mostrarError('No se pudo obtener el historial de asistencias.');
        return [];
    }
}

function formatearFecha(fechaIso) {
    if (!fechaIso) return '--';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-MX');
}

function formatearHora(fechaIso) {
    if (!fechaIso) return '--:--';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function formatearHorasTrabajadas(minutos) {
    if (!minutos || isNaN(minutos)) return '--';
    const horas = Math.floor(minutos / 60);
    const mins = Math.abs(minutos % 60);
    return `${horas}h ${mins}m`;
}

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

function mostrarCargando(mostrar) {
    const tabla = document.querySelector('#tablaAsistencias tbody');
    if (mostrar) {
        tabla.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
    }
}

async function aplicarFiltros() {
    mostrarCargando(true);
    try {
        datosCompletos = await obtenerDatosEmpleado();
        datosFiltrados = [...datosCompletos];
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    } catch (error) {
        mostrarError('Error al aplicar los filtros. Intente nuevamente.');
    } finally {
        mostrarCargando(false);
    }
}

function actualizarTabla() {
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const datosPaginados = datosFiltrados.slice(inicio, fin);
    const tbody = document.querySelector('#tablaAsistencias tbody');
    tbody.innerHTML = '';
    if (datosPaginados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron registros</td></tr>';
        return;
    }
    datosPaginados.forEach(asistencia => {
        tbody.innerHTML += `
            <tr>
                <td>${formatearFecha(asistencia.dia)}</td>
                <td>${formatearHora(asistencia.horaEntrada)}</td>
                <td>${formatearHora(asistencia.horaSalida)}</td>
                <td>${formatearHorasTrabajadas(asistencia.minutosTrabajados)}</td>
                <td>${asistencia.departamento?.nombre || '--'}</td>
            </tr>
        `;
    });
}

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

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    actualizarTabla();
    actualizarPaginacion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function limpiarFiltros() {
    mostrarCargando(true);
    try {
        datosCompletos = await obtenerDatosEmpleado();
        datosFiltrados = [...datosCompletos];
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    } catch (error) {
        mostrarError('Error al limpiar los filtros. Intente nuevamente.');
    } finally {
        mostrarCargando(false);
    }
}

async function inicializarPagina() {
    if (!obtenerIdEmpleadoDeSesion()) {
        mostrarError('No se encontró información de sesión. Inicia sesión nuevamente.');
        return;
    }
    await aplicarFiltros();
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarPagina();
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
    document.getElementById('filasPorPagina').addEventListener('change', function() {
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
});