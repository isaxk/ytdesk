export enum playerState {
  Unstarted = -1,
  Ended = 0,
  Playing = 1,
  Paused = 2,
  Buffering = 3,
  VideoCued = 5,
}

export type musicDataType = {
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

export type videoDataType = {
  video_id: string;
  author: string;
  title: string;
  isPlayable: boolean;
  errorCode: any;
  video_quality: string;
  video_quality_features: Array<any>;
  backgroundable: boolean;
  eventId: string;
  cpn: string;
  isLive: boolean;
  isWindowedLive: boolean;
  isManifestless: boolean;
  allowLiveDvr: boolean;
  isListed: boolean;
  isMultiChannelAudio: boolean;
  hasProgressBarBoundaries: boolean;
  isPremiere: boolean;
  itct: string;
  playerResponseCpn: string;
  progressBarStartPositionUtcTimeMillis: any;
  progressBarEndPositionUtcTimeMillis: any;
  ypcOriginalItct: any;
  ypcPreview: any;
  paidContentOverlayText: any;
  paidContentOverlayDurationMs: number;
  transitionEndpointAtEndOfStream: any;
  currentTime: number;
  duration: number;
};
