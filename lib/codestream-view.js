import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { addLocaleData, IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import en from "react-intl/locale-data/en";
import CodeStreamRoot from "./components/CodeStreamRoot";
import copy from "../translations/en.json";

addLocaleData([...en]);

export const CODESTREAM_VIEW_URI = "atom://codestream";

export default class CodestreamView {
	constructor(store) {
		this.store = store;
		this.element = document.createElement("div");
		this.element.classList.add("codestream");
		this.render();
	}

	getTitle() {
		return "CodeStream";
	}

	getIconName() {
		return "comment-discussion";
	}

	getDefaultLocation() {
		return "right";
	}

	getAllowedLocations() {
		return ["right", "left"];
	}

	isPermanentDockItem() {
		return false;
	}

	getPreferredWidth() {
		// FIXME save this as a preference
		return 300;
	}

	getURI() {
		return CODESTREAM_VIEW_URI;
	}

	serialize() {
		return {
			deserializer: "codestream/CodestreamView"
		};
	}

	destroy() {
		unmountComponentAtNode(this.element);
		this.element.remove();
	}

	update(store) {
		this.store = store;
		this.render();
	}

	render() {
		const directories = atom.project.getDirectories();
		const repoPromises = directories.map(repo => atom.project.repositoryForDirectory(repo));
		Promise.all(repoPromises).then(repos => {
			repos = repos.filter(Boolean);
			render(
				<IntlProvider locale="en" messages={copy}>
					<Provider store={this.store}>
						<CodeStreamRoot repositories={repos} />
					</Provider>
				</IntlProvider>,
				this.element
			);
		});
	}
}
