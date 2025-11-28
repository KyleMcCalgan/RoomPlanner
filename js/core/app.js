/**
 * SpacePlannerApp - Main application bootstrap and orchestration
 */
class SpacePlannerApp {
    constructor() {
        // Get canvas
        const canvas = document.getElementById('mainCanvas');

        // Initialize core systems
        this.eventBus = new EventBus();
        this.viewport = new Viewport(canvas);

        // Initialize room (default dimensions)
        this.room = new Room(200, 200, 200);

        // Initialize object manager
        this.objectManager = new ObjectManager();

        // Initialize window manager
        this.windowManager = new WindowManager();

        // Initialize controllers
        this.roomController = new RoomController(this.room, this.eventBus, this.viewport);

        // Initialize views
        this.roomView = new RoomView(this.roomController, this.eventBus);
        this.objectView = new ObjectView(this.eventBus, this.objectManager);
        this.objectListView = new ObjectListView(this.eventBus, this.objectManager);
        this.windowListView = new WindowListView(this.eventBus, this.windowManager);

        // Initialize renderers
        this.roomRenderer = new RoomRenderer(this.room, this.viewport);
        this.objectRenderer = new ObjectRenderer(this.objectManager, this.viewport, this.room);

        // Initialize services
        this.statisticsService = new StatisticsService();
        this.collisionService = new CollisionService();

        // Initialize view system
        this.viewManager = new ViewManager(this.eventBus);

        // Initialize window components
        this.windowView = new WindowView(this.eventBus, this.windowManager, this.room);
        this.windowRenderer = new WindowRenderer(this.windowManager, this.room, this.viewport, null); // windowController added later

        // Update view renderer to include window renderer
        this.viewRenderer = new ViewRenderer(this.viewManager, this.roomRenderer, this.objectRenderer, this.windowRenderer);

        // Initialize object controller (needs viewManager for click detection)
        this.objectController = new ObjectController(
            this.objectManager,
            this.roomController,
            this.viewport,
            this.eventBus,
            this.objectView,
            this.collisionService,
            this.room,
            this.viewManager
        );

        // Initialize window controller (needs viewManager for click detection)
        this.windowController = new WindowController(
            this.windowManager,
            this.viewport,
            this.eventBus,
            this.windowView,
            this.collisionService,
            this.room,
            this.viewManager,
            this.windowRenderer
        );

        // Update window renderer with controller reference
        this.windowRenderer.windowController = this.windowController;

        // Setup event listeners
        this.setupEventListeners();

        // Setup UI
        this.setupUI();

        // Set initial window button state based on current view
        this.windowView.updateButtonState(this.viewManager.getCurrentView());

        // Initial render
        this.render();

        // Initial window list render
        this.windowListView.render();

        console.log('Space Planner App initialized successfully!');
    }

