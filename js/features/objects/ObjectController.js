/**
 * ObjectController - Handles object interactions and placement logic
 */
class ObjectController {
    constructor(objectManager, roomController, viewport, eventBus, objectView, collisionService, room, viewManager) {
        this.objectManager = objectManager;
        this.roomController = roomController;
        this.viewport = viewport;
        this.eventBus = eventBus;
        this.objectView = objectView;
        this.collisionService = collisionService;
        this.room = room;
        this.viewManager = viewManager;

        this.state = {
            mode: 'READY', // READY, CREATING, EDITING
            pendingObject: null,
            isDragging: false,
            dragStartPos: null,
            dragObjectStartPos: null
        };

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const canvas = this.viewport.canvas;

        // Listen to object creation request
        this.eventBus.on('object:create-requested', (data) => this.handleCreateRequest(data));

        // Canvas mouse events
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Object edit/delete/toggle collision/duplicate
        this.eventBus.on('object:edit-requested', () => this.editSelectedObject());
        this.eventBus.on('object:update-requested', (data) => this.updateObject(data));
        this.eventBus.on('object:delete-requested', () => this.deleteSelectedObject());
        this.eventBus.on('object:toggle-collision-requested', () => this.toggleCollision());
        this.eventBus.on('object:duplicate-requested', () => this.duplicateSelectedObject());
    }

    /**
     * Handle object creation request
     * @param {Object} data - Object data
     */
    handleCreateRequest(data) {
        // Create object but don't add to manager yet
        const obj = new PlaceableObject(
            data.name,
            data.width,
            data.length,
            data.height,
            data.color
        );

        this.state.pendingObject = obj;
        this.state.mode = 'CREATING';
        this.objectView.updateModeIndicator('CREATING');

        // Trigger render to show preview
        this.eventBus.emit('render-requested');
    }

    /**
     * Handle canvas click
     * @param {MouseEvent} e - Mouse event
     */
    handleCanvasClick(e) {
        if (this.state.mode === 'CREATING') {
            this.placeObject(e);
        } else if (this.state.mode === 'READY' || this.state.mode === 'EDITING') {
            this.selectObject(e);
        }
    }

    /**
     * Place pending object
     * @param {MouseEvent} e - Mouse event
     */
    placeObject(e) {
        if (!this.state.pendingObject) return;

        // Only allow placement in top view
        const currentView = this.viewManager.getCurrentView();
        if (currentView !== 'TOP') {
            alert('Please switch to Top View (press 1) to place objects');
            return;
        }

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        // Set object X,Y position (Z will be calculated)
        this.state.pendingObject.move(roomPos.x, roomPos.y, 0);

        // Get all existing objects
        const allObjects = this.objectManager.getAllObjects();

        // Calculate appropriate Z position for stacking
        const stackingZ = this.collisionService.calculateStackingZ(
            this.state.pendingObject,
            allObjects,
            this.room
        );

        // Update Z position
        this.state.pendingObject.position.z = stackingZ;

        // Check for collisions (boundary and enabled collision objects)
        const collisionResult = this.collisionService.canPlace(
            this.state.pendingObject,
            allObjects,
            this.room
        );

        if (!collisionResult.canPlace) {
            if (collisionResult.reason === 'outside_room') {
                const cancel = confirm('Object cannot be placed outside the room boundaries.\n\nThis could be because:\n- The object extends beyond the room walls\n- Stacking would exceed the room ceiling height\n- The object is too large for the room\n\nPress OK to cancel placement, or Cancel to try another location.');
                if (cancel) {
                    this.cancelCreation();
                }
            } else if (collisionResult.reason === 'object_collision') {
                alert('Object collides with another object. Disable collision on the other object to stack, or press ESC to cancel placement.');
            }
            return;
        }

        // Add object to manager
        this.objectManager.addObject(this.state.pendingObject);
        this.objectManager.selectObject(this.state.pendingObject.id);

        // Emit event
        this.eventBus.emit('object:added', { object: this.state.pendingObject });

        // Reset state
        this.state.pendingObject = null;
        this.state.mode = 'EDITING';
        this.objectView.updateModeIndicator('EDITING');

        // Trigger render
        this.eventBus.emit('render-requested');
    }

