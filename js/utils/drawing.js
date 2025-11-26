/**
 * Drawing - Canvas drawing helper functions
 */

/**
 * Clear the entire canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draw a filled rectangle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {string} color - Fill color
 */
function drawRect(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

/**
 * Draw a stroked rectangle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {string} color - Stroke color
 * @param {number} lineWidth - Line width
 */
function drawStrokeRect(ctx, x, y, width, height, color, lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
}

/**
 * Draw text on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Text color
 * @param {string} font - Font specification
 * @param {string} align - Text alignment
 */
function drawText(ctx, text, x, y, color = '#000', font = '12px sans-serif', align = 'left') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

/**
 * Draw a line
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {string} color - Line color
 * @param {number} lineWidth - Line width
 */
function drawLine(ctx, x1, y1, x2, y2, color, lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/**
 * Draw a dashed line
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {string} color - Line color
 * @param {Array<number>} dash - Dash pattern
 */
function drawDashedLine(ctx, x1, y1, x2, y2, color, dash = [5, 5]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

/**
 * Draw a rotated rectangle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate (top-left before rotation)
 * @param {number} y - Y coordinate (top-left before rotation)
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} rotation - Rotation in degrees
 * @param {string} fillColor - Fill color
 * @param {string} strokeColor - Stroke color (optional)
 */
function drawRotatedRect(ctx, x, y, width, height, rotation, fillColor, strokeColor = null) {
    ctx.save();

    // Move to center of rectangle
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw rectangle centered at origin
    ctx.fillStyle = fillColor;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
    }

    ctx.restore();
}
