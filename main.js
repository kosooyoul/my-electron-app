const mongoose = require("mongoose")
const axios = require("axios")
const {
  app,
  ipcMain,
  BrowserWindow
} = require("electron")

const path = require("path")

app.commandLine.appendSwitch("disable-pinch");

const getDisposableMongodb = async (callbackWithMongodb, callbackWithError) => {
  let connection = null;

  try {
    const result = await mongoose.connect("mongodb://localhost:27017/", {
      dbName: "hanulse",
      autoCreate: false
    });
    
    connection = result.connection

    if (connection.readyState != 1) {
      throw new Error("Cannot connect to mongodb")
    }

    if (callbackWithMongodb) {
      await callbackWithMongodb(connection.db);
    }
  } catch (e) {
    if (callbackWithError) {
      await callbackWithError();
    }
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

ipcMain.on("collections", async (event, _data) => {
  console.log("[ipcMain] on(collections)");

  getDisposableMongodb(async (mongodb) => {
    const list = await mongodb.listCollections().toArray();
    
    const filtered = list.filter((c) => c.type == "collection").map((c) => {
      return {
        "name": c.name,
        "type": c.type,
        "uuid": c.info.uuid? c.info.uuid.toJSON(): null,
        "readonly": c.info.readOnly || null
      };
    });

    event.sender.send("result", filtered);
  })
})

ipcMain.on("databases", async (event, _data) => {
  console.log("[ipcMain] on(databases)");

  getDisposableMongodb(async (mongodb) => {
    // Get Database List
    const resultOfDatabases = await mongodb.executeDbAdminCommand({listDatabases: 1})
    if (resultOfDatabases.ok != 1) {
      return event.sender.send("result", [])
    }

    const totalSize = resultOfDatabases.totalSize;
    const list = resultOfDatabases.databases.map(item => {
      return {
        "name": item.name,
        "sizeOnDisk": item.sizeOnDisk,
        "empty": item.empty
      };
    });
    console.log("Database.totalSize: " + totalSize);
    console.log("Database.list: " + JSON.stringify(list));

    event.sender.send("result", list);
  })
})

ipcMain.on("api", async (event, _data) => {
  console.log("[ipcMain] on(api)")
  
  const result = await axios.get("http://www.ahyane.net/backend/wisesaying.php", {
    responseType: "json"
  })

  event.sender.send("result", result.data)
})

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "헬로~",
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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
    icon: path.join(__dirname, "assets/images/icon.ico")
  })

  mainWindow.setMenu(null);
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  // and load the index.html of the app.
  mainWindow.loadFile("index.html")

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on("activate", function () {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