    /**
     * Select object at click position
     * @param {MouseEvent} e - Mouse event
     */
    selectObject(e) {
        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
        const currentView = this.viewManager.getCurrentView();

        let obj = null;

        if (currentView === 'TOP') {
            // Top view: use X,Y coordinates
            obj = this.objectManager.findObjectAtPosition(roomPos.x, roomPos.y);
        } else {
            // Side views: need to check X/Y and Z based on view
            obj = this.findObjectAtSideViewPosition(roomPos.x, roomPos.y, currentView);
        }

        if (obj) {
            this.objectManager.selectObject(obj.id);
            this.state.mode = 'EDITING';
            this.eventBus.emit('object:selected', { object: obj });
        } else {
            this.objectManager.deselectObject();
            this.state.mode = 'READY';
            this.eventBus.emit('object:deselected');
        }

        this.objectView.updateModeIndicator(this.state.mode);
        this.eventBus.emit('render-requested');
    }

    /**
     * Find object at position in side view
     * @param {number} clickX - Click X in room coords
     * @param {number} clickY - Click Y in room coords
     * @param {string} view - Current view (FRONT, LEFT, RIGHT)
     * @returns {PlaceableObject|null} Found object or null
     */
    findObjectAtSideViewPosition(clickX, clickY, view) {
        const roomHeight = this.room.dimensions.height;
        const allObjects = this.objectManager.getAllObjects();

        // Convert click Y to Z coordinate (invert since ground is at bottom)
        const clickZ = roomHeight - clickY;

        for (const obj of allObjects) {
            let minX, maxX, minZ, maxZ;

            if (view === 'FRONT') {
                // Front view: X horizontal, Z vertical
                minX = obj.position.x;
                maxX = obj.position.x + obj.dimensions.width;
                minZ = obj.position.z;
                maxZ = obj.position.z + obj.dimensions.height;

                if (clickX >= minX && clickX <= maxX && clickZ >= minZ && clickZ <= maxZ) {
                    return obj;
                }
            } else if (view === 'LEFT') {
                // Left view: Y horizontal, Z vertical
                minX = obj.position.y;
                maxX = obj.position.y + obj.dimensions.length;
                minZ = obj.position.z;
                maxZ = obj.position.z + obj.dimensions.height;

                if (clickX >= minX && clickX <= maxX && clickZ >= minZ && clickZ <= maxZ) {
                    return obj;
                }
            } else if (view === 'RIGHT') {
                // Right view: Y horizontal but REVERSED, Z vertical
                const roomLength = this.room.dimensions.length;
                minX = roomLength - obj.position.y - obj.dimensions.length;
                maxX = roomLength - obj.position.y;
                minZ = obj.position.z;
                maxZ = obj.position.z + obj.dimensions.height;

                if (clickX >= minX && clickX <= maxX && clickZ >= minZ && clickZ <= maxZ) {
                    return obj;
                }
            }
        }

        return null;
    }

