/**
 * Archivo principal del Sistema de Facturación PWA
 * Contiene la lógica de inicialización y funciones auxiliares
 */

// Datos de ejemplo para inicialización
const sampleClientes = [
    { id: "1", nombre: "Cliente Demo", cedula: "9999999999", direccion: "Dirección de ejemplo" }
];

const sampleProductos = [
    { id: "1", nombre: "Producto Demo", codigo: "PROD001", precio: 10.50 }
];

// Función para inicializar la aplicación
function initApp() {
    console.log("Sistema de Facturación PWA inicializado");
    
    checkInitialData();
    loadComponents();
    setupGlobalEvents();
    setupOnlineStatus();
    setupPWAInstallPrompt();
}

// Verificar y cargar datos iniciales
function checkInitialData() {
    if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify(sampleClientes));
        console.log("Datos de clientes inicializados");
    }
    
    if (!localStorage.getItem('productos')) {
        localStorage.setItem('productos', JSON.stringify(sampleProductos));
        console.log("Datos de productos inicializados");
    }
    
    if (!localStorage.getItem('facturas')) {
        localStorage.setItem('facturas', JSON.stringify([]));
    }
}

// Cargar componentes
function loadComponents() {
    // Los componentes se cargan automáticamente mediante los scripts en el HTML
}

// Configurar eventos globales
function setupGlobalEvents() {
    document.addEventListener('dataUpdated', () => {
        console.log("Datos actualizados - refrescando componentes");
    });
    
    document.addEventListener('showError', (e) => {
        showNotification(`Error: ${e.detail.message}`, 'error');
    });
}

// Configurar el estado de conexión
function setupOnlineStatus() {
    function updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        const body = document.body;
        
        if (navigator.onLine) {
            statusElement.textContent = 'En línea';
            statusElement.className = 'online';
            body.classList.remove('offline');
        } else {
            statusElement.textContent = 'Sin conexión - Modo offline';
            statusElement.className = 'offline';
            body.classList.add('offline');
            showNotification('Estás trabajando en modo offline', 'warning');
        }
    }
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    updateConnectionStatus();
}

// Configurar el prompt de instalación
function setupPWAInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installButton = document.createElement('button');
        installButton.id = 'install-button';
        installButton.textContent = 'Instalar App';
        
        installButton.addEventListener('click', () => {
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    showNotification('Aplicación instalada con éxito', 'success');
                }
                deferredPrompt = null;
            });
        });
        
        document.body.appendChild(installButton);
    });
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);