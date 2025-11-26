/**
 * RoomController - Manages room business logic and interactions
 */
class RoomController {
    constructor(room, eventBus, viewport) {
        this.room = room;
        this.eventBus = eventBus;
        this.viewport = viewport;

        // Set initial viewport scale based on room
        this.updateViewportScale();
    }

    /**
     * Update room dimensions
     * @param {number} width - Width in cm
     * @param {number} length - Length in cm
     * @param {number} height - Height in cm
     * @returns {boolean} True if update succeeded
     */
    updateRoomDimensions(width, length, height) {
        // Validate dimensions
        if (width < 100 || length < 100 || height < 100) {
            console.error('Room dimensions must be at least 100cm');
            return false;
        }

        if (width > 2000 || length > 2000 || height > 500) {
            console.error('Room dimensions exceed maximum allowed');
            return false;
        }

        // Update room
        this.room.updateDimensions(width, length, height);

        // Update viewport scale
        this.updateViewportScale();

        // Emit event
        this.eventBus.emit('room:updated', { room: this.room });

        return true;
    }

    /**
     * Update viewport scale based on room dimensions
     */
    updateViewportScale() {
        this.viewport.setScale(this.room.dimensions.width, this.room.dimensions.length);
    }

    /**
     * Get room dimensions
     * @returns {Object} Dimensions {width, length, height}
     */
    getDimensions() {
        return { ...this.room.dimensions };
    }

    /**
     * Check if an object fits in the room
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Object width
     * @param {number} height - Object height
     * @returns {boolean} True if object fits
     */
    checkObjectFits(x, y, width, height) {
        return (
            x >= 0 &&
            y >= 0 &&
            x + width <= this.room.dimensions.width &&
            y + height <= this.room.dimensions.length
        );
    }
}
