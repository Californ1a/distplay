const remote = require("electron").remote;
const rq = require("electron-require");
const isDev = rq("electron-is-dev");
const mappings = rq("./assets/js/util/mappings.json");
const check = rq("./assets/js/util/check.js");
const Collection = rq("./assets/js/util/Collection.js");
const config = rq("./assets/js/util/loadConfig.js").loadConfig();

const map = new Collection();

function loop() {
	const gamepads = navigator.getGamepads();
	if (gamepads[0]) {
		const gp = gamepads[0];
		check.buttons(gp.buttons, map, 1);
		check.sticks(gp.axes, map, 23, 20, 268, 20);
	}
	window.requestAnimationFrame(loop);
}

window.onload = () => {
	const win = remote.getCurrentWindow();
	if (!isDev) {
		win.setContentSize(345, 95);
	}
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
