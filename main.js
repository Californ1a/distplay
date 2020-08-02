const {
	app,
	BrowserWindow,
	Menu
} = require("electron");
const shell = require("electron").shell;
const ipc = require("electron").ipcMain;
const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");
// const rq = require("electron-require");
const appPath = app.getAppPath();
const config = require(path.resolve(appPath, "./src/assets/js/util/loadConfig.js")).getStore();
// require("update-electron-app")();

const {
	autoUpdater
} = require("electron-updater");
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
autoUpdater.checkForUpdatesAndNotify();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let settingsWindow;
let gamepads;
app.disableHardwareAcceleration();

const shouldQuit = app.requestSingleInstanceLock();

if (!shouldQuit) {
	app.quit();
} else {
	app.on("second-instance", () => {
		// Someone tried to run a second instance, we should focus our window.
		if (win) {
			if (win.isMinimized()) {
				win.restore();
			}
			win.focus();
		}
	});
}

function loadURL(samePage) {
	const currentURL = win.webContents.getURL();
	let newPage = config.get("Settings.selectedLayout", "distplay");
	if (!samePage) {
		newPage = `distplay${(currentURL.includes("distance")) ? "" : "-distance"}`;
	}
	config.set("Settings.selectedLayout", newPage);
	win.loadURL(url.format({
		pathname: path.join(__dirname, `src/${newPage}.html`),
		protocol: "file:",
		slashes: true
	}));
}

function getGamepads() {
	// win.webContents.send("refreshGamepads");
	const submenu = [];
	if (gamepads && gamepads[0]) {
		for (const gamepad of gamepads) {
			submenu.push({
				label: `${(config.get("Settings.selectedGamepad", gamepad)===gamepad)?"✓ ":""}${gamepad}`,
				click() {
					config.set("Settings.selectedGamepad", gamepad);
					loadURL(true);
				}
			});
		}
	}
	if (submenu[0]) {
		return submenu;
	} else {
		return [{
			label: "No gamepads found.",
			enabled: false
		}];
	}
}

function createContextMenu() {
	// contextMenu({
	// 	prepend: () => [{
	const menu = Menu.buildFromTemplate([{
		label: "Switch Layout",
		click() {
			loadURL();
		}
	}, {
		label: "Settings",
		click() {
			const modalPath = url.format({
				pathname: path.join(__dirname, "src/settings.html"),
				protocol: "file:",
				slashes: true
			});
			let wi = 400;
			let he = 380;
			if (isDev) {
				wi = 1280;
				he = 720;
			}
			settingsWindow = new BrowserWindow({
				alwaysOnTop: true,
				icon: path.join(__dirname, "src/assets/images/favicon.png"),
				useContentSize: true,
				frame: false,
				transparent: true,
				width: wi,
				height: he,
				webPreferences: {
					nodeIntegration: true,
					enableRemoteModule: true
				}
			});
			settingsWindow.on("closed", () => {
				//Automatically refresh active page to apply new config when settings window closes
				if (win) {
					loadURL(true);
				}
				settingsWindow = null;
			});
			settingsWindow.loadURL(modalPath);
			settingsWindow.setMenu(null);
			if (isDev) {
				settingsWindow.webContents.openDevTools();
			}
			settingsWindow.show();
		}
	}, {
		label: "Toggle Always-On-Top",
		click() {
			win.setAlwaysOnTop(!win.isAlwaysOnTop());
		}
	}, {
		type: "separator"
	}, {
		label: "Gamepads",
		submenu: getGamepads()
	}, {
		label: "Refresh Gamepads",
		click() {
			win.webContents.send("refreshGamepads");
		}
	}, {
		type: "separator"
	}, {
		label: "About",
		click() {
			shell.openExternal("https://github.com/Californ1a/distplay#readme");
		}
	}, {
		label: "Report Bug",
		click() {
			shell.openExternal("https://github.com/Californ1a/distplay/issues");
		}
	}, {
		type: "separator"
	}, {
		label: "Exit",
		click() {
			app.quit();
		}
	}]);

	menu.popup({
		window: win
	});
	// 	}]
	// });
}

function createWindow() {
	// Create the browser window.
	let w = 355;
	let h = 155;
	if (isDev) {
		w = 800;
		h = 600;
	}
	win = new BrowserWindow({
		icon: path.join(__dirname, "src/assets/images/favicon.png"),
		useContentSize: true,
		// autoHideMenuBar: true,
		backgroundColor: "#000",
		width: w,
		height: h,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});

	win.setMenuBarVisibility(false);

	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, `src/${config.get("Settings.selectedLayout", "distplay")}.html`),
		protocol: "file:",
		slashes: true
	}));

	// Open the DevTools.
	if (isDev) {
		win.webContents.openDevTools();
	}
	// Emitted when the window is closed.
	win.on("close", () => {
		if (settingsWindow) {
			settingsWindow.close();
		}
		settingsWindow = null;
		win = null;
	});

	win.webContents.on("context-menu", (e, p) => {
		createContextMenu(p.x, p.y);
	});

	// createContextMenu();

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipc.on("update-gamepads", (event, arg) => {
	gamepads = arg;
	// win.webContents.send("mainReply", arg);
	// createContextMenu();
});
