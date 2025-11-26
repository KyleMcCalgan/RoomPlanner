/**
 * ObjectManager - Manages object state and CRUD operations
 */
class ObjectManager {
    constructor() {
        this.objects = [];
        this.selectedObjectId = null;
        this.creationCounter = 0;
    }

    /**
     * Add an object
     * @param {PlaceableObject} object - Object to add
     */
    addObject(object) {
        object.creationOrder = this.creationCounter++;
        this.objects.push(object);
    }

    /**
     * Remove an object by ID
     * @param {string} id - Object ID
     * @returns {boolean} True if removed
     */
    removeObject(id) {
        const index = this.objects.findIndex(obj => obj.id === id);
        if (index > -1) {
            this.objects.splice(index, 1);
            if (this.selectedObjectId === id) {
                this.selectedObjectId = null;
            }
            return true;
        }
        return false;
    }

    /**
     * Get object by ID
     * @param {string} id - Object ID
     * @returns {PlaceableObject|null} Object or null if not found
     */
    getObject(id) {
        return this.objects.find(obj => obj.id === id) || null;
    }

    /**
     * Get all objects
     * @returns {Array<PlaceableObject>} All objects
     */
    getAllObjects() {
        return [...this.objects];
    }

    /**
     * Get objects sorted by creation order
     * @returns {Array<PlaceableObject>} Sorted objects
     */
    getObjectsByCreationOrder() {
        return [...this.objects].sort((a, b) => a.creationOrder - b.creationOrder);
    }

    /**
     * Select an object
     * @param {string} id - Object ID
     */
    selectObject(id) {
        this.selectedObjectId = id;
    }

    /**
     * Deselect current object
     */
    deselectObject() {
        this.selectedObjectId = null;
    }

    /**
     * Get selected object
     * @returns {PlaceableObject|null} Selected object or null
     */
    getSelectedObject() {
        if (!this.selectedObjectId) return null;
        return this.getObject(this.selectedObjectId);
    }

    /**
     * Find object at position
     * @param {number} x - X coordinate (room space)
     * @param {number} y - Y coordinate (room space)
     * @returns {PlaceableObject|null} Object at position or null
     */
    findObjectAtPosition(x, y) {
        // Check from top to bottom (reverse creation order for correct z-ordering)
        const sortedObjects = this.getObjectsByCreationOrder().reverse();
        return sortedObjects.find(obj => obj.isAt(x, y)) || null;
    }

    /**
     * Get total count of objects
     * @returns {number} Object count
     */
    getCount() {
        return this.objects.length;
    }

    /**
     * Clear all objects
     */
    clearAll() {
        this.objects = [];
        this.selectedObjectId = null;
        this.creationCounter = 0;
    }
}
