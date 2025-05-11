//Notas Importates
//se tiene una funcion para formatear la hora de 12hrs a 24 hrs borrar de ser necesario (aplica a pantalla usuarios,lista de asistencia)
// --------------------FUNCIONALIDAD DEL MENU----------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    // Función para mostrar/ocultar el navbar
    const showNavbar = (toggleId, navId, bodyId, headerId) => {
      const toggle = document.getElementById(toggleId),
            nav = document.getElementById(navId),
            bodypd = document.getElementById(bodyId),
            headerpd = document.getElementById(headerId);
      
      if(toggle && nav && bodypd && headerpd){
        toggle.addEventListener('click', ()=>{
          nav.classList.toggle('show');
          toggle.classList.toggle('bx-x');
          bodypd.classList.toggle('body-pd');
          headerpd.classList.toggle('body-pd');
        });
      }
    }
    
    showNavbar('header-toggle','nav-bar','body-pd','header');
    
    // Función para el acordeón del menú
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const parentItem = this.closest('.nav_item');
        
        // Cerrar otros submenús abiertos
        document.querySelectorAll('.nav_item').forEach(item => {
          if(item !== parentItem) {
            item.classList.remove('active');
          }
        });
        
        // Alternar el submenú actual
        parentItem.classList.toggle('active');
      });
    });
    
    // Manejo de links activos
    const navLinks = document.querySelectorAll('.nav_link:not(.dropdown-toggle), .submenu_link');
    
    function setActiveLink() {
      navLinks.forEach(link => link.classList.remove('active'));
      this.classList.add('active');
    }
    
    navLinks.forEach(link => {
      link.addEventListener('click', setActiveLink);
    });
  });
// -------------------- FUNCIÓN PARA FORMATEO DE HORAS (24h) --------------------
/**
 * Estandariza una hora al formato 24h (HH:MM)
 * @param {string} hora - Hora en cualquier formato
 * @returns {string} Hora en formato 24h (HH:MM) o '--:--' si no es válida
 */
function formatearHora24(hora) {
  if (!hora || hora.trim() === '' || hora === '--:--') return '--:--';
  
  // Si ya está en formato 24h correcto (HH:MM)
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
      // Asegurar dos dígitos en horas (ej: "8:00" -> "08:00")
      const [hh, mm] = hora.split(':');
      return `${hh.padStart(2, '0')}:${mm}`;
  }
  
  // Si viene en formato 12h (ej: "1:45 PM")
  if (/^([0]?[1-9]|1[0-2]):[0-5][0-9] [AP]M$/i.test(hora)) {
      const [tiempo, periodo] = hora.split(' ');
      let [hh, mm] = tiempo.split(':');
      hh = parseInt(hh);
      
      // Convertir a 24h
      if (periodo.toUpperCase() === 'PM' && hh < 12) hh += 12;
      if (periodo.toUpperCase() === 'AM' && hh === 12) hh = 0;
      
      return `${hh.toString().padStart(2, '0')}:${mm}`;
  }
  
  // Si es un objeto Date
  if (hora instanceof Date || !isNaN(new Date(hora).getTime())) {
      const date = new Date(hora);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  return '--:--'; // Formato no reconocido
}