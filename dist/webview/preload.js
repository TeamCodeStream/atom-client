// @ts-check
const { ipcRenderer } = require("electron");

const host = {
	on(channel, cb) {
		ipcRenderer.on(channel, (e, args) => cb(args));
	},

	send(channel, message) {
		ipcRenderer.sendToHost(channel, message);
	},
};

Object.defineProperty(window, "acquireAtomApi", {
	value: () => host,
});

document.addEventListener("DOMContentLoaded", () => {
	host.send("ready");
	document.addEventListener("keydown", e => {
		host.send("did-keydown", {
			key: e.key,
			keyCode: e.keyCode,
			code: e.code,
			shiftKey: e.shiftKey,
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			metaKey: e.metaKey,
			repeat: e.repeat,
		});
	});
});