    /**
     * Handle mouse down (start drag)
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
        if (this.state.mode !== 'EDITING') return;

        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        // Only allow dragging in top view
        const currentView = this.viewManager.getCurrentView();
        if (currentView !== 'TOP') return;

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        // Check if clicking on selected object
        if (selectedObj.isAt(roomPos.x, roomPos.y)) {
            this.state.isDragging = true;
            this.state.dragStartPos = roomPos;
            this.state.dragObjectStartPos = { ...selectedObj.position };
        }
    }

    /**
     * Handle mouse move (dragging)
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        if (this.state.mode === 'CREATING' && this.state.pendingObject) {
            // Show preview during creation
            this.eventBus.emit('render-requested', { mouseEvent: e });
        } else if (this.state.isDragging) {
            // Handle dragging
            const mousePos = this.viewport.getMousePos(e);
            const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

            const dx = roomPos.x - this.state.dragStartPos.x;
            const dy = roomPos.y - this.state.dragStartPos.y;

            const selectedObj = this.objectManager.getSelectedObject();
            if (selectedObj) {
                const newX = this.state.dragObjectStartPos.x + dx;
                const newY = this.state.dragObjectStartPos.y + dy;

                // Temporarily move to new X,Y position
                selectedObj.move(newX, newY, selectedObj.position.z);

                // Recalculate Z position based on what's underneath
                const allObjects = this.objectManager.getAllObjects();
                const stackingZ = this.collisionService.calculateStackingZ(
                    selectedObj,
                    allObjects,
                    this.room
                );

                // Update Z position
                selectedObj.position.z = stackingZ;

                // Check if position is valid
                const collisionResult = this.collisionService.canPlace(
                    selectedObj,
                    allObjects,
                    this.room
                );

                if (!collisionResult.canPlace) {
                    // Snap back to original position if invalid
                    selectedObj.move(
                        this.state.dragObjectStartPos.x,
                        this.state.dragObjectStartPos.y,
                        this.state.dragObjectStartPos.z
                    );
                } else {
                    // Update drag start position for smooth dragging
                    this.state.dragObjectStartPos.x = newX;
                    this.state.dragObjectStartPos.y = newY;
                    this.state.dragObjectStartPos.z = stackingZ;
                    this.state.dragStartPos = roomPos;

                    this.eventBus.emit('object:moved', { object: selectedObj });
                }

                this.eventBus.emit('render-requested');
            }
        }
    }

    /**
     * Handle mouse up (end drag)
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
        if (this.state.isDragging) {
            // Final collision check
            const selectedObj = this.objectManager.getSelectedObject();
            if (selectedObj) {
                const allObjects = this.objectManager.getAllObjects();
                const collisionResult = this.collisionService.canPlace(
                    selectedObj,
                    allObjects,
                    this.room
                );

                if (!collisionResult.canPlace) {
                    // Snap back to original position
                    selectedObj.move(
                        this.state.dragObjectStartPos.x,
                        this.state.dragObjectStartPos.y,
                        this.state.dragObjectStartPos.z
                    );
                } else {
                    // Object was successfully moved
                    // Recalculate all Z positions to handle:
                    // 1. Objects that were stacked on this one should fall
                    // 2. This object should correctly stack on anything beneath it
                    this.recalculateAllZPositions();
                }

                this.eventBus.emit('render-requested');
            }

            this.state.isDragging = false;
            this.state.dragStartPos = null;
            this.state.dragObjectStartPos = null;
        }
    }

    /**
     * Handle context menu (right-click)
     * @param {MouseEvent} e - Mouse event
     */
    handleContextMenu(e) {
        e.preventDefault();

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
        const currentView = this.viewManager.getCurrentView();

        let obj = null;

        if (currentView === 'TOP') {
            obj = this.objectManager.findObjectAtPosition(roomPos.x, roomPos.y);
        } else {
            obj = this.findObjectAtSideViewPosition(roomPos.x, roomPos.y, currentView);
        }

        if (obj) {
            this.objectManager.selectObject(obj.id);
            this.state.mode = 'EDITING';
            this.objectView.showContextMenu(e.clientX, e.clientY, obj);
            this.eventBus.emit('render-requested');
        }
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Rotation (R key)
        if (e.key === 'r' || e.key === 'R') {
            this.rotateSelectedObject();
        }

        // Delete (Delete or Backspace key)
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Only delete if not in an input field
            if (document.activeElement.tagName !== 'INPUT') {
                this.deleteSelectedObject();
            }
        }

