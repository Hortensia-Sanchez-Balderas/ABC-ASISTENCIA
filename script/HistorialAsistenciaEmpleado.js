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


 // Simulación de datos para un empleado específico
async function obtenerDatosEmpleado(fechaInicio = null, fechaFin = null) {
    // Simulamos un retraso de red de 500-800ms
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
    
    // Datos simulados para 30 días (aproximadamente 1 mes)
    const datosSimulados = [];
    const hoy = new Date();
    const dias = 30;
    
    // Información base del empleado
    const empleadoId = localStorage.getItem('empleadoId') || '12345';
    const departamentos = ['Ventas', 'Recursos Humanos', 'TI', 'Contabilidad', 'Marketing'];
    const deptoActual = departamentos[empleadoId.charCodeAt(0) % departamentos.length];
    
    // Generar datos para cada día
    for (let i = 0; i < dias; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        
        // Saltar fines de semana (sábado=6, domingo=0)
        if (fecha.getDay() === 0 || fecha.getDay() === 6) continue;
        
        // Formatear fecha para display (sin hora)
        const fechaFormateada = fecha.toISOString().split('T')[0];
        
        // Determinar si es un día laboral normal, con retardo o falta
        const tipoDia = Math.random();
        
        // Día normal (70% de probabilidad)
        if (tipoDia < 0.7) {
            const horaEntrada = new Date(fecha);
            horaEntrada.setHours(8 + Math.floor(Math.random() * 2)); // Entre 8:00 y 9:59
            horaEntrada.setMinutes(Math.floor(Math.random() * 60));
            
            const horaSalida = new Date(horaEntrada);
            horaSalida.setHours(horaEntrada.getHours() + 8 + Math.floor(Math.random() * 2)); // 8-9 horas después
            
            const minutosTrabajados = (horaSalida - horaEntrada) / (1000 * 60);
            
            datosSimulados.push({
                fecha: fechaFormateada, // Guardamos en formato YYYY-MM-DD para filtrado
                dia: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }),
                horaEntrada: horaEntrada.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                horaSalida: horaSalida.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                horasTrabajadas: formatearHorasTrabajadas(minutosTrabajados),
                departamento: deptoActual
            });
        }
        // Retardo (20% de probabilidad)
        else if (tipoDia < 0.9) {
            const horaEntrada = new Date(fecha);
            horaEntrada.setHours(10 + Math.floor(Math.random() * 3)); // Entre 10:00 y 12:59 (retardo)
            horaEntrada.setMinutes(Math.floor(Math.random() * 60));
            
            const horaSalida = new Date(horaEntrada);
            horaSalida.setHours(horaEntrada.getHours() + 7 + Math.floor(Math.random() * 2)); // 7-8 horas después
            
            const minutosTrabajados = (horaSalida - horaEntrada) / (1000 * 60);
            
            datosSimulados.push({
                fecha: fechaFormateada,
                dia: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }),
                horaEntrada: horaEntrada.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                horaSalida: horaSalida.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                horasTrabajadas: formatearHorasTrabajadas(minutosTrabajados),
                departamento: deptoActual
            });
        }
        // Falta (10% de probabilidad)
        else {
            datosSimulados.push({
                fecha: fechaFormateada,
                dia: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }),
                horaEntrada: '--:--',
                horaSalida: '--:--',
                horasTrabajadas: '--',
                departamento: deptoActual
            });
        }
    }
    // Aplicar filtros de fecha si existen
    if (fechaInicio || fechaFin) {
        return datosSimulados.filter(item => {
            const diaItem = new Date(item.fecha);
            return (!fechaInicio || diaItem >= fechaInicio) && 
                   (!fechaFin || diaItem <= fechaFin);
        });
    }
    
    return datosSimulados;
}

// Función para formatear horas trabajadas (se mantiene igual)
function formatearHorasTrabajadas(minutos) {
    if (!minutos || isNaN(minutos)) return '--';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
}

// Función para simular la obtención del ID del empleado
function obtenerIdEmpleadoDeSesion() {
    // En un entorno real, esto vendría de tu sistema de autenticación
    // Para la simulación, usaremos un ID fijo o del localStorage
    return localStorage.getItem('empleadoId') || '12345';
}

// Ejemplo de cómo establecer el ID del empleado al iniciar sesión
// localStorage.setItem('empleadoId', '12345');

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
    // Asegurarnos de que haya un ID de empleado
    if (!localStorage.getItem('empleadoId')) {
        localStorage.setItem('empleadoId', '12345'); // ID por defecto para pruebas
    }
    
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

