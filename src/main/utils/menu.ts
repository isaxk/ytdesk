import { BrowserWindow } from "electron";

export function createMenuTemplate(mainWindow: BrowserWindow, handlers: { settings: Function, back: Function, reload: Function, navYt: Function, navMusic: Function, zoom: Function }) {
    const isMac = process.platform === "darwin";

    const template: Array<any> = [
        ...(isMac ? [
            {
                label: "YTDesk",
                submenu: [
                    {
                        label: "Settings",
                        accelerator: "Cmd+,",
                        click: ()=>handlers.settings(),
                    },
                    { type: "separator" },
                    { role: "hide" },
                    { role: "hideOthers" },
                    { type: "separator" },
                    { role: "quit" }
                ]
            }
        ] : []),
        {
            label: "File",
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' },
                { type: "separator" },
                {
                    label: "Switch to Youtube",
                    accelerator: "Alt+Y",
                    click: () => {
                        mainWindow.webContents.send("nav", "yt");
                    }
                },
                {
                    label: "Switch to Music",
                    accelerator: "Alt+M",
                    click: () => {
                        mainWindow.webContents.send("nav", "music");
                    }
                }
            ]
        },
        { role: 'editMenu' },
        {
            label: 'View',
            submenu: [
                {
                    label: "Go Back",
                    click: () => handlers.back(),
                    accelerator: isMac ? "Cmd+Backspace" : "Control+Backspace"
                },
                {
                    label: "Reload",
                    click: () => handlers.reload(),
                    accelerator: isMac ? "Cmd+R" : "Control+R"
                },
                { type: 'separator' },
                {
                    label: "Zoom In",
                    // click: () => activeFrame.webContents.setZoomFactor(activeFrame.webContents.getZoomFactor() + 0.2),
                    click: () => handlers.zoom("in"),
                    accelerator: isMac ? "Cmd+Plus" : "Control+Plus"
                },
                {
                    label: "Zoom Out",
                    // click: () => activeFrame.webContents.setZoomFactor(activeFrame.webContents.getZoomFactor() - 0.2),
                    click: () => handlers.zoom("out"),
                    accelerator: isMac ? "Cmd+-" : "Control+-"
                },
                {
                    label: "Reset Zoom",
                    // click: () => activeFrame.webContents.setZoomFactor(1),
                    click: () => handlers.zoom("reset"),
                    accelerator: isMac ? "Cmd+0" : "Control+0"
                },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        { role: 'windowMenu' },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    }
                }
            ]
        }
    ];

    return template;
}