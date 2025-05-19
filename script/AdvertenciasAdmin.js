document.addEventListener('DOMContentLoaded', function() {
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

    // Inicializar Select2 con datos simulados
    $('.select2-usuario').select2({
        placeholder: 'Busque por nombre, ID o departamento...',
        minimumInputLength: 2,
        ajax: {
            delay: 300,
            transport: function(params, success, failure) {
                setTimeout(function() {
                    const term = params.data.q.toLowerCase();
                    
                    // Filtrar usuarios simulados
                    const resultados = usuariosSimulados.filter(user => 
                        user.nombre.toLowerCase().includes(term) || 
                        user.id.toString().includes(term) ||
                        user.departamento.toLowerCase().includes(term)
                    ).slice(0, 10);
                    
                    // Formatear respuesta
                    success({
                        results: resultados.map(user => ({
                            id: user.id,
                            text: `${user.nombre} (ID: ${user.id})`,
                            nombre: user.nombre,
                            depto: user.departamento
                        })),
                        pagination: {
                            more: false
                        }
                    });
                }, 300);
            }
        },
        templateResult: function(user) {
            if (user.loading) return "Buscando...";
            
            return $(
                `<div class="select2-result-usuario">
                    <div class="fw-bold">${user.nombre}</div>
                    <small class="text-muted">ID: ${user.id} | Depto: ${user.depto}</small>
                </div>`
            );
        },
        templateSelection: function(user) {
            if (!user.id) return user.text;
            return `${user.nombre} (ID: ${user.id})`;
        }
    });

    // Manejar el envío del formulario
    $('#advertenciaForm').on('submit', function(e) {
        e.preventDefault();
        
        const usuarioId = $('#selectUsuario').val();
        const asunto = $('#inputAsunto').val();
        const mensaje = quill.root.innerHTML;
        
        if (!usuarioId || !asunto || !mensaje || mensaje === '<p><br></p>') {
            mostrarAlerta('Por favor complete todos los campos', 'error');
            return;
        }
        
        // Obtener datos del usuario seleccionado
        const usuarioSeleccionado = usuariosSimulados.find(u => u.id == usuarioId);
        
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
        
        mostrarAlerta('Advertencia generada correctamente', 'success');
        
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