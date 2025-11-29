/**
 * Door - Data model for doors placed on room walls
 */
class Door {
    constructor(wall, position, width, height, swingDirection, hingePosition) {
        this.id = generateId();
        this.wall = wall; // "front", "back", "left", "right"
        this.position = position; // Position along the wall (cm)
        this.dimensions = {
            width: width,   // Width of door (cm)
            height: height  // Height of door (cm)
        };
        this.swingDirection = swingDirection; // "inward" (into room) or "outward" (out of room)
        this.hingePosition = hingePosition; // "left" or "right"
        this.visible = true;
        this.isBlocked = false; // True if swing arc is blocked by objects
    }

    /**
     * Update door position along the wall
     * @param {number} position - New position along wall (cm)
     */
    updatePosition(position) {
        this.position = position;
    }

    /**
     * Update door dimensions
     * @param {number} width - Width (cm)
     * @param {number} height - Height (cm)
     */
    updateDimensions(width, height) {
        this.dimensions.width = width;
        this.dimensions.height = height;
    }

    /**
     * Update the wall this door is on
     * @param {string} wall - Wall name ("front", "back", "left", "right")
     */
    updateWall(wall) {
        this.wall = wall;
    }

    /**
     * Update swing direction and hinge position
     * @param {string} swingDirection - "inward" or "outward"
     * @param {string} hingePosition - "left" or "right"
     */
    updateSwing(swingDirection, hingePosition) {
        this.swingDirection = swingDirection;
        this.hingePosition = hingePosition;
    }

    /**
     * Get the bounds of the door in 3D space based on the wall it's on
     * @param {Room} room - Room object for dimensions
     * @returns {Object} Bounds {x, y, z, width, height, wall}
     */
    getBounds(room) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        const pos = this.position;

