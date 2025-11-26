/**
 * PlaceableObject - Data model for objects that can be placed in the room
 */
class PlaceableObject {
    constructor(name, width, length, height, color) {
        this.id = generateId();
        this.name = name;
        this.dimensions = {
            width: width,   // X axis (cm)
            length: length, // Y axis (cm)
            height: height  // Z axis (cm)
        };
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        this.rotation = 0; // 0, 90, 180, 270 degrees
        this.color = color;
        this.collisionEnabled = true;
        this.creationOrder = 0;
    }

    /**
     * Move object to a new position
     * @param {number} x - X position (cm)
     * @param {number} y - Y position (cm)
     * @param {number} z - Z position (cm)
     */
    move(x, y, z = this.position.z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    /**
     * Rotate object
     * @param {number} degrees - Rotation in degrees (0, 90, 180, 270)
     */
    rotate(degrees) {
        this.rotation = degrees % 360;
    }

    /**
     * Check if object is at a given position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if object is at position
     */
    isAt(x, y) {
        const bounds = this.getBounds();
        return pointInRectangle(x, y, bounds);
    }

    /**
     * Get object bounds (accounting for rotation)
     * @returns {Object} Bounds {x, y, width, height}
     */
    getBounds() {
        const bounds = getRotatedBounds(
            this.position.x,
            this.position.y,
            this.dimensions.width,
            this.dimensions.length,
            this.rotation
        );
        return bounds;
    }

    /**
     * Get object area
     * @returns {number} Area in cm²
     */
    getArea() {
        return this.dimensions.width * this.dimensions.length;
    }

    /**
     * Get object volume
     * @returns {number} Volume in cm³
     */
    getVolume() {
        return this.dimensions.width * this.dimensions.length * this.dimensions.height;
    }

    /**
     * Update object dimensions
     * @param {number} width - Width (cm)
     * @param {number} length - Length (cm)
     * @param {number} height - Height (cm)
     */
    updateDimensions(width, length, height) {
        this.dimensions.width = width;
        this.dimensions.length = length;
        this.dimensions.height = height;
    }

    /**
     * Toggle collision detection for this object
     */
    toggleCollision() {
        this.collisionEnabled = !this.collisionEnabled;
    }
}
