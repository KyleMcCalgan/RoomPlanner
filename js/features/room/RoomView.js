/**
 * RoomView - Handles room UI components and modals
 */
class RoomView {
    constructor(roomController, eventBus) {
        this.roomController = roomController;
        this.eventBus = eventBus;

        // Get DOM elements
        this.modal = document.getElementById('roomModal');
        this.form = document.getElementById('roomForm');
        this.setupBtn = document.getElementById('roomSetupBtn');
        this.cancelBtn = document.getElementById('cancelRoomBtn');

        this.widthInput = document.getElementById('roomWidth');
        this.lengthInput = document.getElementById('roomLength');
        this.heightInput = document.getElementById('roomHeight');

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Open modal
        this.setupBtn.addEventListener('click', () => this.showModal());

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
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hideModal();
            }
        });
    }

    /**
     * Show the room setup modal
     */
    showModal() {
        // Populate with current dimensions (convert cm to meters)
        const dims = this.roomController.getDimensions();
        this.widthInput.value = (dims.width / 100).toFixed(1);
        this.lengthInput.value = (dims.length / 100).toFixed(1);
        this.heightInput.value = (dims.height / 100).toFixed(1);

        this.modal.classList.add('active');
    }

    /**
     * Hide the room setup modal
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
        const width = parseFloat(this.widthInput.value) * 100;
        const length = parseFloat(this.lengthInput.value) * 100;
        const height = parseFloat(this.heightInput.value) * 100;

        // Update room dimensions
        const success = this.roomController.updateRoomDimensions(width, length, height);

        if (success) {
            this.hideModal();
        } else {
            alert('Invalid room dimensions. Please check the values and try again.');
        }
    }
}
