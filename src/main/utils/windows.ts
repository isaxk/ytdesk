import { is } from "@electron-toolkit/utils";
import { BrowserWindow, HandlerDetails, ipcMain, nativeTheme, shell, WebContentsView, WindowOpenHandlerResponse } from "electron";
import { join } from "path";
import icon from "../../../resources/icon.png?asset";
import { handleNavigate } from "./navigation";



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

let activeFrame: WebContentsView;
let mainWindow: BrowserWindow;
let ytFrame: WebContentsView;
let musicFrame: WebContentsView;

let isFullscreen: boolean = false;
let isSettings: boolean = false;

export function getWindows(headerHeight) {

	if (!mainWindow || !ytFrame || !musicFrame) {
		mainWindow = createMainWindow();
		ytFrame = createYoutubeFrame(mainWindow, headerHeight);
		musicFrame = createMusicFrame(mainWindow, headerHeight);
	}


	function switchView(to: WebContentsView) {
		if (to === ytFrame) {
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

	function enterFullScreen() {
		isFullscreen = true;
		setBoundsOnActive({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height });
		mainWindow.webContents.send("enter-full-screen");
	}

	function leaveFullScreen() {
		isFullscreen = false;
		setBoundsOnActive({ x: 0, y: headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - headerHeight });
		mainWindow.webContents.send("leave-full-screen");
	}

	function updateWindowSize() {
		const newSize = { x: 0, y: isFullscreen ? 0 : headerHeight, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - (isFullscreen ? 0 : headerHeight) };
		ytFrame.setBounds(newSize);
		musicFrame.setBounds(newSize);
	}

	function openSettings() {
		isSettings = true;
		mainWindow.webContents.send("open-settings");
		getActiveFrame().setVisible(false);
	}

	function closeSettings() {
		isSettings = false;
		mainWindow.webContents.send("close-settings");
		getActiveFrame().setVisible(true);
	}

	function windowOpenHandler(details: HandlerDetails): WindowOpenHandlerResponse {
		shell.openExternal(details.url);
		return {
			action: "deny",
		}
	}

	ipcMain.on("open-settings", openSettings);
	ipcMain.on("close-settings", closeSettings);

	ytFrame.webContents.on("enter-html-full-screen", enterFullScreen);
	ytFrame.webContents.on("leave-html-full-screen", leaveFullScreen);
	musicFrame.webContents.on("enter-html-full-screen", enterFullScreen);
	musicFrame.webContents.on("leave-html-full-screen", leaveFullScreen);

	ytFrame.webContents.on("will-navigate", handleNavigate);
	musicFrame.webContents.on("will-navigate", handleNavigate);

	mainWindow.webContents.setWindowOpenHandler(windowOpenHandler)
	ytFrame.webContents.setWindowOpenHandler(windowOpenHandler);
	musicFrame.webContents.setWindowOpenHandler(windowOpenHandler);

	mainWindow.on("resize", updateWindowSize);

	ipcMain.on("page-action", (_, data) => {
		if (data.action === "back") {
			getActiveFrame().webContents.goBack();
		}
		else if (data.action === "refresh") {
			getActiveFrame().webContents.reload();
		}
	});

	return {
		mainWindow,
		ytFrame,
		musicFrame,
		switchView,
		setBoundsOnActive,
		getActiveFrame,
		openSettings,
		closeSettings,
	}
}

function handleWindowControl(event, message) {
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

