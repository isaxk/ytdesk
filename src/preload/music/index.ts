// Credits to Youtube Music Desktop App. https://github.com/ytmdesktop

// IMPORTANT NOTES ABOUT THIS FILE
//
// This file contains all logic related to interacting with YTM itself and works under the assumption of a trusted environment and data.
// Anything passed to this file does not necessarily need to be or will be validated.
//
// If adding new things to this file ensure best security practices are followed.
// - executeJavaScript is used to enter the main world when you need to interact with YTM APIs or anything from YTM that would otherwise need the prototypes or events from YTM.
//   - Always wrap your executeJavaScript code in an IIFE calling it from outside executeJavaScript when it returns
// - Add functions to exposeInMainWorld when you need to call back to the main program. By nature you should not trust data coming from this.

/* @vite-ignore */

import { contextBridge, ipcRenderer, webFrame } from 'electron';

const playerBarControlsScript = `
  (function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  let ytmdControlButtons = {};

  let currentVideoId = "";

  let libraryFeedbackDefaultToken = "";
  let libraryFeedbackToggledToken = "";

  let sleepTimerTimeout = null;

  let libraryButton = document.createElement("yt-button-shape");
  libraryButton.classList.add("ytmd-player-bar-control");
  libraryButton.classList.add("library-button");
  libraryButton.set("data", {
    focused: false,
    iconPosition: "icon-only",
    onTap: function () {
      var closePopupEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-close-popups-action",
          args: [["ytmusic-menu-popup-renderer"]],
          optionalAction: false,
          returnValue: []
        }
      };
      var feedbackEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-service-request",
          args: [
            this,
            {
              feedbackEndpoint: {
                feedbackToken: this.data.toggled ? libraryFeedbackToggledToken : libraryFeedbackDefaultToken
              }
            }
          ],
          optionalAction: false,
          returnValue: []
        }
      };
      this.dispatchEvent(new CustomEvent("yt-action", closePopupEvent));
      this.dispatchEvent(new CustomEvent("yt-action", feedbackEvent));
      window.__YTMD_HOOK__.ytmStore.dispatch({
        type: "SET_FEEDBACK_TOGGLE_STATE",
        payload: { defaultEndpointFeedbackToken: libraryFeedbackDefaultToken, isToggled: !this.data.toggled }
      });
    }.bind(libraryButton),
    style: "mono",
    toggled: false,
    type: "text"
  });
  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").insertAdjacentElement("afterend", libraryButton);

  let playlistButton = document.createElement("yt-button-shape");
  playlistButton.classList.add("ytmd-player-bar-control");
  playlistButton.classList.add("playlist-button");
  playlistButton.set("icon", "yt-sys-icons:playlist_add");
  playlistButton.set("data", {
    focused: false,
    iconPosition: "icon-only",
    onTap: function () {
      var closePopupEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-close-popups-action",
          args: [["ytmusic-menu-popup-renderer"]],
          optionalAction: false,
          returnValue: []
        }
      };
      var returnValue = [];
      var serviceRequestEvent = {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          actionName: "yt-service-request",
          args: [
            this,
            {
              addToPlaylistEndpoint: {
                videoId: currentVideoId
              }
            }
          ],
          optionalAction: false,
          returnValue
        }
      };
      this.dispatchEvent(new CustomEvent("yt-action", closePopupEvent));
      this.dispatchEvent(new CustomEvent("yt-action", serviceRequestEvent));
      returnValue[0].ajaxPromise.then(
        response => {
          var addToPlaylistEvent = {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              actionName: "yt-open-popup-action",
              args: [
                {
                  openPopupAction: {
                    popup: {
                      addToPlaylistRenderer: response.data.contents[0].addToPlaylistRenderer
                    },
                    popupType: "DIALOG"
                  }
                },
                this
              ],
              optionalAction: false,
              returnValue: []
            }
          };
          this.dispatchEvent(new CustomEvent("yt-action", addToPlaylistEvent));
          this.dispatchEvent(new CustomEvent("yt-action", closePopupEvent));
        },
        () => {
          // service request errored
        },
        this
      );
    }.bind(playlistButton),
    style: "mono",
    toggled: false,
    type: "text"
  });
  libraryButton.insertAdjacentElement("afterend", playlistButton);

  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onVideoDataChange", event => {
    if (event.playertype === 1 && (event.type === "dataloaded" || event.type === "dataupdated")) {
      currentVideoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId;
    }
  });

  const humanizeTime = (time) => {
    // This is just a hacked together function to provide a humanization for the sleep timer. It serves no purpose outside that and isn't some complicated humanizer
    if (time === 1) return time + "minute";
    if (time > 1 && time < 60) return time + "minutes";
    if (time >= 60 && time < 120) return time/60 + "hour";
    if (time >= 120) return time/60 + "hours"; 
  }

  window.addEventListener("yt-action", e => {
    if (e.detail.actionName === "yt-service-request") {
      if (e.detail.args[1].ytmdSleepTimerServiceEndpoint) {
        if (sleepTimerTimeout !== null) {
          clearTimeout(sleepTimerTimeout);
          sleepTimerTimeout = null;
          if (sleepTimerButton.classList.contains("active")) {
            sleepTimerButton.classList.remove("active");
            sleepTimerButton.setAttribute("title", "Sleep timer off");
          }
        }

        if (e.detail.args[1].ytmdSleepTimerServiceEndpoint.time > 0) {
          if (!sleepTimerButton.classList.contains("active")) {
            sleepTimerButton.classList.add("active");
            sleepTimerButton.setAttribute("title", "Sleep timer"+ humanizeTime(e.detail.args[1].ytmdSleepTimerServiceEndpoint.time));
          }

          document.body.dispatchEvent(
            new CustomEvent("yt-action", {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: {
                actionName: "yt-open-popup-action",
                args: [
                  // Endpoint details
                  {
                    openPopupAction: {
                      popup: {
                        notificationActionRenderer: {
                          responseText: {
                            runs: [
                              {
                                text: "Sleep timer set to "+humanizeTime(e.detail.args[1].ytmdSleepTimerServiceEndpoint.time)
                              }
                            ]
                          }
                        }
                      },
                      popupType: "TOAST",
                      uniqueId: crypto.randomUUID()
                    }
                  },
                  document.querySelector("ytmusic-app")
                ],
                optionalAction: false,
                returnValue: []
              }
            })
          );

          sleepTimerTimeout = setTimeout(
            () => {
              sleepTimerTimeout = null;
              sleepTimerButton.classList.remove("active");
              sleepTimerButton.setAttribute("title", "Sleep timer off");

              if (document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playing) {
                document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.pauseVideo();

                document.body.dispatchEvent(
                  new CustomEvent("yt-action", {
                    bubbles: true,
                    cancelable: false,
                    composed: true,
                    detail: {
                      actionName: "yt-open-popup-action",
                      args: [
                        {
                          openPopupAction: {
                            popup: {
                              dismissableDialogRenderer: {
                                title: {
                                  runs: [
                                    {
                                      text: "Music paused"
                                    }
                                  ]
                                },
                                dialogMessages: [
                                  {
                                    runs: [
                                      {
                                        text: "Sleep timer expired and your music has been paused"
                                      }
                                    ]
                                  }
                                ]
                              }
                            },
                            popupType: "DIALOG"
                          }
                        },
                        document.querySelector("ytmusic-app")
                      ],
                      optionalAction: false,
                      returnValue: []
                    }
                  })
                );
              }
            },
            e.detail.args[1].ytmdSleepTimerServiceEndpoint.time * 1000 * 60
          );
        } else {
          document.body.dispatchEvent(
            new CustomEvent("yt-action", {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: {
                actionName: "yt-open-popup-action",
                args: [
                  // Endpoint details
                  {
                    openPopupAction: {
                      popup: {
                        notificationActionRenderer: {
                          responseText: {
                            runs: [
                              {
                                text: "Sleep timer cleared"
                              }
                            ]
                          }
                        }
                      },
                      popupType: "TOAST",
                      uniqueId: crypto.randomUUID()
                    }
                  },
                  document.querySelector("ytmusic-app")
                ],
                optionalAction: false,
                returnValue: []
              }
            })
          );
        }
      }
    }
  });

  ytmStore.subscribe(() => {
    let state = ytmStore.getState();

    // Update library button for current data
    const currentMenu = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").getMenuRenderer();
    if (currentMenu) {
      if (playlistButton.classList.contains("hidden")) {
        playlistButton.classList.remove("hidden");
      }

      let foundLibraryButton = false;
      for (let i = 0; i < currentMenu.items.length; i++) {
        const item = currentMenu.items[i];
        if (item.toggleMenuServiceItemRenderer) {
          if (
            item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "LIBRARY_SAVED" ||
            item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "LIBRARY_ADD"
          ) {
            foundLibraryButton = true;
            libraryFeedbackDefaultToken = item.toggleMenuServiceItemRenderer.defaultServiceEndpoint.feedbackEndpoint.feedbackToken;
            libraryFeedbackToggledToken = item.toggleMenuServiceItemRenderer.toggledServiceEndpoint.feedbackEndpoint.feedbackToken;

            if (
              state.toggleStates.feedbackToggleStates[libraryFeedbackDefaultToken] !== undefined &&
              state.toggleStates.feedbackToggleStates[libraryFeedbackDefaultToken] !== null
            ) {
              libraryButton.set("data.toggled", state.toggleStates.feedbackToggleStates[libraryFeedbackDefaultToken]);
            } else {
              libraryButton.set("data.toggled", false);
            }

            if (item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "LIBRARY_SAVED") {
              // Default value is saved to library (false == remove from library, true == add to library)
              if (libraryButton.data.toggled) {
                libraryButton.set("icon", "yt-sys-icons:library_add");
              } else {
                libraryButton.set("icon", "yt-sys-icons:library_saved");
              }
            } else if (item.toggleMenuServiceItemRenderer.defaultIcon.iconType === "LIBRARY_ADD") {
              // Default value is add to library (false == add to library, true == remove from library)
              if (libraryButton.data.toggled) {
                libraryButton.set("icon", "yt-sys-icons:library_saved");
              } else {
                libraryButton.set("icon", "yt-sys-icons:library_add");
              }
            }
            break;
          }
        }
      }
      
      if (!foundLibraryButton) {
        if (!libraryButton.classList.contains("hidden")) {
          libraryButton.classList.add("hidden");
        }
      } else {
        if (libraryButton.classList.contains("hidden")) {
          libraryButton.classList.remove("hidden");
        }
      }
    } else {
      if (!libraryButton.classList.contains("hidden")) {
        libraryButton.classList.add("hidden");
      }
      if (!playlistButton.classList.contains("hidden")) {
        playlistButton.classList.add("hidden");
      }
    }
  });

  ytmdControlButtons.libraryButton = libraryButton;
})

`;
const hookPlayerApiEventsScript = `
(function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  function sendStoreState() {
    // We don't want to see everything in the store as there can be some sensitive data so we only send what's necessary to operate
    let state = ytmStore.getState();

    const videoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse()?.videoDetails?.videoId;
    const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
    const defaultLikeStatus = likeButtonData?.likeStatus ?? "UNKNOWN";
    const storeLikeStatus = state.likeStatus.videos[videoId];
    
    const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoId] : defaultLikeStatus;
    const volume = state.player.volume;
    const adPlaying = state.player.adPlaying;
    const muted = state.player.muted;

    window.ytmd.sendStoreUpdate(state.queue, likeStatus, volume, muted, adPlaying);
  }

  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onVideoProgress", progress => {
    window.ytmd.sendVideoProgress(progress);
  });
  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onStateChange", state => {
    window.ytmd.sendVideoState(state);
  });
  document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.addEventListener("onVideoDataChange", event => {
    if (event.playertype === 1 && (event.type === "dataloaded" || event.type === "dataupdated")) {
      let videoDetails = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails;
      let playlistId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlaylistId();
      let album = null;

      let currentItem = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").currentItem;
      if (currentItem !== null && currentItem !== undefined) {
        if (videoDetails.musicVideoType === "MUSIC_VIDEO_TYPE_PODCAST_EPISODE") {
          // Thumbnails are not provided on the video details for a podcast
          videoDetails.thumbnail = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").currentItem.thumbnail;
        }

        for (let i = 0; i < currentItem.longBylineText.runs.length; i++) {
          const item = currentItem.longBylineText.runs[i];
          if (item.navigationEndpoint) {
            if (item.navigationEndpoint.browseEndpoint.browseEndpointContextSupportedConfigs.browseEndpointContextMusicConfig.pageType === "MUSIC_PAGE_TYPE_ALBUM") {
              album = {
                id: item.navigationEndpoint.browseEndpoint.browseId,
                text: item.text
              }
            }
          }
        }
      }

      let state = ytmStore.getState();
      const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
      const defaultLikeStatus = likeButtonData?.likeStatus ?? "UNKNOWN";
      const storeLikeStatus = state.likeStatus.videos[videoDetails.videoId];
      
      const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoDetails.videoId] : defaultLikeStatus;

      window.ytmd.sendVideoData(videoDetails, playlistId, album, likeStatus);
    }
  });
  ytmStore.subscribe(() => {
    sendStoreState();
  });
  window.addEventListener("yt-action", e => {
    if (e.detail.actionName === "yt-service-request") {
      if (e.detail.args[1].createPlaylistServiceEndpoint) {
        let title = e.detail.args[2].create_playlist_title;
        let returnValue = e.detail.returnValue;
        returnValue[0].ajaxPromise.then(response => {
          let id = response.data.playlistId;
          window.ytmd.sendCreatePlaylistObservation({
            title,
            id
          });
        });
      }
    } else if (e.detail.actionName === "yt-handle-playlist-deletion-command") {
      let playlistId = e.detail.args[0].handlePlaylistDeletionCommand.playlistId;
      window.ytmd.sendDeletePlaylistObservation(playlistId);
    }
  });
})

`;
const getPlaylistsScript = `
(function() {
  return new Promise((resolve, reject) => {
    var returnValue = [];
    var serviceRequestEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-app-layout>ytmusic-player-bar"),
          {
            addToPlaylistEndpoint: {
              videoId: document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId
            }
          }
        ],
        optionalAction: false,
        returnValue
      }
    };
    document.querySelector("ytmusic-app-layout>ytmusic-player-bar").dispatchEvent(new CustomEvent("yt-action", serviceRequestEvent));
    returnValue[0].ajaxPromise.then(
      response => {
        resolve(response.data.contents[0].addToPlaylistRenderer.playlists);
      },
      () => {
        reject();
      }
    );
  });
})

`;
const toggleLikeScript = `
(function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  const videoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId;
  const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
  
  let likeServiceEndpoint = null;
  let indifferentServiceEndpoint = null;

  for (const endpoint of likeButtonData.serviceEndpoints) {
    if (endpoint.likeEndpoint.status === "LIKE") {
      likeServiceEndpoint = endpoint;
    } else if (endpoint.likeEndpoint.status === "INDIFFERENT") {
      indifferentServiceEndpoint = endpoint;
    }
  }

  let serviceEvent = null;

  const defaultLikeStatus = likeButtonData.likeStatus;
  const state = ytmStore.getState();
  const storeLikeStatus = state.likeStatus.videos[videoId];

  const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoId] : defaultLikeStatus;

  if (likeStatus === "LIKE") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          indifferentServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  } else if (likeStatus === "DISLIKE" || likeStatus === "INDIFFERENT") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          likeServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  }

  if (serviceEvent) document.querySelector("ytmusic-like-button-renderer").dispatchEvent(new CustomEvent("yt-action", serviceEvent));
})
`;
const toggleDislikeScript = `
(function() {
  const ytmStore = window.__YTMD_HOOK__.ytmStore;

  const videoId = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails.videoId;
  const likeButtonData = document.querySelector("ytmusic-app-layout>ytmusic-player-bar").querySelector("ytmusic-like-button-renderer").data;
  
  let dislikeServiceEndpoint = null;
  let indifferentServiceEndpoint = null;

  for (const endpoint of likeButtonData.serviceEndpoints) {
    if (endpoint.likeEndpoint.status === "DISLIKE") {
      dislikeServiceEndpoint = endpoint;
    } else if (endpoint.likeEndpoint.status === "INDIFFERENT") {
      indifferentServiceEndpoint = endpoint;
    }
  }

  let serviceEvent = null;

  const defaultLikeStatus = likeButtonData.likeStatus;
  const state = ytmStore.getState();
  const storeLikeStatus = state.likeStatus.videos[videoId];

  const likeStatus = storeLikeStatus ? state.likeStatus.videos[videoId] : defaultLikeStatus;

  if (likeStatus === "DISLIKE") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          indifferentServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  } else if (likeStatus === "LIKE" || likeStatus === "INDIFFERENT") {
    serviceEvent = {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        actionName: "yt-service-request",
        args: [
          document.querySelector("ytmusic-like-button-renderer"),
          dislikeServiceEndpoint
        ],
        optionalAction: false,
        returnValue: []
      }
    };
  }

  if (serviceEvent) document.querySelector("ytmusic-like-button-renderer").dispatchEvent(new CustomEvent("yt-action", serviceEvent));
})

`;

