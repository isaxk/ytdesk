import { ipcMain } from "electron";
import { MainWindowManager } from "../windows";
import { discordClient } from "../discord";
import { factory } from "electron-json-config";

let musicData: null | any = null;
let videoData: null | any = null;
let videoState = 0;
let volume = 0;

const store = factory();

export function initPlayerEvents(mainWindowManager: MainWindowManager) {
  let discord = discordClient();

  ipcMain.on("ytmView:videoDataChanged", (_, data) => {
    musicData = data;
    mainWindowManager.window.webContents.send("video-data-changed", data);
    if (data !== null && store.get("discord-rpc") === true) {
      discord.setMusic(data.title, data.author, data.thumbnail.thumbnails[2]);
    } else {
      discord.clearActivity();
    }
  });

  ipcMain.on("ytmView:storeStateChanged", (_, _queue, _like, v) => {
    volume = v;
    mainWindowManager.window.webContents.send("volume-changed", v);
  });

  ipcMain.on("ytmView:videoStateChanged", (_, data) => {
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

  ipcMain.on("ytmView:videoProgressChanged", (_, data) => {
    mainWindowManager.window.webContents.send("video-progress-changed", data);
  });

  ipcMain.on("ytView:videoDataChanged", (_, data) => {
    videoData = data;
    if (data!==null && store.get("discord-rpc")===true) {
      discord.setVideo(data.video_id, data.title, data.author);
    } else {
      discord.clearActivity();
    }
  });
}

export function getMusicData() {
  return {
    data: musicData,
    state: videoState
  }
}


export function getVideoData() {
  return videoData;
}