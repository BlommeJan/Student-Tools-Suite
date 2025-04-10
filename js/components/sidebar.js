import { getItem, setItem } from '../utils/storage.js';
import { showAlert } from './alerts.js';

// Constants
const FAVORITE_TOOLS_KEY = 'favoriteTools';
const MAX_FAVORITES = 3;

// Tool definitions
const tools = [
    {
        id: 'notes',
        name: 'Notes',
        icon: '<i class="fas fa-file-alt"></i>',
        path: '/tools/notes/index.html'
    },
    {
        id: 'whiteboard',
        name: 'Whiteboard',
        icon: '<i class="fas fa-chalkboard"></i>',
        path: '/tools/whiteboard/index.html'
    },
    {
        id: 'todo',
        name: 'To-Do Manager',
        icon: '<i class="fas fa-list-check"></i>',
        path: '/tools/todo/index.html'
    },
    {
        id: 'planner',
        name: 'Project Planner',
        icon: '<i class="fas fa-project-diagram"></i>',
        path: '/tools/planner/index.html'
    },
    {
        id: 'flashcards',
        name: 'Flashcards',
        icon: '<i class="fas fa-layer-group"></i>',
        path: '/tools/flashcards/index.html'
    },
    {
        id: 'quiz',
        name: 'Quiz Maker',
        icon: '<i class="fas fa-question"></i>',
        path: '/tools/quiz/index.html'
    },
    {
        id: 'resources',
        name: 'Bookshelf',
        icon: '<i class="fas fa-book"></i>',
        path: '/tools/resources/index.html'
    },
    {
        id: 'tracker',
        name: 'Time Tracker',
        icon: '<i class="fas fa-clock"></i>',
        path: '/tools/tracker/index.html'
    }
];

// DOM Elements
let favoritesList;
let toolsList;
let showMoreBtn;
let toolsListVisible = false;
let activeKebabMenu = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    renderSidebar();
    setupEventListeners();
    setupMobileResponsiveness();
});

// Initialize DOM elements
function initializeDOMElements() {
    favoritesList = document.getElementById('favorites-list');
    toolsList = document.getElementById('tools-list');
    showMoreBtn = document.getElementById('show-more-btn');
}

// Setup event listeners
function setupEventListeners() {
    // Show more button
    showMoreBtn?.addEventListener('click', toggleToolsList);
    
    // Close kebab menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.kebab-menu') && !e.target.closest('.kebab-menu-content')) {
            closeAllKebabMenus();
        }
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    mobileMenuBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });
}

// Setup mobile responsiveness
function setupMobileResponsiveness() {
    const sidebar = document.getElementById('sidebar');
    
    // Add mobile classes
    sidebar.classList.add('transition-transform', 'duration-300', 'ease-in-out');
    sidebar.classList.add('md:translate-x-0');
    
    // Add mobile menu button if it doesn't exist
    if (!document.getElementById('mobile-menu-btn')) {
        const btn = document.createElement('button');
        btn.id = 'mobile-menu-btn';
        btn.className = 'md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface hover:bg-white/5 transition-all';
        btn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(btn);
    }
}

// Toggle tools list visibility
function toggleToolsList() {
    toolsListVisible = !toolsListVisible;
    toolsList.classList.toggle('hidden');
    
    // Update button state
    showMoreBtn.setAttribute('data-expanded', toolsListVisible);
    showMoreBtn.querySelector('span').innerHTML = toolsListVisible ? 
        '<i class="fas fa-chevron-up mr-2"></i>Show Less' : 
        '<i class="fas fa-chevron-down mr-2"></i>Show More';
}

// Close all kebab menus
function closeAllKebabMenus() {
    document.querySelectorAll('.kebab-menu-content').forEach(menu => {
        menu.classList.add('hidden');
    });
    activeKebabMenu = null;
}

