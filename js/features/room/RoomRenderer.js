/**
 * RoomRenderer - Handles rendering the room on canvas
 */
class RoomRenderer {
    constructor(room, viewport) {
        this.room = room;
        this.viewport = viewport;
    }

    /**
     * Render the room
     * @param {string} view - Current view (TOP, FRONT, LEFT, RIGHT)
     * @param {string} hoveredView - View button being hovered (optional)
     */
    render(view = 'TOP', hoveredView = null) {
        const ctx = this.viewport.getContext();

        switch(view) {
            case 'TOP':
                this.renderTopView(ctx);
                // Draw direction indicator if hovering over a view button in TOP view
                if (hoveredView && hoveredView !== 'TOP') {
                    this.drawViewDirectionIndicator(ctx, hoveredView);
                }
                break;
            case 'FRONT':
                this.renderFrontView(ctx);
                break;
            case 'LEFT':
                this.renderLeftView(ctx);
                break;
            case 'RIGHT':
                this.renderRightView(ctx);
                break;
        }
    }

    /**
     * Render top-down view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderTopView(ctx) {
        // Draw rulers
        this.drawRulersTopView(ctx);

        // Draw room outline
        this.drawRoomOutlineTopView(ctx);
    }

    /**
     * Render front view (looking from south to north)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderFrontView(ctx) {
        const { width, height } = this.room.dimensions;

        // Draw rulers
        this.drawHorizontalRuler(ctx, width, 'top');
        this.drawVerticalRuler(ctx, height, 'left');

        // Draw room as side elevation
        const topLeft = this.viewport.toCanvasCoords(0, 0);
        const bottomRight = this.viewport.toCanvasCoords(width, height);

        const w = bottomRight.x - topLeft.x;
        const h = bottomRight.y - topLeft.y;

        // Draw room background
        drawRect(ctx, topLeft.x, topLeft.y, w, h, '#3A3A3C');

        // Draw grid
        this.drawGrid(ctx, topLeft.x, topLeft.y, w, h);

        // Draw border
        drawStrokeRect(ctx, topLeft.x, topLeft.y, w, h, '#5B9BD5', 2);

        // Draw floor line
        drawLine(ctx, topLeft.x, bottomRight.y, bottomRight.x, bottomRight.y, '#888', 2);
    }

    /**
     * Render left view (looking from west to east)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderLeftView(ctx) {
        const { length, height } = this.room.dimensions;

        // Draw rulers
        this.drawHorizontalRuler(ctx, length, 'top');
        this.drawVerticalRuler(ctx, height, 'left');

        // Draw room as side elevation
        const topLeft = this.viewport.toCanvasCoords(0, 0);
        const bottomRight = this.viewport.toCanvasCoords(length, height);

        const w = bottomRight.x - topLeft.x;
        const h = bottomRight.y - topLeft.y;

        // Draw room background
        drawRect(ctx, topLeft.x, topLeft.y, w, h, '#3A3A3C');

        // Draw grid
        this.drawGrid(ctx, topLeft.x, topLeft.y, w, h);

        // Draw border
        drawStrokeRect(ctx, topLeft.x, topLeft.y, w, h, '#5B9BD5', 2);

        // Draw floor line
        drawLine(ctx, topLeft.x, bottomRight.y, bottomRight.x, bottomRight.y, '#888', 2);
    }

    /**
     * Render right view (looking from east to west)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderRightView(ctx) {
        const { length, height } = this.room.dimensions;

        // Draw rulers
        this.drawHorizontalRuler(ctx, length, 'top');
        this.drawVerticalRuler(ctx, height, 'left');

        // Draw room as side elevation
        const topLeft = this.viewport.toCanvasCoords(0, 0);
        const bottomRight = this.viewport.toCanvasCoords(length, height);

        const w = bottomRight.x - topLeft.x;
        const h = bottomRight.y - topLeft.y;

        // Draw room background
        drawRect(ctx, topLeft.x, topLeft.y, w, h, '#3A3A3C');

        // Draw grid
        this.drawGrid(ctx, topLeft.x, topLeft.y, w, h);

        // Draw border
        drawStrokeRect(ctx, topLeft.x, topLeft.y, w, h, '#5B9BD5', 2);

        // Draw floor line
        drawLine(ctx, topLeft.x, bottomRight.y, bottomRight.x, bottomRight.y, '#888', 2);
    }

    /**
     * Draw measurement rulers for top view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawRulersTopView(ctx) {
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
     * Draw room outline for top view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawRoomOutlineTopView(ctx) {
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
     * Draw directional arrow indicator for a view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} view - View to draw indicator for (FRONT, LEFT, RIGHT)
     */
    drawViewDirectionIndicator(ctx, view) {
        if (!view || view === 'TOP') return;

        const topLeft = this.viewport.toCanvasCoords(0, 0);
        const bottomRight = this.viewport.toCanvasCoords(
            this.room.dimensions.width,
            this.room.dimensions.length
        );

        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;

        ctx.save();

        // Arrow styling
        ctx.strokeStyle = 'rgba(91, 155, 213, 0.8)';
        ctx.fillStyle = 'rgba(91, 155, 213, 0.6)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const arrowLength = 50;
        const arrowHeadSize = 15;

        let startX, startY, endX, endY;

        switch (view) {
            case 'FRONT':
                // Arrow pointing UP (towards front wall) from bottom padding area
                startX = topLeft.x + width / 2;
                startY = bottomRight.y + 50;
                endX = startX;
                endY = bottomRight.y + 10;
                break;

            case 'LEFT':
                // Arrow pointing RIGHT (towards left wall) from left padding area
                startX = topLeft.x - 90;
                startY = topLeft.y + height / 2;
                endX = topLeft.x - 50;
                endY = startY;
                break;

            case 'RIGHT':
                // Arrow pointing LEFT (towards right wall) from right padding area
                startX = bottomRight.x + 50;
                startY = topLeft.y + height / 2;
                endX = bottomRight.x + 10;
                endY = startY;
                break;
        }

        // Draw arrow shaft
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(endY - startY, endX - startX);

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
            endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
            endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw label
        let labelX = startX;
        let labelY = startY;
        let labelText = '';

        switch (view) {
            case 'FRONT':
                labelText = 'FRONT VIEW';
                labelY = bottomRight.y + 65; // Position below the arrow in padding area
                break;
            case 'LEFT':
                labelText = 'LEFT VIEW';
                labelX = topLeft.x - 70; // Position in left padding area
                labelY = topLeft.y + height / 2 + 20;
                break;
            case 'RIGHT':
                labelText = 'RIGHT VIEW';
                labelX = bottomRight.x + 50; // Position in right padding area
                labelY = topLeft.y + height / 2 + 20;
                break;
        }

        ctx.fillStyle = 'rgba(91, 155, 213, 0.9)';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, labelX, labelY);

        ctx.restore();
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
