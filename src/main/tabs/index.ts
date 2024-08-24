import { ElectronBlocker } from '@cliqz/adblocker-electron';
import {
	BrowserWindow,
	ipcMain,
	shell,
	WebContentsView,
	WindowOpenHandlerResponse
} from 'electron';
import { factory } from 'electron-json-config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { sleep } from '../utils';

export async function createBlocker() {
	const blocker = await ElectronBlocker.fromLists(
		fetch,
		[''],
		{
			enableCompression: true,
			enableInMemoryCache: true
		},
		{
			path: 'engine.bin',
			read: async (...args) => readFileSync(...args),
			write: async (...args) => writeFileSync(...args)
		}
	);
	return blocker;
}

function windowOpenHandler(details): WindowOpenHandlerResponse {
	shell.openExternal(details.url);
	return {
		action: 'deny'
	};
}

const store = factory();

let currentTab: number | null = 0;
let isFullscreen = false;

export async function createTabManager(mainWindow: BrowserWindow) {
	function bounds() {
		return {
			x: 0,
			y: isFullscreen ? 0 : 40,
			width: mainWindow.getBounds().width,
			height: mainWindow.getBounds().height - (isFullscreen ? 0 : 40)
		};
	}

	function createMusicTab() {
		const view = new WebContentsView({
			webPreferences: {
				transparent: true,
				preload: join(__dirname, '../preload/music.mjs'),
				sandbox: false,
				contextIsolation: true
			}
		});
		view.webContents.loadURL('https://music.youtube.com');
		view.setVisible(false);
		mainWindow.contentView.addChildView(view);
		mainWindow.on('resize', () => {
			view.setBounds(bounds());
		});
		view.setBounds(bounds());

		view.webContents.setWindowOpenHandler(windowOpenHandler);

		ipcMain.on('music-remote', (_, command, value) => {
			view.webContents.send('remoteControl:execute', command, value);
		});

		let loaded = false;
		ipcMain.once('ytmView:loaded', async () => {
			if (!loaded) {
				await sleep(500);
				view.setVisible(true);
				loaded = true;
			}
			updateTabs();
		});

		let id = 0;
		view.webContents.on('did-navigate', () => updateTabs());
		view.webContents.on('did-navigate-in-page', () => updateTabs());

		// blocker.enableBlockingInSession(view.webContents.session);

		return {
			view,
			unset: () => {
				mainWindow.contentView.removeChildView(view);
			},
			set: () => {
				mainWindow.contentView.addChildView(view);
			},
			data: () => {
				return {
					title: view.webContents.getTitle(),
					url: view.webContents.getURL(),
					type: 'music',
					id
				};
			}
		};
	}

	function createStudioTab() {
		const view = new WebContentsView({
			webPreferences: {
				// preload: join(__dirname, '../preload/music.js'),
				sandbox: false,
				contextIsolation: true
			}
		});

		mainWindow.on('resize', () => {
			view.setBounds(bounds());
		});
		view.setBounds(bounds());
		view.webContents.loadURL('https://studio.youtube.com');
		view.webContents.setWindowOpenHandler(windowOpenHandler);

		let id = 1;

		let loaded = false;
		view.webContents.on('did-finish-load', () => {
			if (!loaded) {
				view.setVisible(true);
				loaded = false;
			}
			updateTabs();
		});
		view.webContents.on('did-navigate', () => updateTabs());
		view.webContents.on('did-navigate-in-page', () => updateTabs());

		// blocker.enableBlockingInSession(view.webContents.session);

		return {
			view,
			unset: () => {
				mainWindow.contentView.removeChildView(view);
			},
			set: () => {
				mainWindow.contentView.addChildView(view);
			},
			data: () => {
				return {
					title: view.webContents.getTitle(),
					url: view.webContents.getURL(),
					type: 'studio',
					id
				};
			}
		};
	}

	function createTab() {
		const view = new WebContentsView({
			webPreferences: {
				transparent: true,
				preload: join(__dirname, '../preload/yt.mjs'),
				sandbox: false,
				contextIsolation: true,
				allowRunningInsecureContent: true,
				webSecurity: false
			}
		});
		view.setVisible(false);
		mainWindow.contentView.addChildView(view);
		mainWindow.on('resize', () => {
			view.setBounds(bounds());
		});
		view.setBounds(bounds());
		view.webContents.loadURL('https://www.youtube.com');
		view.webContents.setWindowOpenHandler(windowOpenHandler);

		let id = Date.now();

		let loaded = false;
		view.webContents.on('did-finish-load', () => {
			if (!loaded) {
				view.setVisible(true);
				loaded = false;
			}
			updateTabs();
		});
		view.webContents.on('did-navigate', () => updateTabs());
		view.webContents.on('did-navigate-in-page', () => {
			updateTabs();
			view.webContents.send('navigate');
		});

		view.webContents.on('enter-html-full-screen', () => {
			isFullscreen = true;
			view.setBounds(bounds());
		});
		view.webContents.on('leave-html-full-screen', () => {
			isFullscreen = false;
			view.setBounds(bounds());
		});

		return {
			view,
			unset: () => {
				mainWindow.contentView.removeChildView(view);
			},
			set: () => {
				mainWindow.contentView.addChildView(view);
			},
			data: () => {
				return {
					title: view.webContents.getTitle(),
					url: view.webContents.getURL(),
					type: 'yt',
					id
				};
			}
		};
	}

	let tabs = [createMusicTab()];

	if (store.get('studio-tab')) {
		tabs.push(createStudioTab());
	}

	function switchTab(i: number) {
		if (currentTab!==null) {
			tabs[currentTab].unset();
		}
		tabs[i].set();

		currentTab = i;
	}

	function updateTabs() {
		mainWindow.webContents.send('update-tabs', { tabs: tabs.map((o) => o.data()), currentTab });
	}

	ipcMain.on('switch-tab', (_, i) => {
		switchTab(i);
		updateTabs();
	});

	ipcMain.on('new-tab', () => {
		tabs.push(createTab());
		if (currentTab !== null) tabs[currentTab].unset();
		switchTab(tabs.length - 1);
		updateTabs();
	});

	ipcMain.on('close-tab', (_, i) => {
		if (tabs.length < 2) {
			return;
		} else {
			tabs[i].unset();
			tabs[i].view.webContents.close();
			tabs.splice(i, 1);
			if (tabs[i] == null) {
				currentTab = null;
				switchTab(i - 1);
			} else {
				currentTab = null;
				switchTab(i);
			}
		}
		updateTabs();
	});

	ipcMain.on('page-action', (_, i) => {
		if (currentTab !== null) {
			switch (i) {
				case 'back':
					tabs[currentTab].view.webContents.goBack();
					break;
				case 'forward':
					tabs[currentTab].view.webContents.goForward();
					break;
				case 'reload':
					tabs[currentTab].view.webContents.reload();
					break;
			}
		}
	});

	ipcMain.on('open-settings', () => {
		if(currentTab!==null) {
			tabs[currentTab].view.setVisible(false);
			tabs[currentTab].unset();
		}
	});

	ipcMain.on('close-settings', () => {
		if(currentTab!==null) {
			tabs[currentTab].view.setVisible(true);
			tabs[currentTab].set();
		}
	});

	ipcMain.on('open-miniplayer', () => {
		if(currentTab!==null) {
			tabs[currentTab].view.setVisible(false)
			tabs[currentTab].unset();
		}
	});

	ipcMain.on('close-miniplayer', () => {
		if(currentTab!==null) {
			tabs[currentTab].view.setVisible(true)
			tabs[currentTab].set();
		}
	});

	let loaded = false;

	mainWindow.on('ready-to-show', async () => {
		if (!loaded) {
			updateTabs();
			switchTab(0);
			loaded = true;
		}
	});

	return {
		getTabs: ()=>{
			return tabs
		}
	}
}
