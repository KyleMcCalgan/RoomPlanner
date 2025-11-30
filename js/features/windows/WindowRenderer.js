/**
 * WindowRenderer - Handles rendering windows on canvas
 */
class WindowRenderer {
    constructor(windowManager, room, viewport, windowController) {
        this.windowManager = windowManager;
        this.room = room;
        this.viewport = viewport;
        this.windowController = windowController;
    }

    /**
     * Render all windows
     * @param {string} view - Current view (TOP, FRONT, LEFT, RIGHT)
     */
    render(view = 'TOP') {
        const ctx = this.viewport.getContext();

        // In top view, show window positions as indicators on walls
        if (view === 'TOP') {
            this.renderTopViewIndicators(ctx);
            return;
        }

        const windows = this.windowManager.getAllWindows();
        const selectedWindow = this.windowManager.getSelectedWindow();
        const pendingWindow = this.windowController.getPendingWindow();

        // Render all placed windows
        for (const window of windows) {
            if (this.shouldRenderWindow(window, view)) {
                const isSelected = selectedWindow && selectedWindow.id === window.id;
                this.renderWindow(ctx, window, view, isSelected, false);
            }
        }

        // Render pending window (preview)
        if (pendingWindow && this.shouldRenderWindow(pendingWindow, view)) {
            this.renderWindow(ctx, pendingWindow, view, false, true);
        }
    }

    /**
     * Check if window should be rendered in current view
     * @param {Window} window - Window to check
     * @param {string} view - Current view
     * @returns {boolean} True if should render
     */
    shouldRenderWindow(window, view) {
        // Windows are only visible on their respective walls in side views
        switch (view) {
            case 'FRONT':
                return window.wall === 'front';
            case 'LEFT':
                // LEFT view means looking FROM left TOWARDS right - so we see the RIGHT wall
                return window.wall === 'right';
            case 'RIGHT':
                // RIGHT view means looking FROM right TOWARDS left - so we see the LEFT wall
                return window.wall === 'left';
            default:
                return false;
        }
    }

