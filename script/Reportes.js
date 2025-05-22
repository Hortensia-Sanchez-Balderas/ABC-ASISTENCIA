const apiPath = 'https://abcd-asistencia.onrender.com';
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
function crearGraficaAsistencias(datos, canvasId = 'chartAsistencias') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Definir el orden correcto de los meses
    const ordenMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Extraer años disponibles
    const años = Object.keys(datos);
    
    // Extraer todos los meses únicos y ordenarlos
    const mesesSet = new Set();
    años.forEach(año => {
        if (datos[año] && typeof datos[año] === 'object') {
            Object.keys(datos[año]).forEach(mes => mesesSet.add(mes));
        }
    });
    const meses = ordenMeses.filter(mes => mesesSet.has(mes));
    
    // Extraer todos los departamentos únicos
    const departamentosSet = new Set();
    años.forEach(año => {
        if (datos[año] && typeof datos[año] === 'object') {
            Object.values(datos[año]).forEach(mesData => {
                if (mesData && typeof mesData === 'object') {
                    Object.keys(mesData).forEach(depto => departamentosSet.add(depto));
                }
            });
        }
    });
    const departamentos = Array.from(departamentosSet);
    
    // Generar colores únicos para cada departamento
    const colores = [
        { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },
        { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' },
        { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
        { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgba(255, 206, 86, 1)' },
        { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' },
        { bg: 'rgba(255, 159, 64, 0.6)', border: 'rgba(255, 159, 64, 1)' },
        { bg: 'rgba(199, 199, 199, 0.6)', border: 'rgba(199, 199, 199, 1)' },
        { bg: 'rgba(83, 102, 255, 0.6)', border: 'rgba(83, 102, 255, 1)' }
    ];
    
    // Crear datasets para cada departamento
    const datasets = departamentos.map((depto, index) => {
        const data = meses.map(mes => {
            let total = 0;
            años.forEach(año => {
                if (datos[año] && datos[año][mes] && datos[año][mes][depto]) {
                    total += datos[año][mes][depto];
                }
            });
            return total;
        });
        
        const colorIndex = index % colores.length;
        return {
            label: depto,
            data: data,
            backgroundColor: colores[colorIndex].bg,
            borderColor: colores[colorIndex].border,
            borderWidth: 1
        };
    });
    
    // Opciones del gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Asistencias por Departamento',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Meses',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Número de Asistencias por Departamento',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };
    
    // Crear el gráfico
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: chartOptions
    });
}

// Crear gráfica de faltas y retardos
function crearGraficaFaltasRetardos(datos, canvasId = 'chartAsistenciasFaltas') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Definir el orden correcto de los meses
    const ordenMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Extraer años disponibles
    const años = Object.keys(datos);
    
    // Extraer todos los meses únicos y ordenarlos
    const mesesSet = new Set();
    años.forEach(año => {
        if (datos[año] && typeof datos[año] === 'object') {
            Object.keys(datos[año]).forEach(mes => mesesSet.add(mes));
        }
    });
    const meses = ordenMeses.filter(mes => mesesSet.has(mes));
    
    // Calcular datos para faltas y retrasos
    const datosFaltas = meses.map(mes => {
        let totalFaltas = 0;
        años.forEach(año => {
            if (datos[año] && datos[año][mes] && datos[año][mes]['faltas']) {
                totalFaltas += datos[año][mes]['faltas'];
            }
        });
        return totalFaltas;
    });
    
    const datosRetrasos = meses.map(mes => {
        let totalRetrasos = 0;
        años.forEach(año => {
            if (datos[año] && datos[año][mes] && datos[año][mes]['retardos']) {
                totalRetrasos += datos[año][mes]['retardos'];
            }
        });
        return totalRetrasos;
    });
    
    // Crear datasets
    const datasets = [
        {
            label: 'Faltas',
            data: datosFaltas,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: 'rgba(255, 99, 132, 1)',
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4,
            fill: false
        },
        {
            label: 'Retrasos',
            data: datosRetrasos,
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: 'rgba(255, 159, 64, 1)',
            pointBorderColor: 'rgba(255, 159, 64, 1)',
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4,
            fill: false
        }
    ];
    
    // Opciones del gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Asistencias vs. Faltas/Retrasos',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Meses',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Número de Faltas y Retrasos',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };
    
    // Crear el gráfico
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: chartOptions
    });
}

