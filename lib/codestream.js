import os from "os";
import { CompositeDisposable } from "atom";
import Raven from "raven-js";
import Dexie from "dexie";
import CodestreamView, { CODESTREAM_VIEW_URI } from "./codestream-view";
import { bootstrapStore } from "./local-cache";
import git from "./git";
import createStore from "./createStore";
import {
	commitHashChanged,
	fetchRepoInfo,
	logout,
	noAccess,
	setRepoAttributes,
	resetContext,
	setContext,
	setCurrentFile,
	setCurrentCommit
} from "./actions/context";
import { setStreamUMITreatment } from "./actions/umi";
import { commitNewMarkerLocations, refreshMarkersAndLocations } from "./actions/marker-location";
import logger from "./util/Logger";
import { online, offline } from "./actions/connectivity";
import { open as openRepo } from "./git/GitRepo";
import { PRODUCTION_URL } from "./network-request";

Raven.config("https://46fd0a63e10340b585d895d333fec719@sentry.io/280733", {
	captureUnhandledRejections: true,
	tags: {
		process: process.type,
		platform: os.platform(),
		platformRelease: os.release(),
		atom: atom.getVersion(),
		codestreamUrl: atom.config.get("codestream.url") || "production"
	}
}).install();
window.addEventListener("unhandledrejection", function(event) {
	Raven.captureException(event.reason);
});

logger.addHandler((level, msg) => {
	console.log(`[${level}] ${msg}`);
});

let store;

const getCurrentCommit = async repo => {
	const data = await git(["rev-parse", "--verify", "HEAD"], {
		cwd: repo.getWorkingDirectory()
	});
	return data.trim();
};

const reloadPlugin = codestream => {
	store.dispatch({ type: "RESET" });
	bootstrapStore(store);
	codestream.view && codestream.view.update(store);

	codestream.deactivate();
	codestream.activate();
	codestream.consumeStatusBar(codestream.statusBar);
	codestream.setup();
};

