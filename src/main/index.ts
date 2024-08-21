import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { createTabManager } from './tabs'
import { factory } from 'electron-json-config'
import { clearActivity, initDiscordClient, setMusic } from './discord'

const store = factory()

let bgColor = '#fff'
let lightBg = '#fff'
let darkBg = '#121212'

function updateTheme(mainWindow: BrowserWindow) {
  if (store.get('theme') === 'light') {
    bgColor = lightBg
    mainWindow.webContents.send('update-theme', 'light')
  } else if (store.get('theme') === 'dark') {
    bgColor = darkBg
    mainWindow.webContents.send('update-theme', 'dark')
  } else {
    bgColor = nativeTheme.shouldUseDarkColors ? darkBg : lightBg
    mainWindow.webContents.send('update-theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
  }
}

switch (store.get('theme')) {
  case 'system':
    bgColor = nativeTheme.shouldUseDarkColors ? darkBg : lightBg
    break
  case 'light':
    bgColor = lightBg
    break
  case 'dark':
    bgColor = darkBg
    break
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 700,
    width: 1200,
    height: 700,
    titleBarStyle: 'hiddenInset',
    frame: false,
    trafficLightPosition: {
      x: 15,
      y: 12
    },
    backgroundColor: bgColor,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/main.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    createTabManager(mainWindow)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function createSettingsWindow() {
  const win = new BrowserWindow({
    width: 600,
    minWidth: 600,
    height: 400,
    minHeight: 400,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: bgColor,
    show: false,
    trafficLightPosition: {
      x: 10,
      y: 10
    },
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, '../preload/main.js')
    }
  })
  win.on('ready-to-show', () => {
    win.show()
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/settings')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {hash: "#/settings"})
  }

  return win
}

function createMiniPlayer(mainWindow: BrowserWindow) {
  const miniplayer = new BrowserWindow({
    width: 300,
    minWidth: 235,
    maxWidth: 450,
    height: 300,
    minHeight: 235,
    maxHeight: 450,
    resizable: true,
    fullscreen: false,
    maximizable: false,
    backgroundColor: bgColor,
    frame: false,
    show: false,
    
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, '../preload/main.js')
    }
  })

  miniplayer.setAspectRatio(1/1);

  miniplayer.setAlwaysOnTop(store.get("miniplayer-on-top")==true);

  miniplayer.on('close', () => {
    miniplayer.hide()
    mainWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    miniplayer.loadURL(process.env['ELECTRON_RENDERER_URL']+"#/miniplayer")
  } else {
    miniplayer.loadFile(join(__dirname, '../renderer/index.html'), {hash: "#/miniplayer"})
  }

  return miniplayer
}

function handleWindowAction(event, message) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)

  switch (message) {
    case 'minimize':
      win?.minimize()
      break
    case 'maximize':
      if (win?.isMaximized()) {
        win?.unmaximize()
      } else {
        win?.maximize()
      }

      break
    case 'close':
      win?.close()
      break
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  let mainWindow = createWindow()
  initDiscordClient()
  mainWindow.webContents.on('did-finish-load', () => {
    updateTheme(mainWindow)
  })
  let settingsWindow: BrowserWindow | null = null
  let miniPlayer: BrowserWindow | null = null

  ipcMain.on('open-settings', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) settingsWindow.show()
    else {
      settingsWindow = createSettingsWindow()
    }
  })

  let videoData: null | any = null
  let videoState = 0
  let volume = 0

  ipcMain.on('open-miniplayer', () => {
    if (miniPlayer && !miniPlayer.isDestroyed()) miniPlayer.show()
    else {
      miniPlayer = createMiniPlayer(mainWindow)
      miniPlayer?.webContents.on('did-finish-load', () => {
        miniPlayer?.show()
        mainWindow.hide()
      })
    }
  })

  ipcMain.on('close-miniplayer', () => {
    if (miniPlayer && !miniPlayer.isDestroyed()) miniPlayer.close()
    mainWindow.show()
  })

  // ipcMain.on('music-remote', (_, command, value) => {
  //   // view.webContents.send("remoteControl:execute", command, value);
  // })

  ipcMain.on('window-action', handleWindowAction)

  const defaults = {
    theme: 'system',
    'open-at-login': false,
    'ad-blocking': false,
    'discord-rpc': false,
    'studio-tab': false,
    'miniplayer-on-top': false
  }

  ipcMain.handle('get-config', (_, key: string) => {
    if (key) {
      return store.get(key, defaults[key])
    } else {
      return store.all()
    }
  })

  ipcMain.on('set-config', (_, e) => {
    store.set(e.key, e.value)
    updateTheme(mainWindow)
    if (settingsWindow) {
      updateTheme(settingsWindow)
    }
    if (e.key === 'discord-rpc') {
      if (e.value === false) {
        clearActivity()
      } else if (videoData !== null) {
        setMusic(videoData.title, videoData.author, videoData.thumbnail.thumbnails[0].url)
      }
    }
    miniPlayer?.setAlwaysOnTop(store.get("miniplayer-on-top")==true);
  })

  ipcMain.handle('get-theme', () => {
    return store.get('theme') !== 'system'
      ? store.get('theme')
      : nativeTheme.shouldUseDarkColors
        ? 'dark'
        : 'light'
  })

  ipcMain.on('ytmView:videoDataChanged', (_, data) => {
    console.log(data)
    videoData = data
    if (miniPlayer && !miniPlayer.isDestroyed()) {
      miniPlayer?.webContents.send('video-data-changed', data)
    }
  })

  ipcMain.on('ytmView:storeStateChanged', (_, _queue, _like, v) => {
    volume = v
    console.log(v)
    if (miniPlayer && !miniPlayer.isDestroyed()) {
      miniPlayer.webContents.send('volume-changed', v)
    }
  })

  ipcMain.on('ytmView:videoStateChanged', (_, data) => {
    videoState = data
    if (miniPlayer && !miniPlayer.isDestroyed()) {
      miniPlayer.webContents.send('video-state-changed', data)
    }
  })

  ipcMain.handle('get-video-data', () => {
    return videoData
  })

  ipcMain.handle('get-video-state', () => {
    return videoState
  })

  ipcMain.handle('get-volume', () => {
    console.log('Volume Requested')
    return volume
  })

  ipcMain.on('ytmView:videoProgressChanged', (_, data) => {
    if (miniPlayer && !miniPlayer.isDestroyed()) {
      miniPlayer.webContents.send('video-progress-changed', data)
    }
  })

  nativeTheme.addListener('updated', () => {
    updateTheme(mainWindow)
    if (settingsWindow) {
      updateTheme(settingsWindow)
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
