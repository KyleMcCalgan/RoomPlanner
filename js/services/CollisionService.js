/**
 * CollisionService - Handles collision detection for objects and room boundaries
 */
class CollisionService {
    /**
     * Check if an object is within room boundaries
     * @param {PlaceableObject} object - Object to check
     * @param {Room} room - The room
     * @returns {boolean} True if object is fully within room
     */
    checkBoundaryCollision(object, room) {
        const bounds = object.getBounds();

        // Check if any part of the object is outside room boundaries (X, Y)
        if (bounds.x < 0 || bounds.y < 0) {
            return true; // Collision with left or top boundary
        }

        if (bounds.x + bounds.width > room.dimensions.width ||
            bounds.y + bounds.height > room.dimensions.length) {
            return true; // Collision with right or bottom boundary
        }

        // Check if object is outside room boundaries (Z axis - height)
        if (object.position.z < 0) {
            return true; // Below ground
        }

        if (object.position.z + object.dimensions.height > room.dimensions.height) {
            return true; // Above ceiling
        }

        return false; // No collision
    }

    /**
     * Check if two objects collide with each other
     * @param {PlaceableObject} object1 - First object
     * @param {PlaceableObject} object2 - Second object
     * @returns {boolean} True if objects collide
     */
    checkObjectCollision(object1, object2) {
        // If either object has collision disabled, no collision
        if (!object1.collisionEnabled || !object2.collisionEnabled) {
            return false;
        }

        const bounds1 = object1.getBounds();
        const bounds2 = object2.getBounds();

        // AABB (Axis-Aligned Bounding Box) collision detection
        return rectanglesOverlap(bounds1, bounds2);
    }

    /**
     * Check if an object can be placed at its current position
     * @param {PlaceableObject} object - Object to check
     * @param {Array<PlaceableObject>} allObjects - All other objects
     * @param {Room} room - The room
     * @returns {Object} {canPlace: boolean, reason: string}
     */
    canPlace(object, allObjects, room) {
        // Check boundary collision
        if (this.checkBoundaryCollision(object, room)) {
            return { canPlace: false, reason: 'outside_room' };
        }

        // Check collision with other objects (only if collision is enabled)
        if (object.collisionEnabled) {
            for (const other of allObjects) {
                if (other.id !== object.id) {
                    if (this.checkObjectCollision(object, other)) {
                        return { canPlace: false, reason: 'object_collision' };
                    }
                }
            }
        }

        return { canPlace: true, reason: null };
    }

    /**
     * Get all objects that would collide with the given object
     * @param {PlaceableObject} object - Object to check
     * @param {Array<PlaceableObject>} allObjects - All other objects
     * @returns {Array<PlaceableObject>} Array of colliding objects
     */
    getCollidingObjects(object, allObjects) {
        const colliding = [];

        for (const other of allObjects) {
            if (other.id !== object.id && this.checkObjectCollision(object, other)) {
                colliding.push(other);
            }
        }

        return colliding;
    }

    /**
     * Find a valid position near the desired position
     * @param {PlaceableObject} object - Object to place
     * @param {number} desiredX - Desired X position
     * @param {number} desiredY - Desired Y position
     * @param {Array<PlaceableObject>} allObjects - All other objects
     * @param {Room} room - The room
     * @returns {Object|null} Valid position {x, y} or null if none found
     */
    findValidPosition(object, desiredX, desiredY, allObjects, room) {
        // Try the desired position first
        object.move(desiredX, desiredY);
        const result = this.canPlace(object, allObjects, room);
        if (result.canPlace) {
            return { x: desiredX, y: desiredY };
        }

        // Try positions in a spiral pattern around the desired position
        const maxAttempts = 20;
        const step = 10; // cm

        for (let i = 1; i <= maxAttempts; i++) {
            const offset = i * step;

            // Try 8 directions around the desired position
            const positions = [
                { x: desiredX + offset, y: desiredY },
                { x: desiredX - offset, y: desiredY },
                { x: desiredX, y: desiredY + offset },
                { x: desiredX, y: desiredY - offset },
                { x: desiredX + offset, y: desiredY + offset },
                { x: desiredX + offset, y: desiredY - offset },
                { x: desiredX - offset, y: desiredY + offset },
                { x: desiredX - offset, y: desiredY - offset }
            ];

            for (const pos of positions) {
                object.move(pos.x, pos.y);
                const result = this.canPlace(object, allObjects, room);
                if (result.canPlace) {
                    return pos;
                }
            }
        }

        // No valid position found
        return null;
    }

