/**
 * WindowController - Handles window interactions and placement logic
 */
class WindowController {
    constructor(windowManager, viewport, eventBus, windowView, collisionService, room, viewManager, windowRenderer = null) {
        this.windowManager = windowManager;
        this.viewport = viewport;
        this.eventBus = eventBus;
        this.windowView = windowView;
        this.collisionService = collisionService;
        this.room = room;
        this.viewManager = viewManager;
        this.windowRenderer = windowRenderer; // Will be set later

        this.state = {
            mode: 'READY', // READY, CREATING_WINDOW
            pendingWindow: null,
            isDragging: false,
            isResizing: false,
            resizeHandle: null, // Which handle is being dragged
            dragStartPos: null,
            dragWindowStartPos: null,
            dragOffset: null, // Offset from click to window position
            resizeStartDimensions: null // Original dimensions when resize started
        };

        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const canvas = this.viewport.canvas;

        // Listen to window creation request
        this.eventBus.on('window:create-requested', (data) => this.handleCreateRequest(data));

        // Canvas events for window placement and interaction
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // Window edit/delete/duplicate
        this.eventBus.on('window:edit-requested', () => this.editSelectedWindow());
        this.eventBus.on('window:update-requested', (data) => this.updateWindow(data));
        this.eventBus.on('window:duplicate-requested', () => this.duplicateSelectedWindow());
        this.eventBus.on('window:delete-requested', () => this.deleteSelectedWindow());

        // View change - update button state
        this.eventBus.on('view:changed', (data) => {
            this.windowView.updateButtonState(data.view);
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * Handle window creation request
     * @param {Object} data - Window data
     */
    handleCreateRequest(data) {
        const currentView = this.viewManager.getCurrentView();

        // Windows can only be placed in side views
        if (currentView === 'TOP') {
            // Silently ignore - button should be disabled in TOP view anyway
            return;
        }

        // Determine wall based on current view
        const wall = this.getWallFromView(currentView);

        // Create window but don't add to manager yet
        // Position will be set when user clicks on canvas
        const window = new Window(
            wall,
            0, // Position will be set on click
            data.width,
            data.height,
            data.heightFromFloor
        );

        this.state.pendingWindow = window;
        this.state.mode = 'CREATING_WINDOW';

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
        if (this.state.mode === 'CREATING_WINDOW') {
            this.placeWindow(e);
        } else if (this.state.mode === 'READY') {
            this.selectWindow(e);
        }
    }

    /**
     * Place pending window
     * @param {MouseEvent} e - Mouse event
     */
    placeWindow(e) {
        if (!this.state.pendingWindow) return;

        const currentView = this.viewManager.getCurrentView();
        if (currentView === 'TOP') {
            // Silently ignore - windows can't be placed in top view
            return;
        }

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        // Calculate position along the wall and height from floor based on view
        const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

        // Update window position
        this.state.pendingWindow.position = wallPosition;
        this.state.pendingWindow.heightFromFloor = heightFromFloor;

        // Check for collisions with other windows and doors
        const allWindows = this.windowManager.getAllWindows();
        const allDoors = this.room.doors || [];

        const collisionResult = this.collisionService.canPlaceWindow(
            this.state.pendingWindow,
            allWindows,
            allDoors,
            this.room
        );

        if (!collisionResult.canPlace) {
            // Silently prevent placement - collision detection active
            return;
        }

        // Add window to manager and room
        this.windowManager.addWindow(this.state.pendingWindow);
        this.room.addWindow(this.state.pendingWindow);
        this.windowManager.selectWindow(this.state.pendingWindow.id);

        // Emit event
        this.eventBus.emit('window:added', { window: this.state.pendingWindow });

        // Reset state
        this.state.pendingWindow = null;
        this.state.mode = 'READY';

        // Trigger render
        this.eventBus.emit('render-requested');
    }

    /**
     * Calculate window position from click coordinates based on view
     * @param {Object} roomPos - Room coordinates {x, y}
     * @param {string} view - Current view
     * @returns {Object} {wallPosition, heightFromFloor}
     */
    getWindowPositionFromClick(roomPos, view) {
        let wallPosition = 0;
        let heightFromFloor = 0;

        switch (view) {
            case 'FRONT': // X-Z plane (front wall at Y=0)
                wallPosition = roomPos.x;
                heightFromFloor = roomPos.y; // In side views, Y represents Z (height)
                break;
            case 'LEFT': // Y-Z plane (left wall at X=0)
                wallPosition = roomPos.x; // X represents Y (along wall)
                heightFromFloor = roomPos.y; // Y represents Z (height)
                break;
            case 'RIGHT': // Y-Z plane (right wall at X=width)
                wallPosition = roomPos.x; // X represents Y (along wall)
                heightFromFloor = roomPos.y; // Y represents Z (height)
                break;
        }

        return { wallPosition, heightFromFloor };
    }

    /**
     * Select window at click position
     * @param {MouseEvent} e - Mouse event
     */
    selectWindow(e) {
        const currentView = this.viewManager.getCurrentView();
        if (currentView === 'TOP') {
            // Windows not visible in top view
            // Deselect any selected window when clicking in top view
            if (this.windowManager.getSelectedWindow()) {
                this.windowManager.deselectWindow();
                this.viewport.canvas.style.cursor = 'default';
                this.eventBus.emit('window:deselected');
                this.eventBus.emit('render-requested');
            }
            return;
        }

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        const wall = this.getWallFromView(currentView);
        const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

        const window = this.windowManager.findWindowAtPosition(wall, wallPosition, heightFromFloor);

        if (window) {
            this.windowManager.selectWindow(window.id);
            this.eventBus.emit('window:selected', { windowId: window.id });
            this.eventBus.emit('render-requested');
        } else {
            // Clicked on empty space - deselect window
            if (this.windowManager.getSelectedWindow()) {
                this.windowManager.deselectWindow();
                this.viewport.canvas.style.cursor = 'default';
                this.eventBus.emit('window:deselected');
                this.eventBus.emit('render-requested');
            }
        }
    }

    /**
     * Handle mouse down - start dragging or resizing window
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
        if (e.button !== 0) return; // Only left click

        const currentView = this.viewManager.getCurrentView();
        if (currentView === 'TOP') return; // Can't drag windows in top view

        const selectedWindow = this.windowManager.getSelectedWindow();
        if (!selectedWindow) return;

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        // Check if clicking on a resize handle first
        let handle = null;
        if (this.windowRenderer) {
            handle = this.windowRenderer.getHandleAtPosition(selectedWindow, currentView, mousePos.x, mousePos.y);
        }

        if (handle) {
            // Start resizing
            this.state.isResizing = true;
            this.state.resizeHandle = handle;
            this.state.dragStartPos = roomPos;
            this.state.resizeStartDimensions = {
                position: selectedWindow.position,
                width: selectedWindow.dimensions.width,
                height: selectedWindow.dimensions.height,
                heightFromFloor: selectedWindow.heightFromFloor
            };
            e.preventDefault();
        } else {
            // Check if clicking on the selected window for dragging
            const wall = this.getWallFromView(currentView);
            const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

            if (selectedWindow.containsPoint(wallPosition, heightFromFloor)) {
                this.state.isDragging = true;
                this.state.dragStartPos = roomPos;
                this.state.dragWindowStartPos = {
                    position: selectedWindow.position,
                    heightFromFloor: selectedWindow.heightFromFloor
                };
                // Calculate offset from click position to window's top-left corner
                this.state.dragOffset = {
                    position: wallPosition - selectedWindow.position,
                    heightFromFloor: heightFromFloor - selectedWindow.heightFromFloor
                };
                e.preventDefault();
            }
        }
    }

    /**
     * Handle mouse move - drag or resize window
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        if (!this.state.isDragging && !this.state.isResizing) {
            // Update cursor based on hover
            this.updateCursor(e);

            // Show preview for pending window
            if (this.state.pendingWindow) {
                this.updatePendingWindowPreview(e);
            }
            return;
        }

        const selectedWindow = this.windowManager.getSelectedWindow();
        if (!selectedWindow) return;

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
        const currentView = this.viewManager.getCurrentView();

        if (this.state.isResizing) {
            // Handle resizing
            this.handleResize(roomPos, selectedWindow, currentView);
        } else if (this.state.isDragging) {
            // Handle dragging
            const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

            // Update window position using the drag offset to maintain relative position
            selectedWindow.position = wallPosition - this.state.dragOffset.position;
            selectedWindow.heightFromFloor = heightFromFloor - this.state.dragOffset.heightFromFloor;
        }

        // Trigger render
        this.eventBus.emit('render-requested');
    }

    /**
     * Handle window resize based on handle being dragged
     * @param {Object} roomPos - Current mouse position in room coordinates
     * @param {Window} window - Window being resized
     * @param {string} view - Current view
     */
    handleResize(roomPos, window, view) {
        const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, view);
        const handle = this.state.resizeHandle;
        const start = this.state.resizeStartDimensions;
        const startPos = this.state.dragStartPos;

        // Calculate deltas
        const deltaPos = wallPosition - startPos.x;
        const deltaHeight = heightFromFloor - startPos.y;

        // Apply resize based on handle
        switch (handle) {
            case 'left':
                // Resize left edge - change position and width
                window.position = start.position + deltaPos;
                window.dimensions.width = start.width - deltaPos;
                break;

            case 'right':
                // Resize right edge - change width only
                window.dimensions.width = start.width + deltaPos;
                break;

            case 'top':
                // Resize top edge - change heightFromFloor and height
                window.heightFromFloor = start.heightFromFloor + deltaHeight;
                window.dimensions.height = start.height - deltaHeight;
                break;

            case 'bottom':
                // Resize bottom edge - change height only
                window.dimensions.height = start.height + deltaHeight;
                break;

            case 'top-left':
                window.position = start.position + deltaPos;
                window.dimensions.width = start.width - deltaPos;
                window.heightFromFloor = start.heightFromFloor + deltaHeight;
                window.dimensions.height = start.height - deltaHeight;
                break;

            case 'top-right':
                window.dimensions.width = start.width + deltaPos;
                window.heightFromFloor = start.heightFromFloor + deltaHeight;
                window.dimensions.height = start.height - deltaHeight;
                break;

            case 'bottom-left':
                window.position = start.position + deltaPos;
                window.dimensions.width = start.width - deltaPos;
                window.dimensions.height = start.height + deltaHeight;
                break;

            case 'bottom-right':
                window.dimensions.width = start.width + deltaPos;
                window.dimensions.height = start.height + deltaHeight;
                break;
        }

        // Ensure minimum size
        const minSize = 10; // 10cm minimum
        if (window.dimensions.width < minSize) {
            window.dimensions.width = minSize;
        }
        if (window.dimensions.height < minSize) {
            window.dimensions.height = minSize;
        }
    }

    /**
     * Handle mouse up - finish dragging or resizing
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
        if (!this.state.isDragging && !this.state.isResizing) return;

        const selectedWindow = this.windowManager.getSelectedWindow();
        if (!selectedWindow) {
            this.state.isDragging = false;
            this.state.isResizing = false;
            return;
        }

        // Validate final position/dimensions
        const allWindows = this.windowManager.getAllWindows();
        const allDoors = this.room.doors || [];

        const collisionResult = this.collisionService.canPlaceWindow(
            selectedWindow,
            allWindows,
            allDoors,
            this.room
        );

        if (!collisionResult.canPlace) {
            // Revert to start position/dimensions - silently prevent invalid placement
            if (this.state.isResizing && this.state.resizeStartDimensions) {
                selectedWindow.position = this.state.resizeStartDimensions.position;
                selectedWindow.dimensions.width = this.state.resizeStartDimensions.width;
                selectedWindow.dimensions.height = this.state.resizeStartDimensions.height;
                selectedWindow.heightFromFloor = this.state.resizeStartDimensions.heightFromFloor;
            } else if (this.state.isDragging && this.state.dragWindowStartPos) {
                selectedWindow.position = this.state.dragWindowStartPos.position;
                selectedWindow.heightFromFloor = this.state.dragWindowStartPos.heightFromFloor;
            }
        } else {
            // Emit update event
            this.eventBus.emit('window:updated', { windowId: selectedWindow.id });
        }

        this.state.isDragging = false;
        this.state.isResizing = false;
        this.state.resizeHandle = null;
        this.state.dragStartPos = null;
        this.state.dragWindowStartPos = null;
        this.state.dragOffset = null;
        this.state.resizeStartDimensions = null;

        this.eventBus.emit('render-requested');
    }

    /**
     * Update pending window preview position
     * @param {MouseEvent} e - Mouse event
     */
    updatePendingWindowPreview(e) {
        if (!this.state.pendingWindow) return;

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
        const currentView = this.viewManager.getCurrentView();

        const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

        this.state.pendingWindow.position = wallPosition;
        this.state.pendingWindow.heightFromFloor = heightFromFloor;

        this.eventBus.emit('render-requested');
    }

    /**
     * Handle context menu (right-click)
     * @param {MouseEvent} e - Mouse event
     */
    handleContextMenu(e) {
        e.preventDefault();

        const currentView = this.viewManager.getCurrentView();
        if (currentView === 'TOP') return;

        const mousePos = this.viewport.getMousePos(e);
        const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);

        const wall = this.getWallFromView(currentView);
        const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

        const window = this.windowManager.findWindowAtPosition(wall, wallPosition, heightFromFloor);

        if (window) {
            this.windowManager.selectWindow(window.id);
            this.windowView.showContextMenu(e.clientX, e.clientY);
            this.eventBus.emit('render-requested');
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

        const selectedWindow = this.windowManager.getSelectedWindow();

        // Escape - cancel creation or deselect window
        if (e.key === 'Escape') {
            if (this.state.mode === 'CREATING_WINDOW') {
                this.cancelCreation();
            } else if (selectedWindow) {
                this.windowManager.deselectWindow();
                this.viewport.canvas.style.cursor = 'default';
                this.eventBus.emit('window:deselected');
                this.eventBus.emit('render-requested');
            }
            return;
        }

        // Only process shortcuts if a window is selected
        if (!selectedWindow) return;

        // D - Duplicate selected window
        if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.duplicateSelectedWindow();
            return;
        }

        // Delete/Backspace - Delete selected window
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            this.deleteSelectedWindow();
            return;
        }
    }

