/**
 * ViewRenderer - Orchestrates rendering based on current view
 */
class ViewRenderer {
    constructor(viewManager, roomRenderer, objectRenderer, windowRenderer = null, doorRenderer = null) {
        this.viewManager = viewManager;
        this.roomRenderer = roomRenderer;
        this.objectRenderer = objectRenderer;
        this.windowRenderer = windowRenderer;
        this.doorRenderer = doorRenderer;
    }

    /**
     * Render the current view
     */
    render() {
        const currentView = this.viewManager.getCurrentView();

        // Render room first
        this.roomRenderer.render(currentView);

        // Render windows (after room, before objects so objects can overlap windows)
        if (this.windowRenderer) {
            this.windowRenderer.render(currentView);
        }

        // Render doors (after windows, before objects so objects can overlap doors)
        if (this.doorRenderer) {
            this.doorRenderer.render(currentView);
        }

        // Render objects
        this.objectRenderer.render(currentView);
    }
}
