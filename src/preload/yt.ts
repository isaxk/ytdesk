import { contextBridge, ipcRenderer, webFrame } from "electron";

const hookPlayerApiEventsScript = `
(function() {
  if(document.querySelector("#ytd-player")==null) return;
  document.querySelector("#ytd-player").getPlayer().addEventListener("onStateChange", state => {
    window.ytmd.sendVideoState(state);
  });
  document.querySelector("#ytd-player").getPlayer().addEventListener("onVideoDataChange", event => {
    console.log(event.type)
    if (event.playertype === 1 && (event.type === "dataloaded" || event.type === "dataupdated")) {
      let videoDetails = document.querySelector("#ytd-player").getPlayer().getVideoData();
      videoDetails.currentTime = document.querySelector("#ytd-player").getPlayer().getCurrentTime();
       videoDetails.duration = document.querySelector("#ytd-player").getPlayer().getDuration();
      window.ytd.sendVideoData(videoDetails);
    }
    else if (event.type === "newdata") {
       window.ytd.sendVideoData(null);
    }
  });
  
})
    `;

contextBridge.exposeInMainWorld("ytd", {
  sendVideoProgress: (volume: number) =>
    ipcRenderer.send("ytView:videoProgressChanged", volume),
  sendVideoState: (state: number) =>
    ipcRenderer.send("ytView:videoStateChanged", state),
  sendVideoData: async (videoDetails: unknown) => {
    // ipcRenderer.send('ytmView:videoDataChanged', videoDetails, playlistId, album, likeStatus)
    ipcRenderer.send("ytView:videoDataChanged", videoDetails);
  },
  sendStoreUpdate: (
    queueState: unknown,
    likeStatus: string,
    volume: number,
    muted: boolean,
    adPlaying: boolean,
  ) =>
    ipcRenderer.send(
      "ytView:storeStateChanged",
      queueState,
      likeStatus,
      volume,
      muted,
      adPlaying,
    ),
  sendCreatePlaylistObservation: (playlist: unknown) =>
    ipcRenderer.send("ytView:createPlaylistObserved", playlist),
  sendDeletePlaylistObservation: (playlistId: string) =>
    ipcRenderer.send("ytView:deletePlaylistObserved", playlistId),
});

async function hookPlayerApiEvents() {
  (await webFrame.executeJavaScript(hookPlayerApiEventsScript))();
}

window.addEventListener("load", async () => {
  hookPlayerApiEvents();
});

ipcRenderer.on("navigate", () => {
  hookPlayerApiEvents();
});

ipcRenderer.on("picture-in-picture", async () => {
  (
    await webFrame.executeJavaScript(`
      document.querySelector("#movie_player > div.html5-video-container > video").requestPictureInPicture()
    `)
  )();
});
