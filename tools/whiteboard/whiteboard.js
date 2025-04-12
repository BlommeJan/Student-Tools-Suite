// Whiteboard Tool - Core functionality
import { showAlert } from '../../js/components/alerts.js';
import { getItem, setItem, removeItem } from '../../js/utils/storage.js';

// Constants
const WHITEBOARDS_LIST_KEY = 'whiteboards-list';
const WHITEBOARD_CONTENT_PREFIX = 'whiteboard-content-';
const FAVORITE_TOOLS_KEY = 'favoriteTools';
const MAX_FAVORITES = 3;

// DOM Elements
let whiteboardsDashboard;
let editorView;
let canvasContainer;
let currentWhiteboardTitle;
let currentWhiteboardTag;
let newWhiteboardBtn;
let importBtn;
let exportBtn;
let exportWhiteboardBtn;
let backToDashboardBtn;
let newWhiteboardModal;
let importModal;
let exportModal;
let editWhiteboardModal;
let toolOptionsPanel;
let newWhiteboardTitleInput;
let newWhiteboardTagInput;
let importFileInput;
let importTitleInput;
let importTagInput;
let editWhiteboardTitleInput;
let editWhiteboardTagInput;
let confirmNewWhiteboardBtn;
let cancelNewWhiteboardBtn;
let confirmImportBtn;
let cancelImportBtn;
let cancelExportBtn;
let confirmEditWhiteboardBtn;
let cancelEditWhiteboardBtn;
let currentColorPreview;

// Tool buttons
let moveToolBtn;
let penToolBtn;
let eraserToolBtn;
let lineToolBtn;
let rectangleToolBtn;
let circleToolBtn;
let polygonToolBtn;
let textToolBtn;
let colorPickerBtn;
let colorPickerPopup;
let colorBtns;
let customColorBtn;
let customColorInput;
let undoBtn;
let redoBtn;
let clearBtn;

// Tool option elements
let lineToolOptions;
let polygonToolOptions;
let fillOptions;
let lineTypeBtns;
let fillTypeBtns;
let cornersSlider;
let cornersValue;

// State
let currentWhiteboardId = null;
let whiteboardsList = [];
let autoSaveTimeout = null;
let canvas = null;
let undoStack = [];
let redoStack = [];

// Tool state
let currentTool = 'pen';
let currentColor = '#000000';
let currentFill = 'transparent';
let isFillEnabled = false;
let currentLineType = 'line';
let currentCorners = 3;
let isDrawing = false;
let startPoint = null;
let currentShape = null;
let polygonPoints = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Load whiteboards and setup event listeners
    loadWhiteboards();
    setupEventListeners();
    
    // Initialize alerts
    if (typeof initializeAlerts === 'function') {
        initializeAlerts();
    }
});

// Initialize DOM elements
function initializeDOMElements() {
    whiteboardsDashboard = document.getElementById('whiteboards-dashboard');
    editorView = document.getElementById('editor-view');
    canvasContainer = document.getElementById('canvas-container');
    currentWhiteboardTitle = document.getElementById('current-whiteboard-title');
    currentWhiteboardTag = document.getElementById('current-whiteboard-tag');
    newWhiteboardBtn = document.getElementById('new-whiteboard-btn');
    importBtn = document.getElementById('import-btn');
    exportBtn = document.getElementById('export-btn');
    exportWhiteboardBtn = document.getElementById('export-whiteboard-btn');
    backToDashboardBtn = document.getElementById('back-to-dashboard');
    newWhiteboardModal = document.getElementById('new-whiteboard-modal');
    importModal = document.getElementById('import-modal');
    exportModal = document.getElementById('export-modal');
    editWhiteboardModal = document.getElementById('edit-whiteboard-modal');
    toolOptionsPanel = document.getElementById('tool-options-panel');
    newWhiteboardTitleInput = document.getElementById('new-whiteboard-title');
    newWhiteboardTagInput = document.getElementById('new-whiteboard-tag');
    importFileInput = document.getElementById('import-file');
    importTitleInput = document.getElementById('import-title');
    importTagInput = document.getElementById('import-tag');
    editWhiteboardTitleInput = document.getElementById('edit-whiteboard-title');
    editWhiteboardTagInput = document.getElementById('edit-whiteboard-tag');
    confirmNewWhiteboardBtn = document.getElementById('confirm-new-whiteboard');
    cancelNewWhiteboardBtn = document.getElementById('cancel-new-whiteboard');
    confirmImportBtn = document.getElementById('confirm-import');
    cancelImportBtn = document.getElementById('cancel-import');
    cancelExportBtn = document.getElementById('cancel-export');
    confirmEditWhiteboardBtn = document.getElementById('confirm-edit-whiteboard');
    cancelEditWhiteboardBtn = document.getElementById('cancel-edit-whiteboard');
    currentColorPreview = document.getElementById('current-color-preview');
    
    // Tool buttons
    moveToolBtn = document.getElementById('move-tool');
    penToolBtn = document.getElementById('pen-tool');
    eraserToolBtn = document.getElementById('eraser-tool');
    lineToolBtn = document.getElementById('line-tool');
    rectangleToolBtn = document.getElementById('rectangle-tool');
    circleToolBtn = document.getElementById('circle-tool');
    polygonToolBtn = document.getElementById('polygon-tool');
    textToolBtn = document.getElementById('text-tool');
    colorPickerBtn = document.getElementById('color-picker-btn');
    colorPickerPopup = document.getElementById('color-picker-popup');
    colorBtns = document.querySelectorAll('.color-btn');
    customColorBtn = document.getElementById('custom-color-btn');
    customColorInput = document.getElementById('custom-color-input');
    undoBtn = document.getElementById('undo-btn');
    redoBtn = document.getElementById('redo-btn');
    clearBtn = document.getElementById('clear-btn');
    
    // Tool option elements
    lineToolOptions = document.getElementById('line-tool-options');
    polygonToolOptions = document.getElementById('polygon-tool-options');
    fillOptions = document.getElementById('fill-options');
    lineTypeBtns = document.querySelectorAll('.line-type-btn[data-line-type]');
    fillTypeBtns = document.querySelectorAll('#fill-none, #fill-color');
    cornersSlider = document.getElementById('corners-slider');
    cornersValue = document.getElementById('corners-value');
}

