import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  globalShortcut,
} from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import { createTabManager } from "./tabs";
import { factory } from "electron-json-config";
import { clearActivity, discordClient } from "./discord";
import { createMainWindowManager, MainWindowManager } from "./windows";
import { initPlayerEvents } from "./player";

const store = factory();

let mainWindowManager: MainWindowManager;

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  mainWindowManager = createMainWindowManager();
  initPlayerEvents(mainWindowManager);


  let tabsManager = await createTabManager(mainWindowManager.window);

  mainWindowManager.window.webContents.on("did-finish-load", () => {
    tabsManager.getTabs()[0].view.webContents.on("did-finish-load", () => {
      registerShortcuts();
    });
  });

  const defaults = {
    theme: "system",
    "open-at-login": false,
    "ad-blocking": false,
    "discord-rpc": false,
    "studio-tab": false,
    "miniplayer-on-top": false,
    "playback-bind": "Ctrl+Shift+Space",
    "next-bind": "Ctrl+Shift+Right",
    "previous-bind": "Ctrl+Shift+Left",
  };

  ipcMain.handle("get-config", (_, key: string) => {
    if (key) {
      return store.get(key, defaults[key]);
    } else {
      return store.all();
    }
  });

  function registerShortcuts() {
    globalShortcut.unregisterAll();
    if (store.get("playback-bind", defaults["playback-bind"])! !== "Unbound") {
      globalShortcut.register(
        store.get("playback-bind", defaults["playback-bind"])!,
        () => {
          if (tabsManager.getTabs()[0]) {
            tabsManager
              .getTabs()[0]
              .view.webContents.send("remoteControl:execute", "playPause");
          }
        },
      );
    }
    if (store.get("next-bind", defaults["next-bind"])! !== "Unbound") {
      globalShortcut.register(
        store.get("next-bind", defaults["next-bind"])!,
        () => {
          if (tabsManager.getTabs()[0]) {
            tabsManager
              .getTabs()[0]
              .view.webContents.send("remoteControl:execute", "next");
          }
        },
      );
    }
    if (store.get("previous-bind", defaults["next-bind"])! !== "Unbound") {
      globalShortcut.register(
        store.get("previous-bind", defaults["previous-bind"])!,
        () => {
          if (tabsManager.getTabs()[0]) {
            tabsManager
              .getTabs()[0]
              .view.webContents.send("remoteControl:execute", "previous");
          }
        },
      );
    }
  }

  ipcMain.on("set-config", (_, e) => {
    console.log(e.key, e.value)
    store.set(e.key, e.value);
    mainWindowManager.applyTheme()
    if (e.key === "discord-rpc") {
      if (e.value === false) {
        clearActivity();
      } else {
        discordClient().enable();
      }
    }
    if (e.key === "miniplayer-on-top" && mainWindowManager.miniPlayerOpen()) {
      mainWindowManager.window.setAlwaysOnTop(store.get("miniplayer-on-top") == true);
    }
    if (tabsManager.getTabs().length > 0) {
      registerShortcuts();
    }
  });

  ipcMain.handle("get-theme", () => {
    return store.get("theme") !== "system"
      ? store.get("theme")
      : nativeTheme.shouldUseDarkColors
        ? "dark"
        : "light";
  });

  nativeTheme.addListener("updated", () => {
    mainWindowManager.applyTheme();
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindowManager = createMainWindowManager();
    }
    if (mainWindowManager.window) {
      mainWindowManager.window.show();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