    /**
     * Get stacking order for objects (by creation order)
     * @param {Array<PlaceableObject>} objects - All objects
     * @returns {Array<PlaceableObject>} Objects sorted by creation order
     */
    getStackingOrder(objects) {
        return [...objects].sort((a, b) => a.creationOrder - b.creationOrder);
    }

    /**
     * Find all objects that overlap with the given object (ignoring collision settings)
     * @param {PlaceableObject} object - Object to check
     * @param {Array<PlaceableObject>} allObjects - All other objects
     * @returns {Array<PlaceableObject>} Array of overlapping objects
     */
    findOverlappingObjects(object, allObjects) {
        const overlapping = [];
        const bounds1 = object.getBounds();

        for (const other of allObjects) {
            if (other.id !== object.id) {
                const bounds2 = other.getBounds();
                if (rectanglesOverlap(bounds1, bounds2)) {
                    overlapping.push(other);
                }
            }
        }

        return overlapping;
    }

    /**
     * Calculate the appropriate Z position for stacking an object on others
     * Objects can stack when EITHER object has collision disabled
     * Creation order determines stacking: earlier objects are always below later objects
     * @param {PlaceableObject} object - Object to stack
     * @param {Array<PlaceableObject>} allObjects - All other objects (should only be earlier objects)
     * @param {Room} room - The room (unused, kept for compatibility)
     * @returns {number} Calculated Z position (in cm)
     */
    calculateStackingZ(object, allObjects, room) {
        const overlapping = this.findOverlappingObjects(object, allObjects);

        // Filter for objects where EITHER this object OR the other has collision disabled
        // This allows stacking when either party allows it
        const stackableObjects = overlapping.filter(obj =>
            !obj.collisionEnabled || !object.collisionEnabled
        );

        if (stackableObjects.length === 0) {
            return 0; // No objects to stack on, place on ground
        }

        // Find the highest top surface among overlapping objects
        let maxTopZ = 0;
        for (const obj of stackableObjects) {
            const topZ = obj.position.z + obj.dimensions.height;
            if (topZ > maxTopZ) {
                maxTopZ = topZ;
            }
        }

        // Return the calculated Z position
        // The boundary collision check will reject if this exceeds room height
        return maxTopZ;
    }

    /**
     * Check if two windows collide (overlap on the same wall)
     * @param {Window} window1 - First window
     * @param {Window} window2 - Second window
     * @returns {boolean} True if windows collide
     */
    checkWindowCollision(window1, window2) {
        // Windows can only collide if they're on the same wall
        if (window1.wall !== window2.wall) {
            return false;
        }

        // Check overlap along the wall
        const w1Start = window1.position;
        const w1End = window1.position + window1.dimensions.width;
        const w2Start = window2.position;
        const w2End = window2.position + window2.dimensions.width;

        // Check horizontal overlap
        const horizontalOverlap = !(w1End <= w2Start || w2End <= w1Start);

        // Check vertical overlap
        const w1Bottom = window1.heightFromFloor;
        const w1Top = window1.heightFromFloor + window1.dimensions.height;
        const w2Bottom = window2.heightFromFloor;
        const w2Top = window2.heightFromFloor + window2.dimensions.height;

        const verticalOverlap = !(w1Top <= w2Bottom || w2Top <= w1Bottom);

        return horizontalOverlap && verticalOverlap;
    }

    /**
     * Check if a window can be placed at its current position
     * @param {Window} window - Window to check
     * @param {Array<Window>} allWindows - All other windows
     * @param {Array<Door>} allDoors - All doors
     * @param {Room} room - The room
     * @returns {Object} {canPlace: boolean, reason: string}
     */
    canPlaceWindow(window, allWindows, allDoors, room) {
        // Check if window fits within room boundaries
        if (!window.isValidPlacement(room)) {
            return { canPlace: false, reason: 'outside_wall' };
        }

        // Check collision with other windows
        for (const other of allWindows) {
            if (other.id !== window.id) {
                if (this.checkWindowCollision(window, other)) {
                    return { canPlace: false, reason: 'window_collision' };
                }
            }
        }

        // Check collision with doors (if doors exist)
        if (allDoors) {
            for (const door of allDoors) {
                if (this.checkWindowDoorCollision(window, door)) {
                    return { canPlace: false, reason: 'door_collision' };
                }
            }
        }

        return { canPlace: true, reason: null };
    }

