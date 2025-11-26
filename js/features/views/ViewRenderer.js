/**
 * ViewRenderer - Orchestrates rendering based on current view
 */
class ViewRenderer {
    constructor(viewManager, roomRenderer, objectRenderer) {
        this.viewManager = viewManager;
        this.roomRenderer = roomRenderer;
        this.objectRenderer = objectRenderer;
    }

    /**
     * Render the current view
     */
    render() {
        const currentView = this.viewManager.getCurrentView();

        // Render room first
        this.roomRenderer.render(currentView);

        // Render objects
        this.objectRenderer.render(currentView);
    }
}
