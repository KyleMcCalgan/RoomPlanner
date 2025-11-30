/**
 * DoorRenderer - Handles rendering doors on canvas
 */
class DoorRenderer {
    constructor(doorManager, room, viewport, doorController) {
        this.doorManager = doorManager;
        this.room = room;
        this.viewport = viewport;
        this.doorController = doorController;
    }

    /**
     * Render all doors
     * @param {string} view - Current view (TOP, FRONT, LEFT, RIGHT)
     */
    render(view = 'TOP') {
        const ctx = this.viewport.getContext();

        const doors = this.doorManager.getAllDoors();
        const selectedDoor = this.doorManager.getSelectedDoor();
        const pendingDoor = this.doorController.getState().pendingDoor;

        // Render all placed doors
        for (const door of doors) {
            if (this.shouldRenderDoor(door, view)) {
                const isSelected = selectedDoor && selectedDoor.id === door.id;
                this.renderDoor(ctx, door, view, isSelected, false);
            }
        }

        // Render pending door (preview)
        if (pendingDoor && this.shouldRenderDoor(pendingDoor, view)) {
            this.renderDoor(ctx, pendingDoor, view, false, true);
        }
    }

    /**
     * Check if door should be rendered in current view
     * @param {Door} door - Door to check
     * @param {string} view - Current view
     * @returns {boolean} True if should render
     */
    shouldRenderDoor(door, view) {
        if (view === 'TOP') {
            return true; // All doors visible in top view
        }

        // Doors visible in their own wall view AND perpendicular views (to show arc)
        switch (view) {
            case 'FRONT':
                // FRONT view shows: doors on front wall (full door) + doors on left/right walls (arc only)
                return door.wall === 'front' || door.wall === 'left' || door.wall === 'right';
            case 'LEFT':
                // LEFT view shows RIGHT wall, so show doors on right wall (full door) + doors on front/back walls (arc only)
                return door.wall === 'right' || door.wall === 'front' || door.wall === 'back';
            case 'RIGHT':
                // RIGHT view shows LEFT wall, so show doors on left wall (full door) + doors on front/back walls (arc only)
                return door.wall === 'left' || door.wall === 'front' || door.wall === 'back';
            default:
                return false;
        }
    }

    /**
     * Check if door is on the wall being directly viewed (not perpendicular)
     * @param {Door} door - Door to check
     * @param {string} view - Current view
     * @returns {boolean} True if door is on the viewed wall
     */
    isDoorOnViewedWall(door, view) {
        switch (view) {
            case 'FRONT':
                return door.wall === 'front';
            case 'LEFT':
                return door.wall === 'right';
            case 'RIGHT':
                return door.wall === 'left';
            default:
                return false;
        }
    }

    /**
     * Render a single door
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Door} door - Door to render
     * @param {string} view - Current view
     * @param {boolean} isSelected - Whether door is selected
     * @param {boolean} isPending - Whether door is being placed (preview)
     */
    renderDoor(ctx, door, view, isSelected = false, isPending = false) {
        if (view === 'TOP') {
            this.renderDoorTopView(ctx, door, isSelected, isPending);
        } else {
            // Check if door is on the wall being viewed or perpendicular
            const isOnViewedWall = this.isDoorOnViewedWall(door, view);

            if (isOnViewedWall) {
                // Door is on this wall - render the full door
                this.renderDoorSideView(ctx, door, view, isSelected, isPending);
            } else {
                // Door is on perpendicular wall - render the arc/clearance zone
                this.renderDoorArcPerpendicularView(ctx, door, view, isSelected, isPending);
            }
        }
    }