// Setup event listeners
function setupEventListeners() {
    // Main action buttons
    newWhiteboardBtn?.addEventListener('click', () => showModal('new-whiteboard-modal'));
    importBtn?.addEventListener('click', () => showModal('import-modal'));
    exportBtn?.addEventListener('click', () => showModal('export-modal'));
    exportWhiteboardBtn?.addEventListener('click', () => showModal('export-modal'));
    backToDashboardBtn?.addEventListener('click', showDashboard);
    
    // Modal buttons
    confirmNewWhiteboardBtn?.addEventListener('click', createNewWhiteboard);
    cancelNewWhiteboardBtn?.addEventListener('click', () => hideModal('new-whiteboard-modal'));
    confirmImportBtn?.addEventListener('click', importImage);
    cancelImportBtn?.addEventListener('click', () => hideModal('import-modal'));
    cancelExportBtn?.addEventListener('click', () => hideModal('export-modal'));
    confirmEditWhiteboardBtn?.addEventListener('click', saveWhiteboardEdit);
    cancelEditWhiteboardBtn?.addEventListener('click', () => hideModal('edit-whiteboard-modal'));
    
    // Close modal buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('[id$="-modal"]');
            if (modal) hideModal(modal.id);
        });
    });
    
    // Export format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            if (format) exportWhiteboard(format);
        });
    });
    
    // Tool buttons
    moveToolBtn?.addEventListener('click', () => setActiveTool('move'));
    penToolBtn?.addEventListener('click', () => setActiveTool('pen'));
    eraserToolBtn?.addEventListener('click', () => setActiveTool('eraser'));
    lineToolBtn?.addEventListener('click', () => setActiveTool('line'));
    rectangleToolBtn?.addEventListener('click', () => setActiveTool('rectangle'));
    circleToolBtn?.addEventListener('click', () => setActiveTool('circle'));
    polygonToolBtn?.addEventListener('click', () => setActiveTool('polygon'));
    textToolBtn?.addEventListener('click', () => setActiveTool('text'));
    
    // Color picker
    colorPickerBtn?.addEventListener('click', toggleColorPicker);
    
    // Close color picker when clicking outside
    document.addEventListener('click', (e) => {
        if (colorPickerPopup && !colorPickerPopup.classList.contains('hidden') && 
            !e.target.closest('#color-picker-popup') && 
            !e.target.closest('#color-picker-btn')) {
            colorPickerPopup.classList.add('hidden');
        }
    });
    
    // Color buttons
    colorBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            if (color) {
                setCurrentColor(color);
                colorPickerPopup.classList.add('hidden');
            }
        });
    });
    
    // Custom color input
    customColorInput?.addEventListener('input', (e) => {
        setCurrentColor(e.target.value);
    });
    
    // Line type buttons
    lineTypeBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            const lineType = btn.dataset.lineType;
            if (lineType) {
                setLineType(lineType);
                // Update button states
                lineTypeBtns.forEach(b => b.classList.toggle('active', b.dataset.lineType === lineType));
            }
        });
    });
    
    // Fill type buttons
    fillTypeBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'fill-none') {
                isFillEnabled = false;
                currentFill = 'transparent';
            } else if (btn.id === 'fill-color') {
                isFillEnabled = true;
                currentFill = currentColor;
            }
            
            // Update button states
            fillTypeBtns.forEach(b => b.classList.toggle('active', b === btn));
            
            if (canvas && canvas.getActiveObject()) {
                const obj = canvas.getActiveObject();
                if (obj && obj.fill !== undefined) {
                    obj.set('fill', isFillEnabled ? currentColor : 'transparent');
                    canvas.renderAll();
                }
            }
        });
    });
    
    // Corners slider
    cornersSlider?.addEventListener('input', (e) => {
        currentCorners = parseInt(e.target.value);
        if (cornersValue) cornersValue.textContent = currentCorners;
    });
    
    // Action buttons
    undoBtn?.addEventListener('click', undo);
    redoBtn?.addEventListener('click', redo);
    clearBtn?.addEventListener('click', clearCanvas);
}

// Load whiteboards from localStorage
function loadWhiteboards() {
    whiteboardsList = getItem(WHITEBOARDS_LIST_KEY) || [];
    renderWhiteboardsDashboard();
}

