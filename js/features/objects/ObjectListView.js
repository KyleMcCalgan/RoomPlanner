/**
 * ObjectListView - Handles the right panel object list with drag-and-drop reordering and batch operations
 */
class ObjectListView {
    constructor(eventBus, objectManager) {
        this.eventBus = eventBus;
        this.objectManager = objectManager;

        // Get DOM elements
        this.objectListContainer = document.getElementById('objectList');
        this.doorListContainer = document.getElementById('doorList');
        this.windowListContainer = document.getElementById('windowList');

        // Context menus
        this.listContextMenu = document.getElementById('listContextMenu');
        this.batchContextMenu = document.getElementById('batchContextMenu');

        // Drag and drop state
        this.draggedItem = null;
        this.draggedObjectId = null;

        // Context menu state
        this.contextMenuObjectId = null;

        this.setupEventListeners();
        this.setupContextMenus();
        this.refresh();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for object-related events
        this.eventBus.on('object:added', () => this.refresh());
        this.eventBus.on('object:updated', () => this.refresh());
        this.eventBus.on('object:deleted', () => this.refresh());
        this.eventBus.on('object:selected', () => this.updateSelection());
        this.eventBus.on('object:deselected', () => this.updateSelection());

        // Close context menu on outside click
        document.addEventListener('click', (e) => {
            // Don't close if clicking on a menu item or context menu
            const isContextMenu = e.target.closest('.context-menu');
            const isListItem = e.target.closest('.list-item');

            if (!isContextMenu && !isListItem) {
                this.hideContextMenus();
            }
        });
    }

    /**
     * Set up context menu handlers
     */
    setupContextMenus() {
        // Wait for DOM to be fully ready
        setTimeout(() => {
            // Helper to add menu item handler using mousedown for better reliability
            const addMenuItem = (id, handler) => {
                const element = document.getElementById(id);
                console.log(`Setting up ${id}:`, element);
                if (element) {
                    // Use mousedown instead of click for more reliable triggering
                    element.addEventListener('mousedown', (e) => {
                        console.log(`${id} clicked!`);
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        handler();
                        this.hideContextMenus();
                    });
                    // Also add click as backup
                    element.addEventListener('click', (e) => {
                        console.log(`${id} clicked (backup)!`);
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    });
                } else {
                    console.error(`Menu item ${id} not found in DOM!`);
                }
            };

            // Single item context menu
            addMenuItem('listEditObjectMenu', () => {
                const objectId = this.contextMenuObjectId; // Store before hiding
                console.log('Edit handler executing, objectId:', objectId);
                if (objectId) {
                    this.eventBus.emit('object:edit-requested', { objectId });
                }
            });

            addMenuItem('listDuplicateObjectMenu', () => {
                const objectId = this.contextMenuObjectId; // Store before hiding
                console.log('Duplicate handler executing');
                if (objectId) {
                    this.eventBus.emit('object:duplicate-requested', { objectId });
                }
            });

            addMenuItem('listToggleVisibilityMenu', () => {
                const objectId = this.contextMenuObjectId; // Store before hiding
                console.log('Toggle visibility handler executing');
                if (objectId) {
                    this.eventBus.emit('object:toggle-visibility', { objectId });
                }
            });

            addMenuItem('listToggleCollisionMenu', () => {
                const objectId = this.contextMenuObjectId; // Store before hiding
                console.log('Toggle collision handler executing');
                if (objectId) {
                    this.eventBus.emit('object:toggle-collision-requested', { objectId });
                }
            });

            addMenuItem('listDeleteObjectMenu', () => {
                const objectId = this.contextMenuObjectId; // Store before hiding
                console.log('Delete handler executing');
                if (objectId) {
                    this.eventBus.emit('object:delete-requested', { objectId });
                }
            });

            // Batch context menu
            addMenuItem('batchToggleVisibilityMenu', () => {
                console.log('Batch toggle visibility');
                this.eventBus.emit('batch:toggle-visibility');
            });

            addMenuItem('batchToggleCollisionMenu', () => {
                console.log('Batch toggle collision');
                this.eventBus.emit('batch:toggle-collision');
            });

            addMenuItem('batchDeleteMenu', () => {
                console.log('Batch delete');
                this.eventBus.emit('batch:delete');
            });

            addMenuItem('batchDeselectMenu', () => {
                console.log('Batch deselect');
                this.objectManager.deselectAll();
                this.eventBus.emit('object:deselected');
            });
        }, 100);
    }

