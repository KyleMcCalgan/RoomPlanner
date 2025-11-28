/**
 * WindowManager - Manages window state and CRUD operations
 */
class WindowManager {
    constructor() {
        this.windows = [];
        this.selectedWindowId = null;
    }

    /**
     * Add a window
     * @param {Window} window - Window to add
     */
    addWindow(window) {
        this.windows.push(window);
    }

    /**
     * Remove a window by ID
     * @param {string} id - Window ID
     * @returns {boolean} True if removed
     */
    removeWindow(id) {
        const index = this.windows.findIndex(win => win.id === id);
        if (index > -1) {
            this.windows.splice(index, 1);
            if (this.selectedWindowId === id) {
                this.selectedWindowId = null;
            }
            return true;
        }
        return false;
    }

    /**
     * Get window by ID
     * @param {string} id - Window ID
     * @returns {Window|null} Window or null if not found
     */
    getWindow(id) {
        return this.windows.find(win => win.id === id) || null;
    }

    /**
     * Get all windows
     * @returns {Array<Window>} All windows
     */
    getAllWindows() {
        return [...this.windows];
    }

    /**
     * Get windows by wall
     * @param {string} wall - Wall name ("front", "back", "left", "right")
     * @returns {Array<Window>} Windows on specified wall
     */
    getWindowsByWall(wall) {
        return this.windows.filter(win => win.wall === wall);
    }

    /**
     * Select a window
     * @param {string} id - Window ID
     */
    selectWindow(id) {
        this.selectedWindowId = id;
    }

    /**
     * Deselect current window
     */
    deselectWindow() {
        this.selectedWindowId = null;
    }

    /**
     * Get selected window
     * @returns {Window|null} Selected window or null
     */
    getSelectedWindow() {
        if (!this.selectedWindowId) return null;
        return this.getWindow(this.selectedWindowId);
    }

    /**
     * Check if a window is selected
     * @param {string} id - Window ID
     * @returns {boolean} True if selected
     */
    isSelected(id) {
        return this.selectedWindowId === id;
    }

    /**
     * Find window at position on a specific wall
     * @param {string} wall - Wall name
     * @param {number} wallPos - Position along the wall
     * @param {number} wallHeight - Height on the wall
     * @returns {Window|null} Window at position or null
     */
    findWindowAtPosition(wall, wallPos, wallHeight) {
        const windowsOnWall = this.getWindowsByWall(wall);
        return windowsOnWall.find(win => win.containsPoint(wallPos, wallHeight)) || null;
    }

    /**
     * Get total count of windows
     * @returns {number} Window count
     */
    getCount() {
        return this.windows.length;
    }

    /**
     * Get total area of all windows
     * @returns {number} Total window area in cm²
     */
    getTotalArea() {
        return this.windows.reduce((total, win) => total + win.getArea(), 0);
    }

    /**
     * Clear all windows
     */
    clearAll() {
        this.windows = [];
        this.selectedWindowId = null;
    }
}
