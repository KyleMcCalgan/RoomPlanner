/**
 * WindowView - Handles window UI components and modals
 */
class WindowView {
    constructor(eventBus, windowManager, room) {
        this.eventBus = eventBus;
        this.windowManager = windowManager;
        this.room = room;

        // Get DOM elements for create modal
        this.modal = document.getElementById('windowModal');
        this.form = document.getElementById('windowForm');
        this.addBtn = document.getElementById('addWindowBtn');
        this.cancelBtn = document.getElementById('cancelWindowBtn');

        this.wallInput = document.getElementById('windowWall');
        this.widthInput = document.getElementById('windowWidth');
        this.heightInput = document.getElementById('windowHeight');
        this.heightFromFloorInput = document.getElementById('windowHeightFromFloor');

        // Get DOM elements for edit modal
        this.editModal = document.getElementById('editWindowModal');
        this.editForm = document.getElementById('editWindowForm');
        this.cancelEditBtn = document.getElementById('cancelEditWindowBtn');

        this.editWallInput = document.getElementById('editWindowWall');
        this.editWidthInput = document.getElementById('editWindowWidth');
        this.editHeightInput = document.getElementById('editWindowHeight');
        this.editHeightFromFloorInput = document.getElementById('editWindowHeightFromFloor');
        this.editPositionInput = document.getElementById('editWindowPosition');

        // Context menu
        this.contextMenu = document.getElementById('windowContextMenu');
        this.editMenuItem = document.getElementById('editWindowMenu');
        this.duplicateMenuItem = document.getElementById('duplicateWindowMenu');
        this.deleteMenuItem = document.getElementById('deleteWindowMenu');

        // Track window being edited
        this.editingWindowId = null;

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Open modal
        this.addBtn.addEventListener('click', () => this.showModal());

        // Cancel button
        this.cancelBtn.addEventListener('click', () => this.hideModal());

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal.classList.contains('active')) {
                    this.hideModal();
                }
                if (this.editModal.classList.contains('active')) {
                    this.hideEditModal();
                }
                if (this.contextMenu.classList.contains('active')) {
                    this.hideContextMenu();
                }
            }
        });

        // Edit modal event listeners
        this.cancelEditBtn.addEventListener('click', () => this.hideEditModal());

        this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));

        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.hideEditModal();
            }
        });

        // Context menu items
        this.editMenuItem.addEventListener('click', () => {
            this.eventBus.emit('window:edit-requested');
            this.hideContextMenu();
        });

        this.duplicateMenuItem.addEventListener('click', () => {
            this.eventBus.emit('window:duplicate-requested');
            this.hideContextMenu();
        });

        this.deleteMenuItem.addEventListener('click', () => {
            this.eventBus.emit('window:delete-requested');
            this.hideContextMenu();
        });

        // Close context menu on click outside
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    /**
     * Show the window creation modal with default values based on room size
     */
    showModal() {
        // Set default values based on room dimensions
        // Default dimensions: width=8% of room, height=30% of room, heightFromFloor=30% of room
        const defaultWidth = this.room.dimensions.width * 0.2;
        const defaultHeight = this.room.dimensions.height * 0.30;
        const defaultHeightFromFloor = this.room.dimensions.height * 0.30;

        // Convert from cm to meters for display
        this.widthInput.value = (defaultWidth / 100).toFixed(2);
        this.heightInput.value = (defaultHeight / 100).toFixed(2);
        this.heightFromFloorInput.value = (defaultHeightFromFloor / 100).toFixed(2);

        this.modal.classList.add('active');
        this.wallInput.focus();
    }

    /**
     * Hide the window creation modal
     */
    hideModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    handleSubmit(e) {
        e.preventDefault();

        // Convert from meters to cm (internal storage)
        const windowData = {
            wall: this.wallInput.value,
            width: parseFloat(this.widthInput.value) * 100,
            height: parseFloat(this.heightInput.value) * 100,
            heightFromFloor: parseFloat(this.heightFromFloorInput.value) * 100
        };

        // Validate dimensions
        if (windowData.width <= 0 || windowData.height <= 0 || windowData.heightFromFloor < 0) {
            alert('Window dimensions must be positive values');
            return;
        }

        // Emit event to controller
        this.eventBus.emit('window:create-requested', windowData);

        this.hideModal();
    }

    /**
     * Show the window edit modal
     * @param {string} windowId - Window ID to edit
     */
    showEditModal(windowId) {
        const window = this.windowManager.getWindow(windowId);
        if (!window) return;

        this.editingWindowId = windowId;

        // Populate form with current values (convert cm to meters for display)
        this.editWallInput.value = window.wall;
        this.editWidthInput.value = (window.dimensions.width / 100).toFixed(2);
        this.editHeightInput.value = (window.dimensions.height / 100).toFixed(2);
        this.editHeightFromFloorInput.value = (window.heightFromFloor / 100).toFixed(2);
        this.editPositionInput.value = (window.position / 100).toFixed(2);

        this.editModal.classList.add('active');
        this.editWidthInput.focus();
    }

    /**
     * Hide the window edit modal
     */
    hideEditModal() {
        this.editModal.classList.remove('active');
        this.editForm.reset();
        this.editingWindowId = null;
    }

    /**
     * Handle edit form submission
     * @param {Event} e - Form submit event
     */
    handleEditSubmit(e) {
        e.preventDefault();

        if (!this.editingWindowId) return;

        // Convert from meters to cm (internal storage)
        const updates = {
            wall: this.editWallInput.value,
            width: parseFloat(this.editWidthInput.value) * 100,
            height: parseFloat(this.editHeightInput.value) * 100,
            heightFromFloor: parseFloat(this.editHeightFromFloorInput.value) * 100,
            position: parseFloat(this.editPositionInput.value) * 100
        };

        // Validate dimensions
        if (updates.width <= 0 || updates.height <= 0 || updates.heightFromFloor < 0 || updates.position < 0) {
            alert('Window dimensions and position must be positive values');
            return;
        }

        // Emit event to controller
        this.eventBus.emit('window:update-requested', {
            windowId: this.editingWindowId,
            updates: updates
        });

        this.hideEditModal();
    }

    /**
     * Show context menu at position
     * @param {number} x - X position (screen space)
     * @param {number} y - Y position (screen space)
     */
    showContextMenu(x, y) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('active');
    }

    /**
     * Hide context menu
     */
    hideContextMenu() {
        this.contextMenu.classList.remove('active');
    }

    /**
     * Update button state based on current view
     * Windows can only be placed in side views (FRONT, LEFT, RIGHT)
     * @param {string} currentView - Current view name
     */
    updateButtonState(currentView) {
        const canPlaceWindow = currentView !== 'TOP';
        this.addBtn.disabled = !canPlaceWindow;

        if (!canPlaceWindow) {
            this.addBtn.title = 'Switch to FRONT, LEFT, or RIGHT view to place windows';
        } else {
            this.addBtn.title = 'Add window to current wall';
        }
    }
}
