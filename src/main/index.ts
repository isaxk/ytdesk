import { electronApp, optimizer } from "@electron-toolkit/utils";
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  nativeTheme,
} from "electron";
import { factory } from "electron-json-config";
import { discordClient } from "./intergrations/discord";
import { initPlayerEvents } from "./player";
import { createTabManager } from "./tabs";
import { createMainWindowManager, MainWindowManager } from "./windows";

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
  let discord = discordClient();

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
    "force-cinema": false,
    "miniplayer-on-top": false,
    "playback-bind": "Ctrl+Alt+Space",
    "next-bind": "Ctrl+Alt+Right",
    "previous-bind": "Ctrl+Alt+Left",
    "music-css": JSON.stringify({
      enabled: false,
      type: "url",
      url: "",
      css: "",
    }),
    "yt-css": JSON.stringify({
      enabled: false,
      type: "url",
      url: "",
      css: "",
    })
  };

  ipcMain.handle("get-config", (_, key: string) => {
    if (key) {
      return store.get(key, defaults[key]);
    } else {
      return store.all();
    }
  });

  let shortcuts = [
    {
      key: "playback-bind",
      handler: () => {
        if (tabsManager.getTabs()[0]) {
          tabsManager
            .getTabs()[0]
            .view.webContents.send("remoteControl:execute", "playPause");
        }
      },
    },
    {
      key: "next-bind",
      handler: () => {
        if (tabsManager.getTabs()[0]) {
          tabsManager
            .getTabs()[0]
            .view.webContents.send("remoteControl:execute", "next");
        }
      },
    },
    {
      key: "previous-bind",
      handler: () => {
        if (tabsManager.getTabs()[0]) {
          tabsManager
            .getTabs()[0]
            .view.webContents.send("remoteControl:execute", "previous");
        }
      },
    },
  ];

  function registerShortcuts() {
    globalShortcut.unregisterAll();
    shortcuts.forEach((bind) => {
      if (store.get(bind.key, defaults[bind.key])! !== "Unbound") {
        globalShortcut.register(
          store.get(bind.key, defaults[bind.key])!,
          () => {
            console.log(bind.key, "executed");
            bind.handler();
          },
        );
      }
    });
  }

  ipcMain.on("set-config", (_, e) => {
    store.set(e.key, e.value);
    console.log("Config set:", e.key, e.value)

    mainWindowManager.applyTheme();

    if (e.key === "discord-rpc") {
      if (e.value === false) {
        discord.clear();
      } else {
        discord.enable();
      }
    }

    if (e.key === "miniplayer-on-top" && mainWindowManager.miniPlayerOpen()) {
      mainWindowManager.window.setAlwaysOnTop(
        store.get("miniplayer-on-top") == true,
      );
    }

    if (e.key === "music-css" || e.key === "yt-css") {
      tabsManager.updateCustomCss();
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
