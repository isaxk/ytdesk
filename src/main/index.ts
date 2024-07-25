import { app, shell, BrowserWindow, ipcMain, WebContentsView, session, nativeTheme } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset";
import { factory } from 'electron-json-config';

import { ElectronBlocker, f } from "@cliqz/adblocker-electron";

import { Client } from "@xhayper/discord-rpc";
import { Menu } from "lucide-svelte";

const config = factory();

function youtubeParser(url): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

async function createBlocker() {
  const blocker = await ElectronBlocker.fromLists(fetch, [
    "https://easylist.to/easylist/easylist.txt",
    'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2024.txt',
    'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/quick-fixes.txt'
  ]);

  return blocker;
}


const ytAPIKEY = "AIzaSyBaUEQ9dnGj3XVMpqZOVn5H6A66JtKfsJ8";

function createYoutubeFrame() {
  const ytframe = new WebContentsView(
    {
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        preload: join(__dirname, "../preload/ytview.js")
      }
    }
  );
  ytframe.webContents.loadURL("https://www.youtube.com");

  return ytframe;
}

function createMusicFrame() {

  const musicframe = new WebContentsView({
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      preload: join(__dirname, "../preload/musicview.js")
    },
  })
  musicframe.webContents.loadURL("https://music.youtube.com");

  return musicframe;
}

