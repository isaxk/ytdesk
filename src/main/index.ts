import {
	app,
	shell,
	BrowserWindow,
	ipcMain,
	WebContentsView,
	session,
	nativeTheme,
	Menu
} from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { factory } from 'electron-json-config';
import { ElectronBlocker } from '@cliqz/adblocker-electron';

import { createDiscordClient } from './utils/discord';
import { getWindows } from './utils/windows';
import { createMenuTemplate } from './utils/menu';
import { handleNavigate } from './utils/navigation';
import { createBlocker } from './utils/blocker';
import { updateAccentColor } from './utils/customcss';
import { handleConfigUpdate } from './utils/config';

let dev = false;
dev = !app.isPackaged;

const config = factory();
let blocker: ElectronBlocker;

const headerHeight: number = 37;

let isSettings = false;
let isFullscreen = false;
let isLoaded = false;

if (!config.get('theme')) {
	config.set('theme', 'system');
}

app.whenReady().then(async () => {
	electronApp.setAppUserModelId('com.electron');

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	const { mainWindow, ytFrame, musicFrame, switchView, setBoundsOnActive, getActiveFrame } =
		getWindows(headerHeight);
	const discordRPC = await createDiscordClient('1265008196876242944');

	if (config.get('ad-blocking') === true) {
		blocker = await createBlocker();
		blocker.enableBlockingInSession(session.defaultSession);
	}

	const template = createMenuTemplate(mainWindow, {
		settings: () => {
			isSettings = true;
			mainWindow.webContents.send('open-settings');
		},
		back: () => {
			getActiveFrame().webContents.goBack();
		},
		reload: () => {
			getActiveFrame().webContents.reload();
		},
		navYt: () => {
			switchView(ytFrame);
		},
		navMusic: () => {
			switchView(musicFrame);
		},
		zoom: (action: string) => {
			switch (action) {
				case 'in':
					getActiveFrame().webContents.setZoomFactor(
						getActiveFrame().webContents.getZoomFactor() + 0.2
					);
					break;
				case 'out':
					getActiveFrame().webContents.setZoomFactor(
						getActiveFrame().webContents.getZoomFactor() - 0.2
					);
					break;
				case 'reset':
					getActiveFrame().webContents.setZoomFactor(1);
					break;
			}
		}
	});

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	mainWindow.contentView.addChildView(ytFrame);
	mainWindow.contentView.addChildView(musicFrame);

	ytFrame.webContents.on('did-finish-load', () => {
		updateAccentColor(ytFrame, config.get('yt-accent-color'));
		if (isLoaded) return;
		isLoaded = true;
		mainWindow.webContents.send('loaded');
		if (config.get('default-tab') === 'music') {
			mainWindow.webContents.send('nav', 'music');
			musicFrame.setVisible(true);
		} else {
			ytFrame.setVisible(true);
		}
	});

	let ytmState = 0;
	let ytmData = null;

	ytFrame.webContents.on('did-navigate-in-page', () => {
		const url = ytFrame.webContents.getURL();
		discordRPC.setVideo(url);
		mainWindow.webContents.send('navigate', url);
	});
	musicFrame.webContents.on('did-navigate-in-page', () => {
		const url = musicFrame.webContents.getURL();
		mainWindow.webContents.send('navigate', url);
	});
	ytFrame.webContents.on('did-navigate', () => {
		const url = ytFrame.webContents.getURL();
		discordRPC.setVideo(url);
		mainWindow.webContents.send('navigate', url);
	});
	musicFrame.webContents.on('did-navigate', () => {
		const url = musicFrame.webContents.getURL();
		mainWindow.webContents.send('navigate', url);
	});

	ipcMain.on('ytmView:videoStateChanged', (_, state) => {
		ytmState = state;
	});

	ipcMain.on('open-settings', () => {
		isSettings = true;
		getActiveFrame().setVisible(false);
	});
	ipcMain.on('close-settings', () => {
		isSettings = false;
		updateAccentColor(ytFrame, config.get('yt-accent-color'));
		getActiveFrame().setVisible(true);
	});
	ipcMain.handle('app-v', () => {
		return app.getVersion();
	});

	ipcMain.on('nav', (_, to) => {
		if (!mainWindow.isDestroyed()) {
			if (to === 'yt') {
				if (ytmState === 1) {
					musicFrame.webContents.send('remoteControl:execute', 'pause');
				}
				discordRPC.setVideo(ytFrame.webContents.getURL());
				mainWindow.webContents.send('navigate', ytFrame.webContents.getURL());
				if (isLoaded) {
					switchView(ytFrame);
				}
			} else if (to === 'music') {
				discordRPC.setMusic(ytmData);
				mainWindow.webContents.send('navigate', musicFrame.webContents.getURL());
				ytFrame.webContents.send('player-action', 'pause');
				switchView(musicFrame);
			}
		}
	});

	ipcMain.handle('is-loaded', () => {
		return isLoaded;
	});
	ipcMain.on('update-config', async (_, key, value) => {
		handleConfigUpdate(key, value, blocker, mainWindow, ytFrame, getActiveFrame());
	});
	ipcMain.handle('get-all-config', () => {
		return config.all();
	});
	app.on('before-quit', () => {
		discordRPC.disable();
	});
});

app.on('window-all-closed', () => {
	app.quit();
});
