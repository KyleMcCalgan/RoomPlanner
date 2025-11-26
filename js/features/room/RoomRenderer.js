/**
 * RoomRenderer - Handles rendering the room on canvas
 */
class RoomRenderer {
    constructor(room, viewport) {
        this.room = room;
        this.viewport = viewport;
    }

    /**
     * Render the room (top-down view for now)
     */
    render() {
        const ctx = this.viewport.getContext();

        // Draw rulers
        this.drawRulers(ctx);

        // Draw room outline
        this.drawRoomOutline(ctx);
    }

    /**
     * Draw measurement rulers
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawRulers(ctx) {
        const { width, length } = this.room.dimensions;

        // Top ruler (horizontal - width)
        this.drawHorizontalRuler(ctx, width, 'top');

        // Left ruler (vertical - length)
        this.drawVerticalRuler(ctx, length, 'left');
    }

    /**
     * Draw horizontal ruler
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} dimension - Dimension in cm
     * @param {string} position - 'top' or 'bottom'
     */
    drawHorizontalRuler(ctx, dimension, position) {
        const startPos = this.viewport.toCanvasCoords(0, 0);
        const endPos = this.viewport.toCanvasCoords(dimension, 0);
        const y = position === 'top' ? startPos.y - 12 : startPos.y + 12;

        // Convert to meters for display
        const dimensionM = dimension / 100;

        // Draw ruler line
        drawLine(ctx, startPos.x, y, endPos.x, y, '#666', 1);

        // Draw tick marks
        const numTicks = 5;
        for (let i = 0; i <= numTicks; i++) {
            const x = startPos.x + (endPos.x - startPos.x) * (i / numTicks);
            drawLine(ctx, x, y - 3, x, y + 3, '#666', 1);

            // Draw measurement labels in meters
            const value = ((dimension / numTicks) * i / 100).toFixed(1);
            drawText(ctx, `${value}`, x, y - 8, '#999', '9px sans-serif', 'center');
        }

        // Draw dimension label in meters
        const centerX = (startPos.x + endPos.x) / 2;
        drawText(ctx, `${dimensionM.toFixed(2)} m`, centerX, y - 20, '#AAA', '10px bold sans-serif', 'center');
    }

    /**
     * Draw vertical ruler
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} dimension - Dimension in cm
     * @param {string} position - 'left' or 'right'
     */
    drawVerticalRuler(ctx, dimension, position) {
        const startPos = this.viewport.toCanvasCoords(0, 0);
        const endPos = this.viewport.toCanvasCoords(0, dimension);
        const x = position === 'left' ? startPos.x - 12 : startPos.x + 12;

        // Convert to meters for display
        const dimensionM = dimension / 100;

        // Draw ruler line
        drawLine(ctx, x, startPos.y, x, endPos.y, '#666', 1);

        // Draw tick marks
        const numTicks = 5;
        for (let i = 0; i <= numTicks; i++) {
            const y = startPos.y + (endPos.y - startPos.y) * (i / numTicks);
            drawLine(ctx, x - 3, y, x + 3, y, '#666', 1);

            // Draw measurement labels in meters
            const value = ((dimension / numTicks) * i / 100).toFixed(1);
            ctx.save();
            ctx.translate(x - 8, y);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, `${value}`, 0, 0, '#999', '9px sans-serif', 'center');
            ctx.restore();
        }

        // Draw dimension label in meters
        const centerY = (startPos.y + endPos.y) / 2;
        ctx.save();
        ctx.translate(x - 20, centerY);
        ctx.rotate(-Math.PI / 2);
        drawText(ctx, `${dimensionM.toFixed(2)} m`, 0, 0, '#AAA', '10px bold sans-serif', 'center');
        ctx.restore();
    }

    /**
     * Draw room outline
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawRoomOutline(ctx) {
        const topLeft = this.viewport.toCanvasCoords(0, 0);
        const bottomRight = this.viewport.toCanvasCoords(
            this.room.dimensions.width,
            this.room.dimensions.length
        );

        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;

        // Draw room background
        drawRect(ctx, topLeft.x, topLeft.y, width, height, '#3A3A3C');

        // Draw grid pattern (1 meter = 100cm spacing)
        this.drawGrid(ctx, topLeft.x, topLeft.y, width, height);

        // Draw room border
        drawStrokeRect(ctx, topLeft.x, topLeft.y, width, height, '#5B9BD5', 2);
    }

    /**
     * Draw grid pattern on room floor
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {number} width - Room width in pixels
     * @param {number} height - Room height in pixels
     */
    drawGrid(ctx, x, y, width, height) {
        const gridSpacing = 100; // 100cm = 1 meter
        const gridSpacingPx = this.viewport.toCanvasDim(gridSpacing);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let i = gridSpacingPx; i < width; i += gridSpacingPx) {
            drawLine(ctx, x + i, y, x + i, y + height, 'rgba(255, 255, 255, 0.15)', 1);
        }

        // Draw horizontal lines
        for (let j = gridSpacingPx; j < height; j += gridSpacingPx) {
            drawLine(ctx, x, y + j, x + width, y + j, 'rgba(255, 255, 255, 0.15)', 1);
        }

        ctx.restore();
    }
}
