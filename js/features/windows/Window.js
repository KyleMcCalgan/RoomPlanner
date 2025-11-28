/**
 * Window - Data model for windows placed on room walls
 */
class Window {
    constructor(wall, position, width, height, heightFromFloor) {
        this.id = generateId();
        this.wall = wall; // "front", "back", "left", "right"
        this.position = position; // Position along the wall (cm)
        this.dimensions = {
            width: width,   // Width of window (cm)
            height: height  // Height of window (cm)
        };
        this.heightFromFloor = heightFromFloor; // Distance from floor to bottom of window (cm)
        this.visible = true;
    }

    /**
     * Update window position along the wall
     * @param {number} position - New position along wall (cm)
     */
    updatePosition(position) {
        this.position = position;
    }

    /**
     * Update window dimensions
     * @param {number} width - Width (cm)
     * @param {number} height - Height (cm)
     * @param {number} heightFromFloor - Height from floor (cm)
     */
    updateDimensions(width, height, heightFromFloor) {
        this.dimensions.width = width;
        this.dimensions.height = height;
        this.heightFromFloor = heightFromFloor;
    }

    /**
     * Update the wall this window is on
     * @param {string} wall - Wall name ("front", "back", "left", "right")
     */
    updateWall(wall) {
        this.wall = wall;
    }

    /**
     * Get the bounds of the window in 3D space based on the wall it's on
     * @param {Room} room - Room object for dimensions
     * @returns {Object} Bounds {x, y, z, width, height} or {y, z, depth, width, height}
     */
    getBounds(room) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        const pos = this.position;
        const hff = this.heightFromFloor;

        switch (this.wall) {
            case 'front': // Y = 0, along X axis
                return {
                    x: pos,
                    y: 0,
                    z: hff,
                    width: w,
                    height: h,
                    wall: 'front'
                };
            case 'back': // Y = room.length, along X axis
                return {
                    x: pos,
                    y: room.dimensions.length,
                    z: hff,
                    width: w,
                    height: h,
                    wall: 'back'
                };
            case 'left': // X = 0, along Y axis
                return {
                    x: 0,
                    y: pos,
                    z: hff,
                    width: w,
                    height: h,
                    wall: 'left'
                };
            case 'right': // X = room.width, along Y axis
                return {
                    x: room.dimensions.width,
                    y: pos,
                    z: hff,
                    width: w,
                    height: h,
                    wall: 'right'
                };
            default:
                return null;
        }
    }

    /**
     * Get window area
     * @returns {number} Area in cm²
     */
    getArea() {
        return this.dimensions.width * this.dimensions.height;
    }

    /**
     * Validate window placement within room bounds
     * @param {Room} room - Room object
     * @returns {boolean} True if window fits within wall
     */
    isValidPlacement(room) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        const pos = this.position;
        const hff = this.heightFromFloor;

        // Check if window fits within wall dimensions
        if (this.wall === 'front' || this.wall === 'back') {
            // Along X axis
            return pos >= 0 &&
                   pos + w <= room.dimensions.width &&
                   hff >= 0 &&
                   hff + h <= room.dimensions.height;
        } else if (this.wall === 'left' || this.wall === 'right') {
            // Along Y axis
            return pos >= 0 &&
                   pos + w <= room.dimensions.length &&
                   hff >= 0 &&
                   hff + h <= room.dimensions.height;
        }
        return false;
    }

    /**
     * Toggle visibility of this window
     */
    toggleVisibility() {
        this.visible = !this.visible;
    }

    /**
     * Check if a point (in wall-space) is within this window
     * @param {number} wallPos - Position along the wall
     * @param {number} wallHeight - Height on the wall
     * @returns {boolean} True if point is within window
     */
    containsPoint(wallPos, wallHeight) {
        return wallPos >= this.position &&
               wallPos <= this.position + this.dimensions.width &&
               wallHeight >= this.heightFromFloor &&
               wallHeight <= this.heightFromFloor + this.dimensions.height;
    }
}
