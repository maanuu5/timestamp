/**
 * ChronoStamp - Canvas Renderer Engine
 * Draws high-resolution images with crisp timestamp overlays.
 */

window.CanvasRenderer = (function () {

    /**
     * Render image and timestamp onto a canvas element.
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {HTMLImageElement|ImageBitmap} image - Source image element
     * @param {string} timestampText - Text to overlay (e.g. "30/07/2026 10:44")
     * @param {Object} styleOptions - Options for font, position, colors, size
     */
    function renderStamp(canvas, image, timestampText, styleOptions) {
        if (!canvas || !image || !timestampText) return;

        const {
            fontFamily = 'Inter, sans-serif',
            fontSizePercent = 2.8, // % of image height
            textColor = '#ffffff',
            textOpacity = 0.95,
            enableShadow = true,
            enableOutline = true,
            position = 'bottom-right',
            paddingPercent = 3.5 // % of image dimension
        } = styleOptions;

        const imgWidth = image.naturalWidth || image.width;
        const imgHeight = image.naturalHeight || image.height;

        // Set canvas resolution to match natural image size
        canvas.width = imgWidth;
        canvas.height = imgHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, imgWidth, imgHeight);

        // 1. Draw source image
        ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

        // 2. Calculate dynamic font size based on image height
        const fontSizePx = Math.max(12, Math.round((imgHeight * fontSizePercent) / 100));

        ctx.save();
        ctx.font = `${fontSizePx}px ${fontFamily}`;
        ctx.globalAlpha = textOpacity;

        // Measure text width to align position
        const textMetrics = ctx.measureText(timestampText);
        const textWidth = textMetrics.width;
        const textHeight = fontSizePx; // Approximate line height

        // Calculate padding in pixels
        const padX = Math.round((imgWidth * paddingPercent) / 100);
        const padY = Math.round((imgHeight * paddingPercent) / 100);

        let x = 0;
        let y = 0;

        switch (position) {
            case 'top-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                x = padX;
                y = padY;
                break;
            case 'top-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                x = imgWidth - padX;
                y = padY;
                break;
            case 'bottom-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                x = padX;
                y = imgHeight - padY;
                break;
            case 'bottom-right':
            default:
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                x = imgWidth - padX;
                y = imgHeight - padY;
                break;
        }

        // 3. Draw Outline if enabled
        if (enableOutline) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.lineWidth = Math.max(2, Math.round(fontSizePx * 0.08));
            ctx.lineJoin = 'round';
            ctx.strokeText(timestampText, x, y);
        }

        // 4. Draw Drop Shadow if enabled
        if (enableShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = Math.max(4, Math.round(fontSizePx * 0.15));
            ctx.shadowOffsetX = Math.max(1, Math.round(fontSizePx * 0.04));
            ctx.shadowOffsetY = Math.max(1, Math.round(fontSizePx * 0.04));
        }

        // 5. Fill Text
        ctx.fillStyle = textColor;
        ctx.fillText(timestampText, x, y);

        ctx.restore();
    }

    /**
     * Export canvas contents as Blob (PNG or JPEG)
     */
    function exportCanvasBlob(canvas, mimeType = 'image/jpeg', quality = 0.92) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, mimeType, quality);
        });
    }

    return {
        renderStamp,
        exportCanvasBlob
    };
})();
