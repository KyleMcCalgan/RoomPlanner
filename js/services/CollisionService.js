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
     * When an object overlaps with others that have collision disabled,
     * it should stack on top of the highest one
     * @param {PlaceableObject} object - Object to stack
     * @param {Array<PlaceableObject>} allObjects - All other objects
     * @param {Room} room - The room (unused, kept for compatibility)
     * @returns {number} Calculated Z position (in cm)
     */
    calculateStackingZ(object, allObjects, room) {
        const overlapping = this.findOverlappingObjects(object, allObjects);

        // Filter for objects with collision disabled (can stack on these)
        const stackableObjects = overlapping.filter(obj => !obj.collisionEnabled);

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
}
