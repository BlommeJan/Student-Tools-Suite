// Modal component for dialogs and popups
export function initializeModals() {
    // Add global click handler for modal triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger]');
        if (trigger) {
            const modalId = trigger.dataset.modalTarget;
            openModal(modalId);
        }
    });

    // Add close handlers for existing modals
    document.querySelectorAll('.modal').forEach(setupModal);
}

export function createModal(options = {}) {
    const {
        id = `modal-${Date.now()}`,
        title = '',
        content = '',
        showClose = true,
        width = 'max-w-lg'
    } = options;

    // Remove existing modal if any
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    // Remove any existing keydown listeners
    document.removeEventListener('keydown', handleEscape);

    // Create modal element
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <!-- Background overlay with enhanced blur -->
            <div class="fixed inset-0 transition-all duration-300 bg-black/20 backdrop-blur-lg" aria-hidden="true"></div>

            <!-- Modal panel -->
            <div class="relative inline-block w-full ${width} p-8 text-left align-middle transition-all transform scale-95 opacity-0 rounded-2xl" 
                style="background: rgba(var(--bg-color-rgb), 0.3); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px);">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-garamond font-bold tracking-tight" style="color: var(--accent-color)">
                        ${title}
                    </h3>
                    ${showClose ? `
                        <button class="modal-close p-2 rounded-full hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-accent">
                            <span class="sr-only">Close</span>
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(modal);

    // Setup close functionality
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.backdrop-blur-lg');
    const modalPanel = modal.querySelector('.transform');
    
    function closeModal() {
        overlay.classList.remove('bg-black/20');
        overlay.classList.add('bg-black/0');
        modalPanel.classList.remove('scale-100', 'opacity-100');
        modalPanel.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        }, 200);
    }

    function handleEscape(e) {
        if (e.key === 'Escape') closeModal();
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Close on escape key
    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Add animation classes after a brief delay
    requestAnimationFrame(() => {
        modalPanel.classList.remove('scale-95', 'opacity-0');
        modalPanel.classList.add('scale-100', 'opacity-100');
    });

    return modal;
}

function setupModal(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.bg-black');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal.id));
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', () => closeModal(modal.id));
    }

    // Close on escape key
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal(modal.id);
    });
}

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.querySelector('button, [tabindex="0"]')?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');

    // Restore body scroll
    document.body.style.overflow = '';
}

// Add necessary styles
const style = document.createElement('style');
style.textContent = `
    .modal-content {
        color: var(--text-color);
    }
    .modal-content .settings-section {
        background: rgba(var(--bg-color-rgb), 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
        backdrop-filter: blur(8px);
        transition: all 0.2s ease;
    }
    .modal-content .settings-section:hover {
        background: rgba(var(--bg-color-rgb), 0.3);
        border-color: rgba(255, 255, 255, 0.2);
    }
    .modal-content button {
        color: var(--text-color);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
        padding: 0.75rem 1.25rem;
        border-radius: 0.75rem;
        font-weight: 500;
    }
    .modal-content button:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
    }
    .modal-content button:active {
        transform: translateY(0);
    }
    .modal-content button.bg-accent {
        background: var(--accent-color);
        color: white;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .modal-content button.bg-accent:hover {
        filter: brightness(110%);
    }
    .modal-content .color-preview {
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        overflow: hidden;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid rgba(255, 255, 255, 0.1);
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-content .color-preview:hover {
        transform: scale(1.05);
        border-color: rgba(255, 255, 255, 0.2);
    }
    .modal-content .color-preview .color-check {
        opacity: 0;
        color: white;
        font-size: 1.25rem;
        transition: all 0.2s ease;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    .modal-content .color-preview.active .color-check {
        opacity: 1;
    }
    .modal-content input[type="color"] {
        position: absolute;
        inset: -4px;
        width: calc(100% + 8px);
        height: calc(100% + 8px);
        cursor: pointer;
        border: none;
        padding: 0;
        background: transparent;
    }
    .modal-content input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }
    .modal-content input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 0.75rem;
    }
    .theme-preview-button {
        width: 100%;
        padding: 0;
        background: none;
        border: none;
        position: relative;
        cursor: pointer;
    }
    .theme-preview {
        width: 100%;
        height: 6rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border: 2px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 0;
    }
    .theme-preview-button:hover .theme-preview {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.2);
    }
    .theme-preview.light {
        background: #ffffff;
        color: #1a202c;
    }
    .theme-preview.dark {
        background: #12181f;
        color: #ffffff;
    }
    .theme-check {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 1.5rem;
        height: 1.5rem;
        background: var(--accent-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.2s ease;
    }
    .theme-preview-button.active .theme-check {
        opacity: 1;
        transform: scale(1);
    }
    .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 200ms;
    }
`;
document.head.appendChild(style); 
