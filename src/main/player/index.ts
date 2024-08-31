import { ipcMain } from "electron";
import { MainWindowManager } from "../windows";
import { discordClient } from "../intergrations/discord";
import { factory } from "electron-json-config";
import { musicDataType, playerState, videoDataType } from "../utils/types";

let musicData: musicDataType | null = null;
let videoData: videoDataType | null = null;
let videoState: playerState = playerState.Unstarted;
let volume: number = 0;

const store = factory();

export function initPlayerEvents(mainWindowManager: MainWindowManager) {
  let discord = discordClient();

  ipcMain.on("ytmView:videoDataChanged", (_, data) => {
    musicData = data;
    mainWindowManager.window.webContents.send("video-data-changed", data);
    if (data !== null && store.get("discord-rpc") === true) {
      discord.setMusic(
        data.title,
        data.author,
        data.thumbnail.thumbnails[2].url,
      );
    } else {
      discord.clear();
    }
  });

  mainWindowManager.window.webContents.send("video-data-changed", null);

  ipcMain.on("ytmView:storeStateChanged", (_, _queue, _like, v) => {
    volume = v;
    mainWindowManager.window.webContents.send("volume-changed", v);
  });

  ipcMain.on("ytmView:videoStateChanged", (_, data: playerState) => {
    videoState = data;
    console.log(data);
    mainWindowManager.window.webContents.send("video-state-changed", data);
  });

  ipcMain.handle("get-video-data", () => {
    return musicData;
  });

  ipcMain.handle("get-video-state", () => {
    return videoState;
  });

  ipcMain.handle("get-volume", () => {
    console.log("Volume Requested");
    return volume;
  });

  ipcMain.on("ytmView:videoProgressChanged", (_, data: number) => {
    mainWindowManager.window.webContents.send("video-progress-changed", data);
  });

  ipcMain.on("ytView:videoDataChanged", (_, data: videoDataType) => {
    console.log(data);
    videoData = data;
    if (data !== null && store.get("discord-rpc") === true) {
      discord.setVideo(data.video_id, data.title, data.author);
    } else {
      discord.clear();
    }
  });
}

function getMusicData(): {
  data: musicDataType | null;
  state: playerState;
} {
  return {
    data: musicData,
    state: videoState,
  };
}

function getVideoData(): videoDataType | null {
  return videoData;
}

export function playerManager() {
  return {
    getData: () => {
      return {
        music: getMusicData(),
        video: getVideoData(),
      };
    },
  };
}
