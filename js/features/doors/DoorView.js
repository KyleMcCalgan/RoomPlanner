/**
 * DoorView - Handles door UI components and modals
 */
class DoorView {
    constructor(eventBus, doorManager, room) {
        this.eventBus = eventBus;
        this.doorManager = doorManager;
        this.room = room;

        // Get DOM elements for create modal
        this.modal = document.getElementById('doorModal');
        this.form = document.getElementById('doorForm');
        this.addBtn = document.getElementById('addDoorBtn');
        this.cancelBtn = document.getElementById('cancelDoorBtn');

        this.widthInput = document.getElementById('doorWidth');
        this.heightInput = document.getElementById('doorHeight');
        this.swingDirectionInput = document.getElementById('doorSwingDirection');
        this.hingePositionInput = document.getElementById('doorHingePosition');

        // Get DOM elements for edit modal
        this.editModal = document.getElementById('editDoorModal');
        this.editForm = document.getElementById('editDoorForm');
        this.cancelEditBtn = document.getElementById('cancelEditDoorBtn');

        this.editWallInput = document.getElementById('editDoorWall');
        this.editWidthInput = document.getElementById('editDoorWidth');
        this.editHeightInput = document.getElementById('editDoorHeight');
        this.editSwingDirectionInput = document.getElementById('editDoorSwingDirection');
        this.editHingePositionInput = document.getElementById('editDoorHingePosition');
        this.editPositionInput = document.getElementById('editDoorPosition');

        // Context menu
        this.contextMenu = document.getElementById('doorContextMenu');
        this.editMenuItem = document.getElementById('editDoorMenu');
        this.duplicateMenuItem = document.getElementById('duplicateDoorMenu');
        this.deleteMenuItem = document.getElementById('deleteDoorMenu');

        // Track door being edited
        this.editingDoorId = null;

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
            this.eventBus.emit('door:edit-requested');
            this.hideContextMenu();
        });

        this.duplicateMenuItem.addEventListener('click', () => {
            this.eventBus.emit('door:duplicate-requested');
            this.hideContextMenu();
        });

        this.deleteMenuItem.addEventListener('click', () => {
            this.eventBus.emit('door:delete-requested');
            this.hideContextMenu();
        });

        // Close context menu on click outside
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    /**
     * Show the door creation modal with default values based on room size
     */
    showModal() {
        // Set default values based on room dimensions
        // Default dimensions: width=15% of room, height=80% of room
        const defaultWidth = this.room.dimensions.width * 0.15;
        const defaultHeight = this.room.dimensions.height * 0.80;

        // Convert from cm to meters for display
        this.widthInput.value = (defaultWidth / 100).toFixed(2);
        this.heightInput.value = (defaultHeight / 100).toFixed(2);

        // Default swing settings
        this.swingDirectionInput.value = 'inward';
        this.hingePositionInput.value = 'left';

        this.modal.classList.add('active');
        this.widthInput.focus();
    }

    /**
     * Hide the door creation modal
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
        // Note: wall is not specified here - it will be determined by the controller
        // based on current view (TOP = drag to wall, side views = current wall)
        const doorData = {
            width: parseFloat(this.widthInput.value) * 100,
            height: parseFloat(this.heightInput.value) * 100,
            swingDirection: this.swingDirectionInput.value,
            hingePosition: this.hingePositionInput.value
        };

        // Validate dimensions
        if (doorData.width <= 0 || doorData.height <= 0) {
            alert('Door dimensions must be positive values');
            return;
        }

        // Emit event to controller
        this.eventBus.emit('door:create-requested', doorData);

        this.hideModal();
    }

    /**
     * Show the door edit modal
     * @param {string} doorId - Door ID to edit
     */
    showEditModal(doorId) {
        const door = this.doorManager.getDoor(doorId);
        if (!door) return;

        this.editingDoorId = doorId;

        // Populate form with current values (convert cm to meters for display)
        this.editWallInput.value = door.wall;
        this.editWidthInput.value = (door.dimensions.width / 100).toFixed(2);
        this.editHeightInput.value = (door.dimensions.height / 100).toFixed(2);
        this.editSwingDirectionInput.value = door.swingDirection;
        this.editHingePositionInput.value = door.hingePosition;
        this.editPositionInput.value = (door.position / 100).toFixed(2);

        this.editModal.classList.add('active');
        this.editWidthInput.focus();
    }

    /**
     * Hide the door edit modal
     */
    hideEditModal() {
        this.editModal.classList.remove('active');
        this.editForm.reset();
        this.editingDoorId = null;
    }

    /**
     * Handle edit form submission
     * @param {Event} e - Form submit event
     */
    handleEditSubmit(e) {
        e.preventDefault();

        if (!this.editingDoorId) return;

        // Convert from meters to cm (internal storage)
        const updates = {
            wall: this.editWallInput.value,
            width: parseFloat(this.editWidthInput.value) * 100,
            height: parseFloat(this.editHeightInput.value) * 100,
            swingDirection: this.editSwingDirectionInput.value,
            hingePosition: this.editHingePositionInput.value,
            position: parseFloat(this.editPositionInput.value) * 100
        };

        // Validate dimensions
        if (updates.width <= 0 || updates.height <= 0 || updates.position < 0) {
            alert('Door dimensions and position must be positive values');
            return;
        }

        // Emit event to controller
        this.eventBus.emit('door:update-requested', {
            doorId: this.editingDoorId,
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
     * Doors can be placed in all views (different behavior per view)
     * @param {string} currentView - Current view name
     */
    updateButtonState(currentView) {
        // Doors can be placed in all views
        // TOP view: drag to any wall
        // Side views: constrained to current wall
        this.addBtn.disabled = false;

        if (currentView === 'TOP') {
            this.addBtn.title = 'Add door (drag to any wall)';
        } else {
            this.addBtn.title = 'Add door to current wall';
        }
    }
}
