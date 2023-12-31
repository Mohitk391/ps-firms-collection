const path = require("path");

const { app, BrowserWindow } = require("electron");
const isDev = app.isPackaged ? false : require("electron-is-dev");

if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    app.quit();
  }
  
  function handleSquirrelEvent() {
    if (process.argv.length === 1) {
      return false;
    }
  
    const ChildProcess = require('child_process');
    const path = require('path');
  
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
  
    const spawn = function(command, args) {
      let spawnedProcess; 
  
      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {}
  
      return spawnedProcess;
    };
  
    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };
  
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus
  
        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers
  
        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated
  
        app.quit();
        return true;
  
      default:
        
    }
  };
  

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.