class Store<TSchema> {
	public set(key: string, value?: unknown) {
		return ipcRenderer.send('settings:set', key, value);
	}

	public async get(key: keyof TSchema) {
		// return await ipcRenderer.invoke("settings:get", key);
		return null;
	}

	public reset(key: keyof TSchema) {
		return ipcRenderer.send('settings:reset', key);
	}

	public onDidAnyChange(callback: (newState: TSchema, oldState: TSchema) => void) {
		return ipcRenderer.on('settings:stateChanged', (event, newState, oldState) => {
			callback(newState, oldState);
		});
	}
}

const store = new Store<any>();

contextBridge.exposeInMainWorld('ytmd', {
	sendVideoProgress: (volume: number) => ipcRenderer.send('ytmView:videoProgressChanged', volume),
	sendVideoState: (state: number) => ipcRenderer.send('ytmView:videoStateChanged', state),
	sendVideoData: (
		videoDetails: unknown,
		playlistId: string,
		album: { id: string; text: string },
		likeStatus: unknown
	) => ipcRenderer.send('ytmView:videoDataChanged', videoDetails, playlistId, album, likeStatus),
	sendStoreUpdate: (
		queueState: unknown,
		likeStatus: string,
		volume: number,
		muted: boolean,
		adPlaying: boolean
	) =>
		ipcRenderer.send('ytmView:storeStateChanged', queueState, likeStatus, volume, muted, adPlaying),
	sendCreatePlaylistObservation: (playlist: unknown) =>
		ipcRenderer.send('ytmView:createPlaylistObserved', playlist),
	sendDeletePlaylistObservation: (playlistId: string) =>
		ipcRenderer.send('ytmView:deletePlaylistObserved', playlistId)
});

