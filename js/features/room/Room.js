/**
 * Room - Data model for the room/space
 */
class Room {
    constructor(width, length, height) {
        this.id = generateId();
        this.dimensions = {
            width: width,   // X axis (cm)
            length: length, // Y axis (cm)
            height: height  // Z axis (cm)
        };
        this.windows = [];
        this.doors = [];
    }

    /**
     * Update room dimensions
     * @param {number} width - Width in cm
     * @param {number} length - Length in cm
     * @param {number} height - Height in cm
     */
    updateDimensions(width, length, height) {
        this.dimensions.width = width;
        this.dimensions.length = length;
        this.dimensions.height = height;
    }

    /**
     * Check if a point is within room bounds
     * @param {number} x - X coordinate (cm)
     * @param {number} y - Y coordinate (cm)
     * @param {number} z - Z coordinate (cm)
     * @returns {boolean} True if point is in bounds
     */
    isPointInBounds(x, y, z = 0) {
        return (
            x >= 0 &&
            x <= this.dimensions.width &&
            y >= 0 &&
            y <= this.dimensions.length &&
            z >= 0 &&
            z <= this.dimensions.height
        );
    }

    /**
     * Get floor area
     * @returns {number} Area in cm²
     */
    getFloorArea() {
        return this.dimensions.width * this.dimensions.length;
    }

    /**
     * Get room volume
     * @returns {number} Volume in cm³
     */
    getVolume() {
        return this.dimensions.width * this.dimensions.length * this.dimensions.height;
    }

    /**
     * Add window to room
     * @param {Window} window - Window object
     */
    addWindow(window) {
        this.windows.push(window);
    }

    /**
     * Add door to room
     * @param {Door} door - Door object
     */
    addDoor(door) {
        this.doors.push(door);
    }
}
