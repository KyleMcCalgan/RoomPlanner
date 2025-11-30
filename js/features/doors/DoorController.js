/**
 * DoorController - Handles door interactions and placement logic
 */
class DoorController {
    constructor(doorManager, viewport, eventBus, doorView, collisionService, room, viewManager, windowManager, doorRenderer = null) {
        this.doorManager = doorManager;
        this.viewport = viewport;
        this.eventBus = eventBus;
        this.doorView = doorView;
        this.collisionService = collisionService;
        this.room = room;
        this.viewManager = viewManager;
        this.windowManager = windowManager;
        this.doorRenderer = doorRenderer; // Will be set later

        this.state = {
            mode: 'READY', // READY, CREATING_DOOR
            pendingDoor: null,
            isDragging: false,
            dragStartPos: null,
            dragDoorStartPos: null,
            dragOffset: null // Offset from click to door position
        };

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const canvas = this.viewport.canvas;

        // Listen to door creation request
        this.eventBus.on('door:create-requested', (data) => this.handleCreateRequest(data));

        // Canvas events for door placement and interaction
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // Door edit/delete/duplicate
        this.eventBus.on('door:edit-requested', () => this.editSelectedDoor());
        this.eventBus.on('door:update-requested', (data) => this.updateDoor(data));
        this.eventBus.on('door:duplicate-requested', () => this.duplicateSelectedDoor());
        this.eventBus.on('door:delete-requested', () => this.deleteSelectedDoor());

        // View change - update button state
        this.eventBus.on('view:changed', (data) => {
            this.doorView.updateButtonState(data.view);
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * Handle door creation request
     * @param {Object} data - Door data
     */
    handleCreateRequest(data) {
        const currentView = this.viewManager.getCurrentView();

        // Determine wall based on current view
        // In side views: use the current wall being viewed
        // In TOP view: will be determined when user clicks (defaults to 'front' for now)
        let wall = 'front'; // Default for TOP view
        if (currentView !== 'TOP') {
            wall = this.getWallFromView(currentView);
        }

        // Create door but don't add to manager yet
        // Position will be set when user clicks on canvas
        const door = new Door(
            wall,
            0, // Position will be set on click
            data.width,
            data.height,
            data.swingDirection,
            data.hingePosition
        );

        this.state.pendingDoor = door;
        this.state.mode = 'CREATING_DOOR';

        // Trigger render to show preview
        this.eventBus.emit('render-requested');
    }

    /**
     * Get wall name from current view
     * @param {string} view - Current view name
     * @returns {string} Wall name
     */
    getWallFromView(view) {
        switch (view) {
            case 'FRONT':
                return 'front';
            case 'LEFT':
                // LEFT view means looking FROM left TOWARDS right - so we see the RIGHT wall
                return 'right';
            case 'RIGHT':
                // RIGHT view means looking FROM right TOWARDS left - so we see the LEFT wall
                return 'left';
            default:
                return 'front';
        }
    }

    /**
     * Handle canvas click
     * @param {MouseEvent} e - Mouse event
     */
    handleCanvasClick(e) {
        const currentView = this.viewManager.getCurrentView();

        if (this.state.mode === 'CREATING_DOOR') {
            this.placeDoor(e);
        } else if (this.state.mode === 'READY') {
            // Select doors in all views including TOP view
            this.selectDoor(e);
        }
    }

    /**
     * Place pending door
     * @param {MouseEvent} e - Mouse event
     */
    placeDoor(e) {
        if (!this.state.pendingDoor) return;

        const currentView = this.viewManager.getCurrentView();
        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        // Calculate position along the wall based on view
        if (currentView === 'TOP') {
            // In TOP view: determine which wall to place on
            const wallInfo = this.getWallFromTopViewClick(roomPos);
            this.state.pendingDoor.updateWall(wallInfo.wall);
            this.state.pendingDoor.position = wallInfo.position;
        } else {
            // In side views: position along the current wall
            const { wallPosition } = this.getDoorPositionFromClick(roomPos, currentView);
            this.state.pendingDoor.position = wallPosition;
        }

        // Check for collisions with other doors and windows
        const allDoors = this.doorManager.getAllDoors();
        const allWindows = this.windowManager.getAllWindows();

        const validationResult = this.collisionService.canPlaceDoor(
            this.state.pendingDoor,
            allDoors,
            allWindows,
            this.room
        );

        if (!validationResult.canPlace) {
            // Silently prevent placement - don't show alert
            return;
        }

        // Save door ID before clearing state
        const doorId = this.state.pendingDoor.id;

        // Add door to manager
        this.doorManager.addDoor(this.state.pendingDoor);
        this.doorManager.selectDoor(doorId);

        // Clear state
        this.state.pendingDoor = null;
        this.state.mode = 'READY';

        // Emit events
        this.eventBus.emit('door:created', { doorId });
        this.eventBus.emit('render-requested');
        this.eventBus.emit('statistics:update-requested');
    }

    /**
     * Determine wall and position from TOP view click
     * @param {Object} roomPos - Room coordinates
     * @returns {Object} {wall, position}
     */
    getWallFromTopViewClick(roomPos) {
        const x = roomPos.x;
        const y = roomPos.y;
        const threshold = 50; // cm threshold for wall detection

        // Determine closest wall
        const distToFront = y;
        const distToBack = this.room.dimensions.length - y;
        const distToLeft = x;
        const distToRight = this.room.dimensions.width - x;

        const minDist = Math.min(distToFront, distToBack, distToLeft, distToRight);

        if (minDist === distToFront && distToFront < threshold) {
            return { wall: 'front', position: x };
        } else if (minDist === distToBack && distToBack < threshold) {
            return { wall: 'back', position: x };
        } else if (minDist === distToLeft && distToLeft < threshold) {
            return { wall: 'left', position: y };
        } else if (minDist === distToRight && distToRight < threshold) {
            return { wall: 'right', position: y };
        }

        // Default to front wall if not close to any wall
        return { wall: 'front', position: x };
    }

    /**
     * Get door position from click in side view
     * @param {Object} roomPos - Room coordinates
     * @param {string} view - Current view
     * @returns {Object} {wallPosition}
     */
    getDoorPositionFromClick(roomPos, view) {
        let wallPosition;

        switch (view) {
            case 'FRONT': // X-Z plane (front wall at Y=0)
                wallPosition = roomPos.x; // X is along the wall
                break;
            case 'BACK': // X-Z plane (back wall at Y=room.length)
                wallPosition = roomPos.x; // X is along the wall
                break;
            case 'LEFT': // Y-Z plane (left wall at X=0)
                wallPosition = roomPos.x; // In left view, X represents Y (along wall)
                break;
            case 'RIGHT': // Y-Z plane (right wall at X=room.width)
                wallPosition = roomPos.x; // In right view, X represents Y (along wall)
                break;
            default:
                wallPosition = 0;
        }

        return { wallPosition };
    }

    /**
     * Select door at click position
     * @param {MouseEvent} e - Mouse event
     */
    selectDoor(e) {
        const currentView = this.viewManager.getCurrentView();
        const mousePos = this.viewport.getMousePos(e);

        let door = null;

        if (currentView === 'TOP') {
            // In TOP view, find door by checking proximity to door lines
            door = this.findDoorInTopView(mousePos.x, mousePos.y);
        } else {
            // In side views, find door at the clicked position
            const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
            const wall = this.getWallFromView(currentView);
            const { wallPosition } = this.getDoorPositionFromClick(roomPos, currentView);

            // Doors always start from floor (height = 0)
            const wallHeight = roomPos.z || 0;

            door = this.doorManager.findDoorAtPosition(wall, wallPosition, wallHeight);
        }

        if (door) {
            this.doorManager.selectDoor(door.id);
            this.eventBus.emit('door:selected', { doorId: door.id });
            this.eventBus.emit('render-requested');
        } else {
            this.doorManager.deselectDoor();
            this.eventBus.emit('door:deselected');
            this.eventBus.emit('render-requested');
        }
    }

    /**
     * Find door in TOP view by checking if click is near any door line
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     * @returns {Door|null} Found door or null
     */
    findDoorInTopView(canvasX, canvasY) {
        const allDoors = this.doorManager.getAllDoors();

        for (const door of allDoors) {
            if (this.doorRenderer.isPointOnDoorTopView(door, canvasX, canvasY)) {
                return door;
            }
        }

        return null;
    }

    /**
     * Handle mouse down
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
        if (e.button !== 0) return; // Only left click

        const currentView = this.viewManager.getCurrentView();
        const selectedDoor = this.doorManager.getSelectedDoor();
        if (!selectedDoor) return;

        const mousePos = this.viewport.getMousePos(e);

        if (currentView === 'TOP') {
            // In TOP view, check if clicking on the selected door line
            if (this.doorRenderer.isPointOnDoorTopView(selectedDoor, mousePos.x, mousePos.y)) {
                this.state.isDragging = true;
                const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
                this.state.dragStartPos = roomPos;
                this.state.dragDoorStartPos = selectedDoor.position;
                this.state.dragDoorStartWall = selectedDoor.wall;
            }
        } else {
            // In side views, use the existing logic
            const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
            const wall = this.getWallFromView(currentView);
            const { wallPosition } = this.getDoorPositionFromClick(roomPos, currentView);

            // Check if clicking on selected door
            const wallHeight = roomPos.z || 0;
            if (selectedDoor.containsPoint(wallPosition, wallHeight)) {
                this.state.isDragging = true;
                this.state.dragStartPos = { wallPosition, wallHeight };
                this.state.dragDoorStartPos = selectedDoor.position;
                this.state.dragOffset = wallPosition - selectedDoor.position;
            }
        }
    }

    /**
     * Handle mouse move
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        const currentView = this.viewManager.getCurrentView();

        // Update pending door preview position
        if (this.state.mode === 'CREATING_DOOR' && this.state.pendingDoor) {
            const mousePos = this.viewport.getMousePos(e);
            const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

            if (currentView === 'TOP') {
                const wallInfo = this.getWallFromTopViewClick(roomPos);
                this.state.pendingDoor.updateWall(wallInfo.wall);
                this.state.pendingDoor.position = wallInfo.position;
            } else {
                const { wallPosition } = this.getDoorPositionFromClick(roomPos, currentView);
                this.state.pendingDoor.position = wallPosition;
            }

            this.eventBus.emit('render-requested');
            return;
        }

        // Handle dragging
        if (this.state.isDragging) {
            const selectedDoor = this.doorManager.getSelectedDoor();
            if (!selectedDoor) return;

            const mousePos = this.viewport.getMousePos(e);
            const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

            if (currentView === 'TOP') {
                // In TOP view: allow changing wall and position
                const wallInfo = this.getWallFromTopViewClick(roomPos);
                selectedDoor.updateWall(wallInfo.wall);
                selectedDoor.updatePosition(wallInfo.position);
            } else {
                // In side views: only move along the current wall
                const { wallPosition } = this.getDoorPositionFromClick(roomPos, currentView);

                // Calculate new position maintaining offset
                const newPosition = wallPosition - this.state.dragOffset;

                // Update door position
                selectedDoor.updatePosition(newPosition);
            }

            // Check for collisions
            const allDoors = this.doorManager.getAllDoors();
            const allWindows = this.windowManager.getAllWindows();

            const validationResult = this.collisionService.canPlaceDoor(
                selectedDoor,
                allDoors,
                allWindows,
                this.room
            );

            if (!validationResult.canPlace) {
                // Revert to start position and wall
                selectedDoor.updatePosition(this.state.dragDoorStartPos);
                if (currentView === 'TOP' && this.state.dragDoorStartWall) {
                    selectedDoor.updateWall(this.state.dragDoorStartWall);
                }
            }

            this.eventBus.emit('render-requested');
        }
    }

    /**
     * Handle mouse up
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
        if (this.state.isDragging) {
            this.state.isDragging = false;
            this.state.dragStartPos = null;
            this.state.dragDoorStartPos = null;
            this.state.dragOffset = null;

            this.eventBus.emit('door:moved');
            this.eventBus.emit('render-requested');
            this.eventBus.emit('statistics:update-requested');
        }
    }

    /**
     * Handle context menu
     * @param {MouseEvent} e - Mouse event
     */
    handleContextMenu(e) {
        e.preventDefault();

        const currentView = this.viewManager.getCurrentView();
        if (currentView === 'TOP') return; // No context menu in top view

        const selectedDoor = this.doorManager.getSelectedDoor();
        if (selectedDoor) {
            this.doorView.showContextMenu(e.clientX, e.clientY);
        }
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Ignore if typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        const selectedDoor = this.doorManager.getSelectedDoor();
        if (!selectedDoor) return;

        switch (e.key.toLowerCase()) {
            case 'delete':
            case 'backspace':
                e.preventDefault();
                this.deleteSelectedDoor();
                break;
            case 'd':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.duplicateSelectedDoor();
                }
                break;
            case 'escape':
                if (this.state.mode === 'CREATING_DOOR') {
                    this.state.mode = 'READY';
                    this.state.pendingDoor = null;
                    this.eventBus.emit('render-requested');
                } else {
                    this.doorManager.deselectDoor();
                    this.eventBus.emit('door:deselected');
                    this.eventBus.emit('render-requested');
                }
                break;
        }
    }

    /**
     * Edit selected door
     */
    editSelectedDoor() {
        const selectedDoor = this.doorManager.getSelectedDoor();
        if (selectedDoor) {
            this.doorView.showEditModal(selectedDoor.id);
        }
    }

    /**
     * Update door properties
     * @param {Object} data - Update data
     */
    updateDoor(data) {
        const door = this.doorManager.getDoor(data.doorId);
        if (!door) return;

        const updates = data.updates;

        // Update door properties
        door.updateWall(updates.wall);
        door.updateDimensions(updates.width, updates.height);
        door.updateSwing(updates.swingDirection, updates.hingePosition);
        door.updatePosition(updates.position);

        // Validate placement
        const allDoors = this.doorManager.getAllDoors();
        const allWindows = this.windowManager.getAllWindows();

        const validationResult = this.collisionService.canPlaceDoor(
            door,
            allDoors,
            allWindows,
            this.room
        );

        if (!validationResult.canPlace) {
            alert('Cannot update door: would overlap with another door or window');
            return;
        }

        this.eventBus.emit('door:updated', { doorId: door.id });
        this.eventBus.emit('render-requested');
        this.eventBus.emit('statistics:update-requested');
    }

    /**
     * Duplicate selected door
     */
    duplicateSelectedDoor() {
        const selectedDoor = this.doorManager.getSelectedDoor();
        if (!selectedDoor) return;

        // Create new door with same properties but offset position
        const newDoor = new Door(
            selectedDoor.wall,
            selectedDoor.position + selectedDoor.dimensions.width + 20, // Offset by width + 20cm
            selectedDoor.dimensions.width,
            selectedDoor.dimensions.height,
            selectedDoor.swingDirection,
            selectedDoor.hingePosition
        );

        // Check if can place
        const allDoors = this.doorManager.getAllDoors();
        const allWindows = this.windowManager.getAllWindows();

        const validationResult = this.collisionService.canPlaceDoor(
            newDoor,
            allDoors,
            allWindows,
            this.room
        );

        if (!validationResult.canPlace) {
            // Try without offset
            newDoor.position = selectedDoor.position;
            const retryResult = this.collisionService.canPlaceDoor(
                newDoor,
                allDoors,
                allWindows,
                this.room
            );

            if (!retryResult.canPlace) {
                alert('Cannot duplicate door: not enough space');
                return;
            }
        }

        this.doorManager.addDoor(newDoor);
        this.doorManager.selectDoor(newDoor.id);

        this.eventBus.emit('door:created', { doorId: newDoor.id });
        this.eventBus.emit('render-requested');
        this.eventBus.emit('statistics:update-requested');
    }

    /**
     * Delete selected door
     */
    deleteSelectedDoor() {
        const selectedDoor = this.doorManager.getSelectedDoor();
        if (!selectedDoor) return;

        this.doorManager.removeDoor(selectedDoor.id);

        this.eventBus.emit('door:deleted', { doorId: selectedDoor.id });
        this.eventBus.emit('render-requested');
        this.eventBus.emit('statistics:update-requested');
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    }

    /**
     * Set door renderer
     * @param {DoorRenderer} renderer - Door renderer instance
     */
    setRenderer(renderer) {
        this.doorRenderer = renderer;
    }
}
