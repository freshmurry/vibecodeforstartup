"use strict";
/**
 * Time formatting utilities
 * Provides functions for formatting dates and times in user-friendly formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRelativeTime = formatRelativeTime;
/**
 * Format a date as relative time (e.g., "2 hours ago", "just now")
 */
function formatRelativeTime(date) {
    if (!date)
        return 'Unknown';
    var now = new Date();
    var diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'just now';
    if (diffInSeconds < 3600)
        return "".concat(Math.floor(diffInSeconds / 60), " minutes ago");
    if (diffInSeconds < 86400)
        return "".concat(Math.floor(diffInSeconds / 3600), " hours ago");
    if (diffInSeconds < 604800)
        return "".concat(Math.floor(diffInSeconds / 86400), " days ago");
    if (diffInSeconds < 2592000)
        return "".concat(Math.floor(diffInSeconds / 604800), " weeks ago");
    if (diffInSeconds < 31536000)
        return "".concat(Math.floor(diffInSeconds / 2592000), " months ago");
    return "".concat(Math.floor(diffInSeconds / 31536000), " years ago");
}
