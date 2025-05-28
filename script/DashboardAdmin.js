const apiPath = 'https://abcd-asistencia.onrender.com';
document.addEventListener('DOMContentLoaded', function() {
    const totalEmpleadosElement = document.getElementById('toralEmpleados');

    getEmpleados().then(empleados => {
        if (empleados && empleados.length > 0) {
            totalEmpleadosElement.textContent = empleados.length;
        } else {
            totalEmpleadosElement.textContent = '0';
        }
    })
})

const getEmpleados = async () => {
    try {
        const response = await fetch(`${apiPath}/empleados`,);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const empleados = await response.json();



        return empleados;
    } catch (error) {
        console.error('Error fetching empleados:', error);
        return [];
    }
}
