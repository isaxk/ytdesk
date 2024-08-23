import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  nativeTheme,
} from "electron";
import { join } from "path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { createTabManager } from "./tabs";
import { factory } from "electron-json-config";
import { clearActivity, initDiscordClient, setMusic } from "./discord";
import { sleep } from "./utils";

const store = factory();

let bgColor = "#fff";
let lightBg = "#fff";
let darkBg = "#121212";

function updateTheme(mainWindow: BrowserWindow) {
  if (store.get("theme") === "light") {
    bgColor = lightBg;
    mainWindow.webContents.send("update-theme", "light");
  } else if (store.get("theme") === "dark") {
    bgColor = darkBg;
    mainWindow.webContents.send("update-theme", "dark");
  } else {
    bgColor = nativeTheme.shouldUseDarkColors ? darkBg : lightBg;
    mainWindow.webContents.send(
      "update-theme",
      nativeTheme.shouldUseDarkColors ? "dark" : "light",
    );
  }
}

switch (store.get("theme")) {
  case "system":
    bgColor = nativeTheme.shouldUseDarkColors ? darkBg : lightBg;
    break;
  case "light":
    bgColor = lightBg;
    break;
  case "dark":
    bgColor = darkBg;
    break;
}

let mainWindow: BrowserWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 700,
    width: 1200,
    height: 700,
    titleBarStyle: "hiddenInset",
    frame: false,
    trafficLightPosition: {
      x: 15,
      y: 12,
    },
    backgroundColor: bgColor,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, "../preload/main.mjs"),
      sandbox: false,
    },
  });

  mainWindow.webContents.on("did-finish-load", () => {
    createTabManager(mainWindow);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// function createSettingsWindow() {
// 	const win = new BrowserWindow({
// 		width: 600,
// 		minWidth: 600,
// 		height: 400,
// 		minHeight: 400,
// 		frame: false,
// 		titleBarStyle: 'hiddenInset',
// 		backgroundColor: bgColor,
// 		show: false,
// 		trafficLightPosition: {
// 			x: 10,
// 			y: 10
// 		},
// 		minimizable: false,
// 		maximizable: false,
// 		fullscreenable: false,
// 		resizable: false,
// 		webPreferences: {
// 			sandbox: false,
// 			preload: join(__dirname, '../preload/main.js')
// 		}
// 	});
// 	win.webContents.on('dom-ready', () => {
// 		win.webContents.send('push-spa', '/settings');
// 	});
// 	win.webContents.on('did-finish-load', () => {
// 		win.show();
// 	});

// 	if (!is.dev) {
// 		loadVite(win, 'settings/');
// 	} else {
// 		win.loadURL('app://-/settings');
// 	}
// 	console.log(win.webContents.getURL());

// 	return win;
// }



function handleWindowAction(event, message) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  switch (message) {
    case "minimize":
      win?.minimize();
      break;
    case "maximize":
      if (win?.isMaximized()) {
        win?.unmaximize();
      } else {
        win?.maximize();
      }

      break;
    case "close":
      win?.close();
      break;
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();
  initDiscordClient();
  mainWindow.webContents.on("did-finish-load", () => {
    updateTheme(mainWindow);
  });

  let videoData: null | any = null;
  let videoState = 0;
  let volume = 0;

  let oldPos: number[];
  let miniPlayerOpen = false;

  ipcMain.on("open-miniplayer", async () => {
    miniPlayerOpen = true;
    mainWindow.setMaximizable(false);
    mainWindow.setFullScreenable(false);
    oldPos = mainWindow.getPosition();
    console.log(oldPos);
    await sleep(50);
    mainWindow.setMinimumSize(300, 300);
    mainWindow.setSize(300, 300, true);
    mainWindow.setMaximumSize(300, 300);
    if (store.get("miniplayer-on-top") === true) {
      mainWindow.setAlwaysOnTop(true);
    } else {
      mainWindow.setAlwaysOnTop(false);
    }
  });

  ipcMain.on("close-miniplayer", () => {
    miniPlayerOpen = true;
    mainWindow.setMinimumSize(1200, 700);
    mainWindow.setMaximumSize(100000, 100000);
    mainWindow.setPosition(oldPos[0], oldPos[1], true);
    mainWindow.setSize(1000, 700, true);
    mainWindow.setResizable(true);
    mainWindow.setMaximizable(true);
    mainWindow.setFullScreenable(true);
    mainWindow.setAlwaysOnTop(false);
  });

  var isAppQuitting = false;
  app.on("before-quit", () => {
    isAppQuitting = true;
  });

  mainWindow.on("close", (e) => {
    if (!isAppQuitting && process.platform === "darwin") {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // ipcMain.on('music-remote', (_, command, value) => {
  //   // view.webContents.send("remoteControl:execute", command, value);
  // })

  ipcMain.on("window-action", handleWindowAction);

  const defaults = {
    theme: "system",
    "open-at-login": false,
    "ad-blocking": false,
    "discord-rpc": false,
    "studio-tab": false,
    "miniplayer-on-top": false,
  };

  ipcMain.handle("get-config", (_, key: string) => {
    if (key) {
      return store.get(key, defaults[key]);
    } else {
      return store.all();
    }
  });

  ipcMain.on("set-config", (_, e) => {
    store.set(e.key, e.value);
    updateTheme(mainWindow);
    if (e.key === "discord-rpc") {
      if (e.value === false) {
        clearActivity();
      } else if (videoData !== null) {
        setMusic(
          videoData.title,
          videoData.author,
          videoData.thumbnail.thumbnails[0].url,
        );
      }
    }
    if (e.key === "miniplayer-on-top" && miniPlayerOpen) {
      mainWindow.setAlwaysOnTop(store.get("miniplayer-on-top") == true);
    }
  });

  ipcMain.handle("get-theme", () => {
    return store.get("theme") !== "system"
      ? store.get("theme")
      : nativeTheme.shouldUseDarkColors
        ? "dark"
        : "light";
  });

  ipcMain.on("ytmView:videoDataChanged", (_, data) => {
    videoData = data;
    mainWindow.webContents.send("video-data-changed", data);
  });

  ipcMain.on("ytmView:storeStateChanged", (_, _queue, _like, v) => {
    volume = v;
    mainWindow.webContents.send("volume-changed", v);
  });

  ipcMain.on("ytmView:videoStateChanged", (_, data) => {
    videoState = data;
    console.log(data);
    mainWindow.webContents.send("video-state-changed", data);
  });

  ipcMain.handle("get-video-data", () => {
    return videoData;
  });

  ipcMain.handle("get-video-state", () => {
    return videoState;
  });

  ipcMain.handle("get-volume", () => {
    console.log("Volume Requested");
    return volume;
  });

  ipcMain.on("ytmView:videoProgressChanged", (_, data) => {
    mainWindow.webContents.send("video-progress-changed", data);
  });

  nativeTheme.addListener("updated", () => {
    updateTheme(mainWindow);
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