    /**
     * Cancel window creation
     */
    cancelCreation() {
        this.state.pendingWindow = null;
        this.state.mode = 'READY';
        this.eventBus.emit('render-requested');
    }

    /**
     * Edit selected window
     */
    editSelectedWindow() {
        const selectedWindow = this.windowManager.getSelectedWindow();
        if (selectedWindow) {
            this.windowView.showEditModal(selectedWindow.id);
        }
    }

    /**
     * Update window properties
     * @param {Object} data - Update data {windowId, updates}
     */
    updateWindow(data) {
        const window = this.windowManager.getWindow(data.windowId);
        if (!window) return;

        // Save original values in case we need to revert
        const originalValues = {
            width: window.dimensions.width,
            height: window.dimensions.height,
            heightFromFloor: window.heightFromFloor,
            position: window.position,
            wall: window.wall
        };

        // Update dimensions and position
        window.updateDimensions(data.updates.width, data.updates.height, data.updates.heightFromFloor);
        window.updatePosition(data.updates.position);
        window.updateWall(data.updates.wall);

        // Validate new position
        const allWindows = this.windowManager.getAllWindows();
        const allDoors = this.room.doors || [];

        const collisionResult = this.collisionService.canPlaceWindow(
            window,
            allWindows,
            allDoors,
            this.room
        );

        if (!collisionResult.canPlace) {
            // Revert to original values - collision detected
            window.updateDimensions(originalValues.width, originalValues.height, originalValues.heightFromFloor);
            window.updatePosition(originalValues.position);
            window.updateWall(originalValues.wall);
            return;
        }

        this.eventBus.emit('window:updated', { windowId: window.id });
        this.eventBus.emit('render-requested');
    }

