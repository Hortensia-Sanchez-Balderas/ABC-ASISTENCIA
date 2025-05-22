const apiPath = 'https://abcd-asistencia.onrender.com';

document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar el editor Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['clean']
            ]
        },
        placeholder: 'Escriba el contenido de la advertencia...',
    });

    // Datos simulados de usuarios (sin email)
    const generarUsuariosSimulados = (cantidad) => {
        const departamentos = ['Ventas', 'RH', 'TI', 'Contabilidad', 'Producción', 'Logística'];
        const usuarios = [];
        
        for (let i = 1; i <= cantidad; i++) {
            usuarios.push({
                id: 1000 + i,
                nombre: `Empleado ${i}`,
                departamento: departamentos[Math.floor(Math.random() * departamentos.length)]
            });
        }
        
        // Agregar algunos usuarios específicos para pruebas
        usuarios.push(
            {id: 101, nombre: "Juan Pérez", departamento: "Ventas"},
            {id: 102, nombre: "María García", departamento: "RH"},
            {id: 103, nombre: "Carlos López", departamento: "TI"}
        );
        
        return usuarios;
    };

    const usuariosSimulados = generarUsuariosSimulados(1000);
    const empleadosAPI = await obtenerEmpleados();
    console.log({ empleadosAPI })

    // Inicializar Select2 con datos simulados
    $('.select2-usuario').select2({
        placeholder: 'Busque por nombre, ID o departamento...',
        minimumInputLength: 2,
        ajax: {
            delay: 300,
            transport: function(params, success, failure) {
                setTimeout(function() {
                    const term = params.data.q.toLowerCase();
                    
                    // Filtrar empleados de la API
                    const resultados = empleadosAPI.filter(empleado => 
                        empleado.nombre.toLowerCase().includes(term) || 
                        empleado.id_empleado.toString().includes(term) ||
                        empleado.Departamento.nombre.toLowerCase().includes(term)
                    ).slice(0, 10);
                    
                    // Formatear respuesta
                    success({
                        results: resultados.map(empleado => ({
                            id: empleado.id_empleado,
                            text: `${empleado.nombre} (ID: ${empleado.id_empleado})`,
                            nombre: empleado.nombre,
                            depto: empleado.Departamento.nombre,
                            rol: empleado.Rol.nombre
                        })),
                        pagination: {
                            more: false
                        }
                    });
                }, 300);
            }
        },
        templateResult: function(empleado) {
            if (empleado.loading) return "Buscando...";
            
            return $(
                `<div class="select2-result-usuario">
                    <div class="fw-bold">${empleado.nombre}</div>
                    <small class="text-muted">ID: ${empleado.id} | Depto: ${empleado.depto}</small>
                </div>`
            );
        },
        templateSelection: function(empleado) {
            if (!empleado.id) return empleado.text;
            return `${empleado.nombre} (ID: ${empleado.id})`;
        }
    });

    // Manejar el envío del formulario
    $('#advertenciaForm').on('submit', async function(e) {
        e.preventDefault();
        
        const usuarioId = $('#selectUsuario').val();
        const asunto = $('#inputAsunto').val();
        const mensaje = quill.root.innerHTML;
        
        if (!usuarioId || !asunto || !mensaje || mensaje === '<p><br></p>') {
            mostrarAlerta('Por favor complete todos los campos', 'error');
            return;
        }
        
        // Obtener datos del usuario seleccionado
        const usuarioSeleccionado = empleadosAPI.find(u => u.id_empleado == usuarioId);
        
        // Simular envío a la API
        console.log('Advertencia a enviar:', {
            id_usuario: usuarioSeleccionado.id,
            nombre_usuario: usuarioSeleccionado.nombre,
            departamento: usuarioSeleccionado.departamento,
            asunto: asunto,
            mensaje: mensaje,
            fecha: new Date().toISOString(),
            leido: false
        });

        try {
            const response = await mandarAdvertencia(usuarioId, asunto, mensaje);
            console.log('Respuesta de la API:', response);

            mostrarAlerta('Advertencia generada correctamente', 'success');
        } catch (error) {
            console.error('Error al enviar advertencia:', error);
            mostrarAlerta('Error al enviar la advertencia. Intente nuevamente.', 'error');
            return;
        }


        
        
        // Limpiar formulario
        $('#selectUsuario').val(null).trigger('change');
        $('#inputAsunto').val('');
        quill.root.innerHTML = '';
    });

    // Botón cancelar
    $('#btnCancelar').on('click', function() {
        if (confirm('¿Está seguro que desea cancelar? Los cambios no se guardarán.')) {
            $('#selectUsuario').val(null).trigger('change');
            $('#inputAsunto').val('');
            quill.root.innerHTML = '';
        }
    });

    function mostrarAlerta(mensaje, tipo) {
        const alerta = $(`
            <div class="alert alert-${tipo === 'error' ? 'danger' : 'success'} alert-dismissible fade show">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('#advertenciaForm').prepend(alerta);
        
        setTimeout(() => {
            alerta.alert('close');
        }, 5000);
    }
});

const obtenerEmpleados = async () => {
    try {
        const response = await fetch(`${apiPath}/empleados`);

        return await response.json();
    } catch(error) {
        console.error('Error al obtener empleados:', error);
        return [];
    }
}

const mandarAdvertencia = async (usuarioId, asunto, mensaje) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('Token no encontrado');
        return;
    }

    // Decodear token usando jsonwebtoken
    const decodedToken = jwt_decode(token);
    if (!decodedToken) {
        console.error('Token inválido');
        return;
    }

    const usuarioRemitente = decodedToken.id_empleado;

    try {
        const response = await fetch(`${apiPath}/advertencias/crearAdvertencia?id_empleado_destinatario=${usuarioId}&id_empleado_remitente=${usuarioRemitente}&asunto=${asunto}&mensaje=${mensaje}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return await response.json();
    } catch(error) {
        console.error('Error al enviar advertencia:', error);
    }
}