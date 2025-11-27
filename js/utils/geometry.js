/**
 * Geometry - Mathematical utilities for spatial calculations
 */

/**
 * Check if two rectangles overlap (AABB collision detection)
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} True if rectangles overlap
 */
function rectanglesOverlap(rect1, rect2) {
    return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
    );
}

/**
 * Check if a point is inside a rectangle
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} True if point is inside rectangle
 */
function pointInRectangle(px, py, rect) {
    return (
        px >= rect.x &&
        px <= rect.x + rect.width &&
        py >= rect.y &&
        py <= rect.y + rect.height
    );
}

/**
 * Rotate a point around an origin
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} angle - Angle in degrees
 * @returns {Object} Rotated point {x, y}
 */
function rotatePoint(px, py, cx, cy, angle) {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const dx = px - cx;
    const dy = py - cy;

    return {
        x: cx + (dx * cos - dy * sin),
        y: cy + (dx * sin + dy * cos)
    };
}

/**
 * Get the bounds of a rotated rectangle
 * @param {number} x - Rectangle X
 * @param {number} y - Rectangle Y
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {number} rotation - Rotation in degrees (0, 90, 180, 270)
 * @returns {Object} Bounds {x, y, width, height}
 */
function getRotatedBounds(x, y, width, height, rotation) {
    // Note: PlaceableObject.rotate() already swaps dimensions when rotating
    // So we just return the bounds as-is, no additional swapping needed
    return { x, y, width, height };
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
