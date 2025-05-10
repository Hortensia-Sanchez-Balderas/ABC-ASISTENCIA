// Variables globales para manejar el estado
let datosCompletos = [];
let datosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;

// Función para cargar datos de ejemplo (simulación)
function inicializarDatos() {
    // Datos de ejemplo - en producción esto vendría de una API
    return [
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
        }
    ];
}

        // Función para aplicar filtros
    function aplicarFiltros() {
        const buscar = document.getElementById('buscarAsistencia').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        // Aplicar filtros
        datosFiltrados = [...datosCompletos];
        
        if (buscar) {
            const termino = buscar.toLowerCase();
            datosFiltrados = datosFiltrados.filter(item => 
                item.idUsuario.toLowerCase().includes(termino) || 
                item.nombre.toLowerCase().includes(termino)
            );
        }
        
        // agregar más lógica de filtrado por fecha si es necesario
        
        // Resetear a la primera página después de filtrar
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    }

    // Función para actualizar la tabla con los datos paginados
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

    // Función para actualizar la paginación
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
        const paginasVisibles = 5; // Máximo de números de página a mostrar
        let inicioPaginas = Math.max(1, paginaActual - Math.floor(paginasVisibles / 2));
        let finPaginas = Math.min(totalPaginas, inicioPaginas + paginasVisibles - 1);
        
        // Ajustar si estamos cerca del final
        if (finPaginas - inicioPaginas + 1 < paginasVisibles) {
            inicioPaginas = Math.max(1, finPaginas - paginasVisibles + 1);
        }
        
        // Primera página y elipsis si es necesario
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
        
        // Páginas visibles
        for (let i = inicioPaginas; i <= finPaginas; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
            paginacion.appendChild(li);
        }
        
        // Última página y elipsis si es necesario
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

    // Función para cambiar de página
    function cambiarPagina(nuevaPagina) {
        paginaActual = nuevaPagina;
        actualizarTabla();
        actualizarPaginacion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Función para limpiar filtros
    function limpiarFiltros() {
        document.getElementById('buscarAsistencia').value = '';
        document.getElementById('fechaInicio').value = '';
        document.getElementById('fechaFin').value = '';
        
        // Restablecer datos filtrados a todos los datos
        datosFiltrados = [...datosCompletos];
        paginaActual = 1;
        actualizarTabla();
        actualizarPaginacion();
    }

    // Event listeners para los botones
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar datos
        datosCompletos = inicializarDatos();
        datosFiltrados = [...datosCompletos];
        
        // Cargar datos iniciales
        actualizarTabla();
        actualizarPaginacion();
        
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
        
        // Configurar fechas por defecto (último mes)
        const hoy = new Date();
        const mesPasado = new Date();
        mesPasado.setMonth(hoy.getMonth() - 1);
        
        document.getElementById('fechaInicio').valueAsDate = mesPasado;
        document.getElementById('fechaFin').valueAsDate = hoy;
    });