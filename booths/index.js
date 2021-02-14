const BrowserWindow = require("electron").BrowserWindow;
const path = require("path");

const indexIpc = require("./index.ipc.js");
const indexMenu = require("./index.menu.js");

const create = () => {
  indexIpc.apply();
  indexMenu.apply();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "헬로~",
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "index.preload.js"),
      // webviewTag: true,
      // allowRunningInsecureContent: true,
      // webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
      // devTools: false,
      fullscreenable: false,
      // sandbox: true
    },
    // allowRunningInsecureContent: true,
    // webSecurity: false,
    contextIsolation: false,
    nodeIntegration: true,
    // devTools: false,
    fullscreenable: false,
    // sandbox: true,  
    icon: path.join(__dirname, "../assets/images/icon.ico")
  })

  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../views/index.html"))

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

module.exports = {
  create: create
};