async function createDiscordClient(this: any, clientId: string) {
  const client = new Client({
    clientId
  });

  client.login();

  // client.on("ready", () => {
  //   client.user?.setActivity({
  //     details: "Browsing",
  //     smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
  //   })
  // })

  let disabled = false;

  const setBrowsing = () => {
    if (disabled) return;
    client.user?.setActivity({
      details: "Browsing",
      smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
    })
  };


  return {
    setBrowsing,
    setVideo: async (vidUrl: string) => {
      if (disabled || !client.isConnected) return;
      const vidid = await youtubeParser(vidUrl);
      if (!vidid) { setBrowsing(); return }
      const dataRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vidid}&key=${ytAPIKEY}`);
      const dataJSON = await dataRes.json();
      const data = (await dataJSON.items[0]).snippet;
      client.user?.setActivity({
        details: data.title,
        state: data.channelTitle,
        largeImageKey: data.thumbnails.high.url,
        smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/1200px-YouTube_social_white_square_%282017%29.svg.png",
        buttons: [
          {
            label: "Watch on YouTube",
            url: "https://youtu.be/" + vidid
          }
        ]
      })
    },
    setMusic: async (data) => {
      if (disabled || !client.isConnected) return;
      if (!data) { setBrowsing(); return; }
      client.user?.setActivity({
        details: data.title,
        state: data.author,
        largeImageKey: data.thumbnail.thumbnails[3].url,
        smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/1024px-Youtube_Music_icon.svg.png?20230802004652",
        buttons: [
          {
            label: "Listen on YT Music",
            url: "https://music.youtube.com/watch?v=" + data.id
          }
        ]
      })
    },
    disable: () => {
      client.user?.clearActivity();
      disabled = true;
    },
    enable: () => {
      disabled = false;
    }
  }
}






const headerHeight: number = 37;

let mainWindow: BrowserWindow;
let ytFrame: WebContentsView;
let musicFrame: WebContentsView;
let activeFrame: WebContentsView;


async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 640,
    minHeight: 500,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#171717' : '#fafafa',
    show: true,
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    frame: false,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/mainWindow.js"),
      sandbox: false,
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"))
  }

  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  return win;
}

function handleWindowControl(event, message) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  switch (message) {
    case "minimize": win?.minimize(); break;
    case "maximize":
      if (win?.isMaximized()) {
        win?.unmaximize();
      }
      else {
        win?.maximize();
      }

      break;
    case "close": win?.close(); break;
  }
}

function switchView(win: BrowserWindow, start: WebContentsView, end: WebContentsView) {
  start.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  end.setBounds({ x: 0, y: headerHeight, width: win.getBounds().width, height: win.getBounds().height - headerHeight });

  return end;
}


app.whenReady().then(async () => {
  if(!config.get("theme")) {
    config.set("theme", "system");
  }


  electronApp.setAppUserModelId("com.electron")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })


  if (config.get("ad-blocking") === true) {
    const blocker = await createBlocker();
    blocker.enableBlockingInSession(session.defaultSession);
  }

  mainWindow = await createWindow();

  ytFrame = await createYoutubeFrame();
  musicFrame = await createMusicFrame();

  let activeFrame = ytFrame;

  mainWindow.contentView.addChildView(ytFrame);
  mainWindow.contentView.addChildView(musicFrame);

  const discordRPC = await createDiscordClient("1265008196876242944");

  function setBoundsOnActive(newBounds) {
    if (activeFrame === ytFrame) {
      ytFrame.setBounds(newBounds);
    }
    if (activeFrame === musicFrame) {
      musicFrame.setBounds(newBounds);
    }
  }

  let isFullscreen = false;
  let isLoaded = false;
  let isSettings = false;

  mainWindow.on("resize", () => {
    if (isSettings) return;
    setBoundsOnActive({ x: 0, y: isFullscreen ? 0 : headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - (isFullscreen ? 0 : headerHeight) });
  })

  ytFrame.webContents.on("enter-html-full-screen", () => {
    isFullscreen = true;
    setBoundsOnActive({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
    mainWindow.webContents.send("enter-full-screen");
  });

  ytFrame.webContents.on("did-finish-load", () => {
    if(isLoaded) return;
    isLoaded = true;
    mainWindow.webContents.send("loaded");
    setBoundsOnActive({ x: 0, y: isFullscreen ? 0 : headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - (isFullscreen ? 0 : headerHeight) });
  })

  ytFrame.webContents.on("leave-html-full-screen", () => {
    isFullscreen = false;
    setBoundsOnActive({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - headerHeight });
    mainWindow.webContents.send("leave-full-screen");
  })

  musicFrame.webContents.on("enter-html-full-screen", () => {
    isFullscreen = true;
    setBoundsOnActive({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
    mainWindow.webContents.send("enter-full-screen");
  })

  musicFrame.webContents.on("leave-html-full-screen", () => {
    isFullscreen = false;
    setBoundsOnActive({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - headerHeight });
    mainWindow.webContents.send("leave-full-screen");
  })


  let ytmState = 0;
  let ytmData = null;

  ytFrame.webContents.on("did-navigate-in-page", () => {
    const url = ytFrame.webContents.getURL();
    discordRPC.setVideo(url);
    mainWindow.webContents.send("navigate", url);
  })
  musicFrame.webContents.on("did-navigate-in-page", () => {
    const url = musicFrame.webContents.getURL();
    mainWindow.webContents.send("navigate", url);
  })
  ytFrame.webContents.on("did-navigate", () => {
    const url = ytFrame.webContents.getURL();
    discordRPC.setVideo(url);
    mainWindow.webContents.send("navigate", url);
  })
  musicFrame.webContents.on("did-navigate", () => {
    const url = musicFrame.webContents.getURL();
    mainWindow.webContents.send("navigate", url);
  })
  ipcMain.on('ytmView:videoDataChanged', (_, data) => {
    ytmData = data;
    discordRPC.setMusic(data);
  })
  ipcMain.on('ytmView:videoStateChanged', (_, state) => {
    ytmState = state;
  })
  ipcMain.on("enable-rpc", () => {
    discordRPC.enable();
    if (activeFrame === ytFrame) {
      discordRPC.setVideo(ytFrame.webContents.getURL())
    }
    else {
      discordRPC.setMusic(ytmData);
    }
  });
  ipcMain.on("disable-rpc", () => {
    discordRPC.disable();
  })

  ipcMain.on("open-settings", () => {
    isSettings = true;
    if (activeFrame === ytFrame) {
      ytFrame.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
    else {
      musicFrame.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  });
  ipcMain.on("close-settings", () => {
    isSettings = false;
    setBoundsOnActive({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - headerHeight });
  })


  ipcMain.on("window-control", handleWindowControl);
  ipcMain.on("nav", (_, to) => {
    if (!mainWindow.isDestroyed()) {
      if (to === "yt") {
        if (ytmState === 1) {
          musicFrame.webContents.send("remoteControl:execute", "pause");
        }
        discordRPC.setVideo(ytFrame.webContents.getURL());
        mainWindow.webContents.send("navigate", ytFrame.webContents.getURL());
        if (isLoaded) {
          activeFrame = switchView(mainWindow, musicFrame, ytFrame);
        }


      }
      else if (to === "music") {
        discordRPC.setMusic(ytmData);
        mainWindow.webContents.send("navigate", musicFrame.webContents.getURL());
        ytFrame.webContents.send("player-action", "pause");
        activeFrame = switchView(mainWindow, ytFrame, musicFrame);
      }
    }
  });
  ipcMain.on("page-action", (_, data) => {
    if (data.action === "back") {
      activeFrame.webContents.goBack();
    }
    else if (data.action === "refresh") {
      activeFrame.webContents.reload();
    }
  });

  app.on("before-quit", () => {
    discordRPC.disable();
  });

  ipcMain.on("update-config", (_, key, value) => {
    config.set(key, value);
    mainWindow.webContents.send("refresh-config");
    ytFrame.webContents.send("force-cinema", config.get("force-cinema"));
    if(key==="force-cinema") {
      ytFrame.webContents.reload();
    }
  })

  ipcMain.handle("get-all-config", () => {
    return config.all();
  })



  app.on("activate", function () {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  app.quit()
})



// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