    /**
     * Hide all context menus
     * @param {boolean} clearObjectId - Whether to clear the stored objectId
     */
    hideContextMenus(clearObjectId = true) {
        this.listContextMenu.classList.remove('active');
        this.batchContextMenu.classList.remove('active');
        if (clearObjectId) {
            this.contextMenuObjectId = null;
        }
    }

    /**
     * Refresh the entire list
     */
    refresh() {
        this.renderObjectList();
        this.updateSelection();
    }

    /**
     * Render the object list
     */
    renderObjectList() {
        const objects = this.objectManager.getObjectsByCreationOrder();

        if (objects.length === 0) {
            this.objectListContainer.innerHTML = '<p class="empty-message">No objects yet</p>';
            return;
        }

        // Clear existing list
        this.objectListContainer.innerHTML = '';

        // Create list items
        objects.forEach((obj, index) => {
            const item = this.createListItem(obj, index);
            this.objectListContainer.appendChild(item);
        });
    }

    /**
     * Create a list item for an object
     * @param {PlaceableObject} obj - The object
     * @param {number} index - Position in creation order
     * @returns {HTMLElement} List item element
     */
    createListItem(obj, index) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.dataset.objectId = obj.id;
        item.draggable = true;

        // Add hidden class if not visible
        if (!obj.visible) {
            item.classList.add('hidden');
        }

        // Color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'item-color-indicator';
        colorIndicator.style.backgroundColor = obj.color;

        // Content
        const content = document.createElement('div');
        content.className = 'item-content';

        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = obj.name;

        const details = document.createElement('div');
        details.className = 'item-details';
        details.textContent = `${(obj.dimensions.width / 100).toFixed(2)}m × ${(obj.dimensions.length / 100).toFixed(2)}m × ${(obj.dimensions.height / 100).toFixed(2)}m`;

        content.appendChild(name);
        content.appendChild(details);

        // Order indicator
        const order = document.createElement('div');
        order.className = 'item-order';
        order.textContent = `#${index + 1}`;

        // Assemble
        item.appendChild(colorIndicator);
        item.appendChild(content);
        item.appendChild(order);

        // Add event listeners
        this.attachItemEventListeners(item);

