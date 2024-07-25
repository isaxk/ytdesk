import { app, shell, BrowserWindow, ipcMain, WebContentsView, session } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset"


import { ElectronBlocker, f } from "@cliqz/adblocker-electron";

import { Client } from "@xhayper/discord-rpc";

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

function createYoutubeFrame(blocker: ElectronBlocker) {
  const ytframe = new WebContentsView(
    {
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        preload: join(__dirname, "../preload/ytview.js")
      }
    }
  );
  // blocker.enableBlockingInSession(ytframe.webContents.session);
  ytframe.webContents.loadURL("https://www.youtube.com");

  return ytframe;
}

function createMusicFrame(blocker: ElectronBlocker) {

  const musicframe = new WebContentsView({
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      preload: join(__dirname, "../preload/musicview.js")
    },
  })
  blocker.enableBlockingInSession(musicframe.webContents.session);
  musicframe.webContents.loadURL("https://music.youtube.com");

  return musicframe;
}

async function createDiscordClient(this: any, clientId: string) {
  const client = new Client({
    clientId
  });

  client.login();

  let disabled = false;
  return {
    setBrowsing: () => {
      if (disabled) return;
      client.user?.setActivity({
        details: "Browsing"
      })
    },
    setVideo: async (vidUrl: string) => {
      if (disabled || !client.isConnected) return;
      const vidid = await youtubeParser(vidUrl);
      if (!vidid) return;
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
    setMusic: async (title: string, author: string, thumbnail: any, id: string) => {
      if (disabled || !client.isConnected) return;
      client.user?.setActivity({
        details: title,
        state: author,
        largeImageKey: thumbnail.thumbnails[3].url,
        smallImageKey: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/1024px-Youtube_Music_icon.svg.png?20230802004652",
        buttons: [
          {
            label: "Listen on YT Music",
            url: "https://music.youtube.com/watch?v=" + id
          }
        ]
      })
    },
    disable: () => {
      disabled = true;
    },
    enable: (vidUrl?: string, musicData?: any) => {
      disabled = false;
      if (vidUrl) {
        this.setVideo(vidUrl);
      }
      else if (musicData) {
        this.setMusic(...musicData);
      }
      else {
        this.setBrowsing();
      }
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
    backgroundColor: "#121212",
    show: false,
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
  electronApp.setAppUserModelId("com.electron")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })


  const blocker = await createBlocker();
  blocker.enableBlockingInSession(session.defaultSession);

  mainWindow = await createWindow();

  ytFrame = await createYoutubeFrame(blocker);
  musicFrame = await createMusicFrame(blocker);

  ytFrame.webContents.toggleDevTools();

  let activeFrame = ytFrame;

  mainWindow.contentView.addChildView(ytFrame);
  mainWindow.contentView.addChildView(musicFrame);

  const discordRPC = await createDiscordClient("1265008196876242944");

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  function setBoundsOnActive(newBounds) {
    if (activeFrame === ytFrame) {
      ytFrame.setBounds(newBounds);
    }
    if (activeFrame === musicFrame) {
      musicFrame.setBounds(newBounds);
    }
  }

  let isFullscreen = false;

  mainWindow.on("resize", () => {
    setBoundsOnActive({ x: 0, y: isFullscreen ? 0 : headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - (isFullscreen ? 0 : headerHeight) });
  })

  ytFrame.webContents.on("enter-html-full-screen", () => {
    isFullscreen = true;
    setBoundsOnActive({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
    mainWindow.webContents.send("enter-full-screen");
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

  ytFrame.webContents.on("did-navigate-in-page", () => {
    const url = ytFrame.webContents.getURL();
    discordRPC.setVideo(url);
    mainWindow.webContents.send("navigate", url);
  })
  musicFrame.webContents.on("did-navigate-in-page", () => {
    const url = musicFrame.webContents.getURL();
    mainWindow.webContents.send("navigate", url);
  })
  ipcMain.on('ytmView:videoDataChanged', (_, data) => {
    discordRPC.setMusic(data.title, data.author, data.thumbnail, data.videoId);
  })
  ipcMain.on('ytmView:videoStateChanged', (_, state) => {
    ytmState = state;
  })


  ipcMain.on("window-control", handleWindowControl);
  ipcMain.on("nav", (_, to) => {
    if (!mainWindow.isDestroyed()) {
      if (to === "yt") {
        if (ytmState === 1) {
          musicFrame.webContents.send("remoteControl:execute", "pause");
        }
        mainWindow.webContents.send("navigate", ytFrame.webContents.getURL());
        activeFrame = switchView(mainWindow, musicFrame, ytFrame);

      }
      else if (to === "music") {
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
