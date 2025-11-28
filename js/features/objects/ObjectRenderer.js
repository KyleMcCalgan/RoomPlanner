/**
 * ObjectRenderer - Handles rendering objects on canvas
 */
class ObjectRenderer {
    constructor(objectManager, viewport, room) {
        this.objectManager = objectManager;
        this.viewport = viewport;
        this.room = room;
    }

    /**
     * Render all objects
     * @param {string} view - Current view (TOP, FRONT, LEFT, RIGHT)
     */
    render(view = 'TOP') {
        const ctx = this.viewport.getContext();

        if (view === 'TOP') {
            this.renderTopView(ctx);
        } else {
            this.renderSideView(ctx, view);
        }

        // Highlight selected objects
        const selectedObjects = this.objectManager.getSelectedObjects();
        selectedObjects.forEach(obj => {
            if (obj.visible) {
                this.drawSelection(ctx, obj, view);
            }
        });
    }

    /**
     * Render top view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderTopView(ctx) {
        const objects = this.objectManager.getObjectsByCreationOrder();
        objects.filter(obj => obj.visible).forEach(obj => this.drawObjectTopView(ctx, obj));
    }

    /**
     * Render side view (FRONT, LEFT, RIGHT)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} view - View type
     */
    renderSideView(ctx, view) {
        const objects = this.objectManager.getAllObjects().filter(obj => obj.visible);

        // Sort by depth (back to front) so front objects occlude back ones
        const sortedObjects = this.sortObjectsByDepth(objects, view);

        sortedObjects.forEach(obj => this.drawObjectSideView(ctx, obj, view));
    }

    /**
     * Sort objects by depth for side views
     * @param {Array} objects - Objects to sort
     * @param {string} view - View type
     * @returns {Array} Sorted objects (back to front)
     */
    sortObjectsByDepth(objects, view) {
        return [...objects].sort((a, b) => {
            if (view === 'FRONT') {
                // Front view: sort by Y position (smaller Y = further back)
                return a.position.y - b.position.y;
            } else if (view === 'LEFT') {
                // Left view: sort by X position (smaller X = further back)
                return a.position.x - b.position.x;
            } else if (view === 'RIGHT') {
                // Right view: sort by X position (larger X = further back)
                return b.position.x - a.position.x;
            }
            return 0;
        });
    }

    /**
     * Draw object in top view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {PlaceableObject} obj - Object to draw
     */
    drawObjectTopView(ctx, obj) {
        const canvasPos = this.viewport.toCanvasCoords(obj.position.x, obj.position.y);
        const canvasWidth = this.viewport.toCanvasDim(obj.dimensions.width);
        const canvasLength = this.viewport.toCanvasDim(obj.dimensions.length);

        // Draw the object - dimensions are already swapped, no rotation needed
        const transparentFill = hexToRgba(obj.color, 0.15); // 15% opacity for fill

        // Draw fill
        drawRect(ctx, canvasPos.x, canvasPos.y, canvasWidth, canvasLength, transparentFill);

        // Draw outline
        drawStrokeRect(ctx, canvasPos.x, canvasPos.y, canvasWidth, canvasLength, obj.color, 2);

        // Draw object label
        this.drawLabel(ctx, obj, canvasPos, canvasWidth, canvasLength);

        // Draw collision indicator if disabled
        if (!obj.collisionEnabled) {
            this.drawCollisionDisabledIndicator(ctx, canvasPos, canvasWidth, canvasLength);
        }
    }

