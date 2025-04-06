// Theme management
const THEME_KEY = 'student-tools-theme';
const ACCENT_COLOR_KEY = 'student-tools-accent';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const DEFAULT_ACCENT = '#009999';

// Predefined accent colors
const ACCENT_COLORS = [
    { name: 'Teal', value: '#009999' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#4F46E5' }
];

// Initialize theme before DOM is loaded to prevent flash
const savedTheme = localStorage.getItem(THEME_KEY) || DARK_THEME;
const savedAccent = localStorage.getItem(ACCENT_COLOR_KEY) || DEFAULT_ACCENT;
document.documentElement.className = savedTheme;
document.documentElement.setAttribute('data-theme', savedTheme);

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTheme);

export function initializeTheme() {
    applyThemeColors(savedTheme, savedAccent);
    
    // Initialize settings button only if not already initialized
    if (!window.settingsInitialized) {
        setupSettingsModal();
        window.settingsInitialized = true;
    }
}

export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    const currentAccent = localStorage.getItem(ACCENT_COLOR_KEY) || DEFAULT_ACCENT;
    
    localStorage.setItem(THEME_KEY, newTheme);
    applyThemeColors(newTheme, currentAccent);
}

export function setAccentColor(color) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || DARK_THEME;
    localStorage.setItem(ACCENT_COLOR_KEY, color);
    applyThemeColors(currentTheme, color);
}

function applyThemeColors(theme, accentColor) {
    // Set theme attribute and class
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
    
    // Apply CSS variables
    const colors = {
        [LIGHT_THEME]: {
            '--accent-color': accentColor,
            '--background-color': '#ffffff',
            '--bg-color-rgb': '255, 255, 255',
            '--text-color': '#1a202c',
            '--card-bg': 'rgba(0, 0, 0, 0.05)',
            '--glass-tint': 'rgba(255, 255, 255, 0.15)',
            '--border-color': 'rgba(255, 255, 255, 0.1)',
        },
        [DARK_THEME]: {
            '--accent-color': accentColor,
            '--background-color': '#12181f',
            '--bg-color-rgb': '18, 24, 31',
            '--text-color': '#ffffff',
            '--card-bg': 'rgba(255, 255, 255, 0.05)',
            '--glass-tint': 'rgba(0, 0, 0, 0.1)',
            '--border-color': 'rgba(255, 255, 255, 0.1)',
        }
    };

    Object.entries(colors[theme]).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
    
    // Apply backdrop blur
    document.documentElement.style.setProperty('--glass-blur', 'blur(10px)');
}

async function setupSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) return;

    // Remove any existing click handlers
    const oldSettingsBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(oldSettingsBtn, settingsBtn);

    try {
        const { createModal } = await import('./components/modal.js');
        
        oldSettingsBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.className || DARK_THEME;
            const currentAccent = localStorage.getItem(ACCENT_COLOR_KEY) || DEFAULT_ACCENT;
            
            const modal = createModal({
                title: 'Customize Your Experience',
                content: `
                    <div class="space-y-6">
                        <div class="settings-section">
                            <label class="block text-lg font-medium mb-4">Choose Your Theme</label>
                            <div class="grid grid-cols-2 gap-4">
                                <button class="theme-preview-button light ${currentTheme === LIGHT_THEME ? 'active' : ''}" id="theme-light">
                                    <div class="theme-preview">
                                        <div class="text-center">
                                            <i class="fas fa-sun text-2xl mb-2"></i>
                                            <div class="font-medium">Light Theme</div>
                                        </div>
                                    </div>
                                    <div class="theme-check">
                                        <i class="fas fa-check"></i>
                                    </div>
                                </button>
                                <button class="theme-preview-button dark ${currentTheme === DARK_THEME ? 'active' : ''}" id="theme-dark">
                                    <div class="theme-preview">
                                        <div class="text-center">
                                            <i class="fas fa-moon text-2xl mb-2"></i>
                                            <div class="font-medium">Dark Theme</div>
                                        </div>
                                    </div>
                                    <div class="theme-check">
                                        <i class="fas fa-check"></i>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <label class="block text-lg font-medium mb-4">Accent Color</label>
                            <div class="grid grid-cols-4 gap-4 mb-6">
                                ${ACCENT_COLORS.map(color => `
                                    <button class="color-preview ${color.value === currentAccent ? 'active' : ''}" 
                                            style="background: ${color.value}" 
                                            title="${color.name}"
                                            data-color="${color.value}">
                                        <div class="color-check">
                                            <i class="fas fa-check"></i>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="color-preview" style="background: ${currentAccent}">
                                    <input type="color" id="accent-color" value="${currentAccent}">
                                </div>
                                <div class="flex-1">
                                    <label class="block text-sm font-medium mb-1">Custom Color</label>
                                    <p class="text-sm opacity-75">Click the color box to choose your own accent color</p>
                                </div>
                                <button id="reset-accent" class="hover:bg-accent hover:text-white transition-all">
                                    <i class="fas fa-rotate-left mr-2"></i>Reset
                                </button>
                            </div>
                        </div>
                    </div>
                `
            });

            // Theme toggle handlers with enhanced feedback
            const lightBtn = modal.querySelector('#theme-light');
            const darkBtn = modal.querySelector('#theme-dark');
            
            function updateThemeButtons(theme) {
                lightBtn.classList.toggle('active', theme === LIGHT_THEME);
                darkBtn.classList.toggle('active', theme === DARK_THEME);
            }

            [lightBtn, darkBtn].forEach(btn => {
                btn.addEventListener('click', () => {
                    const isLight = btn.id === 'theme-light';
                    const newTheme = isLight ? LIGHT_THEME : DARK_THEME;
                    if (document.documentElement.className !== newTheme) {
                        toggleTheme();
                        updateThemeButtons(newTheme);
                    }
                });
            });

            // Accent color handlers with enhanced preview
            const colorPicker = modal.querySelector('#accent-color');
            const colorButtons = modal.querySelectorAll('.color-preview[data-color]');
            
            function updateColorSelection(newColor) {
                colorButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.color === newColor);
                });
            }

            colorPicker.addEventListener('input', (e) => {
                const newColor = e.target.value;
                setAccentColor(newColor);
                colorPicker.parentElement.style.background = newColor;
                updateColorSelection(newColor);
            });

            colorButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const newColor = btn.dataset.color;
                    setAccentColor(newColor);
                    colorPicker.value = newColor;
                    colorPicker.parentElement.style.background = newColor;
                    updateColorSelection(newColor);
                });
            });

            modal.querySelector('#reset-accent').addEventListener('click', () => {
                setAccentColor(DEFAULT_ACCENT);
                colorPicker.value = DEFAULT_ACCENT;
                colorPicker.parentElement.style.background = DEFAULT_ACCENT;
                updateColorSelection(DEFAULT_ACCENT);
            });
        });
    } catch (error) {
        console.error('Error setting up settings modal:', error);
    }
}  
