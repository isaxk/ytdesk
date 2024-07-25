import { ipcRenderer, webFrame } from "electron";


console.log("Preloaded");

ipcRenderer.on("player-action", async (_, action) => {

    (
        await webFrame.executeJavaScript(`
          (function() {
            document.querySelector("ytd-player").getPlayer().pauseVideo();
          })
        `)
    )()
})