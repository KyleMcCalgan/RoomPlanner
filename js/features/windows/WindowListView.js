/**
 * WindowListView - Manages the window list in the right panel
 */
class WindowListView {
    constructor(eventBus, windowManager) {
        this.eventBus = eventBus;
        this.windowManager = windowManager;

        this.listContainer = document.getElementById('windowList');
        this.contextMenu = document.getElementById('windowContextMenu');

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for window changes
        this.eventBus.on('window:added', () => this.render());
        this.eventBus.on('window:updated', () => this.render());
        this.eventBus.on('window:deleted', () => this.render());
        this.eventBus.on('window:selected', () => this.render());
        this.eventBus.on('window:deselected', () => this.render());

        // Context menu items
        const editMenuItem = document.getElementById('editWindowMenu');
        const duplicateMenuItem = document.getElementById('duplicateWindowMenu');
        const deleteMenuItem = document.getElementById('deleteWindowMenu');

        if (editMenuItem) {
            editMenuItem.addEventListener('click', () => {
                this.eventBus.emit('window:edit-requested');
                this.hideContextMenu();
            });
        }

        if (duplicateMenuItem) {
            duplicateMenuItem.addEventListener('click', () => {
                this.eventBus.emit('window:duplicate-requested');
                this.hideContextMenu();
            });
        }

        if (deleteMenuItem) {
            deleteMenuItem.addEventListener('click', () => {
                this.eventBus.emit('window:delete-requested');
                this.hideContextMenu();
            });
        }

        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });
    }

    /**
     * Render the window list
     */
    render() {
        const windows = this.windowManager.getAllWindows();

        if (windows.length === 0) {
            this.listContainer.innerHTML = '<p class="empty-message">No windows yet</p>';
            return;
        }

        this.listContainer.innerHTML = '';

        windows.forEach((window, index) => {
            const item = this.createWindowListItem(window, index);
            this.listContainer.appendChild(item);
        });
    }

    /**
     * Create a window list item element
     * @param {Window} window - Window object
     * @param {number} index - Window index
     * @returns {HTMLElement} List item element
     */
    createWindowListItem(window, index) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.dataset.windowId = window.id;

        // Add selected class if this window is selected
        if (this.windowManager.isSelected(window.id)) {
            item.classList.add('selected');
        }

        // Content
        const content = document.createElement('div');
        content.className = 'item-content';

        // Window name/label
        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = `Window ${index + 1}`;

        // Window details
        const details = document.createElement('div');
        details.className = 'item-details';
        const widthM = (window.dimensions.width / 100).toFixed(2);
        const heightM = (window.dimensions.height / 100).toFixed(2);
        const wallName = this.getWallDisplayName(window.wall);
        details.textContent = `${widthM}m × ${heightM}m • ${wallName}`;

        content.appendChild(name);
        content.appendChild(details);

        // Assemble
        item.appendChild(content);

        // Click to select
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleWindowClick(window.id);
        });

        // Right-click context menu
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleWindowRightClick(window.id, e);
        });

        return item;
    }

    /**
     * Get display name for wall
     * @param {string} wall - Wall identifier
     * @returns {string} Display name
     */
    getWallDisplayName(wall) {
        const names = {
            'front': 'Front Wall',
            'back': 'Back Wall',
            'left': 'Left Wall',
            'right': 'Right Wall'
        };
        return names[wall] || wall;
    }

    /**
     * Handle window click from list
     * @param {string} windowId - Window ID
     */
    handleWindowClick(windowId) {
        // Deselect all objects first
        this.eventBus.emit('object:deselect-all');

        // Select the window
        this.windowManager.selectWindow(windowId);
        this.eventBus.emit('window:selected', { windowId });
    }

    /**
     * Handle window right-click from list
     * @param {string} windowId - Window ID
     * @param {MouseEvent} e - Mouse event
     */
    handleWindowRightClick(windowId, e) {
        // Select the window
        this.windowManager.selectWindow(windowId);
        this.eventBus.emit('window:selected', { windowId });

        // Show context menu
        this.showContextMenu(e.clientX, e.clientY);
    }

    /**
     * Show context menu at position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showContextMenu(x, y) {
        if (!this.contextMenu) return;

        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('active');
    }

    /**
     * Hide context menu
     */
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.remove('active');
        }
    }
}
