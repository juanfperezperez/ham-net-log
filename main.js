// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, shell} = require('electron')
const path = require('path')
// const fs = require('fs')
// const remote = require('electron').remote
// const dialog = remote.dialog


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  var menu = Menu.buildFromTemplate([
    {
      label:'Menu',
      submenu:[
        {
          label:'QRZ.com',
          click(){shell.openExternal("https://qrz.com")},
          accelerator: 'CmdOrCtrl+Shift+Q'
        },
        {type:'separator'},
        {label:'Export'},
        {type:'separator'},
        {
          label:'Exit',
          click(){
            app.quit()
          }
        }
      ]
    },
    // {
    //   label:"Window",
    //   submenu: [
    //     {
    //       label: "Open Dev Tools",
    //       click(){
    //         mainWindow.webContents.openDevTools()
    //       },
    //       accelerator: "CmdOrCtrl+Shift+I"
    //     }
    //   ]
    // }
  ])
  Menu.setApplicationMenu(menu)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// console.log('yo there')

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.