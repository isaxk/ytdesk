import { app, shell, BrowserWindow, ipcMain, WebContentsView } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'


import { ElectronBlocker } from '@cliqz/adblocker-electron';

import { Client } from "@xhayper/discord-rpc";

function youtubeParser(url): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}


async function createWindow(): Promise<void> {
  const client = new Client({
    clientId: "1265008196876242944"
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#121212",
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    }
  })

  let rpcEnabled: boolean = true;

  client.on("ready", updateDiscord);


  ipcMain.on('disable-rpc', () => {
    console.log('RPC disabled');
    client.user?.clearActivity();
    rpcEnabled = false;
  })
  ipcMain.on('enable-rpc', async () => {
    console.log('RPC enabled');
    if (!client.isConnected) await client.login();
    rpcEnabled = true;
    updateDiscord();
  })

  app.on('before-quit', (): void => {
    if (client.isConnected) {
      client.user?.clearActivity();
      client.destroy();
    }

  });

  const blocker = await ElectronBlocker.fromLists(fetch, [
    'https://easylist.to/easylist/easylist.txt',
    'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2024.txt',
    'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/quick-fixes.txt'
  ]);




  const headerHeight: number = 37;

  const ytframe = new WebContentsView();
  blocker.enableBlockingInSession(ytframe.webContents.session);
  ytframe.webContents.loadURL('https://www.youtube.com/');

  async function updateDiscord(): Promise<void> {
    if (!ytframe) return;
    const ytAPIKEY = "AIzaSyBaUEQ9dnGj3XVMpqZOVn5H6A66JtKfsJ8";
    const vidid = await youtubeParser(ytframe.webContents.getURL());
    const startTimestamp = Date.now();
    if (client.isConnected && rpcEnabled) {
      if (vidid) {
        const dataRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vidid}&key=${ytAPIKEY}`);
        // const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${vidid}&part=contentDetails&key=${ytAPIKEY}`)
        const data = await dataRes.json();
        // const details = await detailsRes.json();
        client.user?.setActivity({
          details: data.items[0].snippet.title,
          state: data.items[0].snippet.channelTitle,
          startTimestamp,
          largeImageKey: data.items[0].snippet.thumbnails.high.url,
          smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
          buttons: [
            {
              label: "Watch on YouTube",
              url: "https://youtu.be/" + vidid
            }
          ]
        });
      }
      else {
        client.user?.setActivity({
          details: "Browsing",
          largeImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
        })
      }
    }
    else {
      client.user?.clearActivity();
    }
  }

  ytframe.webContents.on("did-navigate-in-page", () => {
    mainWindow.webContents.send("navigate", ytframe.webContents.getURL());
    updateDiscord();
  })
  ytframe.webContents.on("did-navigate", () => {
    mainWindow.webContents.send("navigate", ytframe.webContents.getURL());
    updateDiscord();
  })

  ipcMain.on("back", () => ytframe.webContents.goBack());
  ipcMain.on("refresh", () => ytframe.webContents.reload());

  ytframe.setBounds({ x: 0, y: headerHeight, width: 0, height: 0 })


  mainWindow.on("resize", () => {
    ytframe.setBounds({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - headerHeight });
  })

  mainWindow.on("ready-to-show", ()=>{
    setTimeout(()=>mainWindow.show(),1000);
  })

  ytframe.webContents.on("did-finish-load", () => {
    ytframe.setBounds({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - headerHeight })
  })

  mainWindow.on("ready-to-show", ()=>{
    mainWindow.contentView.addChildView(ytframe);
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

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
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
