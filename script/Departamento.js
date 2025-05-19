// Variables globales para manejar el estado
let departamentosCompletos = [];
let departamentosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// ENDPOINT: Obtener lista completa de departamentos (GET)
function cargarDepartamentos() {
    $.ajax({
        url: '/api/departamentos',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            departamentosCompletos = response.data.map(depto => ({
                id: depto.id_departamento,
                nombre: depto.nombre,
                descripcion: depto.descripcion || 'Sin descripción',
                fechaRegistro: formatearFecha(depto.fecha_registro) || '--/--/----'
            }));
            departamentosFiltrados = [...departamentosCompletos];
            actualizarTablaDepartamentos();
            actualizarPaginacion();
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar departamentos:', error);
            mostrarError('No se pudieron cargar los departamentos. Intente nuevamente.');
        }
    });
}

// ENDPOINT: Agregar nuevo departamento (POST)
function agregarDepartamento(nombre, descripcion) {
    return $.ajax({
        url: '/api/departamentos',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            nombre: nombre,
            descripcion: descripcion
        }),
        success: function(response) {
            mostrarExito('Departamento agregado correctamente');
            cargarDepartamentos(); // Recargar la lista
            $('#modalAgregarDepartamento').modal('hide');
            resetFormularioDepartamento();
        },
        error: function(xhr, status, error) {
            console.error('Error al agregar departamento:', error);
            let errorMsg = 'Error al agregar departamento';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            mostrarError(errorMsg);
        }
    });
}

// Función para resetear el formulario
function resetFormularioDepartamento() {
    document.getElementById('nombreDepartamento').value = '';
    document.getElementById('descripcionDepartamento').value = '';
}

// Función para validar el formulario
function validarFormularioDepartamento() {
    const nombre = document.getElementById('nombreDepartamento').value.trim();
    if (!nombre) {
        mostrarError('El nombre del departamento es requerido');
        return false;
    }
    return true;
}

// Función para aplicar filtros de búsqueda
function aplicarFiltros() {
    const buscar = document.getElementById('buscarDepartamento').value.toLowerCase();
    departamentosFiltrados = buscar ? 
        departamentosCompletos.filter(depto => 
            depto.nombre.toLowerCase().includes(buscar) || 
            depto.descripcion.toLowerCase().includes(buscar)
        ) : 
        [...departamentosCompletos];
    paginaActual = 1;
    actualizarTablaDepartamentos();
    actualizarPaginacion();
}

// Función para actualizar la tabla con los resultados
function actualizarTablaDepartamentos() {
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const departamentosPaginados = departamentosFiltrados.slice(inicio, fin);
    const tbody = document.querySelector('#tablaAsistenciasdiario tbody');
    tbody.innerHTML = '';

    if (departamentosPaginados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No se encontraron resultados</td></tr>';
        return;
    }

    departamentosPaginados.forEach(depto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${depto.nombre}</td>
            <td>${depto.descripcion}</td>
            <td>${depto.fechaRegistro}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para actualizar la paginación
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(departamentosFiltrados.length / filasPorPagina);
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

    for (let i = inicioPaginas; i <= finPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
        paginacion.appendChild(li);
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
        const fin = Math.min(paginaActual * filasPorPagina, departamentosFiltrados.length);
        infoPaginacion.textContent = `Mostrando ${inicio}-${fin} de ${departamentosFiltrados.length} registros`;
    }
}

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('buscarDepartamento').value = '';
    departamentosFiltrados = [...departamentosCompletos];
    paginaActual = 1;
    actualizarTablaDepartamentos();
    actualizarPaginacion();
}

// Función para cambiar de página
function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    actualizarTablaDepartamentos();
    actualizarPaginacion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funciones para mostrar mensajes 
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

function mostrarExito(mensaje) {
    const toast = `<div class="toast align-items-center text-white bg-success" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>`;

    document.getElementById('toastContainer').innerHTML = toast;
    $('.toast').toast('show');
}

// Función para formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return null;
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos
    cargarDepartamentos();

    // Configurar eventos
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);

    // Cambiar número de filas por página
    document.getElementById('filasPorPagina').addEventListener('change', function() {
        filasPorPagina = parseInt(this.value);
        paginaActual = 1;
        actualizarTablaDepartamentos();
        actualizarPaginacion();
    });

    // Permitir búsqueda al presionar Enter
    document.getElementById('buscarDepartamento').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            aplicarFiltros();
        }
    });

    // Delegación de eventos para la paginación
    document.querySelector('.pagination').addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.closest('#paginaAnterior')) {
            if (paginaActual > 1) cambiarPagina(paginaActual - 1);
        } else if (e.target.closest('#paginaSiguiente')) {
            if (paginaActual < Math.ceil(departamentosFiltrados.length / filasPorPagina)) {
                cambiarPagina(paginaActual + 1);
            }
        } else if (e.target.hasAttribute('data-pagina')) {
            cambiarPagina(parseInt(e.target.getAttribute('data-pagina')));
        }
    });

    // Eventos del modal de agregar departamento
    document.getElementById('btnAgregarDepartamento').addEventListener('click', function() {
        $('#modalAgregarDepartamento').modal('show');
    });

    document.getElementById('btnGuardarDepartamento').addEventListener('click', function() {
        if (validarFormularioDepartamento()) {
            const nombre = document.getElementById('nombreDepartamento').value.trim();
            const descripcion = document.getElementById('descripcionDepartamento').value.trim();
            agregarDepartamento(nombre, descripcion);
        }
    });

    // Permitir enviar el formulario con Enter
    document.getElementById('nombreDepartamento').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btnGuardarDepartamento').click();
        }
    });

    // Limpiar el formulario cuando se cierra el modal
    $('#modalAgregarDepartamento').on('hidden.bs.modal', function() {
        resetFormularioDepartamento();
    });
});