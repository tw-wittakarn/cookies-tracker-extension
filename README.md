# Cookie Tracker Chrome Extension

A Chrome extension that allows you to track specific cookies across websites. Add cookie names once, and the extension will show their values whenever you visit any website.

## Features

- **Add Cookie Names**: Input specific cookie names you want to track
- **Persistent Storage**: Your tracked cookie names are saved and persist across browser sessions
- **Real-time Values**: Shows current values of tracked cookies for the active website
- **Visual Status**: Clear indication whether a tracked cookie exists on the current domain
- **Copy Values**: One-click copy cookie values to clipboard for found cookies
- **Easy Management**: Remove cookies from tracking with one click

## How to Install

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" button
4. Select this folder containing the extension files
5. The extension will appear in your Chrome toolbar

## How to Use

1. Click the extension icon in your Chrome toolbar
2. In the "Add Cookie to Track" section, enter a cookie name (e.g., `sessionId`, `userId`, `token`)
3. Click "Add" or press Enter
4. The cookie will be saved to your tracking list
5. Navigate to any website - the extension will show the values of your tracked cookies for that domain
6. Cookies found on the current domain show with a green border and their values
7. Cookies not found show with an orange border
8. Click "Copy" to copy a cookie's value to your clipboard (only available for found cookies)
9. Use the "Remove" button to stop tracking a cookie

## Files

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Extension popup interface
- `popup.css` - Styling for the popup interface
- `popup.js` - JavaScript functionality for cookie tracking and storage
- `icons/` - Extension icons in various sizes (16px, 24px, 32px, 48px, 128px)
- `README.md` - This documentation

## Permissions

- `cookies` - Read cookies from websites
- `activeTab` - Access the current active tab
- `storage` - Store your tracked cookie names
- `<all_urls>` - Access cookies from any website

## Technical Details

- Uses Chrome Extension Manifest V3
- Stores tracked cookie names using `chrome.storage.sync` (syncs across devices)
- Retrieves cookies using `chrome.cookies.getAll()`
- Works on all HTTP/HTTPS websites