// Render whiteboards dashboard
function renderWhiteboardsDashboard() {
    if (!whiteboardsDashboard) return;
    
    if (whiteboardsList.length === 0) {
        whiteboardsDashboard.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center h-64 text-center">
                <i class="fas fa-chalkboard text-4xl mb-4 text-text-secondary"></i>
                <h3 class="text-xl font-bold mb-2">No Whiteboards Yet</h3>
                <p class="text-text-secondary mb-4">Create your first whiteboard to get started</p>
                <button id="create-first-whiteboard" class="px-4 py-2 rounded-lg bg-accent hover:bg-opacity-90 transition-all">
                    <i class="fas fa-plus mr-2"></i>Create Whiteboard
                </button>
            </div>
        `;
        
        document.getElementById('create-first-whiteboard')?.addEventListener('click', () => {
            showModal('new-whiteboard-modal');
        });
        return;
    }
    
    const whiteboardsHTML = whiteboardsList.map(whiteboard => `
        <div class="whiteboard-card bg-surface rounded-lg p-4 border border-white/10 dark:border-white/10 hover:border-accent transition-all cursor-pointer" data-id="${whiteboard.id}">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold truncate text-text">${whiteboard.title}</h3>
                <span class="px-2 py-1 rounded-full text-xs bg-accent text-white">${whiteboard.tag || 'Untagged'}</span>
            </div>
            <div class="whiteboard-preview mb-4 h-32 bg-white rounded-md overflow-hidden">
                <img src="${getWhiteboardPreview(whiteboard.id)}" alt="${whiteboard.title}" class="w-full h-full object-contain">
            </div>
            <div class="flex justify-between items-center text-xs text-text-secondary">
                <span>Last edited: ${formatDate(whiteboard.lastModified)}</span>
                <div class="flex space-x-2">
                    <button class="whiteboard-action-btn hover:text-text transition-colors" data-action="edit" data-id="${whiteboard.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="whiteboard-action-btn hover:text-text transition-colors" data-action="delete" data-id="${whiteboard.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    whiteboardsDashboard.innerHTML = whiteboardsHTML;
    
    // Add event listeners to whiteboard cards
    document.querySelectorAll('.whiteboard-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.whiteboard-action-btn')) {
                openWhiteboard(card.dataset.id);
            }
        });
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.whiteboard-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const whiteboardId = btn.dataset.id;
            
            if (action === 'edit') {
                openEditModal(whiteboardsList.find(w => w.id === whiteboardId));
            } else if (action === 'delete') {
                deleteWhiteboard(whiteboardId);
            }
        });
    });
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Get whiteboard preview
function getWhiteboardPreview(whiteboardId) {
    const content = getItem(`${WHITEBOARD_CONTENT_PREFIX}${whiteboardId}`);
    if (!content) return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Transparent 1x1 PNG
    
    try {
        return content.preview || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    } catch (error) {
        console.error('Error parsing whiteboard content:', error);
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Animate modal content
    setTimeout(() => {
        const modalContent = modal.querySelector('.relative');
        if (modalContent) {
            modalContent.classList.remove('scale-95', 'opacity-0');
        }
    }, 10);
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Animate modal content
    const modalContent = modal.querySelector('.relative');
    if (modalContent) {
        modalContent.classList.add('scale-95', 'opacity-0');
    }
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.add('hidden');
        
        // Reset inputs
        if (modalId === 'new-whiteboard-modal') {
            newWhiteboardTitleInput.value = '';
            newWhiteboardTagInput.value = '';
        } else if (modalId === 'import-modal') {
            importFileInput.value = '';
            importTitleInput.value = '';
            importTagInput.value = '';
        } else if (modalId === 'edit-whiteboard-modal') {
            editWhiteboardTitleInput.value = '';
            editWhiteboardTagInput.value = '';
        }
    }, 200);
}

// Set current color
function setCurrentColor(color) {
    currentColor = color;
    currentColorPreview.style.backgroundColor = color;
    
    if (isFillEnabled) {
        currentFill = color;
    }
    
    if (canvas) {
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.color = color;
        }
        
        // Update any selected object's stroke
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('stroke', color);
            if (isFillEnabled && activeObject.fill !== 'transparent') {
                activeObject.set('fill', color);
            }
            canvas.renderAll();
        }
    }
}

// Set line type
function setLineType(type) {
    currentLineType = type;
}

// Toggle color picker
function toggleColorPicker() {
    colorPickerPopup.classList.toggle('hidden');
}

// Create new whiteboard
function createNewWhiteboard() {
    const title = newWhiteboardTitleInput.value.trim();
    const tag = newWhiteboardTagInput.value.trim();
    
    if (!title) {
        showAlert('Please enter a title for your whiteboard', 'error');
        return;
    }
    
    const whiteboardId = 'whiteboard-' + Date.now();
    const newWhiteboard = {
        id: whiteboardId,
        title: title,
        tag: tag,
        lastModified: Date.now()
    };
    
    // Add to whiteboards list
    whiteboardsList.unshift(newWhiteboard);
    setItem(WHITEBOARDS_LIST_KEY, whiteboardsList);
    
    // Initialize empty content with white background
    setItem(`${WHITEBOARD_CONTENT_PREFIX}${whiteboardId}`, {
        preview: '',
        json: JSON.stringify({
            version: '5.3.0',
            objects: [],
            background: 'white'
        })
    });
    
    hideModal('new-whiteboard-modal');
    openWhiteboard(whiteboardId);
}

// Open edit modal
function openEditModal(whiteboard) {
    if (!whiteboard) return;
    
    editWhiteboardTitleInput.value = whiteboard.title;
    editWhiteboardTagInput.value = whiteboard.tag || '';
    
    // Store the whiteboard ID as a data attribute on the modal
    document.getElementById('edit-whiteboard-modal').dataset.id = whiteboard.id;
    
    showModal('edit-whiteboard-modal');
}

// Save whiteboard edit
function saveWhiteboardEdit() {
    const modalElement = document.getElementById('edit-whiteboard-modal');
    const whiteboardId = modalElement.dataset.id;
    const title = editWhiteboardTitleInput.value.trim();
    const tag = editWhiteboardTagInput.value.trim();
    
    if (!whiteboardId || !title) {
        showAlert('Invalid whiteboard information', 'error');
        return;
    }
    
    // Find and update the whiteboard
    const whiteboardIndex = whiteboardsList.findIndex(w => w.id === whiteboardId);
    if (whiteboardIndex === -1) {
        showAlert('Whiteboard not found', 'error');
        return;
    }
    
    whiteboardsList[whiteboardIndex].title = title;
    whiteboardsList[whiteboardIndex].tag = tag;
    whiteboardsList[whiteboardIndex].lastModified = Date.now();
    
    setItem(WHITEBOARDS_LIST_KEY, whiteboardsList);
    
    hideModal('edit-whiteboard-modal');
    
    // If this is the current whiteboard, update the display
    if (currentWhiteboardId === whiteboardId) {
        currentWhiteboardTitle.textContent = title;
        currentWhiteboardTag.textContent = tag || 'Untagged';
    } else {
        renderWhiteboardsDashboard();
    }
    
    showAlert('Whiteboard updated successfully', 'success');
}

