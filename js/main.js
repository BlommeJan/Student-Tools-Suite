// Import dependencies
import { initializeTheme, toggleTheme } from './theme.js';
import { initializeAlerts, showAlert } from './components/alerts.js';
import { initializeModals } from './components/modal.js';
import { showWelcomePopup } from './components/welcome.js';

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

    // Show welcome popup when the page loads
    showWelcomePopup();
});

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    showAlert('An error occurred. Please try again.', 'error');
    return false;
};  