function createStyleSheet() {
	const css = document.createElement('style');
	css.appendChild(
		document.createTextNode(`
    `)
	);
	document.head.appendChild(css);
}

function createMaterialSymbolsLink() {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href =
		'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,100,0,0';
	return link;
}

function createNavigationMenuArrows() {
	// Go back in history
	const historyBackElement = document.createElement('span');
	historyBackElement.classList.add('material-symbols-outlined', 'ytmd-history-back', 'disabled');
	historyBackElement.innerText = 'keyboard_backspace';

	historyBackElement.addEventListener('click', function () {
		if (!historyBackElement.classList.contains('disabled')) {
			history.back();
		}
	});

	// Go forward in history
	const historyForwardElement = document.createElement('span');
	historyForwardElement.classList.add(
		'material-symbols-outlined',
		'ytmd-history-forward',
		'disabled'
	);
	historyForwardElement.innerText = 'keyboard_backspace';

	historyForwardElement.addEventListener('click', function () {
		if (!historyForwardElement.classList.contains('disabled')) {
			history.forward();
		}
	});

	ipcRenderer.on('ytmView:navigationStateChanged', (event, state) => {
		if (state.canGoBack) {
			historyBackElement.classList.remove('disabled');
		} else {
			historyBackElement.classList.add('disabled');
		}

		if (state.canGoForward) {
			historyForwardElement.classList.remove('disabled');
		} else {
			historyForwardElement.classList.add('disabled');
		}
	});

	const pivotBar = document.querySelector('ytmusic-pivot-bar-renderer');
	if (!pivotBar) {
		// New YTM UI
		const searchBar = document.querySelector('ytmusic-search-box');
		const navBar = searchBar?.parentNode;
		navBar?.insertBefore(historyForwardElement, searchBar);
		navBar?.insertBefore(historyBackElement, historyForwardElement);
	} else {
		historyForwardElement.classList.add('pivotbar');
		historyBackElement.classList.add('pivotbar');
		pivotBar.prepend(historyForwardElement);
		pivotBar.prepend(historyBackElement);
	}
}