    /**
     * Draw object in side view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {PlaceableObject} obj - Object to draw
     * @param {string} view - View type (FRONT, LEFT, RIGHT)
     */
    drawObjectSideView(ctx, obj, view) {
        let x, y, width, height;
        const roomHeight = this.room.dimensions.height;

        // Calculate position and dimensions based on view
        // Dimensions are already swapped by rotation, so we just use them directly
        if (view === 'FRONT') {
            // Front view: X position horizontal, Z position vertical (inverted)
            x = obj.position.x;
            // Invert Y so ground (Z=0) is at bottom of canvas
            y = roomHeight - obj.position.z - obj.dimensions.height;
            width = obj.dimensions.width; // Width always shows in front view
            height = obj.dimensions.height;
        } else if (view === 'LEFT') {
            // Left view: Y position horizontal, Z position vertical (inverted)
            x = obj.position.y;
            // Invert Y so ground (Z=0) is at bottom of canvas
            y = roomHeight - obj.position.z - obj.dimensions.height;
            width = obj.dimensions.length; // Length always shows in left view
            height = obj.dimensions.height;
        } else if (view === 'RIGHT') {
            // Right view: Y position horizontal (REVERSED), Z position vertical (inverted)
            // Looking from east to west, so flip horizontally
            const roomLength = this.room.dimensions.length;
            x = roomLength - obj.position.y - obj.dimensions.length;
            // Invert Y so ground (Z=0) is at bottom of canvas
            y = roomHeight - obj.position.z - obj.dimensions.height;
            width = obj.dimensions.length; // Length always shows in right view
            height = obj.dimensions.height;
        }

        const canvasPos = this.viewport.toCanvasCoords(x, y);
        const canvasWidth = this.viewport.toCanvasDim(width);
        const canvasHeight = this.viewport.toCanvasDim(height);

        // Draw the object - transparent fill, opaque outline
        const transparentFill = hexToRgba(obj.color, 0.15);
        drawRect(ctx, canvasPos.x, canvasPos.y, canvasWidth, canvasHeight, transparentFill);
        drawStrokeRect(ctx, canvasPos.x, canvasPos.y, canvasWidth, canvasHeight, obj.color, 2);

        // Draw object label
        const centerX = canvasPos.x + canvasWidth / 2;
        const centerY = canvasPos.y + canvasHeight / 2;
        const labelWidth = ctx.measureText(obj.name).width + 10;
        drawRect(ctx, centerX - labelWidth / 2, centerY - 10, labelWidth, 20, 'rgba(255, 255, 255, 0.8)');
        drawText(ctx, obj.name, centerX, centerY + 4, '#333', '12px sans-serif', 'center');

        // Draw collision indicator if disabled
        if (!obj.collisionEnabled) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            drawLine(ctx, canvasPos.x, canvasPos.y,
                    canvasPos.x + canvasWidth, canvasPos.y + canvasHeight,
                    'rgba(255, 0, 0, 0.3)', 2);
            ctx.restore();
        }
    }

    /**
     * Draw object label
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {PlaceableObject} obj - Object
     * @param {Object} canvasPos - Canvas position
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasLength - Canvas length
     */
    drawLabel(ctx, obj, canvasPos, canvasWidth, canvasLength) {
        const centerX = canvasPos.x + canvasWidth / 2;
        const centerY = canvasPos.y + canvasLength / 2;

        // Draw label background
        const labelWidth = ctx.measureText(obj.name).width + 10;
        drawRect(ctx, centerX - labelWidth / 2, centerY - 10, labelWidth, 20, 'rgba(255, 255, 255, 0.8)');

        // Draw label text
        drawText(ctx, obj.name, centerX, centerY + 4, '#333', '12px sans-serif', 'center');
    }

    /**
     * Draw collision disabled indicator
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} canvasPos - Canvas position
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasLength - Canvas length
     */
    drawCollisionDisabledIndicator(ctx, canvasPos, canvasWidth, canvasLength) {
        // Draw diagonal lines to indicate collision is disabled
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        drawLine(
            ctx,
            canvasPos.x,
            canvasPos.y,
            canvasPos.x + canvasWidth,
            canvasPos.y + canvasLength,
            'rgba(255, 0, 0, 0.3)',
            2
        );

        ctx.restore();
    }

    /**
     * Draw selection highlight
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {PlaceableObject} obj - Selected object
     * @param {string} view - Current view
     */
    drawSelection(ctx, obj, view = 'TOP') {
        if (view === 'TOP') {
            const canvasPos = this.viewport.toCanvasCoords(obj.position.x, obj.position.y);
            const canvasWidth = this.viewport.toCanvasDim(obj.dimensions.width);
            const canvasLength = this.viewport.toCanvasDim(obj.dimensions.length);

            // Draw selection outline - no rotation needed, dimensions already swapped
            ctx.save();
            ctx.strokeStyle = '#ffffffff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(canvasPos.x - 5, canvasPos.y - 5, canvasWidth + 10, canvasLength + 10);
            ctx.restore();
        } else {
            // Side view selection
            let x, y, width, height;
            const roomHeight = this.room.dimensions.height;

            if (view === 'FRONT') {
                x = obj.position.x;
                // Invert Y so ground (Z=0) is at bottom of canvas
                y = roomHeight - obj.position.z - obj.dimensions.height;
                width = obj.dimensions.width;
                height = obj.dimensions.height;
            } else if (view === 'LEFT') {
                x = obj.position.y;
                // Invert Y so ground (Z=0) is at bottom of canvas
                y = roomHeight - obj.position.z - obj.dimensions.height;
                width = obj.dimensions.length;
                height = obj.dimensions.height;
            } else if (view === 'RIGHT') {
                // Right view is mirrored - flip X coordinate
                const roomLength = this.room.dimensions.length;
                x = roomLength - obj.position.y - obj.dimensions.length;
                // Invert Y so ground (Z=0) is at bottom of canvas
                y = roomHeight - obj.position.z - obj.dimensions.height;
                width = obj.dimensions.length;
                height = obj.dimensions.height;
            }

            const canvasPos = this.viewport.toCanvasCoords(x, y);
            const canvasWidth = this.viewport.toCanvasDim(width);
            const canvasHeight = this.viewport.toCanvasDim(height);

            ctx.save();
            ctx.strokeStyle = '#ffffffff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(canvasPos.x - 5, canvasPos.y - 5, canvasWidth + 10, canvasHeight + 10);
            ctx.restore();
        }
    }

    /**
     * Draw preview object (during placement)
     * @param {Object} objectData - Temporary object data
     * @param {number} mouseX - Mouse X position (canvas coordinates)
     * @param {number} mouseY - Mouse Y position (canvas coordinates)
     */
    drawPreview(objectData, mouseX, mouseY) {
        const ctx = this.viewport.getContext();
        const roomPos = this.viewport.toRoomCoords(mouseX, mouseY);

        const canvasPos = this.viewport.toCanvasCoords(roomPos.x, roomPos.y);
        const canvasWidth = this.viewport.toCanvasDim(objectData.width);
        const canvasLength = this.viewport.toCanvasDim(objectData.length);

        // Draw semi-transparent preview - no rotation
        const previewColor = hexToRgba(objectData.color, 0.25);
        drawRect(ctx, canvasPos.x, canvasPos.y, canvasWidth, canvasLength, previewColor);
        drawStrokeRect(ctx, canvasPos.x, canvasPos.y, canvasWidth, canvasLength, objectData.color, 2);
    }
}
