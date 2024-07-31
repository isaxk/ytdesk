import { ipcRenderer, webFrame } from "electron";
import { access } from "fs";


console.log("Preloaded");

ipcRenderer.on("player-action", async (_, action) => {

    (
        await webFrame.executeJavaScript(`
          (function() {
            document.querySelector("ytd-player").getPlayer().pauseVideo();
          })
        `)
    )()
});

ipcRenderer.on("force-cinema", async (_, is) => {
  console.log(is);
  (
    await webFrame.executeJavaScript(`
      (function() {
        document.cookie = 'wide=${is?1:0}; expires='+new Date('3099').toUTCString()+'; path=/';
      })
    `)
)()
})