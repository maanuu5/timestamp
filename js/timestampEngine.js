/**
 * ChronoStamp - Timestamp Engine
 * Calculates linear time interpolation, fixed intervals, and formats date/time strings.
 */

window.TimestampEngine = (function () {

    /**
     * Parse date string (YYYY-MM-DD) and time string (HH:mm or HH:mm:ss) into a JS Date object.
     */
    function parseDateTime(dateStr, timeStr) {
        if (!dateStr) {
            // Default to today's date if empty
            const today = new Date();
            dateStr = today.toISOString().split('T')[0];
        }
        
        const [year, month, day] = dateStr.split('-').map(Number);
        const timeParts = (timeStr || '00:00:00').split(':').map(Number);
        const hours = timeParts[0] || 0;
        const minutes = timeParts[1] || 0;
        const seconds = timeParts[2] || 0;

        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    /**
     * Generate an array of Date objects interpolated across photoCount images.
     * @param {Object} params
     * @param {string} params.baseDate - "YYYY-MM-DD"
     * @param {string} params.startTime - "HH:mm" or "HH:mm:ss"
     * @param {string} params.endTime - "HH:mm" or "HH:mm:ss"
     * @param {number} params.photoCount - Total number of photos
     * @param {string} params.mode - "linear" or "step"
     * @param {number} params.stepSeconds - Used if mode === "step"
     * @returns {Date[]} Array of Date objects for each photo
     */
    function calculateTimestamps(params) {
        const { baseDate, startTime, endTime, photoCount, mode = 'linear', stepSeconds = 30 } = params;
        
        if (photoCount <= 0) return [];

        const startDate = parseDateTime(baseDate, startTime);
        const endDate = parseDateTime(baseDate, endTime);

        // If start time is after end time (e.g. overnight or user input error), handle date wrap
        let totalDurationMs = endDate.getTime() - startDate.getTime();
        if (totalDurationMs < 0) {
            // Add 24 hours to end date
            endDate.setDate(endDate.getDate() + 1);
            totalDurationMs = endDate.getTime() - startDate.getTime();
        }

        const dates = [];

        if (photoCount === 1) {
            dates.push(new Date(startDate));
            return dates;
        }

        if (mode === 'linear') {
            const stepMs = totalDurationMs / (photoCount - 1);
            for (let i = 0; i < photoCount; i++) {
                const imgTimeMs = startDate.getTime() + (i * stepMs);
                dates.push(new Date(imgTimeMs));
            }
        } else if (mode === 'step') {
            const stepMs = stepSeconds * 1000;
            for (let i = 0; i < photoCount; i++) {
                const imgTimeMs = startDate.getTime() + (i * stepMs);
                dates.push(new Date(imgTimeMs));
            }
        }

        return dates;
    }

    /**
     * Format a Date object into a target format string.
     * Supported formats:
     * - "DD/MM/YYYY HH:mm" (Exact match for reference image: 30/07/2026 10:44)
     * - "DD/MM/YYYY HH:mm:ss"
     * - "YYYY-MM-DD HH:mm"
     * - "MM/DD/YYYY hh:mm A"
     * - "DD MMM YYYY HH:mm"
     * - "HH:mm"
     */
    function formatDateTime(dateObj, formatPattern) {
        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            return '';
        }

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthShort = monthNamesShort[dateObj.getMonth()];

        const hours24 = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');

        let hours12Num = dateObj.getHours() % 12;
        if (hours12Num === 0) hours12Num = 12;
        const hours12 = String(hours12Num).padStart(2, '0');
        const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

        switch (formatPattern) {
            case 'DD/MM/YYYY HH:mm':
                return `${day}/${month}/${year} ${hours24}:${minutes}`;
            case 'DD/MM/YYYY HH:mm:ss':
                return `${day}/${month}/${year} ${hours24}:${minutes}:${seconds}`;
            case 'YYYY-MM-DD HH:mm':
                return `${year}-${month}-${day} ${hours24}:${minutes}`;
            case 'MM/DD/YYYY hh:mm A':
                return `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`;
            case 'DD MMM YYYY HH:mm':
                return `${day} ${monthShort} ${year} ${hours24}:${minutes}`;
            case 'HH:mm':
                return `${hours24}:${minutes}`;
            default:
                return `${day}/${month}/${year} ${hours24}:${minutes}`;
        }
    }

    /**
     * Get summary text for duration and step interval
     */
    function getSummaryStats(baseDate, startTime, endTime, photoCount) {
        const startDate = parseDateTime(baseDate, startTime);
        const endDate = parseDateTime(baseDate, endTime);
        
        let diffMs = endDate.getTime() - startDate.getTime();
        if (diffMs < 0) diffMs += 24 * 3600 * 1000;

        const totalMinutes = Math.floor(diffMs / 60000);
        const totalSeconds = Math.floor(diffMs / 1000);

        let durationStr = `${totalMinutes} mins`;
        if (totalMinutes >= 60) {
            const hrs = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            durationStr = `${hrs}h ${mins}m`;
        }

        let intervalStr = '--';
        if (photoCount > 1) {
            const secPerPhoto = totalSeconds / (photoCount - 1);
            if (secPerPhoto >= 60) {
                const mins = (secPerPhoto / 60).toFixed(1);
                intervalStr = `~${mins} min/photo`;
            } else {
                intervalStr = `~${secPerPhoto.toFixed(1)}s/photo`;
            }
        }

        return {
            durationText: durationStr,
            intervalText: intervalStr
        };
    }

    return {
        calculateTimestamps,
        formatDateTime,
        getSummaryStats
    };
})();
