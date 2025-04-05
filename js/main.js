// Import dependencies
import { initializeTheme, toggleTheme } from './theme.js';
import { initializeAlerts, showAlert } from './alerts.js';
import { initializeModals } from './components/modal.js';

// Main initialization script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Initialize alerts system
    initializeAlerts();
    
    // Add any global event listeners
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    
    // Initialize any active modals
    initializeModals();
});

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    showAlert('An error occurred. Please try again.', 'error');
    return false;
};  