    /**
     * Render door in TOP view (with swing arc)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Door} door - Door to render
     * @param {boolean} isSelected - Whether door is selected
     * @param {boolean} isPending - Whether door is being placed (preview)
     */
    renderDoorTopView(ctx, door, isSelected = false, isPending = false) {
        // Get door position on wall
        const doorPos = this.getDoorTopViewPosition(door);
        if (!doorPos) {
            return;
        }

        // Convert to canvas coordinates
        const canvasStart = this.viewport.toCanvasCoords(doorPos.x1, doorPos.y1);
        const canvasEnd = this.viewport.toCanvasCoords(doorPos.x2, doorPos.y2);

        // Determine if door is blocked
        const isBlocked = door.isBlocked && !isPending;

        // Save canvas state
        ctx.save();

        // Draw door as a line on the wall (thicker for better visibility)
        ctx.strokeStyle = isBlocked ? '#FF4444' : (isSelected ? '#5B9BD5' : '#FFFFFF');
        ctx.lineWidth = isPending ? 3 : 6;
        ctx.lineCap = 'round'; // Round line caps for better visibility
        if (isPending) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(canvasStart.x, canvasStart.y);
        ctx.lineTo(canvasEnd.x, canvasEnd.y);
        ctx.stroke();

        ctx.restore();

        // Draw swing arc (only for inward-swinging doors)
        const arc = door.getSwingArc(this.room);
        if (arc) {
            const centerCanvas = this.viewport.toCanvasCoords(arc.centerX, arc.centerY);
            const radiusCanvas = this.viewport.toCanvasDim(arc.radius);

            ctx.save();

            ctx.strokeStyle = isBlocked ? '#FF4444' : (isSelected ? '#5B9BD5' : 'rgba(255, 255, 255, 0.5)');
            ctx.lineWidth = isPending ? 1 : 2;
            if (isPending) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }

            ctx.beginPath();
            ctx.arc(centerCanvas.x, centerCanvas.y, radiusCanvas, arc.startAngle, arc.endAngle);
            ctx.stroke();

            ctx.restore();

            // Fill arc area with semi-transparent color
            ctx.save();

            ctx.fillStyle = isBlocked ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(centerCanvas.x, centerCanvas.y);
            ctx.arc(centerCanvas.x, centerCanvas.y, radiusCanvas, arc.startAngle, arc.endAngle);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    /**
     * Get door position in TOP view
     * @param {Door} door - Door object
     * @returns {Object|null} {x1, y1, x2, y2} in room coordinates
     */
    getDoorTopViewPosition(door) {
        const w = door.dimensions.width;
        const pos = door.position;

        switch (door.wall) {
            case 'front': // Y = 0, along X axis
                return { x1: pos, y1: 0, x2: pos + w, y2: 0 };
            case 'back': // Y = room.length, along X axis
                return { x1: pos, y1: this.room.dimensions.length, x2: pos + w, y2: this.room.dimensions.length };
            case 'left': // X = 0, along Y axis
                return { x1: 0, y1: pos, x2: 0, y2: pos + w };
            case 'right': // X = room.width, along Y axis
                return { x1: this.room.dimensions.width, y1: pos, x2: this.room.dimensions.width, y2: pos + w };
            default:
                return null;
        }
    }

    /**
     * Render door in side view (as cutout)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Door} door - Door to render
     * @param {string} view - Current view
     * @param {boolean} isSelected - Whether door is selected
     * @param {boolean} isPending - Whether door is being placed (preview)
     */
    renderDoorSideView(ctx, door, view, isSelected = false, isPending = false) {
        // Calculate door position on canvas
        const { x, y, width, height } = this.getDoorCanvasCoords(door, view);

        // Determine if door is blocked
        const isBlocked = door.isBlocked && !isPending;

        // Swing arc visualization in side views removed - not needed when viewing door head-on
        // The arc is still visible in TOP view and collision detection still works

        // Save context state
        ctx.save();

        // Clear the door area (remove grid, show canvas background)
        ctx.clearRect(x, y, width, height);

        // Fill with light brown color (#C19A6B)
        ctx.fillStyle = '#C19A6B';
        ctx.fillRect(x, y, width, height);

        // Draw door border (thin white line, or red if blocked)
        ctx.strokeStyle = isBlocked ? '#FF4444' : (isPending ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF');
        ctx.lineWidth = isPending ? 1 : 2;
        ctx.strokeRect(x, y, width, height);

        // If selected, draw selection highlight
        if (isSelected && !isPending) {
            ctx.strokeStyle = '#5B9BD5';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
            ctx.setLineDash([]);
        }

        // If pending, add visual feedback
        if (isPending) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x, y, width, height);
        }

        // Restore context state
        ctx.restore();
    }

