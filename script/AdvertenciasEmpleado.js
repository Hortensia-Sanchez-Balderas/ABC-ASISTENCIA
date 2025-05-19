// advertencias.js - Script para manejar la lógica de la pantalla de advertencias

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const messagesContainer = document.getElementById('messages-container');
    const searchInput = document.querySelector('.input-group input');
    const searchButton = document.querySelector('.input-group button');
    const refreshButton = document.querySelector('.btn-outline-secondary.me-2');
    const filterDropdown = document.getElementById('filterDropdown');
    const messageModal = document.getElementById('messageModal');
    
    // Estado de la aplicación
    let currentFilter = 'all'; // 'all', 'unread', 'month'
    let currentSort = 'newest'; // 'newest', 'oldest'
    let messages = [];
    let filteredMessages = [];

    // Inicialización
    init();

    // Función de inicialización
    function init() {
        loadMessages();
        setupEventListeners();
    }

    // Cargar mensajes (simulación - reemplazar con llamada AJAX real)
    function loadMessages() {
        // Simulación de carga desde API
        console.log('Cargando mensajes...');
        
        // Esto sería reemplazado por una llamada AJAX real a tu backend
        // fetch('/api/advertencias')
        //     .then(response => response.json())
        //     .then(data => {
        //         messages = data;
        //         applyFilters();
        //     })
        //     .catch(error => console.error('Error cargando mensajes:', error));

        // Datos de ejemplo (simulados)
        messages = [
            {
                id: 1,
                subject: 'Retardo en la entrada del 15 de mayo',
                sender: 'Administración',
                preview: 'Se ha registrado un retardo de 25 minutos en tu entrada del día de hoy. Por favor justifica este retardo con tu supervisor.',
                content: 'Estimado empleado,\n\nSe ha registrado un retardo de 25 minutos en tu entrada del día de hoy. Según nuestros registros, tu hora de entrada programada es a las 8:00 AM y marcaste entrada a las 8:25 AM.\n\nDe acuerdo con el reglamento interno de la empresa, los retardos deben ser justificados ante tu supervisor inmediato dentro de las siguientes 24 horas.\n\nPor favor acude con tu supervisor para justificar este retardo. Si consideras que hubo un error en el registro, también puedes reportarlo.\n\nAtentamente,\nDepartamento de Recursos Humanos',
                date: new Date(),
                read: false
            },
            {
                id: 2,
                subject: 'Recordatorio: Reunión de equipo',
                sender: 'Recursos Humanos',
                preview: 'Este viernes 17 de mayo tendremos reunión de equipo a las 10:00 AM en la sala de juntas. Por favor confirma tu asistencia.',
                content: 'Hola equipo,\n\nEste viernes 17 de mayo a las 10:00 AM tendremos nuestra reunión mensual de equipo en la sala de juntas principal.\n\nTemas a tratar:\n- Revisión de métricas del mes\n- Nuevos proyectos\n- Retroalimentación general\n\nPor favor confirma tu asistencia respondiendo a este mensaje.\n\nSaludos,\nEquipo de Recursos Humanos',
                date: new Date(Date.now() - 86400000), // Ayer
                read: true
            },
            {
                id: 3,
                subject: 'Felicitaciones por tu desempeño',
                sender: 'Gerencia',
                preview: 'Queremos reconocer tu excelente desempeño durante el último trimestre. ¡Sigue así!',
                content: 'Estimado empleado,\n\nNos complace informarte que tu desempeño durante el último trimestre ha sido excepcional. Tu compromiso y resultados han superado nuestras expectativas.\n\nQueremos reconocer tu esfuerzo y dedicación, que son un ejemplo para todo el equipo. ¡Sigue con el excelente trabajo!\n\nAtentamente,\nGerencia General',
                date: new Date(Date.now() - 3 * 86400000), // Hace 3 días
                read: true
            }
        ];

        applyFilters();
    }

    // Aplicar filtros y ordenamiento
    function applyFilters() {
        // Filtrar
        filteredMessages = messages.filter(message => {
            if (currentFilter === 'unread') return !message.read;
            if (currentFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return message.date >= monthAgo;
            }
            return true;
        });

        // Ordenar
        filteredMessages.sort((a, b) => {
            return currentSort === 'newest' 
                ? b.date - a.date 
                : a.date - b.date;
        });

        renderMessages();
    }

    // Renderizar mensajes en el DOM
    function renderMessages() {
        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages p-5 text-center">
                    <i class="bi bi-envelope-open"></i>
                    <h5 class="mb-1">No hay advertencias</h5>
                    <p class="mb-0">No tienes ninguna advertencia o mensaje pendiente.</p>
                </div>
            `;
            return;
        }

        messagesContainer.innerHTML = filteredMessages.map(message => `
            <div class="message-card p-3 border-bottom ${message.read ? '' : 'unread'}" 
                 data-bs-toggle="modal" data-bs-target="#messageModal" 
                 data-message-id="${message.id}">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <div>
                        <div class="message-subject">${message.subject}</div>
                        <div class="message-sender">De: ${message.sender}</div>
                    </div>
                    <div class="message-time">${formatDate(message.date)}</div>
                </div>
                <div class="message-preview">
                    ${message.preview}
                </div>
            </div>
        `).join('');

        // Actualizar contador de mensajes
        updateMessageCount();
    }

    // Formatear fecha para mostrar
    function formatDate(date) {
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return `Hoy, ${date.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}`;
        if (diffDays === 1) return `Ayer, ${date.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}`;
        
        return date.toLocaleDateString('es-MX', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit', 
            minute:'2-digit'
        });
    }

    // Actualizar contador de mensajes
    function updateMessageCount() {
        const countElement = document.querySelector('.text-muted.small');
        if (countElement) {
            countElement.textContent = `Mostrando 1-${filteredMessages.length} de ${filteredMessages.length} mensajes`;
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Botón de búsqueda
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        // Botón de refrescar
        refreshButton.addEventListener('click', loadMessages);

        // Filtros del dropdown
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const filterText = this.textContent;
                
                if (filterText.includes('No leídas')) {
                    currentFilter = 'unread';
                } else if (filterText.includes('Este mes')) {
                    currentFilter = 'month';
                } else if (filterText.includes('Todas')) {
                    currentFilter = 'all';
                } else if (filterText.includes('más reciente')) {
                    currentSort = 'newest';
                } else if (filterText.includes('más antigua')) {
                    currentSort = 'oldest';
                }
                
                applyFilters();
                filterDropdown.textContent = filterText.includes('Ordenar') ? 
                    `<i class="bi bi-funnel"></i> Ordenar` : 
                    `<i class="bi bi-funnel"></i> ${filterText}`;
            });
        });

        // Modal de mensaje
        messageModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const messageId = parseInt(button.getAttribute('data-message-id'));
            const message = messages.find(m => m.id === messageId);
            
            if (!message) return;
            
            // Actualizar UI del modal
            document.getElementById('messageModalLabel').textContent = message.subject;
            document.querySelector('.modal-body strong:nth-of-type(1)').nextSibling.textContent = ` ${message.sender}`;
            document.querySelector('.modal-body strong:nth-of-type(2)').nextSibling.textContent = ` Tú`;
            document.querySelector('.modal-body strong:nth-of-type(3)').nextSibling.textContent = ` ${formatDate(message.date)}`;
            document.querySelector('.modal-body div:nth-of-type(2)').innerHTML = message.content.replace(/\n/g, '<br>');
            
            // Marcar como leído
            if (!message.read) {
                message.read = true;
                button.closest('.message-card').classList.remove('unread');
                
                // En una implementación real, harías una llamada AJAX aquí:
                // markAsRead(messageId);
            }
        });
    }

    // Manejar búsqueda
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            applyFilters();
            return;
        }
        
        filteredMessages = messages.filter(message => 
            message.subject.toLowerCase().includes(searchTerm) || 
            message.content.toLowerCase().includes(searchTerm) ||
            message.sender.toLowerCase().includes(searchTerm)
        );
        
        renderMessages();
    }

    // Función para marcar como leído (simulación)
    function markAsRead(messageId) {
        console.log(`Marcando mensaje ${messageId} como leído...`);
        // fetch(`/api/advertencias/${messageId}/read`, { method: 'PUT' })
        //     .then(response => {
        //         if (!response.ok) throw new Error('Error al marcar como leído');
        //         const message = messages.find(m => m.id === messageId);
        //         if (message) message.read = true;
        //     })
        //     .catch(error => console.error('Error:', error));
    }
});