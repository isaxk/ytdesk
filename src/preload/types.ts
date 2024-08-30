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
