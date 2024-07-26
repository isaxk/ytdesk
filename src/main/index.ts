import { app, shell, BrowserWindow, ipcMain, WebContentsView, session, nativeTheme, Menu } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset";
import { factory } from 'electron-json-config';
import { hexToCSSFilter } from 'hex-to-css-filter';

import { ElectronBlocker, f } from "@cliqz/adblocker-electron";

import { Client } from "@xhayper/discord-rpc";

const config = factory();

function youtubeParser(url): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

function adjust(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
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

  const disable = () => {
    client.user?.clearActivity();
    disabled = true;
  }
  const enable = () => {
    disabled = false;
  }


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
    enable,
    disable,
    toggle: () => {
      if (disabled) enable();
      else disable();
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

const isMac = process.platform === "darwin";

app.whenReady().then(async () => {
  const template: Array<Electron.MenuItem | Electron.MenuItemConstructorOptions> = [
    isMac ? {
      label: "YTDesk",
      submenu: [
        {
          label: "Settings",
          accelerator: "Cmd+,",
          click: () => {
            isSettings = true;
            mainWindow.webContents.send("open-settings");
          }
        },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { type: "separator" },
        { role: "quit" }
      ]
    } : {},
    {
      label: "File",
      submenu: [
        { role: "close" },
        { type: "separator" },
        {
          label: "Switch to Youtube",
          accelerator: "Alt+Y",
          click: () => {
            mainWindow.webContents.send("nav", "yt");
          }
        },
        {
          label: "Switch to Music",
          accelerator: "Alt+M",
          click: () => {
            mainWindow.webContents.send("nav", "music");
          }
        }
      ]
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        {
          label: "Go Back",
          click: () => activeFrame.webContents.goBack(),
          accelerator: isMac ? "Cmd+Backspace" : "Control+Backspace"
        },
        {
          label: "Reload",
          click: () => activeFrame.webContents.reload(),
          accelerator: isMac ? "Cmd+R" : "Control+R"
        },
        { type: 'separator' },
        {
          label: "Zoom In",
          click: () => activeFrame.webContents.setZoomFactor(activeFrame.webContents.getZoomFactor() + 0.2),
          accelerator: isMac ? "Cmd+Plus" : "Control+Plus"
        },
        {
          label: "Zoom Out",
          click: () => activeFrame.webContents.setZoomFactor(activeFrame.webContents.getZoomFactor() - 0.2),
          accelerator: isMac ? "Cmd+-" : "Control+-"
        },
        {
          label: "Reset Zoom",
          click: () => activeFrame.webContents.setZoomFactor(1),
          accelerator: isMac ? "Cmd+0" : "Control+0"
        },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ];

  if (!config.get("theme")) {
    config.set("theme", "system");
  }


  electronApp.setAppUserModelId("com.electron")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  let blocker: ElectronBlocker;

  if (config.get("ad-blocking") === true) {
    blocker = await createBlocker();
    blocker.enableBlockingInSession(session.defaultSession);
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu);

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

  function urlIsGoogleAccountsDomain(url: URL): boolean {
    // https://www.google.com/supported_domains
    const supportedDomains = [".google.com", ".google.ad", ".google.ae", ".google.com.af", ".google.com.ag", ".google.al", ".google.am", ".google.co.ao", ".google.com.ar", ".google.as", ".google.at", ".google.com.au", ".google.az", ".google.ba", ".google.com.bd", ".google.be", ".google.bf", ".google.bg", ".google.com.bh", ".google.bi", ".google.bj", ".google.com.bn", ".google.com.bo", ".google.com.br", ".google.bs", ".google.bt", ".google.co.bw", ".google.by", ".google.com.bz", ".google.ca", ".google.cd", ".google.cf", ".google.cg", ".google.ch", ".google.ci", ".google.co.ck", ".google.cl", ".google.cm", ".google.cn", ".google.com.co", ".google.co.cr", ".google.com.cu", ".google.cv", ".google.com.cy", ".google.cz", ".google.de", ".google.dj", ".google.dk", ".google.dm", ".google.com.do", ".google.dz", ".google.com.ec", ".google.ee", ".google.com.eg", ".google.es", ".google.com.et", ".google.fi", ".google.com.fj", ".google.fm", ".google.fr", ".google.ga", ".google.ge", ".google.gg", ".google.com.gh", ".google.com.gi", ".google.gl", ".google.gm", ".google.gr", ".google.com.gt", ".google.gy", ".google.com.hk", ".google.hn", ".google.hr", ".google.ht", ".google.hu", ".google.co.id", ".google.ie", ".google.co.il", ".google.im", ".google.co.in", ".google.iq", ".google.is", ".google.it", ".google.je", ".google.com.jm", ".google.jo", ".google.co.jp", ".google.co.ke", ".google.com.kh", ".google.ki", ".google.kg", ".google.co.kr", ".google.com.kw", ".google.kz", ".google.la", ".google.com.lb", ".google.li", ".google.lk", ".google.co.ls", ".google.lt", ".google.lu", ".google.lv", ".google.com.ly", ".google.co.ma", ".google.md", ".google.me", ".google.mg", ".google.mk", ".google.ml", ".google.com.mm", ".google.mn", ".google.com.mt", ".google.mu", ".google.mv", ".google.mw", ".google.com.mx", ".google.com.my", ".google.co.mz", ".google.com.na", ".google.com.ng", ".google.com.ni", ".google.ne", ".google.nl", ".google.no", ".google.com.np", ".google.nr", ".google.nu", ".google.co.nz", ".google.com.om", ".google.com.pa", ".google.com.pe", ".google.com.pg", ".google.com.ph", ".google.com.pk", ".google.pl", ".google.pn", ".google.com.pr", ".google.ps", ".google.pt", ".google.com.py", ".google.com.qa", ".google.ro", ".google.ru", ".google.rw", ".google.com.sa", ".google.com.sb", ".google.sc", ".google.se", ".google.com.sg", ".google.sh", ".google.si", ".google.sk", ".google.com.sl", ".google.sn", ".google.so", ".google.sm", ".google.sr", ".google.st", ".google.com.sv", ".google.td", ".google.tg", ".google.co.th", ".google.com.tj", ".google.tl", ".google.tm", ".google.tn", ".google.to", ".google.com.tr", ".google.tt", ".google.com.tw", ".google.co.tz", ".google.com.ua", ".google.co.ug", ".google.co.uk", ".google.com.uy", ".google.co.uz", ".google.com.vc", ".google.co.ve", ".google.co.vi", ".google.com.vn", ".google.vu", ".google.ws", ".google.rs", ".google.co.za", ".google.co.zm", ".google.co.zw", ".google.cat"];
    const domain = url.hostname.split("accounts")[1];
    if (supportedDomains.includes(domain)) return true;
    return false;
  }

  function isPreventedNavOrRedirect(url: URL): boolean {
    return (
      url.hostname !== "consent.youtube.com" &&
      url.hostname !== "accounts.youtube.com" &&
      url.hostname !== "music.youtube.com" &&
      !(
        (url.hostname === "www.youtube.com" || url.hostname === "youtube.com")
      ) &&
      !urlIsGoogleAccountsDomain(url)
    );
  }

  function handleNavigate(event, reqUrl) {
    let url = new URL(reqUrl);
    if (isPreventedNavOrRedirect(url)) {
      event.preventDefault();
      shell.openExternal(reqUrl);
    }
  }

  function windowOpenHandler(url): { action: string } {
    shell.openExternal(url);
    return {
      action: "deny"
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
    updateAccentColor();
    if (isLoaded) return;
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

  ytFrame.webContents.on("will-navigate", handleNavigate);
  musicFrame.webContents.on("will-navigate", handleNavigate);

  ytFrame.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return {
      action: "deny"
    }
  });
  musicFrame.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return {
      action: "deny"
    }
  });

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
    updateAccentColor();
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

  ipcMain.handle("is-loaded", () => {
    return isLoaded;
  })

  function updateAccentColor() {
    let color = config.get("yt-accent-color");
    if (!color) return;
    const logoColor = adjust(color, -40);
    const chipColor = adjust(color, -80);
    const progressBarColor = adjust(color, -100);
    ytFrame.webContents.insertCSS(
      `
        #text > a {
          color: ${color} !important;
        }
        #text.ytd-channel-name {
        color: ${color} !important;
        }
          
        path[d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"] {
          fill: ${logoColor} !important;
        }
        .html5-video-player:not(.ytp-color-party) .html5-play-progress,
	      .html5-video-player:not(.ytp-color-party) .ytp-play-progress,
	      .progress-bar-played.ytd-progress-bar-line, .PlayerControlsProgressBarHostProgressBarPlayed /* on shorts*/
	      {
		      background: ${progressBarColor} !important;
	      }
        .html5-scrubber-button:hover, .ytp-chrome-controls .ytp-button[aria-pressed]::after, .ytp-scrubber-button:hover, .html5-video-player:not(.ytp-color-party) .ytp-swatch-background-color, .ytp-swatch-background-color-secondary,
	      .PlayerControlsProgressBarHostProgressBarPlayheadDot /*shorts*/
	      {
		      background: ${progressBarColor} !important;
        }
        .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox {
          background: ${logoColor} !important;
        }
        #author-comment-badge > ytd-author-comment-badge-renderer {

          background: transparent !important;
          padding-left: 0px transparent;
        }
          #text.yt-chip-cloud-chip-renderer {
          filter: brightness(70%);
          font-weight: normal !important;
        }
        yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER] {
          background: transparent !important;
        }
        yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER][selected] {
          background-color: #ffffff80 !important;
          color: ${logoColor} !important;
        }
        yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER][selected] #text {
          font-weight: bold !important;
        }
        
      `
    )
  }

  ipcMain.on("update-config", async (_, key, value) => {
    config.set(key, value);
    mainWindow.webContents.send("refresh-config");
    ytFrame.webContents.send("force-cinema", config.get("force-cinema"));
    switch (key) {
      case "force-cinema":
        activeFrame.webContents.reload();
        break;
      case "ad-blocking":
        if (value === false && blocker) {
          blocker.disableBlockingInSession(session.defaultSession);
        }
        else {
          if (!blocker) blocker = await createBlocker();
          blocker.enableBlockingInSession(session.defaultSession);
        }
        activeFrame.webContents.reload();
        break;
    }
  })

  ipcMain.handle("get-all-config", () => {
    return config.all();
  });




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
