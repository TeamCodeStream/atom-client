import { CompositeDisposable } from "atom";
import React, { Component } from "react";
import { connect } from "react-redux";
import createClassString from "classnames";
import withRepositories from "./withRepositories";
import { getUserPreference } from "../actions/user";
import * as actions from "../actions/umi";
import rootLogger from "../util/Logger";
import { getStreamsForRepo } from "../reducers/streams";

const Path = require("path");
const logger = rootLogger.forClass("components/UMIs");

const { app } = require("electron").remote;

export class SimpleUMIs extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		// if (atom.packages.isPackageLoaded("tree-view"))
		let treeView = atom.packages.getLoadedPackage("tree-view");
		if (treeView) this.treeView = treeView.mainModule.getTreeViewInstance();

		this.repo = props.repositories[0];

		let that = this;
		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(
			atom.contextMenu.add({
				".tree-view [is='tree-view-file'], .tree-view [is='tree-view-directory']": [
					{
						label: "Notifications",
						submenu: [
							{
								label: "Mute",
								command: "codestream:mute",
								created: function(event) {
									this.label = that.muteLabel(event);
								}
							},
							{
								label: "Bold",
								command: "codestream:bold",
								created: function(event) {
									this.label = that.boldLabel(event);
								}
							},
							{
								label: "Badge",
								command: "codestream:badge",
								created: function(event) {
									this.label = that.badgeLabel(event);
								}
							}
						]
					},
					{ type: "separator" }
				]
			})
		);
	}

	componentDidMount() {
		this.props.recalculate();
		this.scrollDiv = document.getElementsByClassName("tree-view")[0];
		this.scrollDiv.addEventListener("scroll", this.handleScroll.bind(this));
		this.scrollDiv.addEventListener("click", this.handleClick.bind(this));
		let that = this;
		new ResizeObserver(function() {
			that.handleScroll();
		}).observe(this.scrollDiv);
	}

	componentWillUnmount() {
		this.clearTreatments();
		this.subscriptions.dispose();
	}

	getTreatmentFromEvent = event => {
		let li = event.target.closest("li");
		if (!li) return;

		let path = li.getElementsByTagName("span")[0].getAttribute("data-path");
		path = this.repo.relativize(path).replace(Path.sep, "/");
		let prefPath = ["streamTreatments", this.props.repoId, path];
		return getUserPreference(this.props.currentUser, prefPath);
	};

	muteLabel = event => {
		return this.getTreatmentFromEvent(event) === "mute" ? "\u2713 Mute" : "    Mute";
	};

	boldLabel = event => {
		return this.getTreatmentFromEvent(event) === "bold" ? "\u2713 Bold" : "    Bold";
	};

	badgeLabel = event => {
		return this.getTreatmentFromEvent(event) === "badge" ? "\u2713 Badge" : "    Badge";
	};

	render() {
		const umis = this.props.umis;

		this.addUnreadsIndicatorDivs();
		// logger.debug("TREE TRACKER IS: ", this.treeView);
		// logger.debug("THE STREAMS ARE: ", this.props.streams);
		// logger.debug("RENDERING UMIS", umis);
		// logger.debug(this.cwd + "/marker_pseudo_code.js");
		// logger.debug(this.treeView.entryForPath(this.cwd + "/marker_pseudo_code.js"));

		function swapHash(json) {
			var ret = {};
			Object.keys(json).map(key => {
				ret[json[key].id] = key;
			});
			return ret;
		}

		let streamMap = swapHash(this.props.streams);
		this.clearTreatments();

		let totalUMICount = 0;
		Object.keys(umis.unread).map(key => {
			let path = streamMap[key] || "";
			if (!path) return;
			let count = umis.unread[key] || 0;
			let mentions = umis.mentions[key] || 0;
			// logger.debug("CALC: " + count + " FOR " + path + " w/key: " + key + " ment? " + mentions);
			totalUMICount += this.calculateTreatment(path, count, mentions);
		});
		app.setBadgeCount(Math.floor(totalUMICount));
		Object.keys(umis.unread).map(key => {
			let path = streamMap[key] || "";
			this.treatPath(path);
		});

		let prefPath = ["streamTreatments", this.props.repoId];
		let treatments = getUserPreference(this.props.currentUser, prefPath) || {};
		Object.keys(treatments).map(path => {
			// logger.debug("Treating ", path, " with ", treatments[path]);
			let isMute = treatments[path] === "mute" ? 1 : 0;
			this.treatMute(path, isMute);
		});

		this.handleScroll();
		return null;
	}

	clearTreatments() {
		this.treatments = {};

		let elements = document.getElementsByClassName("cs-has-umi");
		let index = elements.length;
		while (index--) {
			let element = elements[index];

			element.setAttribute("cs-umi-mention", 0);
			element.setAttribute("cs-umi-badge", 0);
			element.setAttribute("cs-umi-count", 0);
			element.setAttribute("cs-umi-bold", 0);
			element.setAttribute("cs-umi-mute", 0);
			element.classList.remove("cs-has-umi");
		}
	}

	calculateTreatment(path, count, mentions) {
		let treatment = this.getTreatment(path);
		logger.debug("FOR: ", count, " treat ", treatment, " in ", path, " with mentions ", mentions);

		let parts = path.split("/");
		while (parts.length) {
			let pathPart = parts.join("/");
			if (!this.treatments[pathPart]) this.treatments[pathPart] = {};
			if (mentions) {
				this.treatments[pathPart]["mentions"] =
					(this.treatments[pathPart]["mentions"] || 0) + mentions;
			}
			if (mentions || treatment !== "mute") {
				this.treatments[pathPart]["count"] = (this.treatments[pathPart]["count"] || 0) + count;
			}
			// if (treatment !== "mute") this.treatments[pathPart]["treatment"] += treatment;
			parts.pop();
		}

		let totalUMICount = 0;
		if (mentions || treatment === "badge") {
			totalUMICount += count;
		} else if (treatment === "mute") {
			// do nothing if the user wants to mute
		} else {
			// this is bold; don't add to the app badge count
			totalUMICount += 0.000001;
		}
		logger.debug("Returning: ", totalUMICount, " for ", path);
		return totalUMICount;
	}

	treatMute(path, isMute) {
		path = path.replace(/\*/g, ".");
		const fullPath = Path.join(this.props.workingDirectory, path).replace(/\//g, Path.sep);
		let element = this.treeView.entryForPath(fullPath);
		logger.debug("Treating element ", element, " with ", isMute);
		if (!element) return;
		// don't treat directories that are expanded
		if (element.classList.contains("directory")) {
			let liPath = element.getElementsByTagName("span")[0].getAttribute("data-path");
			liPath = this.repo.relativize(liPath).replace(Path.sep, "/");
			if (liPath !== path) return;
		}
		element.setAttribute("cs-umi-mute", isMute);
	}

	treatPath(path) {
		const fullPath = Path.join(this.props.workingDirectory, path).replace(/\//g, Path.sep);
		let element = this.treeView.entryForPath(fullPath);
		if (!element) {
			return;
		}

		// don't treat directories that are expanded
		if (element.classList.contains("directory") && element.classList.contains("expanded")) return;

		let liPath = element.getElementsByTagName("span")[0].getAttribute("data-path");
		liPath = this.repo.relativize(liPath).replace(Path.sep, "/");

		// if the user wants a badge... set the appropriate class
		let treatmentData = this.treatments[liPath];
		if (!treatmentData) return;
		let count = treatmentData["count"];
		let mentions = treatmentData["mentions"];
		let treatment = this.getTreatment(liPath);

		if (mentions) {
			element.setAttribute("cs-umi-mention", count > 0 ? 1 : 0);
			element.setAttribute("cs-umi-badge", count > 0 ? 1 : 0);
			element.setAttribute("cs-umi-count", mentions > 99 ? "99+" : mentions || 0);
		} else if (treatment === "badge") {
			element.setAttribute("cs-umi-badge", count > 0 ? 1 : 0);
			element.setAttribute("cs-umi-count", count > 99 ? "99+" : count || 0);
		} else if (treatment === "mute") {
			// no need to do this here; we're doing mute treatment at the end
			// in a separate pass, since muted directories impact subdirs and files
			// element.setAttribute("cs-umi-mute", 1);
		} else {
			// default is to bold
			element.setAttribute("cs-umi-bold", count > 0 ? 1 : 0);
		}

		// if we actually have a UMI that hasn't been muted....
		if (mentions || (count > 0 && treatment !== "mute")) {
			element.classList.add("cs-has-umi");
		} else {
			element.classList.remove("cs-has-umi");
		}
	}

	getTreatment(path) {
		let parts = path.split("/");
		let index = parts.length;
		while (parts.length) {
			let path = parts.join("/");
			let prefPath = ["streamTreatments", this.props.repoId, path];
			let treatment = getUserPreference(this.props.currentUser, prefPath);
			// logger.debug("GOT: ", treatment, " FOR ", ["streamTreatments", this.props.repoId, path]);
			// atom.config.get("CodeStream.showUnread-" + path);
			if (treatment) return treatment;
			parts.pop();
		}
		return atom.config.get("CodeStream.showUnread") || "bold";
	}

	handleClick(event) {
		// rerender because there may be a directory open/close
		this.render();
	}

	handleScroll(event) {
		// let elements = scrollDiv.getElementsByClassName("");
		let scrollDiv = event
			? event.target
			: document.getElementsByClassName("tool-panel tree-view")[0];

		if (!scrollDiv) {
			console.log("Couldn't find scrollDiv for ", event);
			return;
		}

		let scrollTop = scrollDiv.scrollTop;
		let containerHeight = scrollDiv.parentNode.offsetHeight;

		let unreadsAbove = false;
		let unreadsBelow = false;
		let mentionsAbove = false;
		let mentionsBelow = false;

		let umiDivs = document.getElementsByClassName("cs-has-umi");
		let index = umiDivs.length;
		while (index--) {
			let umi = umiDivs[index];
			let top = umi.offsetTop;
			if (top - scrollTop + 10 < 0) {
				unreadsAbove = true;
				if (umi.getAttribute("cs-umi-mention") == "1") mentionsAbove = true;
			}
			if (top - scrollTop + 10 > containerHeight) {
				unreadsBelow = true;
				if (umi.getAttribute("cs-umi-mention") == "1") mentionsBelow = true;
			}
		}
		this.setUnreadsAttributes(
			document.getElementById("cs-unreads-above"),
			unreadsAbove,
			mentionsAbove
		);
		this.setUnreadsAttributes(
			document.getElementById("cs-unreads-below"),
			unreadsBelow,
			mentionsBelow
		);

		let childNode = scrollDiv.childNodes[0];
		let right = childNode.offsetWidth - scrollDiv.offsetWidth - scrollDiv.scrollLeft;
		let newStyle = ".tree-view li[cs-umi-badge='1']::after { right: " + right + "px; }";
		logger.debug("Adding style string; " + newStyle);
		this.addStyleString(newStyle, "umi");
	}

	// add a style to the document, reusing a style node that we attach to the DOM
	addStyleString(str, key) {
		let id = "codestream-style-tag-" + key;
		let node = document.getElementById(id) || document.createElement("style");
		node.id = id;
		node.innerHTML = str;
		document.body.appendChild(node);
	}

	setUnreadsAttributes(element, active, mentions) {
		if (active) element.classList.add("active");
		else element.classList.remove("active");
		if (mentions) element.classList.add("mention");
		else element.classList.remove("mention");
	}

	addUnreadsIndicatorDivs() {
		this.addUnreadsIndicatorDiv("above");
		this.addUnreadsIndicatorDiv("below");
	}

	addUnreadsIndicatorDiv(type) {
		let element = document.getElementById("cs-unreads-" + type);
		if (!element) {
			// assume there is only one of these
			let scrollDiv = document.getElementsByClassName("tool-panel tree-view")[0];
			let scrollParent = scrollDiv.parentNode;
			element = document.createElement("div");
			element.id = "cs-unreads-" + type;
			element.classList.add("cs-unreads");
			let indicator = type === "above" ? "&uarr;" : "&darr;";
			element.innerHTML = indicator + " Unread Messages " + indicator;
			element.onclick = function(event) {
				if (type === "below") scrollDiv.scrollTop += scrollDiv.offsetHeight;
				else scrollDiv.scrollTop -= scrollDiv.offsetHeight;
			};
			scrollParent.prepend(element);
		}
	}
}

const mapStateToProps = ({ repoAttributes, context, session, streams, users, umis }) => {
	return {
		users: users,
		streams: getStreamsForRepo(streams, context.currentRepoId) || {},
		currentUser: users[session.userId],
		workingDirectory: repoAttributes.workingDirectory,
		repoId: context.currentRepoId,
		umis: umis
	};
};

export default connect(mapStateToProps, actions)(withRepositories(SimpleUMIs));
