const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

let mainWindow;
const server = express();
const PORT = 4269;

// Determine the correct app directory
const isPackaged = app.isPackaged;
const appDirectory = isPackaged ? path.dirname(process.execPath) : app.getAppPath(); // Fixes incorrect path

// Path to expressConfig.json
const configPath = path.join(appDirectory, 'expressConfig.json');

// Default settings
let config = {
    serveFolder: 'serve' // Default folder name
};

// Enable Hot Reloading in Development Mode
if (!app.isPackaged) {
    const electronPath = process.execPath; 
    require('electron-reload')(appDirectory, {
        electron: electronPath,
        awaitWriteFinish: true
    });
}

// Load configuration if available
if (fs.existsSync(configPath)) {
    try {
        const rawConfig = fs.readFileSync(configPath);
        const parsedConfig = JSON.parse(rawConfig);
        config = { ...config, ...parsedConfig }; // Merge defaults with user-defined values
    } catch (error) {
        console.warn("Error reading expressConfig.json:", error);
    }
}

// Resolve full path to the serve folder
const serveFolderPath = path.join(appDirectory, config.serveFolder);

// Ensure the serve folder exists
if (!fs.existsSync(serveFolderPath)) {
    fs.mkdirSync(serveFolderPath, { recursive: true });
    console.log(`Created missing serve folder: ${serveFolderPath}`);
}

// ✅ Enable livereload BEFORE Express starts
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(serveFolderPath);

// ✅ Inject livereload script into the frontend
server.use(connectLivereload());

// Serve static files from the configured folder
server.use(express.static(serveFolderPath));

// Start the Express server
let httpServer = server.listen(PORT, () => {
    console.log(`🔥 Serving files from: ${serveFolderPath}`);
    console.log(`🌍 Server running at http://localhost:${PORT}`);
});

// ✅ Watch for changes in the serve folder and restart Express
chokidar.watch(serveFolderPath, { ignoreInitial: true }).on('all', () => {
    console.log("🔄 Changes detected in serve folder, restarting Express server...");

    httpServer.close(() => {
        httpServer = server.listen(PORT, () => {
            console.log(`🚀 Restarted server: Serving from ${serveFolderPath}`);
            if (mainWindow) {
                mainWindow.webContents.reload(); // 🔥 Force browser refresh
            }
        });
    });
});

app.whenReady().then(() => {
    const iconPath = path.join(__dirname, 'assets', 'icon.png'); // Use PNG in development

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: iconPath,  // Set the app icon
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            experimentalFeatures: true,
            enableWebGL: true,
            autoplayPolicy: 'no-user-gesture-required',
            devTools: true
        }
    });

    // Load the served website
    mainWindow.loadURL(`http://localhost:${PORT}`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

// Stop the server when Electron quits
app.on('window-all-closed', () => {
    if (httpServer) {
        httpServer.close();
    }
    if (process.platform !== 'darwin') app.quit();
});

// ✅ Reload the Electron window when files change
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});