    /**
     * Set up application-wide event listeners
     */
    setupEventListeners() {
        // Render events
        this.eventBus.on('room:updated', () => this.render());
        this.eventBus.on('object:added', () => {
            this.render();
            this.updateStatistics();
        });
        this.eventBus.on('object:moved', () => {
            this.updateStatistics();
        });
        this.eventBus.on('object:rotated', () => {
            this.updateStatistics();
        });
        this.eventBus.on('object:deleted', () => {
            this.render();
            this.updateStatistics();
        });
        this.eventBus.on('object:updated', () => {
            this.render();
            this.updateStatistics();
        });
        this.eventBus.on('object:collision-toggled', () => {
            this.render();
        });
        this.eventBus.on('object:selected', () => {
            // Deselect any selected window when an object is selected
            this.windowManager.deselectWindow();
            const count = this.objectManager.getSelectedCount();
            this.objectView.updateModeIndicator(count > 0 ? 'EDITING' : 'READY', count);
            this.render();
        });
        this.eventBus.on('object:deselected', () => {
            this.objectView.updateModeIndicator('READY', 0);
            this.render();
        });
        this.eventBus.on('render-requested', (data) => {
            this.render(data ? data.mouseEvent : null);
        });
        this.eventBus.on('view:changed', () => {
            this.render();
        });

        // Window events
        this.eventBus.on('window:added', () => {
            this.render();
            this.updateStatistics();
        });
        this.eventBus.on('window:updated', () => {
            this.render();
            this.updateStatistics();
        });
        this.eventBus.on('window:deleted', () => {
            this.render();
            this.updateStatistics();
        });
        this.eventBus.on('window:selected', () => {
            // Deselect all objects when a window is selected
            this.objectManager.deselectAll();
            this.render();
        });
        this.eventBus.on('window:deselected', () => {
            this.render();
        });

        // Deselect all objects (for when clicking on windows)
        this.eventBus.on('object:deselect-all', () => {
            this.objectManager.deselectAll();
            this.render();
        });

        // List view events
        this.eventBus.on('list:object-clicked', (data) => {
            // Deselect windows when selecting object
            this.windowManager.deselectWindow();
            // Select the object when clicked from list
            this.objectManager.selectObject(data.objectId);
            this.eventBus.emit('object:selected', { objectId: data.objectId });
        });

        this.eventBus.on('list:reorder-objects', (data) => {
            // Reorder objects and update stacking
            this.objectManager.reorderObjects(data.draggedObjectId, data.targetObjectId);
            this.objectController.recalculateAllZPositions();
            this.eventBus.emit('object:updated'); // Trigger list refresh
            this.render();
            this.updateStatistics();
        });

        // Visibility toggle events
        this.eventBus.on('object:toggle-visibility', (data) => {
            const obj = this.objectManager.getObject(data.objectId);
            if (obj) {
                obj.toggleVisibility();
                this.eventBus.emit('object:updated');
                this.render();
            }
        });

        // Batch operation events
        this.eventBus.on('batch:toggle-visibility', () => {
            const selectedObjects = this.objectManager.getSelectedObjects();
            selectedObjects.forEach(obj => obj.toggleVisibility());
            this.eventBus.emit('object:updated');
            this.render();
        });

        this.eventBus.on('batch:toggle-collision', () => {
            const selectedObjects = this.objectManager.getSelectedObjects();
            selectedObjects.forEach(obj => obj.toggleCollision());
            this.objectController.recalculateAllZPositions();
            this.eventBus.emit('object:updated');
            this.render();
        });

        this.eventBus.on('batch:delete', () => {
            const selectedIds = [...this.objectManager.selectedObjectIds]; // Copy array
            selectedIds.forEach(id => this.objectManager.removeObject(id));
            this.objectManager.deselectAll();
            this.objectController.recalculateAllZPositions();
            this.eventBus.emit('object:deleted');
            this.render();
            this.updateStatistics();
        });
    }

