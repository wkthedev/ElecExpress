const { contextBridge, ipcRenderer, clipboard, shell, Notification } = require('electron');
const fs = require('fs');
const path = require('path');

const appDirectory = process.env.PORTABLE_EXECUTABLE_DIR || process.cwd(); // Ensures correct path in both development & production
const serveFolderPath = path.join(appDirectory, 'serve');

contextBridge.exposeInMainWorld("electronAPI", {
    // 📌 Filesystem API - Read Files
    readFile: (filePath) => {
        try {
            return fs.readFileSync(filePath, "utf8");
        } catch (error) {
            console.error("Error reading file:", error);
            return null;
        }
    },

    // 📌 Clipboard API - Read/Write Clipboard
    clipboard: {
        writeText: (text) => clipboard.writeText(text),
        readText: () => clipboard.readText()
    },

    // 📌 Open External Links in Default Browser
    openExternal: (url) => shell.openExternal(url),

    // 📌 Notifications API - Desktop Notifications
    showNotification: (title, body) => {
        return new Notification({ title, body }).show();
    },

    // 📌 Media Permissions - Check if the user has granted media access
    requestMediaPermissions: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop stream after check
            return true;
        } catch (error) {
            console.error("Media permission denied:", error);
            return false;
        }
    },
    getServeFolder: () => ipcRenderer.invoke("getServeFolder"),
    openServeFolder: () => ipcRenderer.invoke("openServeFolder")
});
