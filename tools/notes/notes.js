// Notes Tool - Core functionality
import { showAlert } from '../../js/components/alerts.js';
import { getItem, setItem, removeItem } from '../../js/utils/storage.js';

// Constants
const NOTES_LIST_KEY = 'notes-list';
const NOTE_CONTENT_PREFIX = 'note-content-';
const FAVORITE_TOOLS_KEY = 'favoriteTools';
const MAX_FAVORITES = 3;

// DOM Elements
let notesDashboard;
let editorView;
let noteEditor;
let currentNoteTitle;
let currentNoteTag;
let newNoteBtn;
let importBtn;
let saveAsBtn;
let backToDashboardBtn;
let newNoteModal;
let importModal;
let saveAsModal;
let newNoteTitleInput;
let newNoteTagInput;
let importFileInput;
let importTitleInput;
let importTagInput;
let confirmNewNoteBtn;
let cancelNewNoteBtn;
let confirmImportBtn;
let cancelImportBtn;
let cancelSaveAsBtn;
let formatBtns;

// Format buttons
let formatBoldBtn;
let formatItalicBtn;
let formatUnderlineBtn;
let formatH1Btn;
let formatH2Btn;
let formatH3Btn;
let formatListBtn;
let formatNumberedListBtn;
let formatQuoteBtn;
let formatCodeBtn;
let formatCodeBlockBtn;

// State
let currentNoteId = null;
let notesList = [];
let autoSaveTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Load notes and setup event listeners
    loadNotes();
    setupEventListeners();
    initializeEditor();
    
    // Initialize alerts
    if (typeof initializeAlerts === 'function') {
        initializeAlerts();
    }
});

// Initialize DOM elements
function initializeDOMElements() {
    notesDashboard = document.getElementById('notes-dashboard');
    editorView = document.getElementById('editor-view');
    noteEditor = document.getElementById('note-editor');
    currentNoteTitle = document.getElementById('current-note-title');
    currentNoteTag = document.getElementById('current-note-tag');
    newNoteBtn = document.getElementById('new-note-btn');
    importBtn = document.getElementById('import-btn');
    saveAsBtn = document.getElementById('save-as-btn');
    backToDashboardBtn = document.getElementById('back-to-dashboard');
    newNoteModal = document.getElementById('new-note-modal');
    importModal = document.getElementById('import-modal');
    saveAsModal = document.getElementById('save-as-modal');
    newNoteTitleInput = document.getElementById('new-note-title');
    newNoteTagInput = document.getElementById('new-note-tag');
    importFileInput = document.getElementById('import-file');
    importTitleInput = document.getElementById('import-title');
    importTagInput = document.getElementById('import-tag');
    confirmNewNoteBtn = document.getElementById('confirm-new-note');
    cancelNewNoteBtn = document.getElementById('cancel-new-note');
    confirmImportBtn = document.getElementById('confirm-import');
    cancelImportBtn = document.getElementById('cancel-import');
    cancelSaveAsBtn = document.getElementById('cancel-save-as');
    formatBtns = document.querySelectorAll('.format-btn');
    
    // Format buttons
    formatBoldBtn = document.getElementById('format-bold');
    formatItalicBtn = document.getElementById('format-italic');
    formatUnderlineBtn = document.getElementById('format-underline');
    formatH1Btn = document.getElementById('format-h1');
    formatH2Btn = document.getElementById('format-h2');
    formatH3Btn = document.getElementById('format-h3');
    formatListBtn = document.getElementById('format-list');
    formatNumberedListBtn = document.getElementById('format-numbered-list');
    formatQuoteBtn = document.getElementById('format-quote');
    formatCodeBtn = document.getElementById('format-code');
    formatCodeBlockBtn = document.getElementById('format-code-block');
}

// Load notes from localStorage
function loadNotes() {
    notesList = getItem(NOTES_LIST_KEY) || [];
    renderNotesDashboard();
}

