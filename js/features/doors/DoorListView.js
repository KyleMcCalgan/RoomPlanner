/**
 * DoorListView - Manages the door list in the right panel
 */
class DoorListView {
    constructor(eventBus, doorManager) {
        this.eventBus = eventBus;
        this.doorManager = doorManager;

        this.listContainer = document.getElementById('doorList');
        this.contextMenu = document.getElementById('doorContextMenu');

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for door changes
        this.eventBus.on('door:created', () => this.render());
        this.eventBus.on('door:updated', () => this.render());
        this.eventBus.on('door:deleted', () => this.render());
        this.eventBus.on('door:selected', () => this.render());
        this.eventBus.on('door:deselected', () => this.render());
        this.eventBus.on('door:moved', () => this.render());

        // Context menu items
        const editMenuItem = document.getElementById('editDoorMenu');
        const duplicateMenuItem = document.getElementById('duplicateDoorMenu');
        const deleteMenuItem = document.getElementById('deleteDoorMenu');

        if (editMenuItem) {
            editMenuItem.addEventListener('click', () => {
                this.eventBus.emit('door:edit-requested');
                this.hideContextMenu();
            });
        }

        if (duplicateMenuItem) {
            duplicateMenuItem.addEventListener('click', () => {
                this.eventBus.emit('door:duplicate-requested');
                this.hideContextMenu();
            });
        }

        if (deleteMenuItem) {
            deleteMenuItem.addEventListener('click', () => {
                this.eventBus.emit('door:delete-requested');
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
     * Render the door list
     */
    render() {
        const doors = this.doorManager.getAllDoors();

        if (doors.length === 0) {
            this.listContainer.innerHTML = '<p class="empty-message">No doors yet</p>';
            return;
        }

        this.listContainer.innerHTML = '';

        doors.forEach((door, index) => {
            const item = this.createDoorListItem(door, index);
            this.listContainer.appendChild(item);
        });
    }

    /**
     * Create a door list item element
     * @param {Door} door - Door object
     * @param {number} index - Door index
     * @returns {HTMLElement} List item element
     */
    createDoorListItem(door, index) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.dataset.doorId = door.id;

        // Add selected class if this door is selected
        if (this.doorManager.isSelected(door.id)) {
            item.classList.add('selected');
        }

        // Add blocked class if door is blocked
        if (door.isBlocked) {
            item.classList.add('blocked');
        }

        // Content
        const content = document.createElement('div');
        content.className = 'item-content';

        // Door name/label
        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = `Door ${index + 1}`;
        if (door.isBlocked) {
            name.textContent += ' ⚠️';
        }

        // Door details
        const details = document.createElement('div');
        details.className = 'item-details';
        const widthM = (door.dimensions.width / 100).toFixed(2);
        const heightM = (door.dimensions.height / 100).toFixed(2);
        const wallName = this.getWallDisplayName(door.wall);
        const swingText = this.getSwingDisplayText(door.swingDirection, door.hingePosition);
        details.textContent = `${widthM}m × ${heightM}m • ${wallName} • ${swingText}`;

        content.appendChild(name);
        content.appendChild(details);

        // Assemble
        item.appendChild(content);

        // Click to select
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDoorClick(door.id);
        });

        // Right-click context menu
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleDoorRightClick(door.id, e);
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
            'front': 'Front',
            'back': 'Back',
            'left': 'Left',
            'right': 'Right'
        };
        return names[wall] || wall;
    }

    /**
     * Get display text for swing direction and hinge position
     * @param {string} swingDirection - "inward" or "outward"
     * @param {string} hingePosition - "left" or "right"
     * @returns {string} Display text
     */
    getSwingDisplayText(swingDirection, hingePosition) {
        const direction = swingDirection === 'inward' ? 'In' : 'Out';
        const hinge = hingePosition === 'left' ? 'L' : 'R';
        return `${direction}/${hinge}`;
    }

    /**
     * Handle door click from list
     * @param {string} doorId - Door ID
     */
    handleDoorClick(doorId) {
        // Deselect all objects and windows first
        this.eventBus.emit('object:deselect-all');
        this.eventBus.emit('window:deselect-all');

        // Select the door
        this.doorManager.selectDoor(doorId);
        this.eventBus.emit('door:selected', { doorId });
        this.eventBus.emit('render-requested');
    }

    /**
     * Handle door right-click from list
     * @param {string} doorId - Door ID
     * @param {MouseEvent} e - Mouse event
     */
    handleDoorRightClick(doorId, e) {
        // Select the door
        this.doorManager.selectDoor(doorId);
        this.eventBus.emit('door:selected', { doorId });
        this.eventBus.emit('render-requested');

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
