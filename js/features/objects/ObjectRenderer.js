/**
 * ObjectRenderer - Handles rendering objects on canvas
 */
class ObjectRenderer {
    constructor(objectManager, viewport) {
        this.objectManager = objectManager;
        this.viewport = viewport;
    }

    /**
     * Render all objects
     */
    render() {
        const ctx = this.viewport.getContext();
        const objects = this.objectManager.getObjectsByCreationOrder();

        // Draw all objects
        objects.forEach(obj => this.drawObject(ctx, obj));

        // Highlight selected object
        const selectedObj = this.objectManager.getSelectedObject();
        if (selectedObj) {
            this.drawSelection(ctx, selectedObj);
        }
    }

    /**
     * Draw a single object
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {PlaceableObject} obj - Object to draw
     */
    drawObject(ctx, obj) {
        const canvasPos = this.viewport.toCanvasCoords(obj.position.x, obj.position.y);
        const canvasWidth = this.viewport.toCanvasDim(obj.dimensions.width);
        const canvasLength = this.viewport.toCanvasDim(obj.dimensions.length);

        // Draw the object with rotation - transparent fill, opaque outline
        const transparentFill = hexToRgba(obj.color, 0.15); // 15% opacity for fill
        drawRotatedRect(
            ctx,
            canvasPos.x,
            canvasPos.y,
            canvasWidth,
            canvasLength,
            obj.rotation,
            transparentFill,
            obj.color // Full opacity outline
        );

        // Draw object label
        this.drawLabel(ctx, obj, canvasPos, canvasWidth, canvasLength);

        // Draw collision indicator if disabled
        if (!obj.collisionEnabled) {
            this.drawCollisionDisabledIndicator(ctx, canvasPos, canvasWidth, canvasLength);
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
     */
    drawSelection(ctx, obj) {
        const canvasPos = this.viewport.toCanvasCoords(obj.position.x, obj.position.y);
        const canvasWidth = this.viewport.toCanvasDim(obj.dimensions.width);
        const canvasLength = this.viewport.toCanvasDim(obj.dimensions.length);

        // Draw selection outline
        ctx.save();
        ctx.strokeStyle = '#ffffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        // Account for rotation
        const centerX = canvasPos.x + canvasWidth / 2;
        const centerY = canvasPos.y + canvasLength / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.strokeRect(-canvasWidth / 2 - 5, -canvasLength / 2 - 5, canvasWidth + 10, canvasLength + 10);

        ctx.restore();
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

        // Draw semi-transparent preview
        const previewColor = hexToRgba(objectData.color, 0.25);
        drawRotatedRect(
            ctx,
            canvasPos.x,
            canvasPos.y,
            canvasWidth,
            canvasLength,
            0,
            previewColor,
            objectData.color
        );
    }
}