    /**
     * Render swing arc visualization in side view
     * Shows the clearance zone needed for door swing
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Door} door - Door to render
     * @param {string} view - Current view
     * @param {number} doorX - Door canvas X position
     * @param {number} doorY - Door canvas Y position
     * @param {number} doorWidth - Door canvas width
     * @param {number} doorHeight - Door canvas height
     * @param {boolean} isBlocked - Whether door is blocked
     * @param {boolean} isPending - Whether door is being placed
     */
    renderSwingArcSideView(ctx, door, view, doorX, doorY, doorWidth, doorHeight, isBlocked, isPending) {
        // The swing arc extends into the room by the door width (90° arc with radius = door width)
        // We'll show this as a semi-transparent rectangle extending from the door

        let swingRoomX, swingRoomY, swingRoomWidth, swingRoomHeight;
        const roomHeightDim = this.room.dimensions.height;
        const swingDepth = door.dimensions.width; // Swing extends by door width

        // Calculate swing zone position based on view and hinge position
        switch (view) {
            case 'FRONT': // X-Z plane, door on front wall (Y=0)
                // Swing extends into room (positive Y direction)
                // In FRONT view, we show this as extending to the right or left based on hinge
                if (door.hingePosition === 'left') {
                    // Hinge on left, door swings to the right
                    swingRoomX = door.position + door.dimensions.width;
                } else {
                    // Hinge on right, door swings to the left
                    swingRoomX = door.position - swingDepth;
                }
                swingRoomY = roomHeightDim - 0 - door.dimensions.height;
                swingRoomWidth = swingDepth;
                swingRoomHeight = door.dimensions.height;
                break;

            case 'LEFT': // Y-Z plane, door on left wall (X=0)
                // Similar logic for left wall
                if (door.hingePosition === 'left') {
                    swingRoomX = door.position + door.dimensions.width;
                } else {
                    swingRoomX = door.position - swingDepth;
                }
                swingRoomY = roomHeightDim - 0 - door.dimensions.height;
                swingRoomWidth = swingDepth;
                swingRoomHeight = door.dimensions.height;
                break;

            case 'RIGHT': // Y-Z plane, door on right wall (X=width)
                // Similar logic for right wall
                if (door.hingePosition === 'left') {
                    swingRoomX = door.position + door.dimensions.width;
                } else {
                    swingRoomX = door.position - swingDepth;
                }
                swingRoomY = roomHeightDim - 0 - door.dimensions.height;
                swingRoomWidth = swingDepth;
                swingRoomHeight = door.dimensions.height;
                break;

            default:
                return;
        }

        // Convert to canvas coordinates
        const topLeft = this.viewport.toCanvasCoords(swingRoomX, swingRoomY);
        const bottomRight = this.viewport.toCanvasCoords(
            swingRoomX + swingRoomWidth,
            swingRoomY + swingRoomHeight
        );

        const swingX = topLeft.x;
        const swingY = topLeft.y;
        const swingWidth = bottomRight.x - topLeft.x;
        const swingHeight = bottomRight.y - topLeft.y;

        // Save context
        ctx.save();

        // Draw semi-transparent swing zone
        ctx.fillStyle = isBlocked ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(swingX, swingY, swingWidth, swingHeight);

        // Draw swing zone border
        ctx.strokeStyle = isBlocked ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        if (isPending) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([3, 3]);
        }
        ctx.strokeRect(swingX, swingY, swingWidth, swingHeight);

