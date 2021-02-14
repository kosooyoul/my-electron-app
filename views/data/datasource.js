const ipcRenderer = require("electron").ipcRenderer

window.DataSource = new (function() {
  var generateCallbackChannelName = function() {
    return "CBCH-" + Date.now() + "-" + String(Math.random()).substr(2, 8);
  };

  this.getDatabases = function(callback) {
    const callbackChannel = generateCallbackChannelName();

    ipcRenderer.once(callbackChannel, (_event, data) => {
      console.log("[ipcRenderer] on(" + callbackChannel + ")");

      callback(data);
    });

    ipcRenderer.send("databases", {
      "callbackChannel": callbackChannel
    });
  };

  this.getCollections = function(databaseName, callback) {
    const callbackChannel = generateCallbackChannelName();

    ipcRenderer.once(callbackChannel, (_event, data) => {
      console.log("[ipcRenderer] on(" + callbackChannel + ")");

      callback(data);
    });

    ipcRenderer.send("collections", {
      "callbackChannel": callbackChannel,
      "databaseName": databaseName
    });
  };
})();