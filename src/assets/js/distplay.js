const remote = require("electron").remote;
const rq = require("electron-require");
const isDev = rq("electron-is-dev");
const mappings = rq("./assets/js/util/mappings.json");
const check = rq("./assets/js/util/check.js");
const Collection = rq("./assets/js/util/Collection.js");
rq("./assets/js/util/loadConfig.js").loadConfig();

const map = new Collection();

function loop() {
	const gamepads = navigator.getGamepads();
	if (gamepads[0] !== undefined) {
		const gp = gamepads[0];
		check.buttons(gp.buttons, map);
		check.sticks(gp.axes, map, 23, 52, 278, 52);
	}
	window.requestAnimationFrame(loop);
}

window.onload = () => {
	const win = remote.getCurrentWindow();
	if (!isDev) {
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
