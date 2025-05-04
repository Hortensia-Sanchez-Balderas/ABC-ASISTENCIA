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