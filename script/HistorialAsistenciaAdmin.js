// Variables globales para manejar el estado
let datosCompletos = [];
let datosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// URL base de la API
const API_BASE_URL = 'https://abcd-asistencia.onrender.com';

const COMMON_HEADERS = {
    'Content-Type': 'application/json',
};

async function obtenerDatosDeAPI(fechaInicio = null, fechaFin = null) {
    try {
        let params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio.toISOString().split('T')[0]);
        if (fechaFin) params.append('fechaFin', fechaFin.toISOString().split('T')[0]);

        const endpoint = `/asistencias/obtener-historial-asistencias${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'GET',
            headers: COMMON_HEADERS
        });
        
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const data = await response.json();

        console.log("Datos recibidos de la API:", data);

        return data.map(asistencia => ({
            idUsuario: asistencia.idEmpleado || 'N/A',
            nombre: asistencia.nombreEmpleado || 'Nombre no disponible',
            horasRetardo: asistencia.minutosRetardo ? (asistencia.minutosRetardo / 60).toFixed(2) + " hrs" : "0 hrs",
            cantidadRetardos: asistencia.cantidadRetardos || 0,
            cantidadFaltas: asistencia.cantidadFaltas || 0,
            salidasTemprano: asistencia.cantidadSalidasTemprano || 0,
            asistenciasTotales: asistencia.asistenciasTotales || 0, // Corregido el nombre del campo
            horasTrabajadas: asistencia.horasTrabajadas ? asistencia.horasTrabajadas.toFixed(2) + " hrs" : "0 hrs",
            departamento: asistencia.departamento || 'Sin departamento'
        }));
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
        mostrarError('Error al cargar los datos de asistencia. Intente nuevamente.');
        return [];
    }
}

function mostrarError(mensaje) {
    const toastHTML = `
        <div class="toast align-items-center text-white bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    const toastContainer = document.getElementById('toastContainer') || document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1100';
    document.body.appendChild(toastContainer);
    
    toastContainer.innerHTML = toastHTML;
    $('.toast').toast('show');
}

function mostrarCargando(mostrar) {
    const tabla = document.querySelector('#tablaAsistencias tbody');
    if (mostrar) {
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="d-flex justify-content-center align-items-center">
                        <div class="spinner-border text-primary me-3" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <span class="text-muted">Cargando datos de asistencia...</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Función para aplicar filtros y obtener datos de la API
 */
async function aplicarFiltros() {
    const buscar = document.getElementById('buscarAsistencia').value.toLowerCase();
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    // Mostrar indicador de carga
    mostrarCargando(true);
    
    try {
        const fechaInicioObj = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinObj = fechaFin ? new Date(fechaFin) : null;
        
        datosCompletos = await obtenerDatosDeAPI(fechaInicioObj, fechaFinObj);
        
        datosFiltrados = buscar ? 
            datosCompletos.filter(item => 
                item.idUsuario.toString().toLowerCase().includes(buscar) || 
                item.nombre.toLowerCase().includes(buscar)
            ) : 
            [...datosCompletos];
        
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

function actualizarTabla() {
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const datosPaginados = datosFiltrados.slice(inicio, fin);
    
    const tbody = document.querySelector('#tablaAsistencias tbody');
    tbody.innerHTML = '';
    
    if (datosPaginados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="bi bi-database-exclamation me-2"></i>
                    No se encontraron resultados
                </td>
            </tr>
        `;
        return;
    }
    
    datosPaginados.forEach(asistencia => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${asistencia.idUsuario || 'N/A'}</td>
            <td>${asistencia.nombre || 'Nombre no disponible'}</td>
            <td>${asistencia.horasRetardo || '0 hrs'}</td>
            <td>${asistencia.cantidadRetardos || 0}</td>
            <td>${asistencia.cantidadFaltas || 0}</td>
            <td>${asistencia.salidasTemprano || 0}</td>
            <td>${asistencia.asistenciasTotales || 0}</td>
            <td>${asistencia.horasTrabajadas || '0 hrs'}</td>
        `;
        tbody.appendChild(tr);
    });
}


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
    
    // Números de página
    const paginasVisibles = 5;
    let inicioPaginas = Math.max(1, paginaActual - Math.floor(paginasVisibles / 2));
    let finPaginas = Math.min(totalPaginas, inicioPaginas + paginasVisibles - 1);
    
    if (finPaginas - inicioPaginas + 1 < paginasVisibles) {
        inicioPaginas = Math.max(1, finPaginas - paginasVisibles + 1);
    }
    
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
    
    for (let i = inicioPaginas; i <= finPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
        paginacion.appendChild(li);
    }
    
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
    document.getElementById('buscarAsistencia').value = '';
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    
    // Mostrar indicador de carga
    mostrarCargando(true);
    
    try {
        // Obtener todos los datos sin filtros de fecha
        datosCompletos = await obtenerDatosDeAPI();
        datosFiltrados = [...datosCompletos];
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error al limpiar filtros:', error);
        mostrarError('Error al limpiar los filtros. Intente nuevamente.');
    } finally {
        // Ocultar indicador de carga
        mostrarCargando(false);
    }
}

/**
 * Función para inicializar la página
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
    
    // Permitir búsqueda al presionar Enter
    document.getElementById('buscarAsistencia').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            aplicarFiltros();
        }
    });
});