// Render notes dashboard
function renderNotesDashboard() {
    if (!notesDashboard) return;
    
    if (notesList.length === 0) {
        notesDashboard.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center h-64 text-center">
                <i class="fas fa-sticky-note text-4xl mb-4 text-text-secondary"></i>
                <h3 class="text-xl font-bold mb-2">No Notes Yet</h3>
                <p class="text-text-secondary mb-4">Create your first note to get started</p>
                <button id="create-first-note" class="px-4 py-2 rounded-lg bg-accent hover:bg-opacity-90 transition-all">
                    <i class="fas fa-plus mr-2"></i>Create Note
                </button>
            </div>
        `;
        
        document.getElementById('create-first-note')?.addEventListener('click', () => {
            showModal('new-note-modal');
        });
        return;
    }
    
    const notesHTML = notesList.map(note => `
        <div class="note-card bg-surface rounded-lg p-4 border border-white/10 dark:border-white/10 hover:border-accent transition-all cursor-pointer" data-id="${note.id}">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold truncate text-text">${note.title}</h3>
                <span class="px-2 py-1 rounded-full text-xs bg-accent text-white">${note.tag || 'Untagged'}</span>
            </div>
            <p class="text-sm text-text-secondary mb-4 line-clamp-2">${getNotePreview(note.id)}</p>
            <div class="flex justify-between items-center text-xs text-text-secondary">
                <span>Last edited: ${formatDate(note.lastModified)}</span>
                <div class="flex space-x-2">
                    <button class="note-action-btn hover:text-text transition-colors" data-action="edit" data-id="${note.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-action-btn hover:text-text transition-colors" data-action="delete" data-id="${note.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    notesDashboard.innerHTML = notesHTML;
    
    // Add event listeners to note cards
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.note-action-btn')) {
                openNote(card.dataset.id);
            }
        });
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.note-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const noteId = btn.dataset.id;
            
            if (action === 'edit') {
                openNote(noteId);
            } else if (action === 'delete') {
                deleteNote(noteId);
            }
        });
    });
}

// Get note preview from content
function getNotePreview(noteId) {
    const content = getItem(`${NOTE_CONTENT_PREFIX}${noteId}`);
    if (!content) return 'No content';
    
    try {
        // Create a temporary div to parse the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Get text content and limit to 100 characters
        const text = tempDiv.textContent || tempDiv.innerText;
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    } catch (error) {
        console.error('Error parsing note content:', error);
        return 'Error loading content';
    }
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Setup event listeners
function setupEventListeners() {
    // New note button
    newNoteBtn?.addEventListener('click', () => {
        showModal('new-note-modal');
    });
    
    // Import button
    importBtn?.addEventListener('click', () => {
        showModal('import-modal');
    });
    
    // Save as button
    saveAsBtn?.addEventListener('click', () => {
        showModal('save-as-modal');
    });
    
    // Back to dashboard button
    backToDashboardBtn?.addEventListener('click', () => {
        showDashboard();
    });
    
    // New note modal
    confirmNewNoteBtn?.addEventListener('click', () => {
        createNewNote();
    });
    
    cancelNewNoteBtn?.addEventListener('click', () => {
        hideModal('new-note-modal');
    });
    
    // Import modal
    confirmImportBtn?.addEventListener('click', () => {
        importNote();
    });
    
    cancelImportBtn?.addEventListener('click', () => {
        hideModal('import-modal');
    });
    
    // Save as modal
    cancelSaveAsBtn?.addEventListener('click', () => {
        hideModal('save-as-modal');
    });
    
    // Format buttons
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            exportNote(format);
        });
    });
    
    // Format toolbar buttons
    formatBoldBtn?.addEventListener('click', () => {
        document.execCommand('bold', false, null);
    });
    
    formatItalicBtn?.addEventListener('click', () => {
        document.execCommand('italic', false, null);
    });
    
    formatUnderlineBtn?.addEventListener('click', () => {
        document.execCommand('underline', false, null);
    });
    
    formatH1Btn?.addEventListener('click', () => {
        document.execCommand('formatBlock', false, 'h1');
    });
    
    formatH2Btn?.addEventListener('click', () => {
        document.execCommand('formatBlock', false, 'h2');
    });
    
    formatH3Btn?.addEventListener('click', () => {
        document.execCommand('formatBlock', false, 'h3');
    });
    
    formatListBtn?.addEventListener('click', () => {
        document.execCommand('insertUnorderedList', false, null);
    });
    
    formatNumberedListBtn?.addEventListener('click', () => {
        document.execCommand('insertOrderedList', false, null);
    });
    
    formatQuoteBtn?.addEventListener('click', () => {
        document.execCommand('formatBlock', false, 'blockquote');
    });
    
    formatCodeBtn?.addEventListener('click', () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
            // If text is selected, wrap it in code tags
            const codeElement = document.createElement('code');
            codeElement.textContent = selectedText;
            range.deleteContents();
            range.insertNode(codeElement);
        } else {
            // If no text is selected, insert a code element and place cursor inside
            const codeElement = document.createElement('code');
            codeElement.textContent = 'code';
            range.insertNode(codeElement);
            range.setStart(codeElement, 0);
            range.setEnd(codeElement, 4);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
    
    formatCodeBlockBtn?.addEventListener('click', () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
            // If text is selected, wrap it in pre and code tags
            const preElement = document.createElement('pre');
            const codeElement = document.createElement('code');
            codeElement.textContent = selectedText;
            preElement.appendChild(codeElement);
            range.deleteContents();
            range.insertNode(preElement);
        } else {
            // If no text is selected, insert a pre and code element and place cursor inside
            const preElement = document.createElement('pre');
            const codeElement = document.createElement('code');
            codeElement.textContent = 'code block';
            preElement.appendChild(codeElement);
            range.insertNode(preElement);
            range.setStart(codeElement, 0);
            range.setEnd(codeElement, 11);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
    
    // Auto-save on editor input
    noteEditor?.addEventListener('input', () => {
        // Clear previous timeout
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        
        // Set new timeout for auto-save (500ms after user stops typing)
        autoSaveTimeout = setTimeout(() => {
            saveNoteContent();
        }, 500);
    });
    
    // File input change
    importFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Auto-fill title from filename
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            importTitleInput.value = fileName;
            
            // Try to detect tag from file path or content
            if (file.name.includes('.')) {
                const extension = file.name.split('.').pop().toLowerCase();
                if (['txt', 'md', 'docx', 'pdf'].includes(extension)) {
                    importTagInput.value = extension.toUpperCase();
                }
            }
        }
    });
}

