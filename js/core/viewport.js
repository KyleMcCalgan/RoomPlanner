/**
 * Viewport - Manages canvas coordinate transformations and scaling
 */
class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Padding for rulers, margins, and direction indicators
        this.padding = {
            top: 30,
            right: 20,
            bottom: 80,  // Increased for bottom arrow indicator
            left: 120    // Increased for ruler + left arrow indicator
        };

        // Drawing area (excluding padding)
        this.drawWidth = this.width - this.padding.left - this.padding.right;
        this.drawHeight = this.height - this.padding.top - this.padding.bottom;

        // Scale factor (pixels per cm)
        this.scale = 1;
    }

    /**
     * Set scale based on room dimensions to fit in viewport
     * @param {number} roomWidth - Room width in cm
     * @param {number} roomLength - Room length in cm
     */
    setScale(roomWidth, roomLength) {
        const scaleX = this.drawWidth / roomWidth;
        const scaleY = this.drawHeight / roomLength;
        this.scale = Math.min(scaleX, scaleY) * 0.96; // Use more of the available space
    }

    /**
     * Convert room coordinates to canvas coordinates
     * @param {number} roomX - X in room space (cm)
     * @param {number} roomY - Y in room space (cm)
     * @returns {Object} Canvas coordinates {x, y}
     */
    toCanvasCoords(roomX, roomY) {
        return {
            x: this.padding.left + roomX * this.scale,
            y: this.padding.top + roomY * this.scale
        };
    }

    /**
     * Convert canvas coordinates to room coordinates
     * @param {number} canvasX - X in canvas space (pixels)
     * @param {number} canvasY - Y in canvas space (pixels)
     * @returns {Object} Room coordinates {x, y}
     */
    toRoomCoords(canvasX, canvasY) {
        return {
            x: (canvasX - this.padding.left) / this.scale,
            y: (canvasY - this.padding.top) / this.scale
        };
    }

    /**
     * Convert room dimension to canvas dimension
     * @param {number} roomDim - Dimension in cm
     * @returns {number} Dimension in pixels
     */
    toCanvasDim(roomDim) {
        return roomDim * this.scale;
    }

    /**
     * Clear the canvas
     */
    clear() {
        clearCanvas(this.ctx);
    }

    /**
     * Get the canvas context
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Get mouse position relative to canvas
     * @param {MouseEvent} event - Mouse event
     * @returns {Object} Canvas coordinates {x, y}
     */
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}
