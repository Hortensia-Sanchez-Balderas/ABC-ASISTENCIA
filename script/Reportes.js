// Datos simulados para los reportes
const departamentos = ['Ventas', 'Recursos Humanos', 'TI', 'Contabilidad', 'Marketing'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'];

// Función para generar datos aleatorios
function generarDatosAleatorios() {
    return Array.from({length: meses.length}, () => 
        Math.floor(Math.random() * 100) + 50
    );
}

// Configuración común para las gráficas
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value) {
                    return value + '%';
                }
            }
        }
    }
};

// Crear gráfica de asistencias por departamento
function crearGraficaAsistencias() {
    const ctx = document.getElementById('chartAsistencias').getContext('2d');
    
    const datasets = departamentos.map(depto => ({
        label: depto,
        data: generarDatosAleatorios(),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`,
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
        borderWidth: 1
    }));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: chartOptions
    });
}

// Crear gráfica de faltas y retardos
function crearGraficaFaltasRetardos() {
    const ctx = document.getElementById('chartFaltasRetardos').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Faltas',
                    data: generarDatosAleatorios(),
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Retardos',
                    data: generarDatosAleatorios(),
                    borderColor: 'rgba(241, 196, 15, 1)',
                    backgroundColor: 'rgba(241, 196, 15, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: chartOptions
    });
}

// Inicializar las gráficas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    crearGraficaAsistencias();
    crearGraficaFaltasRetardos();
    
    // Configurar filtros por fecha
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);
    
    document.getElementById('fechaInicio').valueAsDate = mesPasado;
    document.getElementById('fechaFin').valueAsDate = hoy;
    
    // Evento para el botón de filtrar
    document.getElementById('btnFiltrar').addEventListener('click', function() {
        // En una implementación real, aquí se haría una nueva consulta a la API
        alert('Filtro aplicado (simulado)');
    });
});