// Welcome popup component
const WELCOME_SEEN_KEY = 'student-tools-welcome-seen';
const WELCOME_REMIND_KEY = 'student-tools-welcome-remind';

export function showWelcomePopup() {
    // Check if user has opted out
    if (localStorage.getItem(WELCOME_SEEN_KEY) === 'true') {
        return;
    }

    // Check if "remind me later" is still active
    const remindLater = localStorage.getItem(WELCOME_REMIND_KEY);
    if (remindLater && new Date().getTime() < parseInt(remindLater)) {
        return;
    }

    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4';
    popup.innerHTML = `
        <div class="fixed inset-0 backdrop-blur-lg bg-black/20"></div>
        
        <div class="relative w-full max-w-2xl max-h-[90vh] bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                <h2 class="text-2xl font-garamond font-bold mb-6" style="color: var(--accent-color)">
                    Welcome to Student Tools Suite
                </h2>

                <!-- Disclaimer Section -->
                <div class="mb-8">
                    <h3 class="text-lg font-bold mb-3">Important Information</h3>
                    <div class="space-y-3 text-sm">
                        <p>🔒 <strong>Data Storage:</strong> This application uses your browser's local storage to save all your data directly on your device. This ensures your privacy but comes with some important considerations:</p>
                        <ul class="list-disc pl-5 space-y-2">
                            <li>Clearing your browser cache or data will permanently delete all your saved information</li>
                            <li>Data is not synchronized across devices or browsers</li>
                            <li>We cannot recover your data if it's lost or deleted</li>
                        </ul>
                        <p class="text-sm opacity-75">While we're working on improvements for future versions, currently there's no cloud backup solution. Please keep this in mind when using the tools.</p>
                    </div>
                </div>

                <!-- Usage Guide Section -->
                <div class="mb-8">
                    <h3 class="text-lg font-bold mb-3">Getting Started</h3>
                    <div class="space-y-3 text-sm">
                        <p>Student Tools Suite offers various tools to enhance your study experience:</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <ul class="list-disc pl-5 space-y-2">
                                    <li><strong>Notes:</strong> Create and organize study notes</li>
                                    <li><strong>Whiteboard:</strong> Visual brainstorming space</li>
                                    <li><strong>To-Do Manager:</strong> Track tasks and deadlines</li>
                                    <li><strong>Project Planner:</strong> Organize larger projects</li>
                                </ul>
                            </div>
                            <div>
                                <ul class="list-disc pl-5 space-y-2">
                                    <li><strong>Flashcards:</strong> Create study card sets</li>
                                    <li><strong>Quiz Maker:</strong> Test your knowledge</li>
                                    <li><strong>Bookshelf:</strong> Save study resources</li>
                                    <li><strong>Time Tracker:</strong> Monitor study sessions</li>
                                </ul>
                            </div>
                        </div>
                        <p class="mt-4">Simply click on any tool card to get started. Each tool is designed to be intuitive and easy to use.</p>
                    </div>
                </div>

                <!-- Settings Notice -->
                <div class="mb-8">
                    <p class="text-sm">
                        <i class="fas fa-lightbulb text"></i>
                        <strong>Pro tip:</strong> Use the settings button <i class="fas fa-cog"></i> in the top-right corner to customize the theme and accent colors to your preference.
                    </p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center px-6 h-16 border-t border-white/10 bg-black/5">
                <div class="flex items-center space-x-2">
                    <input type="checkbox" id="dont-show-again" class="rounded border-gray-300 text-accent focus:ring-accent">
                    <label for="dont-show-again" class="text-sm">Don't show this again</label>
                </div>
                <div class="flex space-x-4">
                    <button id="remind-later" class="px-6 h-10 rounded-lg bg-opacity-20 hover:bg-opacity-30 transition-all">
                        Remind Me Later
                    </button>
                    <button id="agree-continue" class="px-6 h-10 rounded-lg" style="background-color: var(--accent-color);">
                        Agree & Continue
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(popup);

    // Handle button clicks
    const agreeBtn = popup.querySelector('#agree-continue');
    const remindBtn = popup.querySelector('#remind-later');
    const dontShowCheckbox = popup.querySelector('#dont-show-again');

    function closePopup() {
        popup.classList.add('opacity-0');
        setTimeout(() => popup.remove(), 200);
    }

    agreeBtn.addEventListener('click', () => {
        if (dontShowCheckbox.checked) {
            localStorage.setItem(WELCOME_SEEN_KEY, 'true');
        }
        closePopup();
    });

    remindBtn.addEventListener('click', () => {
        // Set reminder for 24 hours
        const remindTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem(WELCOME_REMIND_KEY, remindTime.toString());
        closePopup();
    });

    // Add animation
    requestAnimationFrame(() => {
        popup.querySelector('.backdrop-blur-lg').classList.add('opacity-100');
        popup.querySelector('.relative').classList.add('translate-y-0', 'opacity-100');
    });
} 