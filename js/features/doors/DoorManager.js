/**
 * DoorManager - Manages door state and CRUD operations
 */
class DoorManager {
    constructor() {
        this.doors = [];
        this.selectedDoorId = null;
    }

    /**
     * Add a door
     * @param {Door} door - Door to add
     */
    addDoor(door) {
        this.doors.push(door);
    }

    /**
     * Remove a door by ID
     * @param {string} id - Door ID
     * @returns {boolean} True if removed
     */
    removeDoor(id) {
        const index = this.doors.findIndex(door => door.id === id);
        if (index > -1) {
            this.doors.splice(index, 1);
            if (this.selectedDoorId === id) {
                this.selectedDoorId = null;
            }
            return true;
        }
        return false;
    }

    /**
     * Get door by ID
     * @param {string} id - Door ID
     * @returns {Door|null} Door or null if not found
     */
    getDoor(id) {
        return this.doors.find(door => door.id === id) || null;
    }

    /**
     * Get all doors
     * @returns {Array<Door>} All doors
     */
    getAllDoors() {
        return [...this.doors];
    }

    /**
     * Get doors by wall
     * @param {string} wall - Wall name ("front", "back", "left", "right")
     * @returns {Array<Door>} Doors on specified wall
     */
    getDoorsByWall(wall) {
        return this.doors.filter(door => door.wall === wall);
    }

    /**
     * Select a door
     * @param {string} id - Door ID
     */
    selectDoor(id) {
        this.selectedDoorId = id;
    }

    /**
     * Deselect current door
     */
    deselectDoor() {
        this.selectedDoorId = null;
    }

    /**
     * Get selected door
     * @returns {Door|null} Selected door or null
     */
    getSelectedDoor() {
        if (!this.selectedDoorId) return null;
        return this.getDoor(this.selectedDoorId);
    }

    /**
     * Check if a door is selected
     * @param {string} id - Door ID
     * @returns {boolean} True if selected
     */
    isSelected(id) {
        return this.selectedDoorId === id;
    }

    /**
     * Find door at position on a specific wall
     * @param {string} wall - Wall name
     * @param {number} wallPos - Position along the wall
     * @param {number} wallHeight - Height on the wall
     * @returns {Door|null} Door at position or null
     */
    findDoorAtPosition(wall, wallPos, wallHeight) {
        const doorsOnWall = this.getDoorsByWall(wall);
        return doorsOnWall.find(door => door.containsPoint(wallPos, wallHeight)) || null;
    }

    /**
     * Get total count of doors
     * @returns {number} Door count
     */
    getCount() {
        return this.doors.length;
    }

    /**
     * Get total area of all doors
     * @returns {number} Total door area in cm²
     */
    getTotalArea() {
        return this.doors.reduce((total, door) => total + door.getArea(), 0);
    }

    /**
     * Get count of blocked doors (doors with swing arc blocked by objects)
     * @returns {number} Count of blocked doors
     */
    getBlockedCount() {
        return this.doors.filter(door => door.isBlocked).length;
    }

    /**
     * Get all blocked doors
     * @returns {Array<Door>} Array of blocked doors
     */
    getBlockedDoors() {
        return this.doors.filter(door => door.isBlocked);
    }

    /**
     * Clear all doors
     */
    clearAll() {
        this.doors = [];
        this.selectedDoorId = null;
    }
}