        return item;
    }

    /**
     * Attach event listeners to a list item
     * @param {HTMLElement} item - List item element
     */
    attachItemEventListeners(item) {
        // Click to select (with Ctrl for multi-select)
        item.addEventListener('click', (e) => {
            const objectId = item.dataset.objectId;

            if (e.ctrlKey || e.metaKey) {
                // Ctrl+Click: toggle selection
                this.objectManager.toggleObjectSelection(objectId);
            } else {
                // Regular click: select only this object
                this.objectManager.selectObject(objectId);
            }

            this.eventBus.emit('object:selected', { objectId });
        });

        // Right-click context menu
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const objectId = item.dataset.objectId;
            console.log('Right-click on item, objectId from dataset:', objectId);
            console.log('Item element:', item);
            this.contextMenuObjectId = objectId;
            console.log('Set contextMenuObjectId to:', this.contextMenuObjectId);

            // If right-clicking on non-selected item, select it
            if (!this.objectManager.isSelected(objectId)) {
                this.objectManager.selectObject(objectId);
                this.eventBus.emit('object:selected', { objectId });
            }

            // Show appropriate context menu
            if (this.objectManager.getSelectedCount() > 1) {
                console.log('Showing batch menu');
                this.showBatchContextMenu(e.pageX, e.pageY);
            } else {
                console.log('Showing single item menu');
                this.showListContextMenu(e.pageX, e.pageY);
            }
            console.log('After showing menu, contextMenuObjectId is:', this.contextMenuObjectId);
        });

        // Drag and drop events
        item.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
        item.addEventListener('dragend', (e) => this.handleDragEnd(e, item));
        item.addEventListener('dragover', (e) => this.handleDragOver(e, item));
        item.addEventListener('dragleave', (e) => this.handleDragLeave(e, item));
        item.addEventListener('drop', (e) => this.handleDrop(e, item));
    }

    /**
     * Show list context menu
     */
    showListContextMenu(x, y) {
        this.hideContextMenus(false); // Don't clear objectId when switching menus
        this.listContextMenu.classList.add('active');

        // Position menu with viewport boundary detection
        const { adjustedX, adjustedY } = this.adjustMenuPosition(this.listContextMenu, x, y);
        this.listContextMenu.style.left = `${adjustedX}px`;
        this.listContextMenu.style.top = `${adjustedY}px`;
    }

    /**
     * Show batch context menu
     */
    showBatchContextMenu(x, y) {
        this.hideContextMenus(false); // Don't clear objectId when switching menus
        this.batchContextMenu.classList.add('active');

        // Position menu with viewport boundary detection
        const { adjustedX, adjustedY } = this.adjustMenuPosition(this.batchContextMenu, x, y);
        this.batchContextMenu.style.left = `${adjustedX}px`;
        this.batchContextMenu.style.top = `${adjustedY}px`;
    }

    /**
     * Adjust menu position to keep it within viewport bounds
     * @param {HTMLElement} menu - The menu element
     * @param {number} x - Desired x position
     * @param {number} y - Desired y position
     * @returns {Object} Adjusted x and y coordinates
     */
    adjustMenuPosition(menu, x, y) {
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        // Adjust horizontal position if menu would overflow right edge
        if (x + menuRect.width > viewportWidth) {
            adjustedX = viewportWidth - menuRect.width - 10; // 10px margin
        }

        // Adjust vertical position if menu would overflow bottom edge
        if (y + menuRect.height > viewportHeight) {
            adjustedY = viewportHeight - menuRect.height - 10; // 10px margin
        }

        // Ensure menu doesn't go off left edge
        if (adjustedX < 10) {
            adjustedX = 10;
        }

        // Ensure menu doesn't go off top edge
        if (adjustedY < 10) {
            adjustedY = 10;
        }

        return { adjustedX, adjustedY };
    }

    /**
     * Handle drag start
     */
    handleDragStart(e, item) {
        this.draggedItem = item;
        this.draggedObjectId = item.dataset.objectId;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e, item) {
        item.classList.remove('dragging');

        // Remove all drag-over classes
        const allItems = this.objectListContainer.querySelectorAll('.list-item');
        allItems.forEach(i => i.classList.remove('drag-over'));

        this.draggedItem = null;
        this.draggedObjectId = null;
    }

    /**
     * Handle drag over
     */
    handleDragOver(e, item) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        e.dataTransfer.dropEffect = 'move';

        if (item !== this.draggedItem) {
            item.classList.add('drag-over');
        }

        return false;
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(e, item) {
        item.classList.remove('drag-over');
    }

    /**
     * Handle drop
     */
    handleDrop(e, item) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        item.classList.remove('drag-over');

        if (this.draggedItem !== item) {
            const draggedObjectId = this.draggedObjectId;
            const targetObjectId = item.dataset.objectId;

            // Emit event for reordering
            this.eventBus.emit('list:reorder-objects', {
                draggedObjectId,
                targetObjectId
            });
        }

        return false;
    }

    /**
     * Update selection highlighting in the list
     */
    updateSelection() {
        const selectedIds = this.objectManager.selectedObjectIds;

        // Remove all selected classes
        const allItems = this.objectListContainer.querySelectorAll('.list-item');
        allItems.forEach(item => item.classList.remove('selected'));

        // Add selected class to selected items
        selectedIds.forEach(id => {
            const selectedItem = this.objectListContainer.querySelector(`[data-object-id="${id}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
                // Scroll first selected into view if needed
                if (id === selectedIds[0]) {
                    selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    }
}