    /**
     * Duplicate selected window
     */
    duplicateSelectedWindow() {
        const selectedWindow = this.windowManager.getSelectedWindow();
        if (!selectedWindow) return;

        // Create a copy of the window
        const duplicate = new Window(
            selectedWindow.wall,
            selectedWindow.position,
            selectedWindow.dimensions.width,
            selectedWindow.dimensions.height,
            selectedWindow.heightFromFloor
        );

        // Offset the position slightly so it's visible
        duplicate.position = selectedWindow.position + 10; // 10cm offset

        // Enter placement mode with the duplicate
        this.state.pendingWindow = duplicate;
        this.state.mode = 'CREATING_WINDOW';

        // Deselect the original
        this.windowManager.deselectWindow();

        // Trigger render to show preview
        this.eventBus.emit('render-requested');
    }

    /**
     * Delete selected window
     */
    deleteSelectedWindow() {
        const selectedWindow = this.windowManager.getSelectedWindow();
        if (!selectedWindow) return;

        // Remove from room
        const index = this.room.windows.findIndex(w => w.id === selectedWindow.id);
        if (index > -1) {
            this.room.windows.splice(index, 1);
        }

        // Remove from manager
        this.windowManager.removeWindow(selectedWindow.id);

        this.eventBus.emit('window:deleted', { windowId: selectedWindow.id });
        this.eventBus.emit('render-requested');
    }