function createKeyboardNavigation() {
	const keyboardNavigation = document.createElement('div');
	keyboardNavigation.tabIndex = 32767;
	keyboardNavigation.onfocus = () => {
		keyboardNavigation.blur();
		ipcRenderer.send('ytmView:switchFocus', 'main');
	};
	document.body.appendChild(keyboardNavigation);
}

async function createAdditionalPlayerBarControls() {
	(await webFrame.executeJavaScript(playerBarControlsScript))();
}

async function hideChromecastButton() {
	(
		await webFrame.executeJavaScript(`
      (function() {
        window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_CAST_AVAILABLE', payload: false });
      })
    `)
	)();
}

async function hookPlayerApiEvents() {
	(await webFrame.executeJavaScript(hookPlayerApiEventsScript))();
}

function overrideHistoryButtonDisplay() {
	// @ts-expect-error Style is reported as readonly but this still works
	document.querySelector<HTMLElement>('#history-link tp-yt-paper-icon-button').style =
		'display: inline-block !important;';
}

function getYTMTextRun(runs: { text: string }[]) {
	let final = '';
	for (const run of runs) {
		final += run.text;
	}
	return final;
}

// This function helps hook YTM
(async function () {
	(
		await webFrame.executeJavaScript(`
    (function() {
      let ytmdHookedObjects = [];
      
      let decorate = null;
      Object.defineProperty(Reflect, "decorate", {
        set: (value) => {
          decorate = value;
        },
        get: () => {
          return (...args) => {
            if (!window.__YTMD_HOOK__) {
              let obj = args[1];
              if (typeof obj === "object") {
                ytmdHookedObjects.push(obj);
              }
            }

            return decorate(...args);
          }
        }
      });

      window.__YTMD_HOOK_OBJS__ = ytmdHookedObjects;
    })
  `)
	)();
})();

