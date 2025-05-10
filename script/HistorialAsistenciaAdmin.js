//Notas importantes
//Buscar "endpoint" para modificar 
// Variables globales para manejar el estado
let datosCompletos = [];
let datosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// URL base de la API (debería ser configurada según el entorno)
const API_BASE_URL = 'https://api.abcd-asistencia.com/v1';

/**
 * Función para obtener datos de la API
 * Esta función reemplazará la inicialización con datos de ejemplo
 * @param {Date} fechaInicio - Fecha de inicio para el filtro
 * @param {Date} fechaFin - Fecha de fin para el filtro
 * @returns {Promise<Array>} - Promesa con los datos de asistencia
 */
async function obtenerDatosDeAPI(fechaInicio = null, fechaFin = null) {
    try {
        // Construir la URL con parámetros de fecha si existen
        let url = `${API_BASE_URL}/asistencias/historial`;
        
        // Añadir parámetros de fecha si están presentes
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio.toISOString().split('T')[0]);
        if (fechaFin) params.append('fechaFin', fechaFin.toISOString().split('T')[0]);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        // ENDPOINT: GET /asistencias/historial
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Asumiendo autenticación JWT
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Mapear los datos de la API al formato esperado por nuestra tabla
        return data.map(item => ({
            idUsuario: item.id_empleado,
            nombre: item.nombre_completo,
            horasRetardo: `${item.minutos_retardo / 60} hrs`, // Convertir minutos a horas
            cantidadRetardos: item.cantidad_retardos,
            cantidadFaltas: item.cantidad_faltas,
            salidasTemprano: item.cantidad_salidas_temprano,
            asistenciasTotales: item.asistencias_totales,
            horasTrabajadas: item.horas_trabajadas
        }));
        
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
        mostrarError('No se pudieron cargar los datos. Intente nuevamente.');
        return [];
    }
}

/**
 * Función para mostrar un mensaje de error al usuario
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
    // Implementar lógica para mostrar errores al usuario
    // Por ejemplo, usando un toast o un alert
    console.error(mensaje);
    alert(mensaje); // Esto es temporal, debería ser reemplazado por un componente de UI mejor
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
        // Convertir fechas a objetos Date si existen
        const fechaInicioObj = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinObj = fechaFin ? new Date(fechaFin) : null;
        
        // ENDPOINT: Obtener datos filtrados por fecha desde la API
        datosCompletos = await obtenerDatosDeAPI(fechaInicioObj, fechaFinObj);
        
        // Aplicar filtro de búsqueda localmente (podría ser otro endpoint si hay muchos datos)
        datosFiltrados = buscar ? 
            datosCompletos.filter(item => 
                item.idUsuario.toLowerCase().includes(buscar) || 
                item.nombre.toLowerCase().includes(buscar)
            ) : 
            [...datosCompletos];
        
        // Resetear a la primera página después de filtrar
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
        
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        mostrarError('Error al aplicar los filtros. Intente nuevamente.');
    } finally {
        // Ocultar indicador de carga
        mostrarCargando(false);
    }
}

/**
 * Función para mostrar/ocultar indicador de carga
 * @param {boolean} mostrar - True para mostrar, false para ocultar
 */
function mostrarCargando(mostrar) {
    // Implementar lógica para mostrar un spinner o indicador de carga
    const tabla = document.querySelector('#tablaAsistencias tbody');
    if (mostrar) {
        tabla.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
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
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No se encontraron resultados</td></tr>';
        return;
    }
    
    datosPaginados.forEach(asistencia => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${asistencia.idUsuario}</td>
            <td>${asistencia.nombre}</td>
            <td>${asistencia.horasRetardo}</td>
            <td>${asistencia.cantidadRetardos}</td>
            <td>${asistencia.cantidadFaltas}</td>
            <td>${asistencia.salidasTemprano}</td>
            <td>${asistencia.asistenciasTotales}</td>
            <td>${asistencia.horasTrabajadas}</td>
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
        // ENDPOINT: Obtener todos los datos sin filtros de fecha
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