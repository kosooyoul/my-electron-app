const Menu = require("electron").Menu;

const menuTemplate = [
  {
      label: "TEST",
      submenu: [
        {
          label: "XXX",
          click: function() {
            console.log("PONG");
            // mainWindow.webContents.send("result", {"result": "PONG"})
          }
        }
      ]
  },
  {
      label: 'Edit222',
      submenu: [
          {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'},
          {role: 'cut'},
          {role: 'copy'},
          {role: 'paste'},
          {role: 'pasteandmatchstyle'},
          {role: 'delete'},
          {role: 'selectall'}
      ]
  },
  {
      label: 'View111',
      submenu: [
          {role: 'reload'},
          {role: 'forcereload'},
          {role: 'toggledevtools'},
          {type: 'separator'},
          {role: 'resetzoom'},
          {role: 'zoomin'},
          {role: 'zoomout'},
          {type: 'separator'},
          {role: 'togglefullscreen'}
      ]
  },
  {
      role: 'window',
      submenu: [
          {role: 'minimize'},
          {role: 'close'}
      ]
  }, 
  {
      role: 'help',
      submenu: [
          {
          label: 'Learn Moreascasc',
          click () { require('electron').shell.openExternal('https://electronjs.org') }
          }
      ]
  }
];

const apply = () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
};

const unapply = () => {
  // TODO: How to?
}

module.exports = {
  apply: apply,
  unapply: unapply
};