// Modal handling
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.relative');
    
    // Clear input fields when showing modal
    if (modalId === 'new-note-modal') {
        document.getElementById('new-note-title').value = '';
        document.getElementById('new-note-tag').value = '';
    } else if (modalId === 'import-modal') {
        document.getElementById('import-file').value = '';
        document.getElementById('import-title').value = '';
        document.getElementById('import-tag').value = '';
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Trigger animation
    requestAnimationFrame(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.relative');
    
    // Trigger animation
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Add click-outside functionality
document.addEventListener('click', (e) => {
    const modals = ['import-modal', 'save-as-modal', 'new-note-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (!modal.classList.contains('hidden')) {
            const modalContent = modal.querySelector('.relative');
            if (!modalContent.contains(e.target) && e.target !== document.getElementById(modalId.replace('-modal', '-btn'))) {
                hideModal(modalId);
            }
        }
    });
});

// Add close button functionality
document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('[id$="-modal"]');
        hideModal(modal.id);
    });
});

// Create new note
function createNewNote() {
    const title = newNoteTitleInput.value.trim();
    const tag = newNoteTagInput.value.trim();
    
    if (!title) {
        showAlert('Please enter a title for your note', 'error');
        return;
    }
    
    const noteId = 'note-' + Date.now();
    const newNote = {
        id: noteId,
        title: title,
        tag: tag,
        lastModified: Date.now()
    };
    
    // Add to notes list
    notesList.unshift(newNote);
    setItem(NOTES_LIST_KEY, notesList);
    
    // Initialize empty content
    setItem(`${NOTE_CONTENT_PREFIX}${noteId}`, '');
    
    hideModal('new-note-modal');
    openNote(noteId);
}

