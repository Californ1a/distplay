const remote = require("electron").remote;
const ipc = require("electron").ipcRenderer;
const rq = require("electron-require");
const isDev = rq("electron-is-dev");
const mappings = rq("./assets/js/util/mappings.json");
const check = rq("./assets/js/util/check.js");
const Collection = rq("./assets/js/util/Collection.js");
rq("./assets/js/util/loadConfig.js").loadConfig();
const config = rq("./assets/js/util/loadConfig.js").getStore();

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
		check.sticks(gp.axes, map, 23, 52, 278, 52);
	}
	window.requestAnimationFrame(loop);
}

window.onload = () => {
	const win = remote.getCurrentWindow();
	if (isDev) {
		win.setContentSize(355, 155);
	}
	const allIDs = document.querySelectorAll("*[id]");

	for (const elt of allIDs) {
		const index = mappings[elt.id];
		const obj = {
			"id": index,
			"name": elt.id,
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
