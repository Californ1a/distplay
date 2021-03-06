const remote = require("electron").remote;
const ipc = require("electron").ipcRenderer;
const isDev = require("electron-is-dev");
const path = require("path");
const appPath = remote.app.getAppPath();
const mappings = require(path.resolve(appPath, "./src/assets/js/util/mappings.json"));
const check = require(path.resolve(appPath, "./src/assets/js/util/check.js"));
const Collection = require(path.resolve(appPath, "./src/assets/js/util/Collection.js"));
const config = require(path.resolve(appPath, "./src/assets/js/util/loadConfig.js")).loadConfig();

let msgSent = false;
const map = new Collection();

function loop() {
	const gamepads = navigator.getGamepads();
	if (gamepads[0]) {
		if (!msgSent) {
			const ids = [];
			for (const gamepad of gamepads) {
				if (gamepad) {
					ids.push(gamepad.id);
				}
			}
			msgSent = true;
			config.set("Settings.selectedGamepad", config.get("Settings.selectedGamepad", gamepads[0]));
			ipc.send("update-gamepads", ids);
		}
		let gp = gamepads[0];
		for (const gamepad of gamepads) {
			if (gamepad && gamepad.id && config.get("Settings.selectedGamepad", gamepad.id) === gamepad.id) {
				gp = gamepad;
			}
		}
		check.buttons(gp.buttons, map);
		check.sticks(gp.axes, map, 23, 20, 268, 20);
	}
	window.requestAnimationFrame(loop);
}

window.onload = () => {
	const win = remote.getCurrentWindow();
	if (!isDev) {
		win.setContentSize(345, 95);
	}
	document.title = `Distplay ${remote.app.getVersion()}`;
	const allIDs = document.querySelectorAll("*[id]");

	for (const elt of allIDs) {
		let index;
		const bind = config.get(`Bindings.${elt.id}`);
		if (elt.id.match(/^ls|rs$/i)) {
			index = mappings[elt.id];
		} else {
			index = mappings[bind];
		}
		const obj = {
			"id": index,
			"name": elt.id,
			"button": (bind) ? bind : elt.id,
			"element": elt
		};
		map.set(index, obj);
	}
	window.requestAnimationFrame(loop);
};

ipc.on("refreshGamepads", () => {
	const gamepads = navigator.getGamepads();
	if (gamepads[0]) {
		const ids = [];
		for (const gamepad of gamepads) {
			if (gamepad) {
				ids.push(gamepad.id);
			}
		}
		msgSent = true;
		ipc.send("update-gamepads", ids);
	}
});

// ipc.on("mainReply", (event, arg) => {
// 	console.log(arg);
// });
