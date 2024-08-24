import { Client } from '@xhayper/discord-rpc'
import { ipcMain } from 'electron'
import { factory } from 'electron-json-config'

const store = factory()

const client = new Client({
  clientId: '1265008196876242944'
})


export function setVideo(id, title, author) {
  client.user?.setActivity({
    state: author,
    details: title,
    type: 3, // Watching...
    largeImageKey: `https://img.youtube.com/vi/${id}/0.jpg`,
    smallImageKey: `https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/2048px-YouTube_social_white_square_%282017%29.svg.png`
  })
}

export function setMusic(title, author, thumbnail) {
  client.user?.setActivity({
    state: author,
    details: title,
    type: 2, // Listening...
    largeImageKey: thumbnail,
    smallImageKey: `https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/512px-Youtube_Music_icon.svg.png`
  })
}

export function clearActivity() {
  client.user?.clearActivity()
}

export function discordClient() {
  client.login();

  return {
    setMusic,
    setVideo,
    clearActivity,
    enable: () => {
      return
    }
  }
}

ipcMain.on('ytView:videoDataChanged', (_, data) => {
  if (data && store.get('discord-rpc')) {
    setVideo(data.video_id, data.title, data.author)
  } else {
    client.user?.clearActivity()
  }
})

ipcMain.on('ytmView:videoDataChanged', (_, data) => {
  if (data === null || store.get('discord-rpc') === false) return
  console.log(data.thumbnail.thumbnails);
  setMusic(data.title, data.author, data.thumbnail.thumbnails[0].url)
})