    /**
     * Check if a window and door collide (overlap on the same wall)
     * @param {Window} window - Window object
     * @param {Door} door - Door object
     * @returns {boolean} True if window and door collide
     */
    checkWindowDoorCollision(window, door) {
        // Can only collide if on the same wall
        if (window.wall !== door.wall) {
            return false;
        }

        // Check overlap along the wall
        const wStart = window.position;
        const wEnd = window.position + window.dimensions.width;
        const dStart = door.position;
        const dEnd = door.position + door.dimensions.width;

        // Check horizontal overlap
        const horizontalOverlap = !(wEnd <= dStart || dEnd <= wStart);

        // Check vertical overlap
        const wBottom = window.heightFromFloor;
        const wTop = window.heightFromFloor + window.dimensions.height;
        const dBottom = 0; // Doors typically start from floor
        const dTop = door.dimensions.height;

        const verticalOverlap = !(wTop <= dBottom || dTop <= wBottom);

        return horizontalOverlap && verticalOverlap;
    }

    /**
     * Get all windows that would collide with the given window
     * @param {Window} window - Window to check
     * @param {Array<Window>} allWindows - All other windows
     * @returns {Array<Window>} Array of colliding windows
     */
    getCollidingWindows(window, allWindows) {
        const colliding = [];

        for (const other of allWindows) {
            if (other.id !== window.id && this.checkWindowCollision(window, other)) {
                colliding.push(other);
            }
        }

        return colliding;
    }

    /**
     * Check if two doors collide (overlap on the same wall)
     * @param {Door} door1 - First door
     * @param {Door} door2 - Second door
     * @returns {boolean} True if doors collide
     */
    checkDoorCollision(door1, door2) {
        // Doors can only collide if they're on the same wall
        if (door1.wall !== door2.wall) {
            return false;
        }

        // Check overlap along the wall
        const d1Start = door1.position;
        const d1End = door1.position + door1.dimensions.width;
        const d2Start = door2.position;
        const d2End = door2.position + door2.dimensions.width;

        // Check horizontal overlap
        const horizontalOverlap = !(d1End <= d2Start || d2End <= d1Start);

        // Check vertical overlap
        const d1Bottom = 0; // Doors start from floor
        const d1Top = door1.dimensions.height;
        const d2Bottom = 0;
        const d2Top = door2.dimensions.height;

        const verticalOverlap = !(d1Top <= d2Bottom || d2Top <= d1Bottom);

        return horizontalOverlap && verticalOverlap;
    }

    /**
     * Check if a door can be placed at its current position
     * @param {Door} door - Door to check
     * @param {Array<Door>} allDoors - All other doors
     * @param {Array<Window>} allWindows - All windows
     * @param {Room} room - The room
     * @returns {Object} {canPlace: boolean, reason: string}
     */
    canPlaceDoor(door, allDoors, allWindows, room) {
        // Check if door fits within room boundaries
        if (!door.isValidPlacement(room)) {
            return { canPlace: false, reason: 'outside_wall' };
        }

        // Check collision with other doors
        for (const other of allDoors) {
            if (other.id !== door.id) {
                if (this.checkDoorCollision(door, other)) {
                    return { canPlace: false, reason: 'door_collision' };
                }
            }
        }

        // Check collision with windows
        if (allWindows) {
            for (const window of allWindows) {
                if (this.checkWindowDoorCollision(window, door)) {
                    return { canPlace: false, reason: 'window_collision' };
                }
            }
        }

        return { canPlace: true, reason: null };
    }