module.exports = {
	subscriptions: null,
	view: null,
	statusBar: null,
	config: {
		showHeadshots: {
			description: "Display headshots in the stream",
			type: "boolean",
			default: true
		},
		showUnread: {
			description:
				"Note that you can override this setting on a per-file or per-directory basis by right-clicking the Tree View.",
			title: "Files with Unread Messages",
			type: "string",
			default: "bold",
			enum: [
				{ value: "badge", description: "Display a badge to the right of the file" },
				{ value: "bold", description: "Bold the filename" }
			]
		}
	},

	initialize(state) {
		this.subscriptions = new CompositeDisposable();
		store = createStore(state);
		window.CodeStreamStore = store;
		bootstrapStore(store);

		if (atom.project.getDirectories().length === 1)
			this.subscriptions.add(atom.packages.onDidActivateInitialPackages(() => this.setup()));

		// this isn't aded to this.subscriptions because it should always run
		atom.project.onDidChangePaths(paths => reloadPlugin(this));
	},

	activate(state) {
		this.subscriptions = this.subscriptions || new CompositeDisposable();
		this.subscriptions.add(
			atom.workspace.addOpener(uri => {
				if (uri === CODESTREAM_VIEW_URI) {
					this.view = new CodestreamView(store);
					return this.view;
				}
			}),
			atom.commands.add("atom-workspace", {
				"codestream:toggle": () => atom.workspace.toggle(CODESTREAM_VIEW_URI),
				"codestream:logout": () => store.dispatch(logout())
			}),
			atom.commands.add(".tree-view", {
				"codestream:mute": target => this.markStreamMute(target),
				"codestream:bold": target => this.markStreamBold(target),
				"codestream:badge": target => this.markStreamBadge(target)
			})
			// atom.commands.add(".codestream .compose.mentions-on", {
			// 	"codestream:at-mention-move-up": event => this.handleAtMentionKeyPress(event, "up"),
			// 	"codestream:at-mention-move-down": event => this.handleAtMentionKeyPress(event, "down"),
			// 	"codestream:at-mention-escape": event => this.handleAtMentionKeyPress(event, "escape")
			// })
		);
		// Dev mode goodies
		if (atom.inDevMode()) {
			this.subscriptions.add(
				atom.commands.add("atom-workspace", {
					"codestream:reset": async () => {
						atom.commands.dispatch(
							document.querySelector("atom-workspace"),
							"codestream:wipe-cache"
						);
						atom.commands.dispatch(document.querySelector("atom-workspace"), "codestream:logout");
						store.dispatch({ type: "RESET" });
						atom.reload();
					},
					"codestream:wipe-cache": () => indexedDB.deleteDatabase("CodeStream"),
					"codestream:point-to-dev": () => {
						sessionStorage.setItem("codestream.url", "https://tca3.codestream.us:9443");
						atom.commands.dispatch(document.querySelector("atom-workspace"), "codestream:logout");
					},
					"codestream:point-to-local": () => {
						sessionStorage.setItem("codestream.url", "https://localhost.codestream.us:12079");
						atom.commands.dispatch(document.querySelector("atom-workspace"), "codestream:logout");
					},
					"codestream:point-to-qa": () => {
						sessionStorage.setItem("codestream.url", "https://qa-api.codestream.us");
						atom.commands.dispatch(document.querySelector("atom-workspace"), "codestream:logout");
					},
					"codestream:point-to-production": () => {
						sessionStorage.setItem("codestream.url", PRODUCTION_URL);
						atom.commands.dispatch(document.querySelector("atom-workspace"), "codestream:logout");
					},
					"codestream:which-environment?": () => {
						const urlConfig = sessionStorage.getItem("codestream.url") || "production";
						atom.notifications.addInfo(`CodeStream is pointed to ${urlConfig}`, {
							dismissable: true
						});
					}
				})
			);
		}
	},

	deactivate() {
		this.subscriptions.dispose();
		if (this.statusBarTile) this.statusBarTile.destroy();
		store.dispatch(logout());
	},

	serialize() {
		const {
			session,
			onboarding,
			context,
			repoAttributes,
			messaging,
			markerLocationRecalculation
		} = store.getState();
		return {
			onboarding: { ...onboarding, errors: {} },
			context,
			session,
			repoAttributes,
			markerLocationRecalculation,
			messaging: {
				...messaging,
				failedSubscriptions: [],
				timedOut: false,
				historyRetrievalFailure: false
			}
		};
	},

	deserializeCodestreamView(data) {
		this.view = new CodestreamView(store);
		return this.view;
	},

	async setup() {
		const directories = atom.project.getDirectories();
		const repoPromises = directories.map(repo => atom.project.repositoryForDirectory(repo));
		const allRepos = await Promise.all(repoPromises);
		const repos = allRepos.filter(Boolean);

		if (repos.length > 0) {
			const repo = repos[0];
			getCurrentCommit(repo).then(commitHash => store.dispatch(setCurrentCommit(commitHash)));

			this.subscriptions.add(
				atom.workspace.observeActiveTextEditor(editor => {
					// Only dispatch the action if there is a current file that belongs to the git repo
					// that way if a user looks at settings or a non-repo file,
					// the stream for the last active repo file is still visible
					if (editor) {
						const directoryForFile = directories.find(directory =>
							directory.contains(editor.getPath())
						);
						if (directoryForFile) {
							atom.project.repositoryForDirectory(directoryForFile).then(repo => {
								let path = repo.relativize(editor.getPath());
								// note we always maintain the current file with a forward slash separator
								// even if we are on a Windows machine using a backslash
								path = path.replace("\\", "/");
								store.dispatch(setCurrentFile(path));
							});
						}
					} else {
						// in the case of no editor, for example the settings page,
						// we display the "intro" welcome to codestream text, which
						// is handled by lib/components/Stream.js when there is no file
						store.dispatch(setCurrentFile(null));
					}
				}),

				// Subscribe to git status changes in order to be aware of current commit hash.
				repo.onDidChangeStatuses(async event => {
					logger.trace("repo.onDidChangeStatuses");
					const { context } = store.getState();
					const lastCommitHash = context.currentCommit;

					const gitRepo = await openRepo(repo.getWorkingDirectory());
					const currentCommit = await gitRepo.getCurrentCommit();
					const currentCommitHash = currentCommit.hash;

					if (lastCommitHash !== currentCommitHash) {
						store.dispatch(commitHashChanged(currentCommitHash));
						store.dispatch(refreshMarkersAndLocations());
					}
				})
			);

			window.addEventListener("online", e => store.dispatch(online()), false);
			window.addEventListener("offline", e => store.dispatch(offline()), false);

			const workDir = repo.repo.workingDirectory;
			const repoUrl = repo.getOriginURL();
			const noParentCommits = await git(["rev-list", "--max-parents=0", "--reverse", "HEAD"], {
				cwd: repo.getWorkingDirectory()
			});
			const repoAttributes = {
				workingDirectory: workDir,
				url: repoUrl,
				firstCommitHash: noParentCommits.split("\n")[0]
			};
			store.dispatch(setRepoAttributes(repoAttributes));
			store.dispatch(fetchRepoInfo(repoAttributes));
		}
	},

	markStreamMute(event) {
		this.markStreamTreatment(event, "mute");
	},
	markStreamBold(event) {
		this.markStreamTreatment(event, "bold");
	},
	markStreamBadge(event) {
		this.markStreamTreatment(event, "badge");
	},
	// set a preference for the treatment of a given stream
	// to either mute, bold, or badge
	markStreamTreatment(event, setting) {
		let li = event.target.closest("li");

		// TODO if there isn't a click event, use the active li from tree-veiw
		if (!li) return;

		let type = li.classList.contains("directory") ? "directory" : "file";
		let path = li.getElementsByTagName("span")[0].getAttribute("data-path");
		// setStreamUMITreatment(path, setting);
		store.dispatch(setStreamUMITreatment(path, setting));
	},

	consumeStatusBar(statusBar) {
		this.statusBar = statusBar;
		const div = document.createElement("div");
		div.classList.add("inline-block");
		const icon = document.createElement("span");
		icon.classList.add("icon", "icon-comment-discussion");
		icon.onclick = event =>
			atom.commands.dispatch(document.querySelector("atom-workspace"), "codestream:toggle");
		atom.tooltips.add(div, { title: "Toggle CodeStream" });
		div.appendChild(icon);
		this.statusBarTile = statusBar.addRightTile({ item: div, priority: 400 });
	}
};