// Crear gráfica de ranking de empleados
function crearGraficaRankingEmpleados(datos, canvasId = 'chartRankingEmpleados') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Convertir el objeto de empleados a array y ordenar por faltas (descendente)
    const empleadosArray = Object.keys(datos).map(id => ({
        id: id,
        nombre: datos[id].nombre,
        faltas: datos[id].faltas || 0
    }));
    
    // Ordenar por número de faltas (de mayor a menor para mostrar el ranking)
    empleadosArray.sort((a, b) => b.faltas - a.faltas);
    
    // Extraer nombres y faltas para el gráfico
    const nombres = empleadosArray.map(emp => emp.nombre);
    const faltas = empleadosArray.map(emp => emp.faltas);
    
    // Generar colores degradados basados en el número de faltas
    const colores = faltas.map(falta => {
        if (falta === 0) {
            return 'rgba(34, 197, 94, 0.7)'; // Verde para 0 faltas
        } else if (falta <= 2) {
            return 'rgba(251, 191, 36, 0.7)'; // Amarillo para pocas faltas
        } else if (falta <= 5) {
            return 'rgba(249, 115, 22, 0.7)'; // Naranja para faltas moderadas
        } else {
            return 'rgba(239, 68, 68, 0.7)'; // Rojo para muchas faltas
        }
    });
    
    const coloresBorde = faltas.map(falta => {
        if (falta === 0) {
            return 'rgba(34, 197, 94, 1)';
        } else if (falta <= 2) {
            return 'rgba(251, 191, 36, 1)';
        } else if (falta <= 5) {
            return 'rgba(249, 115, 22, 1)';
        } else {
            return 'rgba(239, 68, 68, 1)';
        }
    });
    
    // Dataset para el gráfico
    const dataset = {
        label: 'Número de Faltas',
        data: faltas,
        backgroundColor: colores,
        borderColor: coloresBorde,
        borderWidth: 2
    };
    
    // Opciones del gráfico
    const chartOptions = {
        indexAxis: 'y', // Esto hace que las barras sean horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Ranking de Empleados por Faltas/Retrasos',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                display: false // No necesitamos leyenda para una sola serie
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Número de Faltas',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Empleados',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: false
                }
            }
        }
    };
    
    // Crear el gráfico
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nombres,
            datasets: [dataset]
        },
        options: chartOptions
    });
}

// Crear gráfica de histograma de horarios
function crearHistogramaHorarios(datos, canvasId = 'chartHistogramaHorarios') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Convertir los datos del objeto a arrays
    const horarios = Object.keys(datos);
    const empleados = Object.values(datos);
    
    // Función para convertir hora a minutos para ordenamiento
    function horaAMinutos(hora) {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos;
    }
    
    // Función para extraer hora de entrada del rango
    function extraerHoraEntrada(rango) {
        return rango.split('-')[0];
    }
    
    // Crear array de objetos para facilitar el ordenamiento
    const datosOrdenados = horarios.map(horario => ({
        horario: horario,
        empleados: datos[horario],
        horaEntrada: extraerHoraEntrada(horario),
        minutosEntrada: horaAMinutos(extraerHoraEntrada(horario))
    }));
    
    // Ordenar por hora de entrada
    datosOrdenados.sort((a, b) => a.minutosEntrada - b.minutosEntrada);
    
    // Extraer datos ordenados
    const horariosOrdenados = datosOrdenados.map(item => item.horario);
    const empleadosOrdenados = datosOrdenados.map(item => item.empleados);
    
    // Generar colores basados en el número de empleados
    const colores = empleadosOrdenados.map(cantidad => {
        if (cantidad >= 10) {
            return 'rgba(34, 197, 94, 0.7)'; // Verde para alta concentración
        } else if (cantidad >= 5) {
            return 'rgba(59, 130, 246, 0.7)'; // Azul para concentración media
        } else if (cantidad >= 3) {
            return 'rgba(251, 191, 36, 0.7)'; // Amarillo para concentración baja
        } else {
            return 'rgba(156, 163, 175, 0.7)'; // Gris para muy baja concentración
        }
    });
    
    const coloresBorde = empleadosOrdenados.map(cantidad => {
        if (cantidad >= 10) {
            return 'rgba(34, 197, 94, 1)';
        } else if (cantidad >= 5) {
            return 'rgba(59, 130, 246, 1)';
        } else if (cantidad >= 3) {
            return 'rgba(251, 191, 36, 1)';
        } else {
            return 'rgba(156, 163, 175, 1)';
        }
    });
    
    // Dataset para el histograma
    const dataset = {
        label: 'Número de Empleados',
        data: empleadosOrdenados,
        backgroundColor: colores,
        borderColor: coloresBorde,
        borderWidth: 2
    };
    
    // Opciones del gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Distribución de Horarios de Entrada y Salida',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Rango de Horas',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Número de Empleados',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };
    
    // Crear el gráfico
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: horariosOrdenados,
            datasets: [dataset]
        },
        options: chartOptions
    });
}

// Inicializar las gráficas al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    const asistenciasPorDepartamento = await fetch(`${apiPath}/reportes/asistencias-por-departamento`).then(res => res.json());
    crearGraficaAsistencias(asistenciasPorDepartamento, 'chartAsistencias');

    const faltasRetardos = await fetch(`${apiPath}/reportes/faltas-y-retardos-por-mes`).then(res => res.json());
    crearGraficaFaltasRetardos(faltasRetardos, 'chartFaltasRetardos');

    const faltasEmpleados = await fetch(`${apiPath}/reportes/asistencias-por-empleado`).then(res => res.json());
    crearGraficaRankingEmpleados(faltasEmpleados, 'chartRankingEmpleados');

    const horariosEmpleados = await fetch(`${apiPath}/reportes/distribucion-horarios`).then(res => res.json());
    crearHistogramaHorarios(horariosEmpleados, 'chartHistogramaHorarios');
    
    // Configurar filtros por fecha
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);
    
    document.getElementById('fechaInicio').valueAsDate = mesPasado;
    document.getElementById('fechaFin').valueAsDate = hoy;
    
    // Evento para el botón de filtrar
    document.getElementById('btnFiltrar').addEventListener('click', function() {
        // En una implementación real, aquí se haría una nueva consulta a la API
        alert('Función en desarrollo!');
    });
});