import { Client } from "@xhayper/discord-rpc";
import { playerManager } from "../player";
import { playerState } from "../utils/types";

const client = new Client({
  clientId: "1265008196876242944",
});

client.login();

function setVideo(id: string, title: string, author: string) {
  client.user?.setActivity({
    state: author,
    details: title,
    type: 3, // Watching...
    largeImageKey: `https://img.youtube.com/vi/${id}/0.jpg`,
    smallImageKey: `https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/2048px-YouTube_social_white_square_%282017%29.svg.png`,
  });
}

function setMusic(title: string, author: string, thumbnail: string) {
  client.user?.setActivity({
    state: author,
    details: title,
    type: 2, // Listening...
    largeImageKey: thumbnail,
    smallImageKey: `https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/512px-Youtube_Music_icon.svg.png`,
  });
}

function clear() {
  client.user?.clearActivity();
}

export function discordClient() {
  return {
    setMusic,
    setVideo,
    clear,
    enable: () => {
      let music = playerManager().getData().music;
      let video = playerManager().getData().video;

      if (
        (video !== null && music.state !== playerState.Playing && music.data) ||
        music.data !== null
      ) {
        setMusic(
          music.data?.title,
          music.data?.author,
          music.data?.thumbnail.thumbnails[2].url,
        );
      } else if (video !== null) {
        setVideo(video.video_id, video.title, video.author);
      }
    },
  };
}