// Delete whiteboard
function deleteWhiteboard(whiteboardId) {
    if (!window.confirm('Are you sure you want to delete this whiteboard?')) {
        return;
    }
    
    const whiteboardIndex = whiteboardsList.findIndex(w => w.id === whiteboardId);
    if (whiteboardIndex === -1) {
        showAlert('Whiteboard not found', 'error');
        return;
    }
    
    // Remove from list
    whiteboardsList.splice(whiteboardIndex, 1);
    setItem(WHITEBOARDS_LIST_KEY, whiteboardsList);
    
    // Remove content
    removeItem(`${WHITEBOARD_CONTENT_PREFIX}${whiteboardId}`);
    
    // Update dashboard
    renderWhiteboardsDashboard();
    
    showAlert('Whiteboard deleted successfully', 'success');
}

// Open whiteboard in editor
function openWhiteboard(whiteboardId, callback) {
    const whiteboard = whiteboardsList.find(w => w.id === whiteboardId);
    if (!whiteboard) return;
    
    currentWhiteboardId = whiteboardId;
    currentWhiteboardTitle.textContent = whiteboard.title;
    currentWhiteboardTag.textContent = whiteboard.tag || 'Untagged';
    
    // Show editor view and hide dashboard
    whiteboardsDashboard.classList.add('hidden');
    editorView.classList.remove('hidden');
    
    // Initialize canvas
    initializeCanvas();
    
    // Clear undo/redo stacks
    undoStack = [];
    redoStack = [];
    
    // Load whiteboard content with proper error handling
    const content = getItem(`${WHITEBOARD_CONTENT_PREFIX}${whiteboardId}`);
    if (content && content.json) {
        try {
            canvas._skipHistory = true; // Prevent history entries while loading
            const jsonData = JSON.parse(content.json);
            canvas.loadFromJSON(jsonData, () => {
                canvas.renderAll();
                canvas._skipHistory = false;
                
                // Save initial state for undo
                undoStack.push(JSON.stringify(canvas.toJSON()));
                
                // Update the preview after loading
                updateWhiteboardPreview();
                
                // Execute callback if provided
                if (typeof callback === 'function') {
                    callback();
                }
            });
        } catch (error) {
            console.error('Error loading whiteboard:', error);
            showAlert('Error loading whiteboard. Starting with a blank canvas.', 'error');
            
            canvas._skipHistory = false;
            // Reset canvas
            canvas.clear();
            canvas.backgroundColor = 'white';
            canvas.renderAll();
            
            // Save initial state for undo
            undoStack.push(JSON.stringify(canvas.toJSON()));
            
            // Execute callback if provided
            if (typeof callback === 'function') {
                callback();
            }
        }
    } else {
        canvas._skipHistory = false;
        // Reset canvas
        canvas.clear();
        canvas.backgroundColor = 'white';
        canvas.renderAll();
        
        // Save initial state for undo
        undoStack.push(JSON.stringify(canvas.toJSON()));
        
        // Execute callback if provided
        if (typeof callback === 'function') {
            callback();
        }
    }
}

// Show dashboard
function showDashboard() {
    // Save current whiteboard before leaving
    if (currentWhiteboardId && canvas) {
        saveWhiteboardContent();
    }
    
    currentWhiteboardId = null;
    editorView.classList.add('hidden');
    whiteboardsDashboard.classList.remove('hidden');
    renderWhiteboardsDashboard();
    
    // Clean up canvas instance
    if (canvas) {
        canvas.dispose();
        canvas = null;
    }
}

// Initialize canvas
function initializeCanvas() {
    if (canvas) {
        canvas.dispose();
    }
    
    // Set canvas dimensions
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    
    // Create canvas with proper settings
    canvas = new fabric.Canvas('whiteboard', {
        isDrawingMode: false,
        width: containerWidth,
        height: containerHeight,
        backgroundColor: 'white',
        preserveObjectStacking: true,
        selection: false,
        renderOnAddRemove: true,
        stopContextMenu: true
    });
    
    // Handle window resize to make canvas responsive
    const resizeCanvas = () => {
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;
        
        // Prevent redundant updates
        if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
            const zoom = canvas.getZoom();
            canvas.setWidth(containerWidth);
            canvas.setHeight(containerHeight);
            canvas.setZoom(zoom);
            canvas.renderAll();
        }
    };
    
    window.addEventListener('resize', resizeCanvas);
    
    // Set up fabric canvas event listeners
    canvas.on('object:added', (e) => {
        if (canvas._skipHistory) return;
        
        // Save state for undo
        undoStack.push(JSON.stringify(canvas.toJSON()));
        redoStack = [];
        
        // Auto-save after a delay
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(() => {
            saveWhiteboardContent();
        }, 1000);
    });
    
    canvas.on('object:modified', (e) => {
        if (canvas._skipHistory) return;
        
        undoStack.push(JSON.stringify(canvas.toJSON()));
        redoStack = [];
        
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(() => {
            saveWhiteboardContent();
        }, 1000);
    });
    
    canvas.on('path:created', (e) => {
        if (canvas._skipHistory) return;
        
        undoStack.push(JSON.stringify(canvas.toJSON()));
        redoStack = [];
        
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(() => {
            saveWhiteboardContent();
        }, 1000);
    });
    
    canvas.on('selection:created', () => {
        updateFillOptionsVisibility();
    });
    
    canvas.on('selection:updated', () => {
        updateFillOptionsVisibility();
    });
    
    canvas.on('selection:cleared', () => {
        hideToolOptions();
    });
    
    // Set up drawing events
    setupDrawingEvents();
    
    // Initialize the active tool
    setActiveTool('pen');
}