        // Deselect (Escape key)
        if (e.key === 'Escape') {
            if (this.state.mode === 'CREATING') {
                this.cancelCreation();
            } else {
                this.objectManager.deselectObject();
                this.state.mode = 'READY';
                this.objectView.updateModeIndicator('READY');
                this.eventBus.emit('render-requested');
            }
        }
    }

    /**
     * Rotate selected object by 90 degrees
     */
    rotateSelectedObject() {
        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        // Store original state in case we need to rollback
        const originalRotation = selectedObj.rotation;
        const originalWidth = selectedObj.dimensions.width;
        const originalLength = selectedObj.dimensions.length;

        // Apply rotation (this swaps dimensions)
        const newRotation = (selectedObj.rotation + 90) % 360;
        selectedObj.rotate(newRotation);

        // Check if the rotated object fits within room and doesn't collide
        const allObjects = this.objectManager.getAllObjects();
        const collisionResult = this.collisionService.canPlace(
            selectedObj,
            allObjects,
            this.room
        );

        if (!collisionResult.canPlace) {
            // Rollback rotation
            selectedObj.rotation = originalRotation;
            selectedObj.dimensions.width = originalWidth;
            selectedObj.dimensions.length = originalLength;

            // Show alert to user
            if (collisionResult.reason === 'outside_room') {
                alert('Cannot rotate: object would extend outside room boundaries');
            } else if (collisionResult.reason === 'object_collision') {
                alert('Cannot rotate: object would collide with another object');
            }

            this.eventBus.emit('render-requested');
            return;
        }

        // Recalculate Z positions after rotation since the object's footprint changed
        // This ensures proper stacking if rotation affects overlaps
        this.recalculateAllZPositions();

        this.eventBus.emit('object:rotated', { object: selectedObj });
        this.eventBus.emit('render-requested');
    }

    /**
     * Delete selected object
     */
    deleteSelectedObject() {
        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        // Remove the object
        this.objectManager.removeObject(selectedObj.id);

        // Recalculate Z positions for all remaining objects
        // This ensures objects that were stacked above the deleted object fall to the correct height
        // Important: We need to recalculate from bottom to top to ensure correct stacking
        this.recalculateAllZPositions();

        this.state.mode = 'READY';
        this.objectView.updateModeIndicator('READY');

        this.eventBus.emit('object:deleted', { objectId: selectedObj.id });
        this.eventBus.emit('render-requested');
    }

    /**
     * Toggle collision for selected object
     */
    toggleCollision() {
        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        selectedObj.toggleCollision();

        // Recalculate Z positions after toggling collision
        // Disabling collision allows stacking, enabling it prevents it
        this.recalculateAllZPositions();

        this.eventBus.emit('object:collision-toggled', { object: selectedObj });
        this.eventBus.emit('render-requested');
    }

    /**
     * Duplicate selected object
     */
    duplicateSelectedObject() {
        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        // Create a duplicate with the same properties
        const duplicate = new PlaceableObject(
            selectedObj.name + ' (copy)',
            selectedObj.dimensions.width,
            selectedObj.dimensions.length,
            selectedObj.dimensions.height,
            selectedObj.color
        );

        // Copy collision setting
        duplicate.collisionEnabled = selectedObj.collisionEnabled;

        // Enter CREATING mode with the duplicate
        this.state.pendingObject = duplicate;
        this.state.mode = 'CREATING';
        this.objectView.updateModeIndicator('CREATING');

        // Deselect the original object
        this.objectManager.deselectObject();

        // Trigger render to show preview
        this.eventBus.emit('render-requested');
    }

    /**
     * Edit selected object
     */
    editSelectedObject() {
        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        // Show edit modal with object data
        this.objectView.showEditModal(selectedObj);
    }

    /**
     * Update object with new data
     * @param {Object} data - Updated object data
     */
    updateObject(data) {
        const obj = this.objectManager.getObject(data.id);
        if (!obj) {
            console.error('Object not found:', data.id);
            return;
        }

        // Store original position for rollback if needed
        const originalPosition = { ...obj.position };
        const originalDimensions = { ...obj.dimensions };

        // Update object properties
        obj.name = data.name;
        obj.dimensions.width = data.width;
        obj.dimensions.length = data.length;
        obj.dimensions.height = data.height;
        obj.color = data.color;
        obj.position.x = data.posX;
        obj.position.y = data.posY;
        obj.position.z = data.posZ;
        obj.collisionEnabled = data.collisionEnabled;

        // Check if new configuration is valid
        const allObjects = this.objectManager.getAllObjects();
        const collisionResult = this.collisionService.canPlace(
            obj,
            allObjects,
            this.room
        );

        if (!collisionResult.canPlace) {
            // Rollback changes
            obj.position = originalPosition;
            obj.dimensions = originalDimensions;

            if (collisionResult.reason === 'outside_room') {
                alert('Object cannot be placed outside the room boundaries with the given dimensions or position');
            } else if (collisionResult.reason === 'object_collision') {
                alert('Object would collide with another object. Enable "Disable Collision" or adjust dimensions/position.');
            }

            // Re-show edit modal so user can adjust
            this.objectView.showEditModal(obj);
            return;
        }

        // Recalculate Z positions after update since dimensions/position/collision may have changed
        // This ensures proper stacking after edits
        this.recalculateAllZPositions();

        // Emit update event
        this.eventBus.emit('object:updated', { object: obj });
        this.eventBus.emit('render-requested');
    }

    /**
     * Cancel object creation
     */
    cancelCreation() {
        this.state.pendingObject = null;
        this.state.mode = 'READY';
        this.objectView.updateModeIndicator('READY');
        this.eventBus.emit('render-requested');
    }

    /**
     * Get current pending object for preview rendering
     * @returns {PlaceableObject|null}
     */
    getPendingObject() {
        return this.state.pendingObject;
    }

    /**
     * Get current mode
     * @returns {string}
     */
    getMode() {
        return this.state.mode;
    }

    /**
     * Recalculate Z positions for all objects based on creation order
     * Objects created first are always at the bottom of the stack
     * This ensures consistent stacking hierarchy regardless of movement order
     */
    recalculateAllZPositions() {
        const allObjects = this.objectManager.getAllObjects();
        if (allObjects.length === 0) return;

        // Sort objects by creation order (earliest first = bottom of stack)
        const sortedObjects = [...allObjects].sort((a, b) => a.creationOrder - b.creationOrder);

        // Reset all Z positions to 0 first
        sortedObjects.forEach(obj => {
            obj.position.z = 0;
        });

        // Recalculate Z for each object in creation order
        // Each object ONLY stacks on objects created BEFORE it
        // This ensures earlier objects are always at the bottom
        sortedObjects.forEach((obj, index) => {
            // Only consider objects created before this one
            // This maintains creation order: earlier = lower in stack
            const objectsBelow = sortedObjects.slice(0, index);
            const newZ = this.collisionService.calculateStackingZ(obj, objectsBelow, this.room);
            obj.position.z = newZ;
        });
    }
}