        // Restore context
        ctx.restore();
    }

    /**
     * Get door coordinates on canvas
     * @param {Door} door - Door object
     * @param {string} view - Current view
     * @returns {Object} {x, y, width, height} in canvas coordinates
     */
    getDoorCanvasCoords(door, view) {
        let roomX, roomY, roomWidth, roomHeight;
        const roomHeightDim = this.room.dimensions.height;

        switch (view) {
            case 'FRONT': // X-Z plane (front wall at Y=0)
                roomX = door.position;
                // Invert Y so ground (Z=0) is at bottom of canvas - same as objects
                roomY = roomHeightDim - 0 - door.dimensions.height;
                roomWidth = door.dimensions.width;
                roomHeight = door.dimensions.height;
                break;

            case 'LEFT': // Y-Z plane (left wall at X=0)
                roomX = door.position;
                // Invert Y so ground (Z=0) is at bottom of canvas - same as objects
                roomY = roomHeightDim - 0 - door.dimensions.height;
                roomWidth = door.dimensions.width;
                roomHeight = door.dimensions.height;
                break;

            case 'RIGHT': // Y-Z plane (right wall at X=width)
                roomX = door.position;
                // Invert Y so ground (Z=0) is at bottom of canvas - same as objects
                roomY = roomHeightDim - 0 - door.dimensions.height;
                roomWidth = door.dimensions.width;
                roomHeight = door.dimensions.height;
                break;

            default:
                return { x: 0, y: 0, width: 0, height: 0 };
        }

        // Convert to canvas coordinates
        const topLeft = this.viewport.toCanvasCoords(roomX, roomY);
        const bottomRight = this.viewport.toCanvasCoords(
            roomX + roomWidth,
            roomY + roomHeight
        );

        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    /**
     * Render door arc/clearance zone in perpendicular view
     * Shows the swing arc when viewing from a wall perpendicular to the door's wall
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Door} door - Door to render
     * @param {string} view - Current view
     * @param {boolean} isSelected - Whether door is selected
     * @param {boolean} isPending - Whether door is being placed
     */
    renderDoorArcPerpendicularView(ctx, door, view, isSelected = false, isPending = false) {
        // Only render arc for inward-swinging doors
        if (door.swingDirection !== 'inward') {
            return;
        }

        const isBlocked = door.isBlocked && !isPending;
        const swingDepth = door.dimensions.width; // Arc radius
        const roomHeightDim = this.room.dimensions.height;

        let arcRoomX, arcRoomY, arcRoomWidth, arcRoomHeight;

        // Calculate the arc zone based on which wall the door is on and which view we're in
        if (view === 'FRONT') {
            // FRONT view shows X-Z plane
            if (door.wall === 'left') {
                // Door on LEFT wall (X=0), swings into room (+X direction)
                arcRoomX = 0;
                arcRoomWidth = swingDepth;
                arcRoomY = roomHeightDim - door.dimensions.height;
                arcRoomHeight = door.dimensions.height;
            } else if (door.wall === 'right') {
                // Door on RIGHT wall (X=width), swings into room (-X direction)
                arcRoomX = this.room.dimensions.width - swingDepth;
                arcRoomWidth = swingDepth;
                arcRoomY = roomHeightDim - door.dimensions.height;
                arcRoomHeight = door.dimensions.height;
            } else {
                return; // Door not on perpendicular wall for this view
            }
        } else if (view === 'LEFT') {
            // LEFT view shows Y-Z plane (viewing RIGHT wall)
            const roomLength = this.room.dimensions.length;
            if (door.wall === 'front') {
                // Door on FRONT wall (Y=0), swings into room (+Y direction)
                // Appears on the LEFT side of LEFT view
                arcRoomX = 0;
                arcRoomWidth = swingDepth;
                arcRoomY = roomHeightDim - door.dimensions.height;
                arcRoomHeight = door.dimensions.height;
            } else if (door.wall === 'back') {
                // Door on BACK wall (Y=room.length), swings into room (-Y direction)
                // Appears on the RIGHT side of LEFT view
                arcRoomX = roomLength - swingDepth;
                arcRoomWidth = swingDepth;
                arcRoomY = roomHeightDim - door.dimensions.height;
                arcRoomHeight = door.dimensions.height;
            } else {
                return; // Door not on perpendicular wall for this view
            }
        } else if (view === 'RIGHT') {
            // RIGHT view shows Y-Z plane (viewing LEFT wall) - MIRRORED
            // Coordinates are flipped: x = roomLength - y - width
            const roomLength = this.room.dimensions.length;
            if (door.wall === 'front') {
                // Door on FRONT wall (Y=0), swings into room (+Y direction)
                // In mirrored RIGHT view, Y=0 appears on the RIGHT side
                arcRoomX = roomLength - swingDepth;
                arcRoomWidth = swingDepth;
                arcRoomY = roomHeightDim - door.dimensions.height;
                arcRoomHeight = door.dimensions.height;
            } else if (door.wall === 'back') {
                // Door on BACK wall (Y=room.length), swings into room (-Y direction)
                // In mirrored RIGHT view, Y=room.length appears on the LEFT side
                arcRoomX = 0;
                arcRoomWidth = swingDepth;
                arcRoomY = roomHeightDim - door.dimensions.height;
                arcRoomHeight = door.dimensions.height;
            } else {
                return; // Door not on perpendicular wall for this view
            }
        } else {
            return;
        }

        // Convert to canvas coordinates
        const topLeft = this.viewport.toCanvasCoords(arcRoomX, arcRoomY);
        const bottomRight = this.viewport.toCanvasCoords(
            arcRoomX + arcRoomWidth,
            arcRoomY + arcRoomHeight
        );

        const canvasX = topLeft.x;
        const canvasY = topLeft.y;
        const canvasWidth = bottomRight.x - topLeft.x;
        const canvasHeight = bottomRight.y - topLeft.y;

        // Save context
        ctx.save();

        // Draw semi-transparent swing zone
        ctx.fillStyle = isBlocked ? 'rgba(255, 68, 68, 0.15)' : 'rgba(91, 155, 213, 0.1)';
        ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);

        // Draw swing zone border
        ctx.strokeStyle = isBlocked ? 'rgba(255, 68, 68, 0.5)' : (isSelected ? '#5B9BD5' : 'rgba(91, 155, 213, 0.4)');
        ctx.lineWidth = isSelected ? 2 : 1;
        if (isPending) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([3, 3]);
        }
        ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);

        // Restore context
        ctx.restore();
    }

    /**
     * Check if a canvas point is on a door in TOP view
     * @param {Door} door - Door object
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     * @returns {boolean} True if point is on door
     */
    isPointOnDoorTopView(door, canvasX, canvasY) {
        const doorPos = this.getDoorTopViewPosition(door);
        if (!doorPos) return false;

        const canvasStart = this.viewport.toCanvasCoords(doorPos.x1, doorPos.y1);
        const canvasEnd = this.viewport.toCanvasCoords(doorPos.x2, doorPos.y2);

        // Check if point is near the door line
        const threshold = 5; // pixels

        // Calculate distance from point to line segment
        const dx = canvasEnd.x - canvasStart.x;
        const dy = canvasEnd.y - canvasStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return false;

        const t = Math.max(0, Math.min(1, ((canvasX - canvasStart.x) * dx + (canvasY - canvasStart.y) * dy) / (length * length)));
        const projX = canvasStart.x + t * dx;
        const projY = canvasStart.y + t * dy;

        const distance = Math.sqrt(Math.pow(canvasX - projX, 2) + Math.pow(canvasY - projY, 2));

        return distance <= threshold;
    }
}