    /**
     * Update cursor based on what's under the mouse
     * @param {MouseEvent} e - Mouse event
     */
    updateCursor(e) {
        const currentView = this.viewManager.getCurrentView();
        if (currentView === 'TOP') {
            this.viewport.canvas.style.cursor = 'default';
            return;
        }

        const selectedWindow = this.windowManager.getSelectedWindow();
        if (!selectedWindow) {
            this.viewport.canvas.style.cursor = 'default';
            return;
        }

        const mousePos = this.viewport.getMousePos(e);

        // Check if hovering over a resize handle
        let handle = null;
        if (this.windowRenderer) {
            handle = this.windowRenderer.getHandleAtPosition(selectedWindow, currentView, mousePos.x, mousePos.y);
        }

        if (handle) {
            // Set cursor based on handle
            const cursors = {
                'top-left': 'nwse-resize',
                'top': 'ns-resize',
                'top-right': 'nesw-resize',
                'right': 'ew-resize',
                'bottom-right': 'nwse-resize',
                'bottom': 'ns-resize',
                'bottom-left': 'nesw-resize',
                'left': 'ew-resize'
            };
            this.viewport.canvas.style.cursor = cursors[handle] || 'default';
        } else {
            // Check if over window body
            const roomPos = this.viewport.toRoomCoords(mousePos.x, mousePos.y);
            const { wallPosition, heightFromFloor } = this.getWindowPositionFromClick(roomPos, currentView);

            if (selectedWindow.containsPoint(wallPosition, heightFromFloor)) {
                this.viewport.canvas.style.cursor = 'move';
            } else {
                this.viewport.canvas.style.cursor = 'default';
            }
        }
    }

    /**
     * Get pending window (for rendering preview)
     * @returns {Window|null} Pending window or null
     */
    getPendingWindow() {
        return this.state.pendingWindow;
    }
}
