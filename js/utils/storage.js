// Storage utility functions for localStorage

/**
 * Get an item from localStorage
 * @param {string} key - The key to retrieve
 * @returns {any} - The parsed value or null if not found
 */
export function getItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting item from localStorage: ${error}`);
        return null;
    }
}

/**
 * Set an item in localStorage
 * @param {string} key - The key to set
 * @param {any} value - The value to store
 * @returns {boolean} - Whether the operation was successful
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error setting item in localStorage: ${error}`);
        return false;
    }
}

/**
 * Remove an item from localStorage
 * @param {string} key - The key to remove
 * @returns {boolean} - Whether the operation was successful
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing item from localStorage: ${error}`);
        return false;
    }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} - Whether the operation was successful
 */
export function clear() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error(`Error clearing localStorage: ${error}`);
        return false;
    }
} 