// Set active tool with improved state management
function setActiveTool(tool) {
    currentTool = tool;
    
    // Reset various states
    isDrawing = false;
    startPoint = null;
    currentShape = null;
    
    // Update tool button states
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate tool button
    let activeBtn = null;
    switch (tool) {
        case 'move':
            activeBtn = moveToolBtn;
            break;
        case 'pen':
            activeBtn = penToolBtn;
            break;
        case 'eraser':
            activeBtn = eraserToolBtn;
            break;
        case 'line':
            activeBtn = lineToolBtn;
            break;
        case 'rectangle':
            activeBtn = rectangleToolBtn;
            break;
        case 'circle':
            activeBtn = circleToolBtn;
            break;
        case 'polygon':
            activeBtn = polygonToolBtn;
            break;
        case 'text':
            activeBtn = textToolBtn;
            break;
    }
    
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    if (!canvas) return;
    
    // Update tool options panel visibility
    hideToolOptions();
    if (tool === 'line') {
        toolOptionsPanel.classList.remove('hidden');
        lineToolOptions.classList.remove('hidden');
        fillOptions.classList.add('hidden');
    } else if (tool === 'polygon') {
        toolOptionsPanel.classList.remove('hidden');
        polygonToolOptions.classList.remove('hidden');
        fillOptions.classList.remove('hidden');
    } else if (['rectangle', 'circle'].includes(tool)) {
        toolOptionsPanel.classList.remove('hidden');
        lineToolOptions.classList.add('hidden');
        polygonToolOptions.classList.add('hidden');
        fillOptions.classList.remove('hidden');
    }
    
    // Reset canvas state
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    
    // Configure canvas based on selected tool
    switch (tool) {
        case 'move':
            canvas.isDrawingMode = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.forEachObject(obj => {
                obj.selectable = true;
                obj.evented = true;
            });
            break;
            
        case 'pen':
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = 2;
            canvas.freeDrawingBrush.color = currentColor;
            break;
            
        case 'eraser':
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = 20;
            canvas.freeDrawingBrush.color = 'white';
            break;
            
        case 'text':
            canvas.isDrawingMode = false;
            canvas.defaultCursor = 'text';
            break;
            
        default:
            canvas.isDrawingMode = false;
            canvas.defaultCursor = 'crosshair';
            break;
    }
    
    canvas.renderAll();
}

// Hide all tool options
function hideToolOptions() {
    toolOptionsPanel.classList.add('hidden');
    lineToolOptions.classList.add('hidden');
    polygonToolOptions.classList.add('hidden');
    fillOptions.classList.add('hidden');
}

// Update fill options visibility based on selection
function updateFillOptionsVisibility() {
    const activeObject = canvas.getActiveObject();
    
    if (activeObject && activeObject.fill !== undefined) {
        toolOptionsPanel.classList.remove('hidden');
        fillOptions.classList.remove('hidden');
        
        // Update fill buttons state
        const isFilled = activeObject.fill !== 'transparent' && activeObject.fill !== '';
        document.getElementById('fill-none').classList.toggle('active', !isFilled);
        document.getElementById('fill-color').classList.toggle('active', isFilled);
        
        // Update local state
        isFillEnabled = isFilled;
    }
}

