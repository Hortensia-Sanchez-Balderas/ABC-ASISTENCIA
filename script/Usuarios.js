// Notas importantes
//Buscar ENDPOINT para agregar api
// Variables globales para manejar el estado
let usuariosCompletos = [];
let usuariosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;
let horariosTemporales = [];
let departamentosDisponibles = [];
let diasSemana = [];

// ENDPOINT: Obtener lista completa de usuarios (GET)
function cargarUsuarios() {
    $.ajax({
        url: '/api/usuarios',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            usuariosCompletos = response.data.map(usuario => ({
                idUsuario: usuario.id_empleado,
                nombre: usuario.nombre,
                departamento: usuario.nombre_departamento || 'Sin departamento',
                horaEntrada: usuario.hora_entrada_estandar || '--:--',
                horaSalida: usuario.hora_salida_estandar || '--:--',
                contrasena: '••••••••',
                idDepartamento: usuario.id_departamento,
                idRol: usuario.id_rol
            }));
            
            usuariosFiltrados = [...usuariosCompletos];
            actualizarTablaUsuarios();
            actualizarPaginacionUsuarios();
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar usuarios:', error);
            mostrarError('No se pudieron cargar los usuarios. Intente nuevamente.');
        }
    });
}

// ENDPOINT: Obtener departamentos para select (GET)
function cargarDepartamentos() {
    $.ajax({
        url: '/api/departamentos',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            departamentosDisponibles = response.data;
            
            // Llenar select en modal agregar
            const selectAgregar = document.getElementById('departamentoUsuario');
            selectAgregar.innerHTML = '<option value="" selected disabled>Seleccione un departamento</option>';
            
            // Llenar select en modal editar
            const selectEditar = document.getElementById('editarDepartamentoUsuario');
            selectEditar.innerHTML = '<option value="" selected disabled>Seleccione un departamento</option>';
            
            departamentosDisponibles.forEach(depto => {
                const option = document.createElement('option');
                option.value = depto.id_departamento;
                option.textContent = depto.nombre;
                selectAgregar.appendChild(option.cloneNode(true));
                selectEditar.appendChild(option);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar departamentos:', error);
        }
    });
}


// ENDPOINT: Obtener días de la semana (GET)
function cargarDiasSemana() {
    $.ajax({
        url: '/api/dias',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            diasSemana = response.data;
            
            // Llenar select en modal agregar
            const selectAgregar = document.getElementById('diaHorario');
            selectAgregar.innerHTML = '<option value="" selected disabled>Seleccione un día</option>';
            
            // Llenar select en modal editar
            const selectEditar = document.getElementById('diaHorarioEdicion');
            selectEditar.innerHTML = '<option value="" selected disabled>Seleccione un día</option>';
            
            diasSemana.forEach(dia => {
                const option = document.createElement('option');
                option.value = dia.id_dia;
                option.textContent = dia.nombre;
                selectAgregar.appendChild(option.cloneNode(true));
                selectEditar.appendChild(option);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar días:', error);
        }
    });
}

// Función para aplicar filtros
function aplicarFiltrosUsuarios() {
    const buscar = document.getElementById('buscarAsistencia').value.toLowerCase();
    
    usuariosFiltrados = buscar ? 
        usuariosCompletos.filter(usuario => 
            usuario.idUsuario.toString().includes(buscar) || 
            usuario.nombre.toLowerCase().includes(buscar)
        ) : 
        [...usuariosCompletos];
    
    paginaActual = 1;
    actualizarTablaUsuarios();
    actualizarPaginacionUsuarios();
}

// Función para actualizar la tabla
function actualizarTablaUsuarios() {
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(inicio, fin);
    
    const tbody = document.querySelector('#tablaAsistenciasdiario tbody');
    tbody.innerHTML = '';
    
    if (usuariosPaginados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No se encontraron resultados</td></tr>';
        return;
    }
    
    usuariosPaginados.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.idUsuario}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.departamento}</td>
            <td>${(usuario.horaEntrada)}</td> <!-- Mostrar directamente en 24h -->
            <td>${(usuario.horaSalida)}</td> <!-- Mostrar directamente en 24h -->
            <td>${usuario.contrasena}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${usuario.idUsuario}">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${usuario.idUsuario}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// ENDPOINT: Eliminar usuario (DELETE)
function manejarEliminarUsuario(idUsuario) {
    if (!confirm(`¿Estás seguro de eliminar al usuario con ID: ${idUsuario}?`)) return;

    $.ajax({
        url: `/api/usuarios/${idUsuario}`,
        type: 'DELETE',
        success: function(response) {
            mostrarExito('Usuario eliminado correctamente');
            cargarUsuarios(); // Recargar la lista
        },
        error: function(xhr, status, error) {
            console.error('Error al eliminar usuario:', error);
            mostrarError('No se pudo eliminar el usuario. Intente nuevamente.');
        }
    });
}

// -------------------------------------------------------Función para mostrar el modal de agregar usuario
function mostrarModalAgregarUsuario() {
    document.getElementById('modalAgregarUsuarioLabel').textContent = 'Agregar Nuevo Usuario';
    document.getElementById('formAgregarUsuario').reset();
    horariosTemporales = [];
    actualizarTablaHorarios('tablaHorarios');
    
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarUsuario'));
    modal.show();
}

// ENDPOINT: Crear nuevo usuario (POST)
function guardarUsuario() {
    const idUsuario = document.getElementById('idUsuario').value;
    const nombreUsuario = document.getElementById('nombreUsuario').value;
    const departamentoUsuario = document.getElementById('departamentoUsuario').value;
    const contrasenaUsuario = document.getElementById('contrasenaUsuario').value;
    
    if (!nombreUsuario || !departamentoUsuario || !contrasenaUsuario) {
        mostrarError('Por favor complete todos los campos obligatorios');
        return;
    }

    const datosUsuario = {
        nombre: nombreUsuario,
        id_departamento: departamentoUsuario,
        contrasena: contrasenaUsuario,
        horarios: horariosTemporales.map(h => ({
            id_dia: h.idDia,
            hora_entrada_estandar: h.horaEntrada,
            hora_salida_estandar: h.horaSalida,
            laborable: h.laborable
        }))
    };

    $.ajax({
        url: '/api/usuarios',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(datosUsuario),
        success: function(response) {
            mostrarExito('Usuario creado correctamente');
            cargarUsuarios();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarUsuario'));
            modal.hide();
        },
        error: function(xhr, status, error) {
            console.error('Error al crear usuario:', error);
            mostrarError('Ocurrió un error al crear el usuario. Intente nuevamente.');
        }
    });
}



// ---------------------------------------------------Función para mostrar el modal de edición---------------------------------------
function mostrarModalEditarUsuario(usuario) {
    // Cargar departamentos antes de mostrar el modal
    cargarDepartamentos();
    // Cargar días de la semana antes de mostrar el modal
    cargarDiasSemana(); 
    // Limpiar horarios temporales
    horariosTemporales = [];
    // Limpiar tabla de horarios
    const tablaHorarios = document.getElementById('tablaHorariosEdicion');
    tablaHorarios.querySelector('tbody').innerHTML = '';
    
    // Limpiar y preparar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    const form = document.getElementById('formEditarUsuario');
    
    form.reset();
    document.getElementById('editarIdUsuario').value = usuario.idUsuario;
    document.getElementById('editarNombreUsuario').value = usuario.nombre;
    document.getElementById('editarDepartamentoUsuario').value = usuario.idDepartamento;
    
    // Cargar horarios existentes
    horariosTemporales = usuario.horarios || [];
    actualizarTablaHorarios('tablaHorariosEdicion');
    
    modal.show();
}

// Función para guardar los cambios de edición
// ENDPOINT: Actualizar usuario (PUT)
function guardarEdicionUsuario() {
    const idUsuario = document.getElementById('editarIdUsuario').value;
    const nombreUsuario = document.getElementById('editarNombreUsuario').value;
    const departamentoUsuario = document.getElementById('editarDepartamentoUsuario').value;
    const contrasenaUsuario = document.getElementById('editarContrasenaUsuario').value;
    
    if (!nombreUsuario || !departamentoUsuario) {
        mostrarError('Por favor complete todos los campos obligatorios');
        return;
    }

    const datosUsuario = {
        nombre: nombreUsuario,
        id_departamento: departamentoUsuario,
        contrasena: contrasenaUsuario || undefined, // Solo se envía si tiene valor
        horarios: horariosTemporales.map(h => ({
            id_dia: h.idDia,
            hora_entrada_estandar: h.horaEntrada,
            hora_salida_estandar: h.horaSalida,
            laborable: h.laborable
        }))
    };

    $.ajax({
        url: `/api/usuarios/${idUsuario}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(datosUsuario),
        success: function(response) {
            mostrarExito('Usuario actualizado correctamente');
            cargarUsuarios();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
            modal.hide();
        },
        error: function(xhr, status, error) {
            console.error('Error al actualizar usuario:', error);
            mostrarError('Ocurrió un error al actualizar el usuario. Intente nuevamente.');
        }
    });
}

// Función para manejar la edición de usuario
function manejarEditarUsuario(idUsuario) {
    // Buscar usuario en la lista cargada
    const usuarioExistente = usuariosCompletos.find(u => u.idUsuario == idUsuario);
    
    if (usuarioExistente && usuarioExistente.horarios) {
        mostrarModalEditarUsuario(usuarioExistente);
        return;
    }

    // ENDPOINT: Obtener datos completos del usuario (GET)
    $.ajax({
        url: `/api/usuarios/${idUsuario}`,
        type: 'GET',
        success: function(response) {
            const usuario = response.data;
            
            $.ajax({
                url: `/api/horarios/usuario/${idUsuario}`,
                type: 'GET',
                success: function(horariosResponse) {
                    const usuarioCompleto = {
                        idUsuario: usuario.id_empleado,
                        nombre: usuario.nombre,
                        idDepartamento: usuario.id_departamento,
                        horarios: horariosResponse.data.map(h => ({
                            idDia: h.id_dia,
                            nombreDia: diasSemana.find(d => d.id_dia == h.id_dia)?.nombre || 'Día',
                            horaEntrada: h.hora_entrada_estandar,
                            horaSalida: h.hora_salida_estandar,
                            laborable: h.laborable
                        }))
                    };
                    
                    mostrarModalEditarUsuario(usuarioCompleto);
                },
                error: function(xhr, status, error) {
                    console.error('Error al cargar horarios:', error);
                    mostrarError('No se pudieron cargar los horarios del usuario');
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar usuario:', error);
            mostrarError('No se pudo cargar la información del usuario.');
        }
    });
}


// Modificar funciones de horarios para soportar múltiples modales
function agregarHorarioTemporal(diaId, entradaId, salidaId, tablaId) {
    const diaSelect = document.getElementById(diaId);
    const horaEntrada = document.getElementById(entradaId).value; // Asume input time (24h)
    const horaSalida = document.getElementById(salidaId).value;   // Asume input time (24h)
    
    if (!diaSelect.value) {
        alert('Por favor seleccione un día');
        return;
    }
    
    if (!horaEntrada || !horaSalida) {
        alert('Por favor ingrese ambas horas (entrada y salida)');
        return;
    }
    
    if (horariosTemporales.some(h => h.idDia === diaSelect.value)) {
        alert('Este día ya tiene un horario configurado');
        return;
    }
    
    const nuevoHorario = {
        idDia: diaSelect.value,
        nombreDia: diaSelect.options[diaSelect.selectedIndex].text,
        horaEntrada: horaEntrada, // Guardar en 24h
        horaSalida: horaSalida,   // Guardar en 24h
        laborable: true
    };
    
    horariosTemporales.push(nuevoHorario);
    actualizarTablaHorarios(tablaId);
    
    // Limpiar campos
    document.getElementById(entradaId).value = '';
    document.getElementById(salidaId).value = '';
}

function actualizarTablaHorarios(tablaId) {
    const tbody = document.querySelector(`#${tablaId} tbody`);
    tbody.innerHTML = '';
    
    if (horariosTemporales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">No hay horarios configurados</td></tr>';
        return;
    }
    
    horariosTemporales.forEach(horario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${horario.nombreDia}</td>
            <td>${horario.horaEntrada}</td> <!-- Mostrar directamente en 24h -->
            <td>${horario.horaSalida}</td>   <!-- Mostrar directamente en 24h -->
            <td><span class="badge bg-success">Sí</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-horario" data-dia="${horario.idDia}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function eliminarHorarioTemporal(idDia, tablaId) {
    horariosTemporales = horariosTemporales.filter(h => h.idDia !== idDia);
    actualizarTablaHorarios(tablaId);
}


// Funciones para mostrar mensajes
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos
    cargarUsuarios();
    cargarDepartamentos();
    cargarDiasSemana();
    
    // Crear contenedor para toasts
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '2000';
    document.body.appendChild(toastContainer);
    
    // Configurar eventos
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltrosUsuarios);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltrosUsuarios);
    document.getElementById('filasPorPagina').addEventListener('change', function() {
        filasPorPagina = parseInt(this.value);
        paginaActual = 1;
        actualizarTablaUsuarios();
        actualizarPaginacionUsuarios();
    });
    
    // Delegación de eventos
    document.querySelector('.pagination').addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.closest('#paginaAnterior')) {
            if (paginaActual > 1) cambiarPaginaUsuarios(paginaActual - 1);
        } else if (e.target.closest('#paginaSiguiente')) {
            if (paginaActual < Math.ceil(usuariosFiltrados.length / filasPorPagina)) {
                cambiarPaginaUsuarios(paginaActual + 1);
            }
        } else if (e.target.hasAttribute('data-pagina')) {
            cambiarPaginaUsuarios(parseInt(e.target.getAttribute('data-pagina')));
        }
    });
    
    document.querySelector('#tablaAsistenciasdiario').addEventListener('click', function(e) {
        if (e.target.closest('.btn-editar')) {
            const idUsuario = e.target.closest('.btn-editar').getAttribute('data-id');
            manejarEditarUsuario(idUsuario);
        } else if (e.target.closest('.btn-eliminar')) {
            const idUsuario = e.target.closest('.btn-eliminar').getAttribute('data-id');
            manejarEliminarUsuario(idUsuario);
        }
    });
    
    document.getElementById('buscarAsistencia').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') aplicarFiltrosUsuarios();
    });
    
    // Eventos para modal de agregar
    document.getElementById('btnAgregarHorario').addEventListener('click', function() {
        agregarHorarioTemporal('diaHorario', 'horaEntrada', 'horaSalida', 'tablaHorarios');
    });
    
    document.getElementById('tablaHorarios').addEventListener('click', function(e) {
        if (e.target.closest('.btn-eliminar-horario')) {
            const idDia = e.target.closest('.btn-eliminar-horario').getAttribute('data-dia');
            eliminarHorarioTemporal(idDia, 'tablaHorarios');
        }
    });
    
    document.getElementById('btnGuardarUsuario').addEventListener('click', guardarUsuario);
    document.getElementById('btnAgregarUsuario').addEventListener('click', mostrarModalAgregarUsuario);
    
    // Eventos para modal de edición
    document.getElementById('btnAgregarHorarioEdicion').addEventListener('click', function() {
        agregarHorarioTemporal('diaHorarioEdicion', 'horaEntradaEdicion', 'horaSalidaEdicion', 'tablaHorariosEdicion');
    });
    
    document.getElementById('tablaHorariosEdicion').addEventListener('click', function(e) {
        if (e.target.closest('.btn-eliminar-horario')) {
            const idDia = e.target.closest('.btn-eliminar-horario').getAttribute('data-dia');
            eliminarHorarioTemporal(idDia, 'tablaHorariosEdicion');
        }
    });
    
    document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicionUsuario);
});