    /**
     * Set up UI interactions
     */
    setupUI() {
        // Toggle left side panel
        const toggleBtn = document.getElementById('togglePanelBtn');
        const sidePanel = document.getElementById('sidePanel');

        toggleBtn.addEventListener('click', () => {
            sidePanel.classList.toggle('collapsed');
        });

        // Toggle right panel
        const toggleRightBtn = document.getElementById('toggleRightPanelBtn');
        const rightPanel = document.getElementById('rightPanel');

        toggleRightBtn.addEventListener('click', () => {
            rightPanel.classList.toggle('collapsed');
        });

        // Help button
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeHelpBtn = document.getElementById('closeHelpBtn');

        helpBtn.addEventListener('click', () => {
            helpModal.classList.add('active');
        });

        closeHelpBtn.addEventListener('click', () => {
            helpModal.classList.remove('active');
        });

        // Close help modal on background click
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.remove('active');
            }
        });

        // Export button (placeholder for now)
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => {
            alert('Export functionality will be implemented in Phase 9');
        });

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Update initial statistics
        this.updateStatistics();
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Help modal
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                document.getElementById('helpModal').classList.add('active');
                return;
            }

            // Escape closes help modal and context menus
            if (e.key === 'Escape') {
                document.getElementById('helpModal').classList.remove('active');
                document.querySelectorAll('.context-menu').forEach(menu => {
                    menu.classList.remove('active');
                });
                return;
            }

            const selectedObjects = this.objectManager.getSelectedObjects();
            if (selectedObjects.length === 0) return;

            // D - Duplicate (only if not using Ctrl)
            if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if (selectedObjects.length === 1) {
                    this.eventBus.emit('object:duplicate-requested', { objectId: selectedObjects[0].id });
                }
                return;
            }

            // H - Hide/Show
            if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                selectedObjects.forEach(obj => obj.toggleVisibility());
                this.eventBus.emit('object:updated');
                this.render();
                return;
            }

            // C - Toggle Collision
            if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                selectedObjects.forEach(obj => obj.toggleCollision());
                this.objectController.recalculateAllZPositions();
                this.eventBus.emit('object:updated');
                this.render();
                return;
            }

            // A - Select All (works with or without Ctrl)
            if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.objectManager.selectAll();
                this.eventBus.emit('object:selected');
                return;
            }

            // E - Deselect All
            if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.objectManager.deselectAll();
                this.eventBus.emit('object:deselected');
                return;
            }
        });
    }

    /**
     * Main render method
     * @param {MouseEvent} mouseEvent - Optional mouse event for preview rendering
     */
    render(mouseEvent = null) {
        // Clear canvas
        this.viewport.clear();

        // Use ViewRenderer to render based on current view
        this.viewRenderer.render();

        // Render preview if in creating mode (top view only)
        if (mouseEvent && this.objectController.getMode() === 'CREATING' && this.viewManager.getCurrentView() === 'TOP') {
            const pendingObj = this.objectController.getPendingObject();
            if (pendingObj) {
                const mousePos = this.viewport.getMousePos(mouseEvent);
                this.objectRenderer.drawPreview({
                    width: pendingObj.dimensions.width,
                    length: pendingObj.dimensions.length,
                    color: pendingObj.color
                }, mousePos.x, mousePos.y);
            }
        }
    }

    /**
     * Update statistics panel
     */
    updateStatistics() {
        const objects = this.objectManager.getAllObjects();
        const windows = this.windowManager.getAllWindows();

        // Use StatisticsService for accurate calculations (handles overlaps)
        const floorArea = this.statisticsService.calculateFloorArea(this.room);
        const percentageUsed = this.statisticsService.calculatePercentageUsed(objects, this.room);
        const totalVolume = this.statisticsService.calculateTotalVolume(objects);
        const tallestHeight = this.statisticsService.getTallestObject(objects);
        const remainingHeight = this.statisticsService.calculateRemainingHeight(objects, this.room);

        // Window statistics
        const windowCount = windows.length;
        const totalWindowArea = this.windowManager.getTotalArea();

        // Convert to meters for display
        const floorAreaM2 = floorArea / 10000; // cm² to m²
        const totalVolumeM3 = totalVolume / 1000000; // cm³ to m³
        const tallestHeightM = tallestHeight / 100; // cm to m
        const remainingHeightM = remainingHeight / 100; // cm to m
        const windowAreaM2 = totalWindowArea / 10000; // cm² to m²

        // Update UI
        document.getElementById('statFloorSpace').textContent = `${formatNumber(floorAreaM2)} m²`;
        document.getElementById('statSpaceUsed').textContent = `${formatNumber(percentageUsed)}%`;
        document.getElementById('statObjectCount').textContent = objects.length;
        document.getElementById('statTotalVolume').textContent = `${formatNumber(totalVolumeM3)} m³`;
        document.getElementById('statTallestObject').textContent = `${formatNumber(tallestHeightM)} m`;
        document.getElementById('statRemainingHeight').textContent = `${formatNumber(remainingHeightM)} m`;
        document.getElementById('statWindowCount').textContent = windowCount;
        document.getElementById('statWindowArea').textContent = `${formatNumber(windowAreaM2)} m²`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SpacePlannerApp();
});