// Setup drawing events with proper coordination
function setupDrawingEvents() {
    if (!canvas) return;
    
    canvas.on('mouse:down', (options) => {
        if (currentTool === 'move' || canvas.isDrawingMode) return;
        
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startPoint = { x: pointer.x, y: pointer.y };
        
        switch (currentTool) {
            case 'line':
                createLine(startPoint, startPoint);
                break;
                
            case 'rectangle':
                createRectangle(startPoint, 0, 0);
                break;
                
            case 'circle':
                createCircle(startPoint, 0);
                break;
                
            case 'polygon':
                if (options.e.shiftKey) {
                    // Complete polygon on shift+click
                    if (polygonPoints.length >= 3) {
                        completePolygon();
                        polygonPoints = [];
                    }
                } else {
                    // Add point on regular click
                    polygonPoints.push({ x: pointer.x, y: pointer.y });
                    
                    // Draw point marker
                    const point = new fabric.Circle({
                        left: pointer.x - 4,
                        top: pointer.y - 4,
                        radius: 4,
                        fill: currentColor,
                        stroke: 'transparent',
                        selectable: false,
                        evented: false,
                        originX: 'center',
                        originY: 'center'
                    });
                    
                    canvas.add(point);
                    
                    // Draw preview line if more than one point
                    if (polygonPoints.length > 1) {
                        const prevPoint = polygonPoints[polygonPoints.length - 2];
                        const line = new fabric.Line(
                            [prevPoint.x, prevPoint.y, pointer.x, pointer.y],
                            {
                                stroke: currentColor,
                                strokeWidth: 2,
                                selectable: false,
                                evented: false
                            }
                        );
                        
                        canvas.add(line);
                    }
                    
                    // Create preview polygon with at least 3 points
                    if (polygonPoints.length >= 3) {
                        if (currentShape && currentShape.type === 'polygon') {
                            canvas.remove(currentShape);
                        }
                        
                        const polygonPathString = createRegularPolygonPath(
                            polygonPoints[0].x, 
                            polygonPoints[0].y, 
                            100, 
                            currentCorners
                        );
                        
                        currentShape = new fabric.Polygon(polygonPoints, {
                            stroke: currentColor,
                            strokeWidth: 2,
                            fill: isFillEnabled ? currentFill : 'transparent',
                            selectable: false,
                            evented: false
                        });
                        
                        canvas.add(currentShape);
                    }
                }
                break;
                
            case 'text':
                const text = new fabric.IText('Text', {
                    left: pointer.x,
                    top: pointer.y,
                    fontFamily: 'Arial',
                    fill: currentColor,
                    fontSize: 20,
                    selectable: true,
                    editable: true
                });
                
                canvas.add(text);
                canvas.setActiveObject(text);
                text.enterEditing();
                isDrawing = false;
                break;
        }
        
        canvas.renderAll();
    });
    
    canvas.on('mouse:move', (options) => {
        if (!isDrawing || currentTool === 'move' || canvas.isDrawingMode || currentTool === 'text') return;
        
        const pointer = canvas.getPointer(options.e);
        
        switch (currentTool) {
            case 'line':
                if (currentShape) {
                    updateLine(currentShape, startPoint, pointer);
                }
                break;
                
            case 'rectangle':
                if (currentShape) {
                    const width = pointer.x - startPoint.x;
                    const height = pointer.y - startPoint.y;
                    updateRectangle(currentShape, startPoint, width, height);
                }
                break;
                
            case 'circle':
                if (currentShape) {
                    const radius = Math.sqrt(
                        Math.pow(pointer.x - startPoint.x, 2) + 
                        Math.pow(pointer.y - startPoint.y, 2)
                    );
                    updateCircle(currentShape, startPoint, radius);
                }
                break;
                
            case 'polygon':
                if (polygonPoints.length > 0) {
                    // Update preview line from last point to current mouse position
                    canvas.forEachObject(obj => {
                        if (obj.type === 'line' && !obj.permanent) {
                            canvas.remove(obj);
                        }
                    });
                    
                    const lastPoint = polygonPoints[polygonPoints.length - 1];
                    const previewLine = new fabric.Line(
                        [lastPoint.x, lastPoint.y, pointer.x, pointer.y],
                        {
                            stroke: currentColor,
                            strokeWidth: 2,
                            selectable: false,
                            evented: false,
                            permanent: false
                        }
                    );
                    
                    canvas.add(previewLine);
                    canvas.renderAll();
                }
                break;
        }
    });
    
    canvas.on('mouse:up', (options) => {
        if (!isDrawing || currentTool === 'move' || canvas.isDrawingMode || currentTool === 'polygon') return;
        
        isDrawing = false;
        
        if (currentShape && currentTool !== 'polygon') {
            currentShape.set({
                selectable: true,
                evented: true
            });
            
            canvas.setActiveObject(currentShape);
            canvas.renderAll();
        }
        
        // Reset state for next operation
        currentShape = null;
    });
    
    // Double click to complete polygon
    canvas.on('mouse:dblclick', (options) => {
        if (currentTool === 'polygon' && polygonPoints.length >= 3) {
            completePolygon();
            polygonPoints = [];
        }
    });
}

// Create a line based on current settings
function createLine(start, end) {
    let line;
    
    // Create different line types based on current selection
    switch (currentLineType) {
        case 'arrow':
            line = new fabric.Line([start.x, start.y, end.x, end.y], {
                stroke: currentColor,
                strokeWidth: 2,
                selectable: false,
                evented: false
            });
            
            // Add arrow head
            addArrowHead(line, false, true);
            break;
            
        case 'double-arrow':
            line = new fabric.Line([start.x, start.y, end.x, end.y], {
                stroke: currentColor,
                strokeWidth: 2,
                selectable: false,
                evented: false
            });
            
            // Add arrow heads to both ends
            addArrowHead(line, true, true);
            break;
            
        default: // regular line
            line = new fabric.Line([start.x, start.y, end.x, end.y], {
                stroke: currentColor,
                strokeWidth: 2,
                selectable: false,
                evented: false
            });
            break;
    }
    
    canvas.add(line);
    currentShape = line;
    
    return line;
}

// Update line position and apply arrow properties
function updateLine(line, start, end) {
    line.set({
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y
    });
    
    // Update arrow if needed
    if (currentLineType === 'arrow' || currentLineType === 'double-arrow') {
        // Remove existing arrow objects
        canvas.forEachObject(obj => {
            if (obj.isArrowHead && obj.lineId === line.id) {
                canvas.remove(obj);
            }
        });
        
        // Re-add arrow heads
        const addToStart = currentLineType === 'double-arrow';
        addArrowHead(line, addToStart, true);
    }
    
    canvas.renderAll();
}

// Add arrow head(s) to a line
function addArrowHead(line, addToStart, addToEnd) {
    if (!line) return;
    
    // Assign ID to line if it doesn't have one
    if (!line.id) {
        line.id = 'line_' + Date.now();
    }
    
    const headSize = 10;
    const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    
    if (addToEnd) {
        const arrowHeadEnd = new fabric.Triangle({
            left: line.x2,
            top: line.y2,
            width: headSize,
            height: headSize,
            fill: currentColor,
            stroke: 'transparent',
            angle: (angle * 180 / Math.PI) + 90,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            isArrowHead: true,
            lineId: line.id
        });
        
        canvas.add(arrowHeadEnd);
    }
    
    if (addToStart) {
        const arrowHeadStart = new fabric.Triangle({
            left: line.x1,
            top: line.y1,
            width: headSize,
            height: headSize,
            fill: currentColor,
            stroke: 'transparent',
            angle: (angle * 180 / Math.PI) - 90,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            isArrowHead: true,
            lineId: line.id
        });
        
        canvas.add(arrowHeadStart);
    }
}