// Open note in editor
function openNote(noteId) {
    const note = notesList.find(n => n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    currentNoteTitle.textContent = note.title;
    currentNoteTag.textContent = note.tag || 'Untagged';
    
    // Show editor view and hide dashboard
    notesDashboard.classList.add('hidden');
    editorView.classList.remove('hidden');
    
    // Load note content
    const content = getItem(`${NOTE_CONTENT_PREFIX}${noteId}`) || '';
    noteEditor.innerHTML = content;
    
    // Focus the editor
    setTimeout(() => {
        noteEditor.focus();
        // Move cursor to end of content
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(noteEditor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }, 0);
}

// Save note content
function saveNoteContent() {
    if (!currentNoteId) return;
    
    const content = noteEditor.innerHTML;
    setItem(`${NOTE_CONTENT_PREFIX}${currentNoteId}`, content);
    
    // Update last modified
    const note = notesList.find(n => n.id === currentNoteId);
    if (note) {
        note.lastModified = Date.now();
        setItem(NOTES_LIST_KEY, notesList);
    }
}

// Delete note
function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        return;
    }
    
    // Remove from notes list
    notesList = notesList.filter(note => note.id !== noteId);
    setItem(NOTES_LIST_KEY, notesList);
    
    // Remove content
    removeItem(`${NOTE_CONTENT_KEY}${noteId}`);
    
    // If current note is deleted, show dashboard
    if (currentNoteId === noteId) {
        showDashboard();
    } else {
        renderNotesDashboard();
    }
    
    showAlert('Note deleted successfully', 'success');
}

// Show dashboard
function showDashboard() {
    // Save current note before leaving
    if (currentNoteId) {
        saveNoteContent();
    }
    
    currentNoteId = null;
    editorView.classList.add('hidden');
    notesDashboard.classList.remove('hidden');
    renderNotesDashboard();
}

// Import note
function importNote() {
    const file = importFileInput.files[0];
    const title = importTitleInput.value.trim();
    const tag = importTagInput.value.trim();
    
    if (!file) {
        showAlert('Please select a file to import', 'error');
        return;
    }
    
    if (!title) {
        showAlert('Please enter a title for your note', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const content = e.target.result;
        const noteId = 'note-' + Date.now();
        
        // Create note metadata
        const newNote = {
            id: noteId,
            title: title,
            tag: tag,
            lastModified: Date.now()
        };
        
        // Add to notes list
        notesList.unshift(newNote);
        setItem(NOTES_LIST_KEY, notesList);
        
        // Process content based on file type
        const fileType = file.name.split('.').pop().toLowerCase();
        let processedContent = '';
        
        if (fileType === 'txt') {
            // Plain text - just wrap in paragraphs
            processedContent = content.split('\n').map(line => 
                line.trim() ? `<p>${line}</p>` : ''
            ).join('');
        } else if (fileType === 'md') {
            // Markdown - convert to HTML
            processedContent = marked.parse(content);
        } else if (fileType === 'docx') {
            // For DOCX, we would need a more complex parser
            // This is a simplified version
            processedContent = `<p>${content}</p>`;
        } else if (fileType === 'pdf') {
            // For PDF, we would need a PDF parser
            // This is a simplified version
            processedContent = `<p>PDF content imported. Full parsing not implemented yet.</p>`;
        }
        
        // Save content
        setItem(`${NOTE_CONTENT_PREFIX}${noteId}`, processedContent);
        
        hideModal('import-modal');
        openNote(noteId);
        
        showAlert('Note imported successfully', 'success');
    };
    
    reader.onerror = () => {
        showAlert('Error reading file', 'error');
    };
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.readAsText(file);
    } else if (file.name.endsWith('.md')) {
        reader.readAsText(file);
    } else {
        // For other formats, we would need more complex parsing
        // This is a simplified version
        reader.readAsText(file);
    }
}

// Export note
function exportNote(format) {
    if (!currentNoteId) {
        showAlert('No note to export', 'error');
        return;
    }
    
    const note = notesList.find(n => n.id === currentNoteId);
    if (!note) {
        showAlert('Note not found', 'error');
        return;
    }
    
    // Save current content before exporting
    saveNoteContent();
    
    const content = noteEditor.innerHTML;
    let exportContent = '';
    let mimeType = '';
    let fileExtension = '';
    
    switch (format) {
        case 'txt':
            // Convert HTML to plain text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            exportContent = tempDiv.textContent || tempDiv.innerText;
            mimeType = 'text/plain';
            fileExtension = 'txt';
            break;
        case 'md':
            // Convert HTML to Markdown (simplified)
            exportContent = convertHtmlToMarkdown(content);
            mimeType = 'text/markdown';
            fileExtension = 'md';
            break;
        case 'pdf':
        case 'docx':
            // These formats are coming soon
            showAlert(`${format.toUpperCase()} export is coming soon!`, 'info');
            hideModal('save-as-modal');
            return;
        default:
            showAlert('Unsupported format', 'error');
            return;
    }
    
    // Create and download file
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    hideModal('save-as-modal');
    showAlert(`Note exported as ${format.toUpperCase()}`, 'success');
}