    /**
     * Check if a door's swing arc is blocked by any objects
     * @param {Door} door - Door to check
     * @param {Array<PlaceableObject>} allObjects - All objects in the room
     * @param {Room} room - The room
     * @returns {boolean} True if swing arc is blocked
     */
    checkDoorSwingArcCollision(door, allObjects, room) {
        // No collision check for outward-swinging doors (no arc drawn)
        if (door.swingDirection === 'outward') {
            return false;
        }

        const arc = door.getSwingArc(room);
        if (!arc) return false;

        // Doors are at floor level (Z=0) and extend up to door.dimensions.height
        const doorBottom = 0;
        const doorTop = door.dimensions.height;

        // Check if any object's footprint intersects with the swing arc
        for (const obj of allObjects) {
            // IMPORTANT: Only check objects that are actually at floor level
            // An object blocks the door if it overlaps with the door's height range
            const objBottom = obj.position.z;
            const objTop = obj.position.z + obj.dimensions.height;

            // Check if object overlaps with door height (both at floor level)
            const heightOverlap = objBottom < doorTop && objTop > doorBottom;

            // Skip this object if it's above the door (e.g., floating or on a shelf)
            if (!heightOverlap) {
                continue;
            }

            const bounds = obj.getBounds();

            // Sample points around the object's perimeter to check if they're in the arc
            // We'll check the 4 corners of the object
            const corners = [
                { x: bounds.x, y: bounds.y },
                { x: bounds.x + bounds.width, y: bounds.y },
                { x: bounds.x, y: bounds.y + bounds.height },
                { x: bounds.x + bounds.width, y: bounds.y + bounds.height }
            ];

            // Also check center point for better coverage
            corners.push({
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2
            });

            // If any corner is in the swing arc, the door is blocked
            for (const corner of corners) {
                if (door.isPointInSwingArc(corner.x, corner.y, room)) {
                    return true;
                }
            }

            // Also check if the arc passes through the object
            // by checking points along the object's edges
            const edgePoints = [];
            const steps = 4;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                // Top edge
                edgePoints.push({ x: bounds.x + bounds.width * t, y: bounds.y });
                // Bottom edge
                edgePoints.push({ x: bounds.x + bounds.width * t, y: bounds.y + bounds.height });
                // Left edge
                edgePoints.push({ x: bounds.x, y: bounds.y + bounds.height * t });
                // Right edge
                edgePoints.push({ x: bounds.x + bounds.width, y: bounds.y + bounds.height * t });
            }

            for (const point of edgePoints) {
                if (door.isPointInSwingArc(point.x, point.y, room)) {
                    return true;
                }
            }

            // REVERSE CHECK: Check if any point along the arc is inside the object
            // This catches cases where the arc sweeps through the object
            // Sample points along the arc
            const arcSamples = 20; // Sample 20 points along the arc
            for (let i = 0; i <= arcSamples; i++) {
                const t = i / arcSamples;
                const angle = arc.startAngle + (arc.endAngle - arc.startAngle) * t;

                // Handle wrap-around for angles
                let actualAngle = angle;
                if (arc.endAngle < arc.startAngle) {
                    // Wrap-around case
                    actualAngle = arc.startAngle + ((arc.endAngle + 2 * Math.PI) - arc.startAngle) * t;
                    if (actualAngle > 2 * Math.PI) actualAngle -= 2 * Math.PI;
                }

                // Calculate point on arc at this angle
                const arcX = arc.centerX + arc.radius * Math.cos(actualAngle);
                const arcY = arc.centerY + arc.radius * Math.sin(actualAngle);

                // Check if this arc point is inside the object's bounding box
                if (arcX >= bounds.x && arcX <= bounds.x + bounds.width &&
                    arcY >= bounds.y && arcY <= bounds.y + bounds.height) {
                    return true;
                }
            }

            // Also check points along the arc radius (from center to edge)
            // This catches objects placed near the door hinge
            const radiusSamples = 10;
            const angleSamples = 5;
            for (let a = 0; a <= angleSamples; a++) {
                const t1 = a / angleSamples;
                let angle = arc.startAngle + (arc.endAngle - arc.startAngle) * t1;

                if (arc.endAngle < arc.startAngle) {
                    angle = arc.startAngle + ((arc.endAngle + 2 * Math.PI) - arc.startAngle) * t1;
                    if (angle > 2 * Math.PI) angle -= 2 * Math.PI;
                }

                for (let r = 0; r <= radiusSamples; r++) {
                    const t2 = r / radiusSamples;
                    const radius = arc.radius * t2;
                    const arcX = arc.centerX + radius * Math.cos(angle);
                    const arcY = arc.centerY + radius * Math.sin(angle);

                    if (arcX >= bounds.x && arcX <= bounds.x + bounds.width &&
                        arcY >= bounds.y && arcY <= bounds.y + bounds.height) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Update blocked status for all doors based on object positions
     * @param {Array<Door>} allDoors - All doors
     * @param {Array<PlaceableObject>} allObjects - All objects
     * @param {Room} room - The room
     */
    updateDoorBlockedStatus(allDoors, allObjects, room) {
        for (const door of allDoors) {
            const isBlocked = this.checkDoorSwingArcCollision(door, allObjects, room);
            door.setBlocked(isBlocked);
        }
    }

    /**
     * Get all doors that are blocked by objects
     * @param {Array<Door>} allDoors - All doors
     * @param {Array<PlaceableObject>} allObjects - All objects
     * @param {Room} room - The room
     * @returns {Array<Door>} Array of blocked doors
     */
    getBlockedDoors(allDoors, allObjects, room) {
        const blocked = [];

        for (const door of allDoors) {
            if (this.checkDoorSwingArcCollision(door, allObjects, room)) {
                blocked.push(door);
            }
        }

        return blocked;
    }
}
