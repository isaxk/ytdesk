import { is } from "@electron-toolkit/utils";
import { BrowserWindow, ipcMain, nativeTheme, WebContentsView } from "electron";
import { join } from "path";
import icon from "../../../resources/icon.png?asset";



function createYoutubeFrame(mainWindow, headerHeight) {
	const frame = new WebContentsView(
		{
			webPreferences: {
				sandbox: true,
				contextIsolation: true,
				preload: join(__dirname, "../preload/ytview.js")
			}
		}
	);
	frame.webContents.loadURL("https://www.youtube.com");
	frame.setBounds({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
	frame.setVisible(false);

	return frame;
}

function createMusicFrame(mainWindow, headerHeight) {

	const frame = new WebContentsView({
		webPreferences: {
			sandbox: true,
			contextIsolation: true,
			preload: join(__dirname, "../preload/musicview.js")
		},
	})
	frame.webContents.loadURL("https://music.youtube.com");
	frame.setBounds({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
	frame.setVisible(false);


	return frame;
}

function createMainWindow() {
    const win = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 640,
		minHeight: 500,
		backgroundColor: nativeTheme.shouldUseDarkColors ? '#171717' : '#fafafa',
		show: true,
		autoHideMenuBar: true,
		titleBarStyle: "hiddenInset",
		frame: false,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/mainWindow.js"),
			sandbox: false,
		}
	})

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		win.loadURL(process.env["ELECTRON_RENDERER_URL"])
	} else {
		win.loadFile(join(__dirname, "../renderer/index.html"))
	}

	return win;
}

let activeFrame:WebContentsView;

export function createWindows(headerHeight) {
    const mainWindow = createMainWindow();
    const ytFrame = createYoutubeFrame(mainWindow, headerHeight);
    const musicFrame = createMusicFrame(mainWindow, headerHeight);

	function switchView(to:WebContentsView) {
		if(to===ytFrame) {
			musicFrame.setVisible(false);
			ytFrame.setVisible(true);
		}
		else {
			ytFrame.setVisible(false);
			musicFrame.setVisible(true);
		}
		activeFrame = to;
		return to;
	}

	function setBoundsOnActive(newBounds) {
		if (activeFrame === ytFrame) {
			ytFrame.setBounds(newBounds);
		}
		if (activeFrame === musicFrame) {
			musicFrame.setBounds(newBounds);
		}
	}

	function getActiveFrame() {
		return activeFrame;
	}
 
    return {
        mainWindow,
        ytFrame,
        musicFrame,
		switchView,
		setBoundsOnActive,
		getActiveFrame
    }
}

export function handleWindowControl(event, message) {
	const webContents = event.sender;
	const win = BrowserWindow.fromWebContents(webContents);

	switch (message) {
		case "minimize": win?.minimize(); break;
		case "maximize":
			if (win?.isMaximized()) {
				win?.unmaximize();
			}
			else {
				win?.maximize();
			}

			break;
		case "close": win?.close(); break;
	}
};

ipcMain.on("window-control", handleWindowControl);
