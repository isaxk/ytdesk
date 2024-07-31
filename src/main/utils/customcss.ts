import { WebContentsView } from "electron";


function adjust(color, amount) {
	return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export function updateAccentColor(ytFrame: WebContentsView, color?: string) {
	if (!color) return;
	const logoColor = adjust(color, -40);
	const chipColor = adjust(color, -80);
	const progressBarColor = adjust(color, -100);
	ytFrame.webContents.insertCSS(
		`
    #text > a {
      color: ${color} !important;
    }
    #text.ytd-channel-name {
    color: ${color} !important;
    }
      
    path[d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"] {
      fill: ${logoColor} !important;
    }
    .html5-video-player:not(.ytp-color-party) .html5-play-progress,
      .html5-video-player:not(.ytp-color-party) .ytp-play-progress,
      .progress-bar-played.ytd-progress-bar-line, .PlayerControlsProgressBarHostProgressBarPlayed /* on shorts*/
      {
          background: ${progressBarColor} !important;
      }
    .html5-scrubber-button:hover, .ytp-chrome-controls .ytp-button[aria-pressed]::after, .ytp-scrubber-button:hover, .html5-video-player:not(.ytp-color-party) .ytp-swatch-background-color, .ytp-swatch-background-color-secondary,
      .PlayerControlsProgressBarHostProgressBarPlayheadDot /*shorts*/
      {
          background: ${progressBarColor} !important;
    }
    .ytp-menuitem[aria-checked=true] .ytp-menuitem-toggle-checkbox {
      background: ${logoColor} !important;
    }
    #author-comment-badge > ytd-author-comment-badge-renderer {

      background: transparent !important;
      padding-left: 0px transparent;
    }
      #text.yt-chip-cloud-chip-renderer {
      filter: brightness(70%);
      font-weight: normal !important;
    }
    yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER] {
      background: transparent !important;
    }
    yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER][selected] {
      background-color: #ffffff80 !important;
      color: ${logoColor} !important;
    }
    yt-chip-cloud-chip-renderer[chip-style=STYLE_HOME_FILTER][selected] #text {
      font-weight: bold !important;
    }
    
  `
	)
}