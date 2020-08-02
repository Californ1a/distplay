const remote = require("electron").remote;
const path = require("path");
const appPath = remote.app.getAppPath();
const mappings = require(path.resolve(appPath, "./src/assets/js/util/mappings.json"));

function setPressed(ele) {
	(ele.name.match(/^ls|rs$/i)) ? ele.element.classList.add("stickpressed"): ele.element.classList.add("pressed");
}

function rmPressed(ele) {
	(ele.name.match(/^ls|rs$/i)) ? ele.element.classList.remove("stickpressed"): ele.element.classList.remove("pressed");
}

function dpadOpposite(ele, map) {
	let opposite;
	switch (ele.name) {
		case "dup":
			opposite = map.find("name", "ddown");
			break;
		case "ddown":
			opposite = map.find("name", "dup");
			break;
		case "dleft":
			opposite = map.find("name", "dright");
			break;
		case "dright":
			opposite = map.find("name", "dleft");
			break;
	}
	return opposite;
}

function checkButtons(buttons, map, type) {
	for (let i = 0; i < Object.keys(mappings).length; i++) {
		const ele = map.get(i);
		if (ele && buttons[i].pressed) {
			if (ele.name.match(/^rt|lt$/i) && !type) {
				ele.element.style.width = `${buttons[i].value*70}px`;
				if (ele.name === "lt") {
					ele.element.style.left = `${80-buttons[i].value*70}px`;
				}
			} else {
				setPressed(ele);
			}
			if (ele.name.match(/^dup|ddown|dleft|dright$/i)) {
				rmPressed(dpadOpposite(ele, map));
			}
		} else if (ele) {
			if (ele.name.match(/^rt|lt$/i) && !type) {
				ele.element.style.width = "0";
				// if (ele.name === "lt") {
				// 	ele.element.style.left = "auto";
				// }
			} else {
				rmPressed(ele);
			}
		}
	}
}

function checkSticks(axes, map, ls1, ls2, rs1, rs2) {
	if (axes[0] !== 0) {
		map.find("name", "ls").element.style.left = `${ls1 + (axes[0] * 18)}px`;
	}
	if (axes[1] !== 0) {
		map.find("name", "ls").element.style.top = `${ls2 + (axes[1] * 18)}px`;
	}
	if (axes[2] !== 0) {
		map.find("name", "rs").element.style.left = `${rs1 + (axes[2] * 18)}px`;
	}
	if (axes[3] !== 0) {
		map.find("name", "rs").element.style.top = `${rs2 + (axes[3] * 18)}px`;
	}
}

module.exports = {
	"buttons": checkButtons,
	"sticks": checkSticks
};
