const { app, BrowserWindow, ipcMain, shell } = require('electron');
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
    serveFolder: 'serve', // Default folder name
    width: 1280,
    height: 720
};

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

// Paths for user website & built-in default site
const serveFolderPath = path.join(appDirectory, config.serveFolder);
const defaultSitePath = path.join(appDirectory, 'defaultSite');

// Ensure the serve folder exists
if (!fs.existsSync(serveFolderPath)) {
    fs.mkdirSync(serveFolderPath, { recursive: true });
    console.log(`📁 Created missing serve folder: ${serveFolderPath}`);
}

// Function to check if `serve/` is empty
function isServeFolderEmpty() {
    return fs.readdirSync(serveFolderPath).length === 0;
}

// Enable livereload BEFORE Express starts
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(serveFolderPath);

// Inject livereload script into the frontend
server.use(connectLivereload());

// Serve files dynamically based on folder content
server.use((req, res, next) => {
    if (isServeFolderEmpty()) {
        express.static(defaultSitePath)(req, res, next); // Serve built-in page
    } else {
        express.static(serveFolderPath)(req, res, next); // Serve user files
    }
});

// Start the Express server
let httpServer = server.listen(PORT, () => {
    console.log(`Serving files from: ${isServeFolderEmpty() ? defaultSitePath : serveFolderPath}`);
    console.log(`Server running at http://localhost:${PORT}`);
});

// Watch for changes in the serve folder and restart Express
chokidar.watch(serveFolderPath, { ignoreInitial: true }).on('all', () => {
    console.log("Changes detected in serve folder, restarting Express server...");

    httpServer.close(() => {
        httpServer = server.listen(PORT, () => {
            console.log(`Restarted server: Serving from ${serveFolderPath}`);
            if (mainWindow) {
                mainWindow.webContents.reload(); // 🔥 Force browser refresh
            }
        });
    });
});

// Send config to renderer
ipcMain.handle("getServeFolder", () => config.serveFolder);
// Handle opening of folder path from renderer
ipcMain.handle("openServeFolder", () => shell.openPath(serveFolderPath));

app.whenReady().then(() => {
    const iconPath = path.join(__dirname, 'assets', 'icon.png'); // Use PNG in development

    mainWindow = new BrowserWindow({
        width: config.width,
        height: config.height,
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

// Reload the Electron window when files change
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

// Enable Hot Reloading in Development Mode
if (!app.isPackaged) {
    const electronPath = process.execPath; 
    require('electron-reload')(appDirectory, {
        electron: electronPath,
        awaitWriteFinish: true
    });
}