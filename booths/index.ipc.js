const ipcMain = require("electron").ipcMain;
const dao = require("../gems/dao.js");

const apply = () => {
  ipcMain.on("databases", async (event, data) => {
    console.log("[ipcMain] on(databases)");

    const databases = await dao.getDatabases();

    const returnValue = {
        "success": !!databases,
        "databases": databases
    }

    event.sender.send(data.callbackChannel, returnValue);
  });

  ipcMain.on("collections", async (event, data) => {
    console.log("[ipcMain] on(collections)");

    const collections = await dao.getCollections(data.databaseName);

    const returnValue = {
        "success": !!collections,
        "collections": collections
    }

    event.sender.send(data.callbackChannel, returnValue);
  });
};

const unapply = () => {
  // TODO: How to?
}

module.exports = {
  apply: apply,
  unapply: unapply
};