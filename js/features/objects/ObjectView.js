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
        this.addCustomBtn = document.getElementById('addCustomObjectBtn');
        this.addPresetBtn = document.getElementById('addPresetObjectBtn');
        this.cancelBtn = document.getElementById('cancelObjectBtn');

        // Get DOM elements for preset object modal
        this.presetModal = document.getElementById('presetObjectModal');
        this.presetCategoriesContainer = document.getElementById('presetObjectCategories');
        this.cancelPresetBtn = document.getElementById('cancelPresetObjectBtn');

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
        // Open custom object modal
        this.addCustomBtn.addEventListener('click', () => this.showModal());

        // Open preset object modal
        this.addPresetBtn.addEventListener('click', () => this.showPresetModal());

        // Cancel buttons
        this.cancelBtn.addEventListener('click', () => this.hideModal());
        this.cancelPresetBtn.addEventListener('click', () => this.hidePresetModal());

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Close modals on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        this.presetModal.addEventListener('click', (e) => {
            if (e.target === this.presetModal) {
                this.hidePresetModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal.classList.contains('active')) {
                    this.hideModal();
                }
                if (this.presetModal.classList.contains('active')) {
                    this.hidePresetModal();
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
        this.editColorInput.value = object.color;
        this.editPosXInput.value = (object.position.x / 100).toFixed(2);
        this.editPosYInput.value = (object.position.y / 100).toFixed(2);
        this.editPosZInput.value = (object.position.z / 100).toFixed(2);
        this.editCollisionInput.checked = object.collisionEnabled;

        // Handle dimensions based on whether object is preset
        if (object.isPreset) {
            // Make dimension inputs read-only for preset objects
            this.editWidthInput.value = (object.dimensions.width / 100).toFixed(2);
            this.editLengthInput.value = (object.dimensions.length / 100).toFixed(2);
            this.editHeightInput.value = (object.dimensions.height / 100).toFixed(2);

            this.editWidthInput.setAttribute('readonly', 'true');
            this.editLengthInput.setAttribute('readonly', 'true');
            this.editHeightInput.setAttribute('readonly', 'true');

            this.editWidthInput.classList.add('dimension-readonly');
            this.editLengthInput.classList.add('dimension-readonly');
            this.editHeightInput.classList.add('dimension-readonly');
        } else {
            // Make dimension inputs editable for custom objects
            this.editWidthInput.value = (object.dimensions.width / 100).toFixed(2);
            this.editLengthInput.value = (object.dimensions.length / 100).toFixed(2);
            this.editHeightInput.value = (object.dimensions.height / 100).toFixed(2);

            this.editWidthInput.removeAttribute('readonly');
            this.editLengthInput.removeAttribute('readonly');
            this.editHeightInput.removeAttribute('readonly');

            this.editWidthInput.classList.remove('dimension-readonly');
            this.editLengthInput.classList.remove('dimension-readonly');
            this.editHeightInput.classList.remove('dimension-readonly');
        }

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

        // Get the object to check if it's a preset
        const object = this.objectManager.getObjectById(this.editingObjectId);
        if (!object) {
            console.error('Object not found');
            return;
        }

        // Build updated data object
        const updatedData = {
            id: this.editingObjectId,
            name: this.editNameInput.value.trim(),
            color: this.editColorInput.value,
            posX: parseFloat(this.editPosXInput.value) * 100,
            posY: parseFloat(this.editPosYInput.value) * 100,
            posZ: parseFloat(this.editPosZInput.value) * 100,
            collisionEnabled: this.editCollisionInput.checked
        };

        // Only include dimensions for custom objects (not preset objects)
        if (!object.isPreset) {
            updatedData.width = parseFloat(this.editWidthInput.value) * 100;
            updatedData.length = parseFloat(this.editLengthInput.value) * 100;
            updatedData.height = parseFloat(this.editHeightInput.value) * 100;
        }

        // Validate
        if (!updatedData.name) {
            alert('Please enter a name for the object');
            return;
        }

        // Emit event to update object
        this.eventBus.emit('object:update-requested', updatedData);

        this.hideEditModal();
    }

    /**
     * Show the preset object selection modal
     */
    showPresetModal() {
        this.populatePresetObjects();
        this.presetModal.classList.add('active');
    }

    /**
     * Hide the preset object selection modal
     */
    hidePresetModal() {
        this.presetModal.classList.remove('active');
    }

    /**
     * Populate the preset object selection modal with categories and items
     */
    populatePresetObjects() {
        // Clear existing content
        this.presetCategoriesContainer.innerHTML = '';

        // Get all categories
        const categories = getPresetCategories();

        // Create category sections
        for (const categoryKey of categories) {
            const category = getPresetCategory(categoryKey);
            if (!category) continue;

            // Create category container
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'preset-category';

            // Create category header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'preset-category-header';
            headerDiv.textContent = category.categoryName;
            categoryDiv.appendChild(headerDiv);

            // Create items container
            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'preset-items';

            // Create item cards
            for (const item of category.items) {
                const itemCard = document.createElement('div');
                itemCard.className = 'preset-item';
                itemCard.dataset.presetId = item.id;

                // Item name
                const nameSpan = document.createElement('div');
                nameSpan.className = 'preset-item-name';
                nameSpan.textContent = item.name;
                itemCard.appendChild(nameSpan);

                // Item dimensions (convert from cm to m for display)
                const dimensionsSpan = document.createElement('div');
                dimensionsSpan.className = 'preset-item-dimensions';
                dimensionsSpan.textContent = `${(item.width / 100).toFixed(2)}m × ${(item.length / 100).toFixed(2)}m × ${(item.height / 100).toFixed(2)}m`;
                itemCard.appendChild(dimensionsSpan);

                // Color preview
                const colorPreview = document.createElement('div');
                colorPreview.className = 'preset-item-color-preview';
                colorPreview.style.backgroundColor = item.color;
                itemCard.appendChild(colorPreview);

                // Click handler
                itemCard.addEventListener('click', () => {
                    this.handlePresetObjectSelect(item.id);
                });

                itemsDiv.appendChild(itemCard);
            }

            categoryDiv.appendChild(itemsDiv);
            this.presetCategoriesContainer.appendChild(categoryDiv);
        }
    }

    /**
     * Handle preset object selection
     * @param {string} presetId - ID of the selected preset object
     */
    handlePresetObjectSelect(presetId) {
        this.hidePresetModal();
        this.eventBus.emit('preset-object:create-requested', { presetId });
    }
}
