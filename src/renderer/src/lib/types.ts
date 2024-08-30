export type musicData = {
  videoId: string;
  title: string;
  author: string;
  channelId: string;
  isCrawlable: boolean;
  isLiveContent: boolean;
  isOwnerViewing: boolean;
  isUnpluggedCorpus: boolean;
  lengthSeconds: string;
  musicVideoType: string;
  thumbnail: {
    thumbnails: {
      height: number;
      width: number;
      url: string;
    }[];
  };
  viewCount: string;
  allowRatings: boolean;
};

export enum playerState {
  Unstarted = -1,
  Ended = 0,
  Playing = 1,
  Paused = 2,
  Buffering = 3,
  VideoCued = 5,
}

export type musicStore = {
  data: musicData;
  state: playerState;
  progress: number;
  volume: number;
};