window.addEventListener('load', async () => {
	if (window.location.hostname !== 'music.youtube.com') {
		if (
			window.location.hostname === 'consent.youtube.com' ||
			window.location.hostname === 'accounts.google.com'
		) {
			ipcRenderer.send('ytmView:loaded');
		}
		return;
	}

	await new Promise<void>((resolve) => {
		const interval = setInterval(async () => {
			const hooked = (
				await webFrame.executeJavaScript(`
        (function() {
          for (const hookedObj of window.__YTMD_HOOK_OBJS__) {
            if (hookedObj.is) {
              if (hookedObj.is === "ytmusic-app") {
                if (hookedObj.provide) {
                  for (const provider of hookedObj.provide) {
                    if (provider.useValue) {
                      if (provider.useValue.store) {
                        let ytmdHook = {
                          ytmStore: provider.useValue.store
                        };
                        Object.freeze(ytmdHook);
                        window.__YTMD_HOOK__ = ytmdHook;
                        break;
                      }
                    }
                  }
                }

                if (window.__YTMD_HOOK__) {
                  delete window.__YTMD_HOOK_OBJS__;
                  return true;
                }
              }
            }
          }
          
          return false;
        })
      `)
			)();

			if (hooked) {
				clearInterval(interval);
				resolve();
			}
		}, 250);
	});

	let materialSymbolsLoaded = false;

	const materialSymbols = createMaterialSymbolsLink();
	materialSymbols.onload = () => {
		materialSymbolsLoaded = true;
	};
	document.head.appendChild(materialSymbols);

	await new Promise<void>((resolve) => {
		const interval = setInterval(async () => {
			const playerApiReady: boolean = (
				await webFrame.executeJavaScript(`
          (function() {
            return document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.isReady();
          })
        `)
			)();

			if (materialSymbolsLoaded && playerApiReady) {
				clearInterval(interval);
				resolve();
			}
		}, 250);
	});

	createStyleSheet();
	// createNavigationMenuArrows();
	createKeyboardNavigation();
	await createAdditionalPlayerBarControls();
	await hideChromecastButton();
	await hookPlayerApiEvents();
	overrideHistoryButtonDisplay();

	// const integrationScripts: { [integrationName: string]: { [scriptName: string]: string } } = await ipcRenderer.invoke("ytmView:getIntegrationScripts");

	// @ts-ignore: Unreachable code error
	const integrationScripts: { [integrationName: string]: { [scriptName: string]: string } } = null;
	const state: any = await store.get('state');
	// const continueWhereYouLeftOff = (await store.get("playback")).continueWhereYouLeftOff;
	const continueWhereYouLeftOff = false;

	if (continueWhereYouLeftOff) {
		// The last page the user was on is already a page where it will be playing a song from (no point telling YTM to play it again)
		if (!state?.lastUrl.startsWith('https://music.youtube.com/watch')) {
			if (state.lastVideoId) {
				// This height transition check is a hack to fix the `Start playback` hint from not being in the correct position https://github.com/ytmdesktop/ytmdesktop/issues/1159
				let heightTransitionCount = 0;
				const transitionEnd = async (e: TransitionEvent) => {
					if (e.target === document.querySelector('ytmusic-app-layout>ytmusic-player-bar')) {
						if (e.propertyName === 'height') {
							(
								await webFrame.executeJavaScript(`
                  (function() {
                    document.querySelector("ytmusic-popup-container").refitPopups_();
                  })
                `)
							)();
							heightTransitionCount++;
							if (heightTransitionCount >= 2) {
								// @ts-ignore: Unreachable code error
								document
									.querySelector('ytmusic-app-layout>ytmusic-player-bar')
									.removeEventListener('transitionend', transitionEnd);
							}
						}
					}
				};
				// @ts-ignore: Unreachable code error
				document
					.querySelector('ytmusic-app-layout>ytmusic-player-bar')
					.addEventListener('transitionend', transitionEnd);

				document.dispatchEvent(
					new CustomEvent('yt-navigate', {
						detail: {
							endpoint: {
								watchEndpoint: {
									videoId: state.lastVideoId,
									playlistId: state.lastPlaylistId
								}
							}
						}
					})
				);
			}
		} else {
			(
				await webFrame.executeJavaScript(`
          (function() {
            window.ytmd.sendVideoData(document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlayerResponse().videoDetails, document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getPlaylistId());
          })
        `)
			)();
		}
	}

	// const alwaysShowVolumeSlider = (await store.get("appearance")).alwaysShowVolumeSlider;
	const alwaysShowVolumeSlider = false;

	if (alwaysShowVolumeSlider && document) {
		document
			.querySelector('ytmusic-app-layout>ytmusic-player-bar #volume-slider')
			?.classList.add('ytmd-persist-volume-slider');
	}

	ipcRenderer.on('remoteControl:execute', async (_event, command, value) => {
		switch (command) {
			case 'playPause': {
				(
					await webFrame.executeJavaScript(`
            (function() {
            
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playing ? document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.pauseVideo() : document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.playVideo();
            })
          `)
				)();
				break;
			}

			case 'play': {
				(
					await webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.playVideo();
            })
          `)
				)();
				break;
			}

			case 'pause': {
				(
					await webFrame.executeJavaScript(`
            (function() {
            console.log("TEST")
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.pauseVideo();
            })
          `)
				)();
				break;
			}

			case 'next': {
				(
					await webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.nextVideo();
            })
          `)
				)();
				break;
			}

			case 'previous': {
				(
					await webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.previousVideo();
            })
          `)
				)();
				break;
			}

			case 'toggleLike': {
				(await webFrame.executeJavaScript(toggleLikeScript))();
				break;
			}

			case 'toggleDislike': {
				(await webFrame.executeJavaScript(toggleDislikeScript))();
				break;
			}

			case 'volumeUp': {
				const currentVolumeUp: number = (
					await webFrame.executeJavaScript(`
            (function() {
              return document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getVolume();
            })
          `)
				)();

				let newVolumeUp = currentVolumeUp + 10;
				if (currentVolumeUp > 100) {
					newVolumeUp = 100;
				}
				(
					await webFrame.executeJavaScript(`
            (function(newVolumeUp) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.setVolume(newVolumeUp);
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_VOLUME', payload: newVolumeUp });
            })
          `)
				)(newVolumeUp);
				break;
			}

			case 'volumeDown': {
				const currentVolumeDown: number = (
					await webFrame.executeJavaScript(`
            (function() {
              return document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.getVolume();
            })
          `)
				)();

				let newVolumeDown = currentVolumeDown - 10;
				if (currentVolumeDown < 0) {
					newVolumeDown = 0;
				}
				(
					await webFrame.executeJavaScript(`
            (function(newVolumeDown) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.setVolume(newVolumeDown);
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_VOLUME', payload: newVolumeDown });
            })
          `)
				)(newVolumeDown);
				break;
			}

			case 'setVolume': {
				const valueInt: number = parseInt(value);
				// Check if Volume is a number and between 0 and 100
				if (isNaN(valueInt) || valueInt < 0 || valueInt > 100) {
					return;
				}

				(
					await webFrame.executeJavaScript(`
            (function(valueInt) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.setVolume(valueInt);
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_VOLUME', payload: valueInt });
            })
          `)
				)(valueInt);
				break;
			}

			case 'mute':
				(
					await webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.mute();
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_MUTED', payload: true });
            })
          `)
				)();
				break;

			case 'unmute':
				(
					await webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.unMute();
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_MUTED', payload: false });
            })
          `)
				)();
				break;

			case 'repeatMode':
				(
					await webFrame.executeJavaScript(`
            (function(value) {
              window.__YTMD_HOOK__.ytmStore.dispatch({ type: 'SET_REPEAT', payload: value });
            })
          `)
				)(value);
				break;

			case 'seekTo':
				(
					await webFrame.executeJavaScript(`
            (function(value) {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").playerApi.seekTo(value);
            })
          `)
				)(value);
				break;

			case 'shuffle':
				(
					await webFrame.executeJavaScript(`
            (function() {
              document.querySelector("ytmusic-app-layout>ytmusic-player-bar").queue.shuffle();
            })
          `)
				)();
				break;

			case 'playQueueIndex': {
				const index: number = parseInt(value);

				(
					await webFrame.executeJavaScript(`
            (function(index) {
              const state = window.__YTMD_HOOK__.ytmStore.getState();
              const queue = state.queue;

              const maxQueueIndex = state.queue.items.length - 1;
              const maxAutoMixQueueIndex = Math.max(state.queue.automixItems.length - 1, 0);

              let useAutoMix = false;
              if (index > maxQueueIndex) {
                index = index - state.queue.items.length;
                useAutoMix = true;
              }

              let song = null;
              if (!useAutoMix) {
                song = queue.items[index];
              } else {
                song = queue.automixItems[index];
              }

              let playlistPanelVideoRenderer;
              if (song.playlistPanelVideoRenderer) {
                playlistPanelVideoRenderer = song.playlistPanelVideoRenderer;
              } else if (song.playlistPanelVideoWrapperRenderer) {
                playlistPanelVideoRenderer = song.playlistPanelVideoWrapperRenderer.primaryRenderer.playlistPanelVideoRenderer;
              }

              document.dispatchEvent(
                new CustomEvent("yt-navigate", {
                  detail: {
                    endpoint: {
                      watchEndpoint: playlistPanelVideoRenderer.navigationEndpoint.watchEndpoint
                    }
                  }
                })
              );
            })
          `)
				)(index);

				break;
			}

			case 'navigate': {
				const endpoint = value;
				document.dispatchEvent(
					new CustomEvent('yt-navigate', {
						detail: {
							endpoint
						}
					})
				);
				break;
			}
		}
	});

	ipcRenderer.on('ytmView:getPlaylists', async (_event, requestId) => {
		const rawPlaylists = await (await webFrame.executeJavaScript(getPlaylistsScript))();

		const playlists: Array<any> = [];
		for (const rawPlaylist of rawPlaylists) {
			const playlist = rawPlaylist.playlistAddToOptionRenderer;
			playlists.push({
				id: playlist.playlistId,
				title: getYTMTextRun(playlist.title.runs)
			});
		}
		ipcRenderer.send(`ytmView:getPlaylists:response:${requestId}`, playlists);
	});

	store.onDidAnyChange((newState) => {
		if (newState.appearance.alwaysShowVolumeSlider) {
			const volumeSlider = document.querySelector('#volume-slider');
			if (!volumeSlider?.classList.contains('ytmd-persist-volume-slider')) {
				volumeSlider?.classList.add('ytmd-persist-volume-slider');
			}
		} else {
			const volumeSlider = document.querySelector('#volume-slider');
			if (volumeSlider?.classList.contains('ytmd-persist-volume-slider')) {
				volumeSlider?.classList.remove('ytmd-persist-volume-slider');
			}
		}
	});

	ipcRenderer.on('ytmView:refitPopups', async () => {
		// Update 4/14/2024: Broken until a hook is provided for this
		/*
    (
      await webFrame.executeJavaScript(`
        (function() {
          document.querySelector("ytmusic-popup-container").refitPopups_();
        })
      `)
    )();
    */
	});

	ipcRenderer.on('ytmView:executeScript', async (_event, integrationName, scriptName) => {
		const scripts = integrationScripts[integrationName];
		if (scripts) {
			const script = scripts[scriptName];
			if (script) {
				(await webFrame.executeJavaScript(script))();
			}
		}
	});

	ipcRenderer.send('ytmView:loaded');
});