// Toggle kebab menu
function toggleKebabMenu(toolId, event) {
    event.stopPropagation();
    event.preventDefault();
    
    const menuContent = document.getElementById(`kebab-menu-${toolId}`);
    
    // Close previously open menu if different
    if (activeKebabMenu && activeKebabMenu !== menuContent) {
        activeKebabMenu.classList.add('hidden');
    }
    
    menuContent.classList.toggle('hidden');
    activeKebabMenu = menuContent.classList.contains('hidden') ? null : menuContent;
}

// Toggle favorite status
function toggleFavorite(toolId) {
    const favorites = getItem(FAVORITE_TOOLS_KEY) || [];
    const isFavorited = favorites.some(fav => fav.id === toolId);
    
    if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(fav => fav.id !== toolId);
        setItem(FAVORITE_TOOLS_KEY, updatedFavorites);
        showAlert('Tool removed from favorites', 'success');
    } else {
        // Add to favorites if under limit
        if (favorites.length >= MAX_FAVORITES + 1) {
            showAlert(`You can only have ${MAX_FAVORITES} favorite tools. Please remove one first.`, 'warning');
            return;
        }
        
        const tool = tools.find(t => t.id === toolId);
        favorites.push({
            id: tool.id,
            name: tool.name,
            icon: tool.icon
        });
        setItem(FAVORITE_TOOLS_KEY, favorites);
        showAlert('Tool added to favorites', 'success');
    }
    
    renderSidebar();
}

// Create tool link HTML
function createToolLink(tool, isFavorite = false) {
    const isCurrentTool = window.location.pathname.includes(tool.path);
    const activeClass = isCurrentTool ? 'bg-white/10' : 'hover:bg-white/5';
    const favorites = getItem(FAVORITE_TOOLS_KEY) || [];
    const isFavorited = favorites.some(fav => fav.id === tool.id);
    
    return `
        <li class="relative group">
            <a href="${tool.path}" class="tool-link flex items-center space-x-2 px-3 py-2 rounded-lg ${activeClass} transition-all backdrop-blur-sm">
                <span class="text-lg ${isCurrentTool ? 'text-accent' : ''}">${tool.icon}</span>
                <span class="flex-1">${tool.name}</span>
                ${isCurrentTool ? '<span class="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Current</span>' : ''}
                <button class="kebab-menu opacity-0 group-hover:opacity-100 px-2 hover:bg-white/10 rounded transition-all" 
                        onclick="toggleKebabMenu('${tool.id}', event)">
                    <i class="fas fa-ellipsis-vertical"></i>
                </button>
            </a>
            <div id="kebab-menu-${tool.id}" class="kebab-menu-content hidden absolute right-0 mt-1 w-48 rounded-lg shadow-lg z-50">
                <button onclick="toggleFavorite('${tool.id}')" 
                        class="w-full text-left px-4 py-2 hover:bg-white/10 transition-all rounded-lg">
                    <i class="fas ${isFavorited ? 'fa-star text-accent' : 'fa-star'} mr-2"></i>
                    ${isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
            </div>
        </li>
    `;
}

// Render sidebar
function renderSidebar() {
    const favorites = getItem(FAVORITE_TOOLS_KEY) || [];
    
    // Render favorites
    const favoritesHTML = favorites
        .map(favorite => {
            const tool = tools.find(t => t.id === favorite.id);
            if (!tool) return '';
            return createToolLink(tool, true);
        })
        .join('');
    
    favoritesList.innerHTML = favoritesHTML || `
        <li class="px-3 py-2 text-sm text-text-secondary bg-white/5 backdrop-blur-sm rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-lightbulb text-accent mr-2"></i>
                <span>No favorites yet. Add tools using the menu (⋮).</span>
            </div>
        </li>
    `;
    
    // Render all tools
    const toolsHTML = tools
        .map(tool => createToolLink(tool))
        .join('');
    
    toolsList.innerHTML = toolsHTML;
}

// Make functions available globally for event handlers
window.toggleKebabMenu = toggleKebabMenu;
window.toggleFavorite = toggleFavorite;

// Export functions that might be needed by other modules
export {
    tools,
    renderSidebar
}; 