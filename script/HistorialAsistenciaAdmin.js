//Notas importantes
//Buscar "endpoint" para modificar 
// Variables globales para manejar el estado
let datosCompletos = [];
let datosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// URL base de la API (debería ser configurada según el entorno)
const API_BASE_URL = 'https://api.abcd-asistencia.com/v1';


// Reemplaza la función obtenerDatosDeAPI con esta versión simulada
async function obtenerDatosDeAPI(fechaInicio = null, fechaFin = null) {
    // Simulamos un retraso de red de 800ms
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generamos datos de ejemplo para 25 empleados
    const datosSimulados = [];
    const nombres = [
        "Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Luis Rodríguez",
        "Laura Sánchez", "Pedro Ramírez", "Sofía Cruz", "Jorge Hernández", "Mónica Díaz",
        "Fernando Gómez", "Elena Ruiz", "Roberto Morales", "Adriana Ortega", "Miguel Castro",
        "Isabel Vargas", "Diego Mendoza", "Patricia Silva", "Ricardo Rojas", "Gabriela Torres",
        "José Núñez", "Lucía Guzmán", "Arturo Medina", "Verónica Herrera", "Raúl Flores"
    ];
    
    const departamentos = ["Ventas", "Recursos Humanos", "TI", "Contabilidad", "Marketing", "Operaciones"];
    
    // Generar datos para cada empleado
    for (let i = 0; i < 25; i++) {
        const id = i + 1; // ID numérico simple (1-25)
        const minutosRetardo = Math.floor(Math.random() * 300); // 0-300 minutos
        const retardos = Math.floor(Math.random() * 10); // 0-10 retardos
        const faltas = Math.floor(Math.random() * 5); // 0-5 faltas
        const salidasTemprano = Math.floor(Math.random() * 8); // 0-8 salidas temprano
        const asistencias = 22 - faltas; // Asumiendo 22 días laborales
        const horasTrabajadas = (asistencias * 8) - (minutosRetardo / 60); // 8 horas por día
        
        datosSimulados.push({
            idUsuario: id, // Ahora es numérico
            nombre: nombres[i],
            horasRetardo: (minutosRetardo / 60).toFixed(2) + " hrs",
            cantidadRetardos: retardos,
            cantidadFaltas: faltas,
            salidasTemprano: salidasTemprano,
            asistenciasTotales: asistencias,
            horasTrabajadas: horasTrabajadas.toFixed(2) + " hrs",
            departamento: departamentos[Math.floor(Math.random() * departamentos.length)]
        });
    }
    
    // Si hay filtros de fecha, simulamos que afectan los resultados
    if (fechaInicio || fechaFin) {
        // En una simulación real, podríamos ajustar los datos basados en las fechas
        console.log(`Filtrando por fechas: ${fechaInicio?.toISOString() || 'sin inicio'} - ${fechaFin?.toISOString() || 'sin fin'}`);
        
        // Simulamos que algunos registros no cumplen con el filtro
        return datosSimulados.slice(0, Math.floor(Math.random() * 15) + 10); // Devuelve 10-24 registros
    }
    
    return datosSimulados;
}

// Modifica la función mostrarError para que use un toast más elegante
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

// Modifica la función mostrarCargando para un spinner más profesional
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


// Actualiza la función actualizarTabla para incluir estilos condicionales
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