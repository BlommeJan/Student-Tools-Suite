// Alert system for notifications and messages
let alertContainer;

export function initializeAlerts() {
    // Create alert container if it doesn't exist
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'fixed top-4 right-4 z-50 space-y-4';
        document.body.appendChild(alertContainer);
    }
}

export function showAlert(message, type = 'info', duration = 3000) {
    // Initialize alerts if not already done
    if (!alertContainer) {
        initializeAlerts();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert p-4 rounded-lg shadow-lg transform transition-all duration-300 ${getAlertClass(type)} backdrop-blur-glass`;
    alert.innerHTML = `
        <div class="flex items-center">
            ${getAlertIcon(type)}
            <p class="ml-3">${message}</p>
        </div>
    `;

    // Add to container
    alertContainer.appendChild(alert);

    // Animate in
    requestAnimationFrame(() => {
        alert.style.transform = 'translateX(0)';
        alert.style.opacity = '1';
    });

    // Remove after duration
    setTimeout(() => {
        alert.style.transform = 'translateX(100%)';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, duration);
}

function getAlertClass(type) {
    const classes = {
        success: 'bg-primary bg-opacity-10 text-primary dark:bg-primary dark:bg-opacity-20 dark:text-white',
        error: 'bg-accent bg-opacity-10 text-accent dark:bg-accent dark:bg-opacity-20 dark:text-white',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
    };
    return classes[type] || classes.info;
}

function getAlertIcon(type) {
    const icons = {
        success: '<i class="fas fa-check-circle text-primary dark:text-white"></i>',
        error: '<i class="fas fa-exclamation-circle text-accent dark:text-white"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-yellow-500 dark:text-yellow-300"></i>',
        info: '<i class="fas fa-info-circle text-blue-500 dark:text-blue-300"></i>'
    };
    return icons[type] || icons.info;
} 