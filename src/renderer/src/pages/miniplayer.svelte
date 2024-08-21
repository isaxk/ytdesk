<script lang="ts">
  import { onMount } from 'svelte'
  import MiniBody from './miniBody.svelte'

  let videoData: any = null
  let progress: number = 0
  let state: number = 0
  let volume: number = 50;



  window.api.onVideoDataChange((e) => {
    videoData = e
  })

  window.api.onVideoProgressChange((e) => {
    progress = e
  })

  window.api.onVideoStateChange((e)=> {
    state = e;
  })

  window.api.onVolumeChange((e)=> {
    console.log(e);
    volume = e;
    
  })

  onMount(async () => {
    videoData = await window.api.getVideoData()
    state = await window.api.getVideoState()
    volume = await window.api.getVolume()
  })

  window.addEventListener("keydown", (e) => {
    console.log(e)
    if(e.key===" ") {
      window.api.musicRemote("playPause", 0);
    }
  })
</script>

<MiniBody {videoData} {state} {progress} {volume}/>