    /**
     * Render a single window
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Window} window - Window to render
     * @param {string} view - Current view
     * @param {boolean} isSelected - Whether window is selected
     * @param {boolean} isPending - Whether window is being placed (preview)
     */
    renderWindow(ctx, window, view, isSelected = false, isPending = false) {
        // Calculate window position on canvas
        const { x, y, width, height } = this.getWindowCanvasCoords(window, view);

        // Save context state
        ctx.save();

        // Clear the window area (remove grid, show canvas background)
        ctx.clearRect(x, y, width, height);

        // Draw window border (thin white line)
        ctx.strokeStyle = isPending ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF';
        ctx.lineWidth = isPending ? 1 : 2;
        ctx.strokeRect(x, y, width, height);

        // If selected, draw selection highlight and resize handles
        if (isSelected && !isPending) {
            ctx.strokeStyle = '#5B9BD5';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
            ctx.setLineDash([]);

            // Draw resize handles
            this.drawResizeHandles(ctx, x, y, width, height);
        }

        // If pending, add visual feedback
        if (isPending) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x, y, width, height);
        }

        // Restore context state
        ctx.restore();
    }

    /**
     * Draw resize handles for selected window
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Window x position
     * @param {number} y - Window y position
     * @param {number} width - Window width
     * @param {number} height - Window height
     */
    drawResizeHandles(ctx, x, y, width, height) {
        const handleSize = 8;
        const halfHandle = handleSize / 2;

        ctx.fillStyle = '#5B9BD5';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        // Define handle positions: [x, y, cursor]
        const handles = [
            [x - halfHandle, y - halfHandle], // Top-left
            [x + width / 2 - halfHandle, y - halfHandle], // Top-center
            [x + width - halfHandle, y - halfHandle], // Top-right
            [x + width - halfHandle, y + height / 2 - halfHandle], // Right-center
            [x + width - halfHandle, y + height - halfHandle], // Bottom-right
            [x + width / 2 - halfHandle, y + height - halfHandle], // Bottom-center
            [x - halfHandle, y + height - halfHandle], // Bottom-left
            [x - halfHandle, y + height / 2 - halfHandle] // Left-center
        ];

        // Draw each handle
        handles.forEach(([hx, hy]) => {
            ctx.fillRect(hx, hy, handleSize, handleSize);
            ctx.strokeRect(hx, hy, handleSize, handleSize);
        });
    }

    /**
     * Get window coordinates on canvas
     * @param {Window} window - Window object
     * @param {string} view - Current view
     * @returns {Object} {x, y, width, height} in canvas coordinates
     */
    getWindowCanvasCoords(window, view) {
        let roomX, roomY, roomWidth, roomHeight;

        switch (view) {
            case 'FRONT': // X-Z plane (front wall at Y=0)
                roomX = window.position;
                roomY = window.heightFromFloor;
                roomWidth = window.dimensions.width;
                roomHeight = window.dimensions.height;
                break;

            case 'LEFT': // Y-Z plane (left wall at X=0)
                roomX = window.position;
                roomY = window.heightFromFloor;
                roomWidth = window.dimensions.width;
                roomHeight = window.dimensions.height;
                break;

            case 'RIGHT': // Y-Z plane (right wall at X=width)
                roomX = window.position;
                roomY = window.heightFromFloor;
                roomWidth = window.dimensions.width;
                roomHeight = window.dimensions.height;
                break;

            default:
                return { x: 0, y: 0, width: 0, height: 0 };
        }

        // Convert to canvas coordinates
        const topLeft = this.viewport.toCanvasCoords(roomX, roomY);
        const bottomRight = this.viewport.toCanvasCoords(
            roomX + roomWidth,
            roomY + roomHeight
        );

        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    /**
     * Get resize handle at canvas position
     * @param {Window} window - Window object
     * @param {string} view - Current view
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     * @returns {string|null} Handle name or null
     */
    getHandleAtPosition(window, view, canvasX, canvasY) {
        const { x, y, width, height } = this.getWindowCanvasCoords(window, view);
        const handleSize = 8;
        const halfHandle = handleSize / 2;
        const tolerance = 4; // Extra pixels for easier clicking

        // Define handle positions with names
        const handles = [
            { name: 'top-left', x: x - halfHandle, y: y - halfHandle },
            { name: 'top', x: x + width / 2 - halfHandle, y: y - halfHandle },
            { name: 'top-right', x: x + width - halfHandle, y: y - halfHandle },
            { name: 'right', x: x + width - halfHandle, y: y + height / 2 - halfHandle },
            { name: 'bottom-right', x: x + width - halfHandle, y: y + height - halfHandle },
            { name: 'bottom', x: x + width / 2 - halfHandle, y: y + height - halfHandle },
            { name: 'bottom-left', x: x - halfHandle, y: y + height - halfHandle },
            { name: 'left', x: x - halfHandle, y: y + height / 2 - halfHandle }
        ];

        // Check each handle
        for (const handle of handles) {
            if (canvasX >= handle.x - tolerance &&
                canvasX <= handle.x + handleSize + tolerance &&
                canvasY >= handle.y - tolerance &&
                canvasY <= handle.y + handleSize + tolerance) {
                return handle.name;
            }
        }

        return null;
    }

    /**
     * Render window with label (for debugging/info)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Window} window - Window object
     * @param {string} view - Current view
     */
    renderWindowLabel(ctx, window, view) {
        const { x, y, width, height } = this.getWindowCanvasCoords(window, view);

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = `W`;
        ctx.fillText(label, x + width / 2, y + height / 2);

        ctx.restore();
    }

    /**
     * Render window position indicators in top view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderTopViewIndicators(ctx) {
        const windows = this.windowManager.getAllWindows();
        const selectedWindow = this.windowManager.getSelectedWindow();

        ctx.save();

        windows.forEach(window => {
            const isSelected = selectedWindow && selectedWindow.id === window.id;

            // Get the wall edge coordinates in top view
            const indicator = this.getTopViewIndicatorCoords(window);

            if (indicator) {
                // Draw indicator line on the wall
                ctx.strokeStyle = isSelected ? '#5B9BD5' : 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = isSelected ? 4 : 3;
                ctx.lineCap = 'butt';

                ctx.beginPath();
                ctx.moveTo(indicator.x1, indicator.y1);
                ctx.lineTo(indicator.x2, indicator.y2);
                ctx.stroke();

                // Draw small perpendicular marks at the ends to show it's a window
                if (isSelected) {
                    ctx.lineWidth = 2;
                    const perpLength = 5;

                    if (window.wall === 'front' || window.wall === 'back') {
                        // Horizontal wall - draw vertical marks
                        ctx.beginPath();
                        ctx.moveTo(indicator.x1, indicator.y1 - perpLength);
                        ctx.lineTo(indicator.x1, indicator.y1 + perpLength);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(indicator.x2, indicator.y2 - perpLength);
                        ctx.lineTo(indicator.x2, indicator.y2 + perpLength);
                        ctx.stroke();
                    } else {
                        // Vertical wall - draw horizontal marks
                        ctx.beginPath();
                        ctx.moveTo(indicator.x1 - perpLength, indicator.y1);
                        ctx.lineTo(indicator.x1 + perpLength, indicator.y1);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(indicator.x2 - perpLength, indicator.y2);
                        ctx.lineTo(indicator.x2 + perpLength, indicator.y2);
                        ctx.stroke();
                    }
                }
            }
        });

        ctx.restore();
    }

    /**
     * Get coordinates for window indicator in top view
     * @param {Window} window - Window object
     * @returns {Object|null} Coordinates {x1, y1, x2, y2} or null
     */
    getTopViewIndicatorCoords(window) {
        const roomWidth = this.room.dimensions.width;
        const roomLength = this.room.dimensions.length;

        const startPos = window.position;
        const endPos = window.position + window.dimensions.width;

        // Convert to canvas coordinates
        let start, end;

        switch (window.wall) {
            case 'front':
                // Front wall (top edge in top view - what you're looking at)
                start = this.viewport.toCanvasCoords(startPos, 0);
                end = this.viewport.toCanvasCoords(endPos, 0);
                return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };

            case 'back':
                // Back wall (bottom edge in top view - behind you)
                start = this.viewport.toCanvasCoords(startPos, roomLength);
                end = this.viewport.toCanvasCoords(endPos, roomLength);
                return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };

            case 'left':
                // Left wall (left edge in top view)
                start = this.viewport.toCanvasCoords(0, startPos);
                end = this.viewport.toCanvasCoords(0, endPos);
                return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };

            case 'right':
                // Right wall (right edge in top view)
                start = this.viewport.toCanvasCoords(roomWidth, startPos);
                end = this.viewport.toCanvasCoords(roomWidth, endPos);
                return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };

            default:
                return null;
        }
    }
}
