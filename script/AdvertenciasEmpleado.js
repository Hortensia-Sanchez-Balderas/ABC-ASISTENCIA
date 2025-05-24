const apiPath = 'https://abcd-asistencia.onrender.com';


document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messages-container');
    const searchInput = document.querySelector('.input-group input');
    const searchButton = document.querySelector('.input-group button');
    const refreshButton = document.querySelector('.btn-outline-secondary.me-2');
    const filterDropdown = document.getElementById('filterDropdown');
    const messageModal = document.getElementById('messageModal');
    
    let currentFilter = 'all';
    let currentSort = 'newest';
    let messages = [];
    let filteredMessages = [];

    init();

    function init() {
        loadMessages();
        setupEventListeners();
    }

    async function loadMessages() {
        messages = [];
        const advertenciasAPI = await obtenerMensajes();

        if (!advertenciasAPI || advertenciasAPI.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages p-5 text-center">
                    <i class="bi bi-envelope-open"></i>
                    <h5 class="mb-1">No hay advertencias</h5>
                    <p class="mb-0">No tienes ninguna advertencia o mensaje pendiente.</p>
                </div>
            `;
            updateMessageCount();
            return;
        }

        const empleados = await obtenerEmpleados();
        
        advertenciasAPI.forEach(advertencia => {
            const fecha = new Date(advertencia.fecha);
            fecha.setHours(fecha.getHours() + 6);

            const empleadoSender = empleados.find(empleado => empleado.id_empleado === advertencia.id_empleado_remitente);
            messages.push({
                id: advertencia.id_advertencia,
                subject: advertencia.asunto,
                sender: empleadoSender?.nombre ?? '--',
                preview: advertencia.mensaje,
                content: advertencia.mensaje,
                date: fecha,
                read: advertencia.leido
            });
        });

        applyFilters();
    }

    function applyFilters() {
        filteredMessages = messages.filter(message => {
            if (currentFilter === 'unread') return !message.read;
            if (currentFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return message.date >= monthAgo;
            }
            return true;
        });

        filteredMessages.sort((a, b) => {
            return currentSort === 'newest' 
                ? b.date - a.date 
                : a.date - b.date;
        });

        renderMessages();
    }

    function renderMessages() {
        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages p-5 text-center">
                    <i class="bi bi-envelope-open"></i>
                    <h5 class="mb-1">No hay advertencias</h5>
                    <p class="mb-0">No tienes ninguna advertencia o mensaje pendiente.</p>
                </div>
            `;
            updateMessageCount();
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

        updateMessageCount();
    }

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

    function updateMessageCount() {
        const countElement = document.querySelector('.text-muted.small');
        if (countElement) {
            countElement.textContent = `Mostrando 1-${filteredMessages.length} de ${filteredMessages.length} mensajes`;
        }
    }

    function setupEventListeners() {
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        refreshButton.addEventListener('click', loadMessages);

        document.querySelectorAll('.filtro-opcion').forEach(item => {
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

        messageModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const messageId = parseInt(button.getAttribute('data-message-id'));
            const message = messages.find(m => m.id === messageId);
            if (!message) return;
            document.getElementById('messageModalLabel').textContent = message.subject;
            document.getElementById('messageModalLabel').style.color = '#000';
            document.querySelector('.modal-body strong:nth-of-type(1)').nextSibling.textContent = ` ${message.sender}`;
            document.querySelector('.modal-body strong:nth-of-type(3)').nextSibling.textContent = ` ${formatDate(message.date)}`;
            document.querySelector('.modal-body div:nth-of-type(2)').innerHTML = message.content.replace(/\n/g, '<br>');
            if (!message.read) {
                message.read = true;
                button.closest('.message-card').classList.remove('unread');
                // Aquí podrías hacer una llamada AJAX para marcar como leído en el backend
            }
        });
    }

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
});

const obtenerMensajes = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('Token no encontrado');
        return [];
    }
    const decodedToken = jwt_decode(token);
    if (!decodedToken) {
        console.error('Token inválido');
        return [];
    }
    const usuarioId = decodedToken.id_empleado;
    try {
        const response = await fetch(`${apiPath}/advertencias/advertenciasByEmpleado?id_empleado_destinatario=${usuarioId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

const obtenerEmpleados = async () => {
    try {
        const response = await fetch(`${apiPath}/empleados`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}