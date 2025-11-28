/**
 * ObjectView - Handles object UI components and modals
 */
class ObjectView {
    constructor(eventBus, objectManager) {
        this.eventBus = eventBus;
        this.objectManager = objectManager;

        // Get DOM elements for create modal
        this.modal = document.getElementById('objectModal');
        this.form = document.getElementById('objectForm');
        this.addBtn = document.getElementById('addObjectBtn');
        this.cancelBtn = document.getElementById('cancelObjectBtn');

        this.nameInput = document.getElementById('objectName');
        this.widthInput = document.getElementById('objectWidth');
        this.lengthInput = document.getElementById('objectLength');
        this.heightInput = document.getElementById('objectHeight');
        this.colorInput = document.getElementById('objectColor');

        // Get DOM elements for edit modal
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');

        this.editNameInput = document.getElementById('editName');
        this.editWidthInput = document.getElementById('editWidth');
        this.editLengthInput = document.getElementById('editLength');
        this.editHeightInput = document.getElementById('editHeight');
        this.editColorInput = document.getElementById('editColor');
        this.editPosXInput = document.getElementById('editPosX');
        this.editPosYInput = document.getElementById('editPosY');
        this.editPosZInput = document.getElementById('editPosZ');
        this.editCollisionInput = document.getElementById('editCollision');

        // Context menu
        this.contextMenu = document.getElementById('contextMenu');
        this.editMenuItem = document.getElementById('editObjectMenu');
        this.duplicateMenuItem = document.getElementById('duplicateObjectMenu');
        this.deleteMenuItem = document.getElementById('deleteObjectMenu');
        this.toggleCollisionMenuItem = document.getElementById('toggleCollisionMenu');

        // Track object being edited
        this.editingObjectId = null;

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
            this.eventBus.emit('object:edit-requested');
            this.hideContextMenu();
        });

        this.duplicateMenuItem.addEventListener('click', () => {
            this.eventBus.emit('object:duplicate-requested');
            this.hideContextMenu();
        });

        this.deleteMenuItem.addEventListener('click', () => {
            this.eventBus.emit('object:delete-requested');
            this.hideContextMenu();
        });

        this.toggleCollisionMenuItem.addEventListener('click', () => {
            this.eventBus.emit('object:toggle-collision-requested');
            this.hideContextMenu();
        });

        // Close context menu on click outside
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    /**
     * Show the object creation modal
     */
    showModal() {
        // Auto-number the object name
        const nextNumber = this.objectManager.getAllObjects().length + 1;
        this.nameInput.value = nextNumber.toString();

        this.modal.classList.add('active');
        this.nameInput.focus();
        this.nameInput.select(); // Select the text so user can easily type over it
    }

    /**
     * Hide the object creation modal
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
        const objectData = {
            name: this.nameInput.value.trim(),
            width: parseFloat(this.widthInput.value) * 100,
            length: parseFloat(this.lengthInput.value) * 100,
            height: parseFloat(this.heightInput.value) * 100,
            color: this.colorInput.value
        };

        // Validate
        if (!objectData.name) {
            alert('Please enter a name for the object');
            return;
        }

        // Emit event to create object
        this.eventBus.emit('object:create-requested', objectData);

        this.hideModal();
    }

    /**
     * Show context menu at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {PlaceableObject} object - The object being context-menued
     */
    showContextMenu(x, y, object) {
        // Update toggle collision text based on current state
        if (object) {
            this.toggleCollisionMenuItem.textContent = object.collisionEnabled
                ? '✓ Collision Enabled'
                : '✗ Collision Disabled';
        }

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
     * Update mode indicator
     * @param {string} mode - Current mode
     * @param {number} selectedCount - Number of selected objects
     */
    updateModeIndicator(mode, selectedCount = 0) {
        const indicator = document.getElementById('modeIndicator');
        const modeTexts = {
            'READY': 'Ready',
            'CREATING': 'Click to place object... (ESC to cancel)',
            'EDITING': selectedCount > 1 ? `${selectedCount} objects selected` : 'Editing mode'
        };
        indicator.textContent = modeTexts[mode] || mode;
    }

    /**
     * Show the edit modal with object data
     * @param {PlaceableObject} object - The object to edit
     */
    showEditModal(object) {
        if (!object) return;

        this.editingObjectId = object.id;

        // Convert from cm to meters for display
        this.editNameInput.value = object.name;
        this.editWidthInput.value = (object.dimensions.width / 100).toFixed(2);
        this.editLengthInput.value = (object.dimensions.length / 100).toFixed(2);
        this.editHeightInput.value = (object.dimensions.height / 100).toFixed(2);
        this.editColorInput.value = object.color;
        this.editPosXInput.value = (object.position.x / 100).toFixed(2);
        this.editPosYInput.value = (object.position.y / 100).toFixed(2);
        this.editPosZInput.value = (object.position.z / 100).toFixed(2);
        this.editCollisionInput.checked = object.collisionEnabled;

        this.editModal.classList.add('active');
        this.editNameInput.focus();
    }

    /**
     * Hide the edit modal
     */
    hideEditModal() {
        this.editModal.classList.remove('active');
        this.editingObjectId = null;
    }

    /**
     * Handle edit form submission
     * @param {Event} e - Form submit event
     */
    handleEditSubmit(e) {
        e.preventDefault();

        if (!this.editingObjectId) {
            console.error('No object is being edited');
            return;
        }

        // Convert from meters to cm (internal storage)
        const updatedData = {
            id: this.editingObjectId,
            name: this.editNameInput.value.trim(),
            width: parseFloat(this.editWidthInput.value) * 100,
            length: parseFloat(this.editLengthInput.value) * 100,
            height: parseFloat(this.editHeightInput.value) * 100,
            color: this.editColorInput.value,
            posX: parseFloat(this.editPosXInput.value) * 100,
            posY: parseFloat(this.editPosYInput.value) * 100,
            posZ: parseFloat(this.editPosZInput.value) * 100,
            collisionEnabled: this.editCollisionInput.checked
        };

        // Validate
        if (!updatedData.name) {
            alert('Please enter a name for the object');
            return;
        }

        // Emit event to update object
        this.eventBus.emit('object:update-requested', updatedData);

        this.hideEditModal();
    }
}