// Create rectangle
function createRectangle(point, width, height) {
    const rect = new fabric.Rect({
        left: point.x,
        top: point.y,
        width: Math.abs(width),
        height: Math.abs(height),
        fill: isFillEnabled ? currentFill : 'transparent',
        stroke: currentColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    
    canvas.add(rect);
    currentShape = rect;
    
    return rect;
}

// Update rectangle dimensions
function updateRectangle(rect, origin, width, height) {
    // Handle negative dimensions
    if (width < 0) {
        rect.set({
            left: origin.x + width,
            width: Math.abs(width)
        });
    } else {
        rect.set({
            left: origin.x,
            width: width
        });
    }
    
    if (height < 0) {
        rect.set({
            top: origin.y + height,
            height: Math.abs(height)
        });
    } else {
        rect.set({
            top: origin.y,
            height: height
        });
    }
    
    canvas.renderAll();
}

// Create circle
function createCircle(center, radius) {
    const circle = new fabric.Circle({
        left: center.x - radius,
        top: center.y - radius,
        radius: radius,
        fill: isFillEnabled ? currentFill : 'transparent',
        stroke: currentColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    
    canvas.add(circle);
    currentShape = circle;
    
    return circle;
}

// Update circle dimensions
function updateCircle(circle, center, radius) {
    circle.set({
        left: center.x - radius,
        top: center.y - radius,
        radius: radius
    });
    
    canvas.renderAll();
}

// Complete polygon drawing
function completePolygon() {
    if (polygonPoints.length < 3) return;
    
    // Remove temporary preview shapes
    canvas.forEachObject(obj => {
        if ((obj.type === 'circle' || obj.type === 'line') && !obj.permanent) {
            canvas.remove(obj);
        }
    });
    
    // If we're drawing a regular polygon (star)
    if (currentCorners >= 3 && polygonPoints.length === 1) {
        // Create regular polygon with specified corners
        const center = polygonPoints[0];
        const radius = 50; // Default radius for regular polygons
        
        // Calculate points for regular polygon
        const points = [];
        for (let i = 0; i < currentCorners; i++) {
            const angle = (i * 2 * Math.PI / currentCorners) - (Math.PI / 2);
            points.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }
        
        const polygon = new fabric.Polygon(points, {
            left: center.x - radius,
            top: center.y - radius,
            fill: isFillEnabled ? currentFill : 'transparent',
            stroke: currentColor,
            strokeWidth: 2,
            selectable: true,
            evented: true
        });
        
        canvas.add(polygon);
        canvas.setActiveObject(polygon);
    } else {
        // Create polygon from drawn points
        const polygon = new fabric.Polygon(polygonPoints, {
            fill: isFillEnabled ? currentFill : 'transparent',
            stroke: currentColor,
            strokeWidth: 2,
            selectable: true,
            evented: true
        });
        
        canvas.add(polygon);
        canvas.setActiveObject(polygon);
    }
    
    canvas.renderAll();
}

// Helper to create a regular polygon path
function createRegularPolygonPath(centerX, centerY, radius, sides) {
    const angleStep = 2 * Math.PI / sides;
    let points = [];
    
    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2; // Start from top
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }
    
    return points;
}

// Save whiteboard content with preview
function saveWhiteboardContent() {
    if (!currentWhiteboardId || !canvas) return;
    
    try {
        // Generate JSON data
        const jsonData = canvas.toJSON();
        
        // Generate preview image
        const previewDataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.5,
            multiplier: 0.5
        });
        
        // Save data
        setItem(`${WHITEBOARD_CONTENT_PREFIX}${currentWhiteboardId}`, {
            preview: previewDataURL,
            json: JSON.stringify(jsonData)
        });
        
        // Update whiteboard last modified time
        const whiteboardIndex = whiteboardsList.findIndex(w => w.id === currentWhiteboardId);
        if (whiteboardIndex !== -1) {
            whiteboardsList[whiteboardIndex].lastModified = Date.now();
            setItem(WHITEBOARDS_LIST_KEY, whiteboardsList);
        }
    } catch (error) {
        console.error('Error saving whiteboard:', error);
        showAlert('Error saving whiteboard', 'error');
    }
}

// Update whiteboard preview
function updateWhiteboardPreview() {
    if (!currentWhiteboardId || !canvas) return;
    
    try {
        // Generate preview image
        const previewDataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.5,
            multiplier: 0.5
        });
        
        // Get existing content
        const content = getItem(`${WHITEBOARD_CONTENT_PREFIX}${currentWhiteboardId}`);
        if (content) {
            content.preview = previewDataURL;
            setItem(`${WHITEBOARD_CONTENT_PREFIX}${currentWhiteboardId}`, content);
        }
    } catch (error) {
        console.error('Error updating preview:', error);
    }
}

// Undo operation
function undo() {
    if (!canvas || undoStack.length <= 1) return; // Keep at least initial state
    
    // Save current state to redo stack
    redoStack.push(JSON.stringify(canvas.toJSON()));
    
    // Remove current state from undo stack
    undoStack.pop();
    
    // Apply previous state
    const previousState = undoStack[undoStack.length - 1];
    canvas._skipHistory = true;
    canvas.loadFromJSON(JSON.parse(previousState), () => {
        canvas.renderAll();
        canvas._skipHistory = false;
        
        // Auto-save after undo
        saveWhiteboardContent();
    });
}

