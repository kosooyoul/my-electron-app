const {
  ipcRenderer
} = require('electron')

document.querySelector("#btn-databases").addEventListener("click", () => {
  ipcRenderer.send("databases", "test-data");
})

document.querySelector("#btn-collections").addEventListener("click", () => {
  ipcRenderer.send("collections", "test-data");
})

document.querySelector("#btn-http-api").addEventListener("click", () => {
  ipcRenderer.send("api", "test-data");
})

document.addEventListener("contextmenu", () => {
  alert("TODO CONTEXT MENU")
})

ipcRenderer.on("result", (_event, data) => {
  console.log("[ipcRenderer] on(result)")

  const inputResult = document.querySelector("#input-result");
  inputResult.textContent = JSON.stringify(data);
})