        switch (this.wall) {
            case 'front': // Y = 0, along X axis
                return {
                    x: pos,
                    y: 0,
                    z: 0, // Doors start from floor
                    width: w,
                    height: h,
                    wall: 'front'
                };
            case 'back': // Y = room.length, along X axis
                return {
                    x: pos,
                    y: room.dimensions.length,
                    z: 0,
                    width: w,
                    height: h,
                    wall: 'back'
                };
            case 'left': // X = 0, along Y axis
                return {
                    x: 0,
                    y: pos,
                    z: 0,
                    width: w,
                    height: h,
                    wall: 'left'
                };
            case 'right': // X = room.width, along Y axis
                return {
                    x: room.dimensions.width,
                    y: pos,
                    z: 0,
                    width: w,
                    height: h,
                    wall: 'right'
                };
            default:
                return null;
        }
    }

    /**
     * Calculate swing arc for visualization in TOP view
     * Returns the arc parameters for drawing a 90-degree quarter circle
     * Only returns arc for inward-swinging doors
     * @param {Room} room - Room object for dimensions
     * @returns {Object|null} Arc parameters {centerX, centerY, radius, startAngle, endAngle} or null if outward swing
     */
    getSwingArc(room) {
        // No arc for outward-swinging doors
        if (this.swingDirection === 'outward') {
            return null;
        }

        const w = this.dimensions.width;
        const radius = w; // Arc radius equals door width
        let centerX, centerY, startAngle, endAngle;

        // Calculate arc center based on wall and hinge position
        switch (this.wall) {
            case 'front': // Y = 0, along X axis
                centerY = 0;
                if (this.hingePosition === 'left') {
                    // Hinge on left side of door
                    centerX = this.position;
                    startAngle = 0; // Pointing right
                    endAngle = Math.PI / 2; // 90 degrees, pointing down (into room)
                } else {
                    // Hinge on right side of door
                    centerX = this.position + w;
                    startAngle = Math.PI / 2; // Pointing down (into room)
                    endAngle = Math.PI; // 180 degrees, pointing left
                }
                break;

            case 'back': // Y = room.length, along X axis
                centerY = room.dimensions.length;
                if (this.hingePosition === 'left') {
                    // Hinge on left side of door (from outside view)
                    centerX = this.position;
                    startAngle = 3 * Math.PI / 2; // Pointing up (into room)
                    endAngle = 0; // 0 degrees, pointing right
                } else {
                    // Hinge on right side of door
                    centerX = this.position + w;
                    startAngle = Math.PI; // Pointing left
                    endAngle = 3 * Math.PI / 2; // 270 degrees, pointing up (into room)
                }
                break;

            case 'left': // X = 0, along Y axis
                centerX = 0;
                if (this.hingePosition === 'left') {
                    // Hinge on left side of door (from outside view)
                    centerY = this.position;
                    startAngle = 0; // Pointing right (into room)
                    endAngle = Math.PI / 2; // 90 degrees, pointing down
                } else {
                    // Hinge on right side of door
                    centerY = this.position + w;
                    startAngle = 3 * Math.PI / 2; // Pointing up
                    endAngle = 0; // 0 degrees, pointing right (into room)
                }
                break;

            case 'right': // X = room.width, along Y axis
                centerX = room.dimensions.width;
                if (this.hingePosition === 'left') {
                    // Hinge on left side of door (from outside view)
                    centerY = this.position;
                    startAngle = Math.PI / 2; // Pointing down
                    endAngle = Math.PI; // 180 degrees, pointing left (into room)
                } else {
                    // Hinge on right side of door
                    centerY = this.position + w;
                    startAngle = Math.PI; // Pointing left (into room)
                    endAngle = 3 * Math.PI / 2; // 270 degrees, pointing up
                }
                break;

            default:
                return null;
        }

        return {
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        };
    }

    /**
     * Get door area (for statistics)
     * @returns {number} Area in cm²
     */
    getArea() {
        return this.dimensions.width * this.dimensions.height;
    }

    /**
     * Validate door placement within room bounds
     * @param {Room} room - Room object
     * @returns {boolean} True if door fits within wall
     */
    isValidPlacement(room) {
        const w = this.dimensions.width;
        const h = this.dimensions.height;
        const pos = this.position;

        // Check if door fits within wall dimensions
        if (this.wall === 'front' || this.wall === 'back') {
            // Along X axis
            return pos >= 0 &&
                   pos + w <= room.dimensions.width &&
                   h <= room.dimensions.height;
        } else if (this.wall === 'left' || this.wall === 'right') {
            // Along Y axis
            return pos >= 0 &&
                   pos + w <= room.dimensions.length &&
                   h <= room.dimensions.height;
        }
        return false;
    }

    /**
     * Toggle visibility of this door
     */
    toggleVisibility() {
        this.visible = !this.visible;
    }

    /**
     * Set blocked status (when swing arc is blocked by objects)
     * @param {boolean} blocked - True if blocked
     */
    setBlocked(blocked) {
        this.isBlocked = blocked;
    }

    /**
     * Check if a point (in wall-space) is within this door
     * @param {number} wallPos - Position along the wall
     * @param {number} wallHeight - Height on the wall
     * @returns {boolean} True if point is within door
     */
    containsPoint(wallPos, wallHeight) {
        return wallPos >= this.position &&
               wallPos <= this.position + this.dimensions.width &&
               wallHeight >= 0 &&
               wallHeight <= this.dimensions.height;
    }

    /**
     * Check if a point (x, y) in TOP view is within the swing arc
     * Used for clearance detection
     * @param {number} x - X coordinate in room space
     * @param {number} y - Y coordinate in room space
     * @param {Room} room - Room object
     * @returns {boolean} True if point is within swing arc
     */
    isPointInSwingArc(x, y, room) {
        const arc = this.getSwingArc(room);
        if (!arc) return false; // No arc for outward doors

        // Calculate distance from arc center
        const dx = x - arc.centerX;
        const dy = y - arc.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if within radius
        if (distance > arc.radius) return false;

        // Calculate angle of the point
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI; // Normalize to 0-2π

        // Check if angle is within arc range
        let start = arc.startAngle;
        let end = arc.endAngle;

        // Handle wrap-around cases
        if (end < start) {
            return angle >= start || angle <= end;
        } else {
            return angle >= start && angle <= end;
        }
    }
}
