/**
 * StatisticsService - Calculates statistics about room and object usage
 * Handles overlapping objects correctly using grid-based sampling
 */
class StatisticsService {
    constructor() {
        this.gridResolution = 10; // Grid cell size in cm (10cm = 0.1m)
    }

    /**
     * Calculate floor area
     * @param {Room} room - The room
     * @returns {number} Floor area in cm²
     */
    calculateFloorArea(room) {
        return room.getFloorArea();
    }

    /**
     * Calculate actual used floor area accounting for overlaps
     * @param {Array<PlaceableObject>} objects - All objects
     * @param {Room} room - The room
     * @returns {number} Used area in cm²
     */
    calculateUsedArea(objects, room) {
        if (objects.length === 0) return 0;

        const gridWidth = Math.ceil(room.dimensions.width / this.gridResolution);
        const gridHeight = Math.ceil(room.dimensions.length / this.gridResolution);

        // Create a grid to track coverage
        const grid = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(false));

        // Mark all grid cells covered by objects
        objects.forEach(obj => {
            this.markObjectCoverage(obj, grid, gridWidth, gridHeight);
        });

        // Count covered cells
        let coveredCells = 0;
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                if (grid[i][j]) coveredCells++;
            }
        }

        // Convert to area (each cell represents gridResolution x gridResolution cm²)
        return coveredCells * this.gridResolution * this.gridResolution;
    }

    /**
     * Mark grid cells covered by an object
     * @param {PlaceableObject} obj - Object to mark
     * @param {Array<Array<boolean>>} grid - Grid to mark
     * @param {number} gridWidth - Grid width
     * @param {number} gridHeight - Grid height
     */
    markObjectCoverage(obj, grid, gridWidth, gridHeight) {
        const bounds = obj.getBounds();

        // Get the range of grid cells this object could occupy
        const minGridX = Math.max(0, Math.floor(bounds.x / this.gridResolution));
        const maxGridX = Math.min(gridWidth - 1, Math.ceil((bounds.x + bounds.width) / this.gridResolution));
        const minGridY = Math.max(0, Math.floor(bounds.y / this.gridResolution));
        const maxGridY = Math.min(gridHeight - 1, Math.ceil((bounds.y + bounds.height) / this.gridResolution));

        // Check each grid cell in this range
        for (let i = minGridX; i <= maxGridX; i++) {
            for (let j = minGridY; j <= maxGridY; j++) {
                // Calculate center point of this grid cell
                const cellCenterX = i * this.gridResolution + this.gridResolution / 2;
                const cellCenterY = j * this.gridResolution + this.gridResolution / 2;

                // Check if this point is inside the object (accounting for rotation)
                if (this.isPointInRotatedRect(cellCenterX, cellCenterY, obj)) {
                    grid[i][j] = true;
                }
            }
        }
    }

    /**
     * Check if a point is inside a rotated rectangle
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {PlaceableObject} obj - Object to check
     * @returns {boolean} True if point is inside
     */
    isPointInRotatedRect(px, py, obj) {
        // Get object center
        const centerX = obj.position.x + obj.dimensions.width / 2;
        const centerY = obj.position.y + obj.dimensions.length / 2;

        // Translate point to object's local space
        const dx = px - centerX;
        const dy = py - centerY;

        // Rotate point back by negative rotation angle
        const angle = -obj.rotation * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Check if point is in unrotated rectangle
        return Math.abs(localX) <= obj.dimensions.width / 2 &&
               Math.abs(localY) <= obj.dimensions.length / 2;
    }

    /**
     * Calculate percentage of floor space used
     * @param {Array<PlaceableObject>} objects - All objects
     * @param {Room} room - The room
     * @returns {number} Percentage used (0-100)
     */
    calculatePercentageUsed(objects, room) {
        const floorArea = this.calculateFloorArea(room);
        if (floorArea === 0) return 0;

        const usedArea = this.calculateUsedArea(objects, room);
        return (usedArea / floorArea) * 100;
    }

    /**
     * Calculate total volume of all objects
     * @param {Array<PlaceableObject>} objects - All objects
     * @returns {number} Total volume in cm³
     */
    calculateTotalVolume(objects) {
        return objects.reduce((total, obj) => total + obj.getVolume(), 0);
    }

    /**
     * Get tallest object height
     * @param {Array<PlaceableObject>} objects - All objects
     * @returns {number} Height in cm
     */
    getTallestObject(objects) {
        if (objects.length === 0) return 0;
        return Math.max(...objects.map(obj => obj.dimensions.height));
    }

    /**
     * Calculate remaining height in room
     * @param {Array<PlaceableObject>} objects - All objects
     * @param {Room} room - The room
     * @returns {number} Remaining height in cm
     */
    calculateRemainingHeight(objects, room) {
        const tallest = this.getTallestObject(objects);
        return room.dimensions.height - tallest;
    }
}
