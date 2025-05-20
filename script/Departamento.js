// Variables globales para manejar el estado
let departamentosCompletos = [];
let departamentosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// ENDPOINT: Obtener lista completa de departamentos (GET)
function cargarDepartamentos() {
  // Simulamos un retraso de red
  setTimeout(() => {
    departamentosCompletos = [
      {
        id: 1,
        nombre: "Ventas",
        descripcion: "Equipo encargado de las ventas y relaciones con clientes",
        fechaRegistro: "15/03/2023"
      },
      {
        id: 2,
        nombre: "Recursos Humanos",
        descripcion: "Gestión del talento humano en la organización",
        fechaRegistro: "20/03/2023"
      },
      {
        id: 3,
        nombre: "Tecnología de la Información",
        descripcion: "Soporte y desarrollo de sistemas informáticos",
        fechaRegistro: "25/03/2023"
      },
      {
        id: 4,
        nombre: "Contabilidad",
        descripcion: "Gestión financiera y contable de la empresa",
        fechaRegistro: "01/04/2023"
      },
      {
        id: 5,
        nombre: "Marketing",
        descripcion: "Estrategias de publicidad y posicionamiento de marca",
        fechaRegistro: "05/04/2023"
      }
    ];
    
    departamentosFiltrados = [...departamentosCompletos];
    actualizarTablaDepartamentos();
    actualizarPaginacion();
    
    // Simulamos también la respuesta de la API para el select de departamentos en otras pantallas
    if (typeof window.departamentosDisponibles === 'undefined') {
      window.departamentosDisponibles = departamentosCompletos.map(depto => ({
        id_departamento: depto.id,
        nombre: depto.nombre
      }));
    }
  }, 800);
}

// ENDPOINT: Agregar nuevo departamento (POST)

// Simula la función agregarDepartamento()
function agregarDepartamento(nombre, descripcion) {
  return new Promise((resolve) => {
    // Simulamos un retraso de red
    setTimeout(() => {
      // Generar un nuevo ID
      const nuevoId = Math.max(...departamentosCompletos.map(d => d.id), 0) + 1;
      
      const nuevoDepartamento = {
        id: nuevoId,
        nombre: nombre,
        descripcion: descripcion,
        fechaRegistro: new Date().toLocaleDateString('es-ES')
      };
      
      // Agregar a los arrays
      departamentosCompletos.unshift(nuevoDepartamento);
      departamentosFiltrados.unshift(nuevoDepartamento);
      
      // Actualizar también la variable global para otros selects
      window.departamentosDisponibles.unshift({
        id_departamento: nuevoId,
        nombre: nombre
      });
      
      // Actualizar la UI
      actualizarTablaDepartamentos();
      actualizarPaginacion();
      
      // Mostrar mensaje de éxito
      mostrarExito('Departamento agregado correctamente (simulado)');
      $('#modalAgregarDepartamento').modal('hide');
      resetFormularioDepartamento();
      
      resolve({ success: true });
    }, 600);
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
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron resultados</td></tr>';
        return;
    }

    departamentosPaginados.forEach(depto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${depto.nombre}</td>
            <td>${depto.descripcion}</td>
            <td>${depto.fechaRegistro}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-editar-departamento" data-id="${depto.id}">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-departamento" data-id="${depto.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
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

//////////////////////////////////MODAL EDICION
// Función para mostrar el modal de edición
function mostrarModalEditarDepartamento(id) {
    const departamento = departamentosCompletos.find(d => d.id == id);
    if (!departamento) {
        mostrarError('Departamento no encontrado');
        return;
    }

    document.getElementById('editarIdDepartamento').value = departamento.id;
    document.getElementById('editarNombreDepartamento').value = departamento.nombre;
    document.getElementById('editarDescripcionDepartamento').value = departamento.descripcion;

    const modal = new bootstrap.Modal(document.getElementById('modalEditarDepartamento'));
    modal.show();
}

// Función para guardar los cambios al editar
function guardarEdicionDepartamento() {
    const id = document.getElementById('editarIdDepartamento').value;
    const nombre = document.getElementById('editarNombreDepartamento').value.trim();
    const descripcion = document.getElementById('editarDescripcionDepartamento').value.trim();

    if (!nombre) {
        mostrarError('El nombre del departamento es requerido');
        return;
    }

    // Simulación de actualización (en un entorno real sería una llamada AJAX)
    const index = departamentosCompletos.findIndex(d => d.id == id);
    if (index !== -1) {
        departamentosCompletos[index] = {
            ...departamentosCompletos[index],
            nombre: nombre,
            descripcion: descripcion
        };

        // Actualizar también en departamentosFiltrados si existe
        const filtradoIndex = departamentosFiltrados.findIndex(d => d.id == id);
        if (filtradoIndex !== -1) {
            departamentosFiltrados[filtradoIndex] = {...departamentosCompletos[index]};
        }

        mostrarExito('Departamento actualizado correctamente');
        actualizarTablaDepartamentos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarDepartamento'));
        modal.hide();
    } else {
        mostrarError('No se encontró el departamento para actualizar');
    }
}

// Función para eliminar un departamento
function eliminarDepartamento(id) {
    if (!confirm('¿Está seguro que desea eliminar este departamento?')) {
        return;
    }

    // Simulación de eliminación (en un entorno real sería una llamada AJAX)
    departamentosCompletos = departamentosCompletos.filter(d => d.id != id);
    departamentosFiltrados = departamentosFiltrados.filter(d => d.id != id);

    mostrarExito('Departamento eliminado correctamente');
    actualizarTablaDepartamentos();
    actualizarPaginacion();
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

    // Evento para editar departamento
    document.querySelector('#tablaAsistenciasdiario').addEventListener('click', function(e) {
        if (e.target.closest('.btn-editar-departamento')) {
            const id = e.target.closest('.btn-editar-departamento').getAttribute('data-id');
            mostrarModalEditarDepartamento(id);
        }
        
        if (e.target.closest('.btn-eliminar-departamento')) {
            const id = e.target.closest('.btn-eliminar-departamento').getAttribute('data-id');
            eliminarDepartamento(id);
        }
    });

    // Evento para guardar edición
    document.getElementById('btnGuardarEdicionDepartamento').addEventListener('click', guardarEdicionDepartamento);
});