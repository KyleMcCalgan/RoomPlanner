/**
 * ObjectController - Handles object interactions and placement logic
 */
class ObjectController {
    constructor(objectManager, roomController, viewport, eventBus, objectView) {
        this.objectManager = objectManager;
        this.roomController = roomController;
        this.viewport = viewport;
        this.eventBus = eventBus;
        this.objectView = objectView;

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

        // Object edit/delete/toggle collision
        this.eventBus.on('object:delete-requested', () => this.deleteSelectedObject());
        this.eventBus.on('object:toggle-collision-requested', () => this.toggleCollision());
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

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        // Set object position
        this.state.pendingObject.move(roomPos.x, roomPos.y, 0);

        // Check if object fits in room
        const bounds = this.state.pendingObject.getBounds();
        if (!this.roomController.checkObjectFits(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height
        )) {
            alert('Object does not fit in the room at this position');
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

        const obj = this.objectManager.findObjectAtPosition(roomPos.x, roomPos.y);

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
     * Handle mouse down (start drag)
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
        if (this.state.mode !== 'EDITING') return;

        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

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

                selectedObj.move(newX, newY);

                this.eventBus.emit('object:moved', { object: selectedObj });
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

        const obj = this.objectManager.findObjectAtPosition(roomPos.x, roomPos.y);

        if (obj) {
            this.objectManager.selectObject(obj.id);
            this.state.mode = 'EDITING';
            this.objectView.showContextMenu(e.clientX, e.clientY);
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

        const newRotation = (selectedObj.rotation + 90) % 360;
        selectedObj.rotate(newRotation);

        this.eventBus.emit('object:rotated', { object: selectedObj });
        this.eventBus.emit('render-requested');
    }

    /**
     * Delete selected object
     */
    deleteSelectedObject() {
        const selectedObj = this.objectManager.getSelectedObject();
        if (!selectedObj) return;

        this.objectManager.removeObject(selectedObj.id);

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

        this.eventBus.emit('object:collision-toggled', { object: selectedObj });
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
}
