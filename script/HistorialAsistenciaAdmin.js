// Función para cargar datos de ejemplo (simulación)
function cargarDatosAsistencias(filtros = {}) {
    // Datos de ejemplo - en producción esto vendría de una API
    const datosEjemplo = [
        {
            idUsuario: "0123",
            nombre: "Juan Pérez",
            horasRetardo: "4 hrs",
            cantidadRetardos: 3,
            cantidadFaltas: 5,
            salidasTemprano: 2,
            asistenciasTotales: 108,
            horasTrabajadas: 826
        },
        {
            idUsuario: "0456",
            nombre: "María García",
            horasRetardo: "2 hrs",
            cantidadRetardos: 1,
            cantidadFaltas: 2,
            salidasTemprano: 0,
            asistenciasTotales: 115,
            horasTrabajadas: 920
        },
        {
            idUsuario: "0789",
            nombre: "Carlos López",
            horasRetardo: "0 hrs",
            cantidadRetardos: 0,
            cantidadFaltas: 0,
            salidasTemprano: 1,
            asistenciasTotales: 120,
            horasTrabajadas: 960
        }
    ];
    
    // Aplicar filtros si existen
    let datosFiltrados = [...datosEjemplo];
    
    if (filtros.buscar) {
        const termino = filtros.buscar.toLowerCase();
        datosFiltrados = datosFiltrados.filter(item => 
            item.idUsuario.toLowerCase().includes(termino) || 
            item.nombre.toLowerCase().includes(termino)
        );
    }
    
    // Aquí agregar más lógica de filtrado por fecha si es necesario
    
    const tbody = document.querySelector('#tablaAsistencias tbody');
    tbody.innerHTML = '';
    
    if (datosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No se encontraron resultados</td></tr>';
        return;
    }
    
    datosFiltrados.forEach(asistencia => {
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

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('buscarAsistencia').value = '';
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    cargarDatosAsistencias();
}

// Event listeners para los botones
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos iniciales
    cargarDatosAsistencias();
    
    // Botón Buscar
    document.getElementById('btnBuscar').addEventListener('click', function() {
        const buscar = document.getElementById('buscarAsistencia').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        // Aplicar filtros
        cargarDatosAsistencias({
            buscar,
            fechaInicio,
            fechaFin
        });
    });
    
    // Botón Limpiar
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
    
    // Cambiar número de filas por página
    document.getElementById('filasPorPagina').addEventListener('change', function() {
        const filas = this.value;
        console.log('Cambiando a', filas, 'filas por página');
        // Aquí iría la lógica para recargar la tabla con el nuevo tamaño de página
    });
    
    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);
    
    document.getElementById('fechaInicio').valueAsDate = mesPasado;
    document.getElementById('fechaFin').valueAsDate = hoy;
});