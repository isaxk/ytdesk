import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron";
import { join } from "path";
import { sleep } from "../utils";
import { factory } from "electron-json-config";
import { playerState } from "../utils/types";
import { playerManager } from "../player";

const store = factory();

let miniPlayerOpen: boolean = false;
let isAppQuitting: boolean = false;
let oldPos: number[] = [];

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
  case "light":
    bgColor = lightBg;
    break;
  case "dark":
    bgColor = darkBg;
    break;
  default:
    bgColor = nativeTheme.shouldUseDarkColors ? darkBg : lightBg;
    break;
}

export type MainWindowManager = {
  window: BrowserWindow;
  applyTheme: Function;
  miniPlayerOpen: Function;
};

app.on("before-quit", () => {
  isAppQuitting = true;
});

export function createMainWindowManager() {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 670,
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

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  ipcMain.on("window-action", handleWindowAction);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

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

  ipcMain.on("close-miniplayer", async () => {
    miniPlayerOpen = true;
    mainWindow.setMaximumSize(100000, 100000);
    mainWindow.setPosition(oldPos[0], oldPos[1], false);
    mainWindow.setSize(1200, 700, false);
    mainWindow.setResizable(true);
    mainWindow.setMaximizable(true);
    mainWindow.setFullScreenable(true);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMinimumSize(800, 670);
  });

  mainWindow.on("close", (e) => {
    if (
      !isAppQuitting &&
      process.platform === "darwin" &&
      playerManager().getData().music.state === playerState.Playing
    ) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    updateTheme(mainWindow);
  });

  return {
    window: mainWindow,
    applyTheme: () => {
      updateTheme(mainWindow);
    },
    miniPlayerOpen: () => {
      return miniPlayerOpen;
    },
  };
}

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
