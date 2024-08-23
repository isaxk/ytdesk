import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
export const api = {
  openSettings: () => {
    ipcRenderer.send('open-settings')
  },
  closeSettings: () => {
    ipcRenderer.send('close-settings')
  },
  onUpdateTabs: (listener: Function) => {
    ipcRenderer.on('update-tabs', (_, data) => {
      listener(data)
    })
  },
  newTab: () => {
    ipcRenderer.send('new-tab')
  },
  closeTab: (i: number) => {
    ipcRenderer.send('close-tab', i)
  },
  switchTab: (i: number) => {
    ipcRenderer.send('switch-tab', i)
  },
  pageAction: (action: 'back' | 'forward' | 'reload') => {
    ipcRenderer.send('page-action', action)
  },
  windowAction: (action: 'close' | 'maximize' | 'minimize') => {
    ipcRenderer.send('window-action', action)
  },
  getConfig: (key: string) => {
    return ipcRenderer.invoke('get-config', key)
  },
  setConfig: (key: string, value: string) => {
    ipcRenderer.send('set-config', { key, value })
  },
  onUpdateTheme: (listener: Function) => {
    ipcRenderer.on('update-theme', (_, theme) => {
      listener(theme)
    })
  },
  getTheme: () => {
    return ipcRenderer.invoke('get-theme')
  },
  openMiniplayer: () => {
    ipcRenderer.send('open-miniplayer')
  },
  closeMiniplayer: () => {
    ipcRenderer.send('close-miniplayer')
  },
  onVideoDataChange: (listener:Function) => {
    ipcRenderer.on('video-data-changed', (_, data)=>{
      listener(data);
    })
  },
  musicRemote: (command:string,value:number) => {
    ipcRenderer.send("music-remote", command, value);
  },
  getVideoData: () => {
    return ipcRenderer.invoke('get-video-data');
  },
  onVideoProgressChange: (listener:Function) => {
    ipcRenderer.on('video-progress-changed', (_, data)=>{
      listener(data);
    })
  },
  onVideoStateChange: (listener:Function) => {
    ipcRenderer.on('video-state-changed', (_, data)=>{
      listener(data);
    })
  },
  onVolumeChange: (listener:Function) => {
    ipcRenderer.on('volume-changed', (_, data)=>{
      listener(data);
    })
  },
  getVideoState: async () => {
    return await ipcRenderer.invoke('get-video-state');
  },
  getVolume: async () => {
    return await ipcRenderer.invoke('get-volume');
  },
  onPushSPA: (listener) =>{
    ipcRenderer.on('push-spa', (_, path)=>{
      console.log(path);
      listener(path)
    })
  },
  platform: process.platform
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = api
}
