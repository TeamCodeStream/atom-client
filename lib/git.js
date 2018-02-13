import { BufferedProcess } from "atom";

export default (args, options = { env: process.env }) => {
	return new Promise((resolve, reject) => {
		let output = "";
		const process = new BufferedProcess({
			command: "git",
			args,
			options,
			stdout: data => {
				output += data.toString();
			},
			stderr: data => {
				output += data.toString();
			},
			exit: code => (code === 0 ? resolve(output) : reject(output))
		});
		process.onWillThrowError(error => {
			atom.notifications.addError(
				//FIXME loc
				"CodeStream is unable to locate the git command. Please ensure git is in your PATH."
			);
			reject();
		});
	});
};
