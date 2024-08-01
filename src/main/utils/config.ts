import { app, session } from 'electron';
import { createBlocker } from './blocker';
import { factory } from 'electron-json-config';

const config = factory();

export async function handleConfigUpdate(key, value, blocker, mainWindow, ytFrame, activeFrame) {
	config.set(key, value);
	mainWindow.webContents.send('refresh-config');
	ytFrame.webContents.send('force-cinema', config.get('force-cinema'));
	switch (key) {
		case 'force-cinema':
			activeFrame.webContents.reload();
			break;
		case 'ad-blocking':
			if (value === false && blocker) {
				blocker.disableBlockingInSession(session.defaultSession);
			} else {
				if (!blocker) blocker = await createBlocker();
				blocker.enableBlockingInSession(session.defaultSession);
			}
			activeFrame.webContents.reload();
			break;
		case 'open-at-login':
			if (value === true) {
				app.setLoginItemSettings({
					openAtLogin: true
				});
			} else {
				app.setLoginItemSettings({
					openAtLogin: false
				});
			}
			break;
	}
}

const loginSettings = app.getLoginItemSettings();

if (loginSettings.openAtLogin) {
	config.set('open-at-login', true);
} else {
	config.set('open-at-login', false);
}
