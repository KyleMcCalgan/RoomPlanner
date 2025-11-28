/**
 * ObjectManager - Manages object state and CRUD operations
 */
class ObjectManager {
    constructor() {
        this.objects = [];
        this.selectedObjectIds = []; // Support multiple selection
        this.selectedObjectId = null; // Deprecated but kept for backwards compatibility
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
     * Select an object (single selection, clears previous)
     * @param {string} id - Object ID
     */
    selectObject(id) {
        this.selectedObjectIds = [id];
        this.selectedObjectId = id; // Maintain compatibility
    }

    /**
     * Toggle selection of an object (for multi-select)
     * @param {string} id - Object ID
     */
    toggleObjectSelection(id) {
        const index = this.selectedObjectIds.indexOf(id);
        if (index > -1) {
            this.selectedObjectIds.splice(index, 1);
        } else {
            this.selectedObjectIds.push(id);
        }
        // Update legacy property
        this.selectedObjectId = this.selectedObjectIds.length > 0 ? this.selectedObjectIds[0] : null;
    }

    /**
     * Add object to selection
     * @param {string} id - Object ID
     */
    addToSelection(id) {
        if (!this.selectedObjectIds.includes(id)) {
            this.selectedObjectIds.push(id);
            this.selectedObjectId = id; // Update legacy property to last selected
        }
    }

    /**
     * Deselect current object(s)
     */
    deselectObject() {
        this.selectedObjectIds = [];
        this.selectedObjectId = null;
    }

    /**
     * Deselect all objects
     */
    deselectAll() {
        this.selectedObjectIds = [];
        this.selectedObjectId = null;
    }

    /**
     * Select all objects
     */
    selectAll() {
        this.selectedObjectIds = this.objects.map(obj => obj.id);
        this.selectedObjectId = this.selectedObjectIds.length > 0 ? this.selectedObjectIds[0] : null;
    }

    /**
     * Get selected object (first one if multiple)
     * @returns {PlaceableObject|null} Selected object or null
     */
    getSelectedObject() {
        if (!this.selectedObjectId) return null;
        return this.getObject(this.selectedObjectId);
    }

    /**
     * Get all selected objects
     * @returns {Array<PlaceableObject>} Array of selected objects
     */
    getSelectedObjects() {
        return this.selectedObjectIds.map(id => this.getObject(id)).filter(obj => obj !== null);
    }

    /**
     * Check if an object is selected
     * @param {string} id - Object ID
     * @returns {boolean} True if selected
     */
    isSelected(id) {
        return this.selectedObjectIds.includes(id);
    }

    /**
     * Get count of selected objects
     * @returns {number} Count of selected objects
     */
    getSelectedCount() {
        return this.selectedObjectIds.length;
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

    /**
     * Reorder objects by updating creation order
     * @param {string} draggedObjectId - ID of the dragged object
     * @param {string} targetObjectId - ID of the target position object
     */
    reorderObjects(draggedObjectId, targetObjectId) {
        const draggedObj = this.getObject(draggedObjectId);
        const targetObj = this.getObject(targetObjectId);

        if (!draggedObj || !targetObj || draggedObj === targetObj) {
            return;
        }

        // Get all objects sorted by creation order
        const sortedObjects = this.getObjectsByCreationOrder();

        // Find indices
        const draggedIndex = sortedObjects.findIndex(obj => obj.id === draggedObjectId);
        const targetIndex = sortedObjects.findIndex(obj => obj.id === targetObjectId);

        if (draggedIndex === -1 || targetIndex === -1) {
            return;
        }

        // Remove dragged object from array
        const [removed] = sortedObjects.splice(draggedIndex, 1);

        // Insert at new position
        // If dragging down, insert before target
        // If dragging up, insert after target
        const insertIndex = draggedIndex < targetIndex ? targetIndex : targetIndex;
        sortedObjects.splice(insertIndex, 0, removed);

        // Reassign creation order
        sortedObjects.forEach((obj, index) => {
            obj.creationOrder = index;
        });

        // Update creation counter to be highest + 1
        this.creationCounter = sortedObjects.length;
    }
}
