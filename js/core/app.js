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

        // Initialize controllers
        this.roomController = new RoomController(this.room, this.eventBus, this.viewport);

        // Initialize views
        this.roomView = new RoomView(this.roomController, this.eventBus);
        this.objectView = new ObjectView(this.eventBus, this.objectManager);

        // Initialize renderers
        this.roomRenderer = new RoomRenderer(this.room, this.viewport);
        this.objectRenderer = new ObjectRenderer(this.objectManager, this.viewport, this.room);

        // Initialize services
        this.statisticsService = new StatisticsService();
        this.collisionService = new CollisionService();

        // Initialize view system
        this.viewManager = new ViewManager(this.eventBus);
        this.viewRenderer = new ViewRenderer(this.viewManager, this.roomRenderer, this.objectRenderer);

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

        // Setup event listeners
        this.setupEventListeners();

        // Setup UI
        this.setupUI();

        // Initial render
        this.render();

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
            this.render();
        });
        this.eventBus.on('object:deselected', () => {
            this.render();
        });
        this.eventBus.on('render-requested', (data) => {
            this.render(data ? data.mouseEvent : null);
        });
        this.eventBus.on('view:changed', () => {
            this.render();
        });
    }

    /**
     * Set up UI interactions
     */
    setupUI() {
        // Toggle side panel
        const toggleBtn = document.getElementById('togglePanelBtn');
        const sidePanel = document.getElementById('sidePanel');

        toggleBtn.addEventListener('click', () => {
            sidePanel.classList.toggle('collapsed');
        });

        // Export button (placeholder for now)
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => {
            alert('Export functionality will be implemented in Phase 9');
        });

        // Update initial statistics
        this.updateStatistics();
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

        // Use StatisticsService for accurate calculations (handles overlaps)
        const floorArea = this.statisticsService.calculateFloorArea(this.room);
        const percentageUsed = this.statisticsService.calculatePercentageUsed(objects, this.room);
        const totalVolume = this.statisticsService.calculateTotalVolume(objects);
        const tallestHeight = this.statisticsService.getTallestObject(objects);
        const remainingHeight = this.statisticsService.calculateRemainingHeight(objects, this.room);

        // Convert to meters for display
        const floorAreaM2 = floorArea / 10000; // cm² to m²
        const totalVolumeM3 = totalVolume / 1000000; // cm³ to m³
        const tallestHeightM = tallestHeight / 100; // cm to m
        const remainingHeightM = remainingHeight / 100; // cm to m

        // Update UI
        document.getElementById('statFloorSpace').textContent = `${formatNumber(floorAreaM2)} m²`;
        document.getElementById('statSpaceUsed').textContent = `${formatNumber(percentageUsed)}%`;
        document.getElementById('statObjectCount').textContent = objects.length;
        document.getElementById('statTotalVolume').textContent = `${formatNumber(totalVolumeM3)} m³`;
        document.getElementById('statTallestObject').textContent = `${formatNumber(tallestHeightM)} m`;
        document.getElementById('statRemainingHeight').textContent = `${formatNumber(remainingHeightM)} m`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SpacePlannerApp();
});