// Redo operation
function redo() {
    if (!canvas || redoStack.length === 0) return;
    
    // Get state to redo
    const nextState = redoStack.pop();
    
    // Save current state to undo stack
    undoStack.push(JSON.stringify(canvas.toJSON()));
    
    // Apply redo state
    canvas._skipHistory = true;
    canvas.loadFromJSON(JSON.parse(nextState), () => {
        canvas.renderAll();
        canvas._skipHistory = false;
        
        // Auto-save after redo
        saveWhiteboardContent();
    });
}

// Clear canvas
function clearCanvas() {
    if (!canvas) return;
    
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        // Save current state to undo stack
        undoStack.push(JSON.stringify(canvas.toJSON()));
        redoStack = [];
        
        // Clear canvas but keep background
        canvas._skipHistory = true;
        canvas.clear();
        canvas.backgroundColor = 'white';
        canvas.renderAll();
        canvas._skipHistory = false;
        
        // Save empty state
        saveWhiteboardContent();
        
        showAlert('Canvas cleared', 'success');
    }
}

// Import image
function importImage() {
    const file = importFileInput.files[0];
    const title = importTitleInput.value.trim();
    const tag = importTagInput.value.trim();
    
    if (!file) {
        showAlert('Please select an image to import', 'error');
        return;
    }
    
    if (!title) {
        showAlert('Please enter a title for your whiteboard', 'error');
        return;
    }
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file', 'error');
        return;
    }
    
    // Create new whiteboard
    const whiteboardId = 'whiteboard-' + Date.now();
    const newWhiteboard = {
        id: whiteboardId,
        title: title,
        tag: tag,
        lastModified: Date.now()
    };
    
    // Add to whiteboards list
    whiteboardsList.unshift(newWhiteboard);
    setItem(WHITEBOARDS_LIST_KEY, whiteboardsList);
    
    // Initialize with white background
    setItem(`${WHITEBOARD_CONTENT_PREFIX}${whiteboardId}`, {
        preview: '',
        json: JSON.stringify({
            version: '5.3.0',
            objects: [],
            background: 'white'
        })
    });
    
    // Open whiteboard and add image
    hideModal('import-modal');
    openWhiteboard(whiteboardId, () => {
        // Load the image after canvas is ready
        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                // Scale image to fit canvas while preserving aspect ratio
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const imgWidth = img.width;
                const imgHeight = img.height;
                
                let scale = 1;
                if (imgWidth > canvasWidth || imgHeight > canvasHeight) {
                    const scaleX = canvasWidth / imgWidth * 0.8;
                    const scaleY = canvasHeight / imgHeight * 0.8;
                    scale = Math.min(scaleX, scaleY);
                } else {
                    // If image is smaller, scale it up slightly
                    scale = Math.min(canvasWidth / imgWidth * 0.5, canvasHeight / imgHeight * 0.5);
                }
                
                img.scale(scale);
                
                // Center the image
                img.set({
                    left: (canvasWidth - imgWidth * scale) / 2,
                    top: (canvasHeight - imgHeight * scale) / 2,
                    selectable: true,
                    evented: true
                });
                
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                
                // Save state
                saveWhiteboardContent();
            });
        };
        reader.readAsDataURL(file);
    });
}

// Export whiteboard
function exportWhiteboard(format) {
    if (!currentWhiteboardId || !canvas) {
        showAlert('No whiteboard to export', 'error');
        return;
    }
    
    const whiteboard = whiteboardsList.find(w => w.id === currentWhiteboardId);
    if (!whiteboard) {
        showAlert('Whiteboard not found', 'error');
        return;
    }
    
    // Save before exporting
    saveWhiteboardContent();
    
    let dataURL;
    let mimeType;
    let fileExtension;
    
    // Determine export format
    switch (format) {
        case 'png':
            dataURL = canvas.toDataURL({ format: 'png' });
            mimeType = 'image/png';
            fileExtension = 'png';
            break;
            
        case 'jpeg':
            dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
            mimeType = 'image/jpeg';
            fileExtension = 'jpg';
            break;
            
        case 'webp':
            dataURL = canvas.toDataURL({ format: 'webp', quality: 0.9 });
            mimeType = 'image/webp';
            fileExtension = 'webp';
            break;
            
        case 'svg':
            dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(canvas.toSVG());
            mimeType = 'image/svg+xml';
            fileExtension = 'svg';
            break;
            
        default:
            showAlert('Unsupported format', 'error');
            return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${whiteboard.title}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideModal('export-modal');
    showAlert(`Whiteboard exported as ${format.toUpperCase()}`, 'success');
}

// Add to favorites
export function addToFavorites(toolId, toolName, toolIcon) {
    const favorites = getItem(FAVORITE_TOOLS_KEY) || [];
    
    // Check if already in favorites
    if (favorites.some(tool => tool.id === toolId)) {
        return;
    }
    
    // Check if max favorites reached
    if (favorites.length >= MAX_FAVORITES) {
        showAlert(`You can only have ${MAX_FAVORITES} favorite tools. Please remove one first.`, 'warning');
        return;
    }
    
    // Add to favorites
    favorites.push({
        id: toolId,
        name: toolName,
        icon: toolIcon
    });
    
    // Save to localStorage
    setItem(FAVORITE_TOOLS_KEY, favorites);
    showAlert(`${toolName} added to favorites`, 'success');
}

// Remove from favorites
export function removeFromFavorites(toolId) {
    const favorites = getItem(FAVORITE_TOOLS_KEY) || [];
    const tool = favorites.find(tool => tool.id === toolId);
    
    if (!tool) return;
    
    // Remove from favorites
    const updatedFavorites = favorites.filter(tool => tool.id !== toolId);
    
    // Save to localStorage
    setItem(FAVORITE_TOOLS_KEY, updatedFavorites);
    showAlert(`${tool.name} removed from favorites`, 'success');
}
