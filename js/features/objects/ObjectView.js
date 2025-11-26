/**
 * ObjectView - Handles object UI components and modals
 */
class ObjectView {
    constructor(eventBus) {
        this.eventBus = eventBus;

        // Get DOM elements
        this.modal = document.getElementById('objectModal');
        this.form = document.getElementById('objectForm');
        this.addBtn = document.getElementById('addObjectBtn');
        this.cancelBtn = document.getElementById('cancelObjectBtn');

        this.nameInput = document.getElementById('objectName');
        this.widthInput = document.getElementById('objectWidth');
        this.lengthInput = document.getElementById('objectLength');
        this.heightInput = document.getElementById('objectHeight');
        this.colorInput = document.getElementById('objectColor');

        this.contextMenu = document.getElementById('contextMenu');
        this.editMenuItem = document.getElementById('editObjectMenu');
        this.deleteMenuItem = document.getElementById('deleteObjectMenu');
        this.toggleCollisionMenuItem = document.getElementById('toggleCollisionMenu');

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
                if (this.contextMenu.classList.contains('active')) {
                    this.hideContextMenu();
                }
            }
        });

        // Context menu items
        this.editMenuItem.addEventListener('click', () => {
            this.eventBus.emit('object:edit-requested');
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
        this.modal.classList.add('active');
        this.nameInput.focus();
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
     * Update mode indicator
     * @param {string} mode - Current mode
     */
    updateModeIndicator(mode) {
        const indicator = document.getElementById('modeIndicator');
        const modeTexts = {
            'READY': 'Ready',
            'CREATING': 'Click to place object...',
            'EDITING': 'Editing mode'
        };
        indicator.textContent = modeTexts[mode] || mode;
    }
}