// Convert HTML to Markdown (simplified)
function convertHtmlToMarkdown(html) {
    // This is a very simplified conversion
    // In a real app, you would use a proper HTML to Markdown converter
    let markdown = html;
    
    // Replace headings
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
    
    // Replace paragraphs
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
    
    // Replace lists
    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
        return content.replace(/<li>(.*?)<\/li>/g, '- $1\n') + '\n';
    });
    
    markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
        let counter = 1;
        return content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1\n`) + '\n';
    });
    
    // Replace blockquotes
    markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n');
    
    // Replace bold and italic
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
    
    // Remove any remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');
    
    return markdown;
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
    
    setItem(FAVORITE_TOOLS_KEY, favorites);
    showAlert(`${toolName} added to favorites`, 'success');
}

// Remove from favorites
export function removeFromFavorites(toolId) {
    const favorites = getItem(FAVORITE_TOOLS_KEY) || [];
    const updatedFavorites = favorites.filter(tool => tool.id !== toolId);
    
    if (updatedFavorites.length !== favorites.length) {
        setItem(FAVORITE_TOOLS_KEY, updatedFavorites);
        showAlert('Tool removed from favorites', 'success');
    }
}

// Theme change handler
function handleThemeChange(isDark) {
    const root = document.documentElement;
    if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    }
    
    // Update editor content visibility
    const editor = document.getElementById('note-editor');
    if (editor) {
        // Update all paragraphs and text nodes
        const paragraphs = editor.getElementsByTagName('p');
        for (let p of paragraphs) {
            p.style.color = isDark ? '#ffffff' : '#1a1a1a';
        }
        
        // Update headings
        const headings = editor.querySelectorAll('h1, h2, h3');
        for (let h of headings) {
            h.style.color = isDark ? '#ffffff' : '#1a1a1a';
        }
        
        // Update lists
        const lists = editor.querySelectorAll('ul, ol');
        for (let list of lists) {
            list.style.color = isDark ? '#ffffff' : '#1a1a1a';
        }
        
        // Update code blocks
        const codeBlocks = editor.querySelectorAll('code, pre');
        for (let code of codeBlocks) {
            code.style.backgroundColor = isDark ? '#2a2a2a' : '#f5f5f5';
            code.style.color = isDark ? '#ffffff' : '#1a1a1a';
        }
        
        // Update blockquotes
        const blockquotes = editor.querySelectorAll('blockquote');
        for (let quote of blockquotes) {
            quote.style.backgroundColor = isDark ? '#2a2a2a' : '#f5f5f5';
            quote.style.color = isDark ? '#a0a0a0' : '#4a4a4a';
        }
    }
    
    // Update all input fields
    document.querySelectorAll('input, textarea').forEach(input => {
        input.style.color = isDark ? '#ffffff' : '#1a1a1a';
        input.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
        input.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    });
    
    // Update note cards
    document.querySelectorAll('.note-card').forEach(card => {
        card.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
        card.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        card.style.color = isDark ? '#ffffff' : '#1a1a1a';
    });
    
    // Update modals
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
        modal.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        modal.style.color = isDark ? '#ffffff' : '#1a1a1a';
    });

    // Update format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
        btn.style.color = isDark ? '#ffffff' : '#1a1a1a';
        btn.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    });
}

// Initialize theme
function initializeTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    handleThemeChange(isDark);
}

// Add theme change listener
document.addEventListener('themeChanged', (e) => {
    handleThemeChange(e.detail.isDark);
});

// Initialize theme on load
initializeTheme();

// Initialize editor
function initializeEditor() {
    // Add input event listener for auto-save
    noteEditor.addEventListener('input', () => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(saveNoteContent, 1000);
    });
    
    // Add focus event listener
    noteEditor.addEventListener('focus', () => {
        noteEditor.classList.add('focused');
    });
    
    noteEditor.addEventListener('blur', () => {
        noteEditor.classList.remove('focused');
    });
}  
