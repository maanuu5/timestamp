/**
 * ChronoStamp - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        photos: [], // Array of { id, file, name, dateObj, imageElement }
        currentIndex: 0,
        options: {
            baseDate: '',
            startTime: '08:31',
            endTime: '08:50',
            interpolationMode: 'linear',
            stepSeconds: 30,
            fontFamily: 'Inter, sans-serif',
            dateFormat: 'DD/MM/YYYY HH:mm',
            fontSizePercent: 2.8,
            textColor: '#ffffff',
            textOpacity: 0.95,
            enableShadow: true,
            enableOutline: true,
            position: 'bottom-right',
            paddingPercent: 3.5
        }
    };

    // --- DOM Elements ---
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const addMoreFilesBtn = document.getElementById('addMoreFilesBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const exportZipBtn = document.getElementById('exportZipBtn');

    const previewContainer = document.getElementById('previewContainer');
    const previewCanvas = document.getElementById('previewCanvas');
    const currentImageName = document.getElementById('currentImageName');
    const currentImageIndex = document.getElementById('currentImageIndex');
    const currentImageDimensions = document.getElementById('currentImageDimensions');
    const prevPhotoBtn = document.getElementById('prevPhotoBtn');
    const nextPhotoBtn = document.getElementById('nextPhotoBtn');
    const downloadCurrentBtn = document.getElementById('downloadCurrentBtn');

    const thumbnailStripContainer = document.getElementById('thumbnailStripContainer');
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    const thumbCount = document.getElementById('thumbCount');
    const photoCountBadge = document.getElementById('photoCountBadge');
    const sortByFilenameBtn = document.getElementById('sortByFilenameBtn');

    // Controls
    const baseDateInput = document.getElementById('baseDate');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const totalDurationText = document.getElementById('totalDurationText');
    const intervalPerPhotoText = document.getElementById('intervalPerPhotoText');
    const interpolationModeSelect = document.getElementById('interpolationMode');
    const stepIntervalGroup = document.getElementById('stepIntervalGroup');
    const stepSecondsInput = document.getElementById('stepSeconds');

    const fontFamilySelect = document.getElementById('fontFamily');
    const dateFormatSelect = document.getElementById('dateFormat');
    const fontSizePercentInput = document.getElementById('fontSizePercent');
    const fontSizeVal = document.getElementById('fontSizeVal');
    const textColorInput = document.getElementById('textColor');
    const textColorHex = document.getElementById('textColorHex');
    const textOpacityInput = document.getElementById('textOpacity');
    const enableShadowInput = document.getElementById('enableShadow');
    const enableOutlineInput = document.getElementById('enableOutline');
    const posButtons = document.querySelectorAll('.pos-btn');
    const paddingPercentInput = document.getElementById('paddingPercent');

    // Export Modal
    const exportModal = document.getElementById('exportModal');
    const exportProgressBar = document.getElementById('exportProgressBar');
    const exportProgressText = document.getElementById('exportProgressText');

    // --- Initialization ---
    init();

    function init() {
        // Set today's date in date picker if empty
        const today = new Date().toISOString().split('T')[0];
        baseDateInput.value = today;
        state.options.baseDate = today;

        bindEvents();
        updateTimeStatsUI();
    }

    function bindEvents() {
        // Drag & Drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.querySelector('.dropzone-card').classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.querySelector('.dropzone-card').classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.querySelector('.dropzone-card').classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelection(Array.from(e.dataTransfer.files));
            }
        });

        selectFilesBtn.addEventListener('click', () => fileInput.click());
        addMoreFilesBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(Array.from(e.target.files));
                fileInput.value = ''; // Reset input
            }
        });

        clearAllBtn.addEventListener('click', handleClearAll);

        // Control Inputs Binding
        baseDateInput.addEventListener('change', (e) => {
            state.options.baseDate = e.target.value;
            recalculateTimestamps();
        });

        startTimeInput.addEventListener('change', (e) => {
            state.options.startTime = e.target.value;
            recalculateTimestamps();
        });

        endTimeInput.addEventListener('change', (e) => {
            state.options.endTime = e.target.value;
            recalculateTimestamps();
        });

        interpolationModeSelect.addEventListener('change', (e) => {
            state.options.interpolationMode = e.target.value;
            if (e.target.value === 'step') {
                stepIntervalGroup.classList.remove('hidden');
            } else {
                stepIntervalGroup.classList.add('hidden');
            }
            recalculateTimestamps();
        });

        stepSecondsInput.addEventListener('change', (e) => {
            state.options.stepSeconds = parseFloat(e.target.value) || 30;
            recalculateTimestamps();
        });

        // Styling Controls
        fontFamilySelect.addEventListener('change', (e) => {
            state.options.fontFamily = e.target.value;
            renderCurrentPreview();
        });

        dateFormatSelect.addEventListener('change', (e) => {
            state.options.dateFormat = e.target.value;
            renderCurrentPreview();
            renderThumbnails();
        });

        fontSizePercentInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            state.options.fontSizePercent = val;
            fontSizeVal.textContent = `${val}%`;
            renderCurrentPreview();
        });

        textColorInput.addEventListener('input', (e) => {
            state.options.textColor = e.target.value;
            textColorHex.textContent = e.target.value.toUpperCase();
            renderCurrentPreview();
        });

        textOpacityInput.addEventListener('input', (e) => {
            state.options.textOpacity = parseFloat(e.target.value);
            renderCurrentPreview();
        });

        enableShadowInput.addEventListener('change', (e) => {
            state.options.enableShadow = e.target.checked;
            renderCurrentPreview();
        });

        enableOutlineInput.addEventListener('change', (e) => {
            state.options.enableOutline = e.target.checked;
            renderCurrentPreview();
        });

        paddingPercentInput.addEventListener('input', (e) => {
            state.options.paddingPercent = parseFloat(e.target.value);
            renderCurrentPreview();
        });

        posButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                posButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.options.position = btn.dataset.pos;
                renderCurrentPreview();
            });
        });

        // Navigation
        prevPhotoBtn.addEventListener('click', () => {
            if (state.currentIndex > 0) {
                state.currentIndex--;
                renderCurrentPreview();
                updateThumbnailActiveState();
            }
        });

        nextPhotoBtn.addEventListener('click', () => {
            if (state.currentIndex < state.photos.length - 1) {
                state.currentIndex++;
                renderCurrentPreview();
                updateThumbnailActiveState();
            }
        });

        sortByFilenameBtn.addEventListener('click', () => {
            state.photos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            recalculateTimestamps();
        });

        // Download Actions
        downloadCurrentBtn.addEventListener('click', handleDownloadCurrent);
        exportZipBtn.addEventListener('click', handleExportZip);
    }

    /**
     * Ingest newly uploaded files
     */
    async function handleFileSelection(files) {
        // Filter only images
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        for (const file of imageFiles) {
            try {
                const imageElement = await window.BatchProcessor.loadImageElement(file);
                state.photos.push({
                    id: Math.random().toString(36).substring(2, 9),
                    file,
                    name: file.name,
                    dateObj: new Date(),
                    imageElement
                });
            } catch (err) {
                console.error(`Failed to load image ${file.name}:`, err);
            }
        }

        if (state.photos.length > 0) {
            dropzone.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            thumbnailStripContainer.classList.remove('hidden');

            addMoreFilesBtn.disabled = false;
            clearAllBtn.disabled = false;
            exportZipBtn.disabled = false;

            recalculateTimestamps();
        }
    }

    /**
     * Recalculate timestamps for all photos using TimestampEngine
     */
    function recalculateTimestamps() {
        const count = state.photos.length;
        photoCountBadge.innerHTML = `${count} Photos`;
        thumbCount.textContent = count;

        updateTimeStatsUI();

        if (count === 0) return;

        const dates = window.TimestampEngine.calculateTimestamps({
            baseDate: state.options.baseDate,
            startTime: state.options.startTime,
            endTime: state.options.endTime,
            photoCount: count,
            mode: state.options.interpolationMode,
            stepSeconds: state.options.stepSeconds
        });

        // Assign dates to photo state
        state.photos.forEach((photo, idx) => {
            photo.dateObj = dates[idx] || new Date();
        });

        renderThumbnails();
        renderCurrentPreview();
    }

    function updateTimeStatsUI() {
        const stats = window.TimestampEngine.getSummaryStats(
            state.options.baseDate,
            state.options.startTime,
            state.options.endTime,
            state.photos.length
        );

        totalDurationText.textContent = stats.durationText;
        intervalPerPhotoText.textContent = stats.intervalText;
    }

    /**
     * Render main preview canvas
     */
    function renderCurrentPreview() {
        if (state.photos.length === 0) return;

        const currentPhoto = state.photos[state.currentIndex];
        if (!currentPhoto) return;

        currentImageName.textContent = currentPhoto.name;
        currentImageIndex.textContent = `${state.currentIndex + 1} of ${state.photos.length}`;
        
        const w = currentPhoto.imageElement.naturalWidth || currentPhoto.imageElement.width;
        const h = currentPhoto.imageElement.naturalHeight || currentPhoto.imageElement.height;
        currentImageDimensions.textContent = `${w}x${h}px`;

        // Format stamp text
        const stampText = window.TimestampEngine.formatDateTime(currentPhoto.dateObj, state.options.dateFormat);

        // Draw canvas
        window.CanvasRenderer.renderStamp(previewCanvas, currentPhoto.imageElement, stampText, state.options);

        // Update nav buttons
        prevPhotoBtn.disabled = state.currentIndex === 0;
        nextPhotoBtn.disabled = state.currentIndex === state.photos.length - 1;
    }

    /**
     * Render bottom thumbnail bar
     */
    function renderThumbnails() {
        thumbnailStrip.innerHTML = '';

        state.photos.forEach((photo, idx) => {
            const card = document.createElement('div');
            card.className = `thumb-card ${idx === state.currentIndex ? 'active' : ''}`;
            card.dataset.index = idx;

            const timeStr = window.TimestampEngine.formatDateTime(photo.dateObj, 'HH:mm');

            card.innerHTML = `
                <img src="${photo.imageElement.src}" class="thumb-img" alt="${photo.name}">
                <div class="thumb-time-badge">${timeStr}</div>
            `;

            card.addEventListener('click', () => {
                state.currentIndex = idx;
                renderCurrentPreview();
                updateThumbnailActiveState();
            });

            thumbnailStrip.appendChild(card);
        });

        updateThumbnailActiveState();
    }

    function updateThumbnailActiveState() {
        const cards = thumbnailStrip.querySelectorAll('.thumb-card');
        cards.forEach((card, idx) => {
            if (idx === state.currentIndex) {
                card.classList.add('active');
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                card.classList.remove('active');
            }
        });
    }

    /**
     * Download single current stamped image
     */
    async function handleDownloadCurrent() {
        if (state.photos.length === 0) return;
        const photo = state.photos[state.currentIndex];
        
        const blob = await window.CanvasRenderer.exportCanvasBlob(previewCanvas, 'image/jpeg', 0.95);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `stamped_${photo.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Bulk export all stamped images as ZIP archive
     */
    async function handleExportZip() {
        if (state.photos.length === 0) return;

        exportModal.classList.remove('hidden');
        exportProgressBar.style.width = '0%';
        exportProgressText.textContent = `Processing photo 1 of ${state.photos.length}...`;

        try {
            const zipBlob = await window.BatchProcessor.createBatchZip(
                state.photos,
                state.options,
                state.options.dateFormat,
                (processed, total) => {
                    const percent = Math.round((processed / total) * 100);
                    exportProgressBar.style.width = `${percent}%`;
                    exportProgressText.textContent = `Stamping photo ${processed} of ${total}...`;
                }
            );

            // Trigger ZIP download
            const zipUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = `ChronoStamp_Batch_${state.photos.length}_photos.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(zipUrl);

        } catch (err) {
            alert(`Export failed: ${err.message}`);
            console.error(err);
        } finally {
            setTimeout(() => {
                exportModal.classList.add('hidden');
            }, 500);
        }
    }

    /**
     * Clear all loaded photos
     */
    function handleClearAll() {
        if (confirm('Are you sure you want to clear all loaded photos?')) {
            state.photos.forEach(p => {
                if (p.imageElement.src.startsWith('blob:')) {
                    URL.revokeObjectURL(p.imageElement.src);
                }
            });

            state.photos = [];
            state.currentIndex = 0;

            dropzone.classList.remove('hidden');
            previewContainer.classList.add('hidden');
            thumbnailStripContainer.classList.add('hidden');

            addMoreFilesBtn.disabled = true;
            clearAllBtn.disabled = true;
            exportZipBtn.disabled = true;

            photoCountBadge.innerHTML = `0 Photos`;
            updateTimeStatsUI();
        }
    }
});
