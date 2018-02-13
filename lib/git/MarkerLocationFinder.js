import Raven from "raven-js";
import rootLogger from "../util/Logger";

export default class MarkerLocationFinder {
	constructor(repo, session, http, context, streamId) {
		this._logger = rootLogger.forClass("MarkerLocationFinder");
		this._repo = repo;
		this._session = session;
		this._http = http;
		this._context = context;
		this._streamId = streamId;
	}

	async findLocationsForCurrentCommit(markers) {
		const me = this;
		const myLogger = me._logger;
		myLogger.trace(".findLocationsForCurrentCommit <=", markers);

		const filePath = me._context.currentFile;
		const repo = me._repo;
		const currentCommit = await repo.getCurrentCommit();
		const currentCommitHash = currentCommit.hash;
		const commitHistory = await repo.getCommitHistoryForFile(filePath, 10);
		await this._addMarkersFirstCommitToCommitHistory(commitHistory, markers);

		const currentLocations = {};
		const missingMarkerIds = {};
		for (const marker of markers) {
			missingMarkerIds[marker._id] = 1;
		}

		for (const commit of commitHistory) {
			if (Object.keys(missingMarkerIds).length === 0) {
				break;
			}

			const commitHash = commit.hash;
			myLogger.debug("Getting marker locations for commit", commitHash);
			const locations = await this._getMarkerLocations(commitHash);
			const lastKnownLocations = {};

			for (const markerId of Object.keys(locations)) {
				if (missingMarkerIds[markerId]) {
					lastKnownLocations[markerId] = locations[markerId];
					delete missingMarkerIds[markerId];
				}
			}

			const lastKnownLocationsLength = Object.keys(lastKnownLocations).length;
			myLogger.debug(
				"Commit",
				commitHash,
				"has location information for",
				lastKnownLocationsLength,
				"markers"
			);
			Object.assign(currentLocations, lastKnownLocations);

			if (lastKnownLocationsLength && !commit.equals(currentCommit)) {
				const deltas = await repo.getDeltasBetweenCommits(commit, currentCommit, filePath);
				const edits = this._getEdits(deltas);
				if (edits.length) {
					myLogger.debug(
						"File has changed from",
						commit.hash,
						"to",
						currentCommit.hash,
						"- recalculating locations"
					);
					const calculatedLocations = await this._calculateLocations(
						lastKnownLocations,
						edits,
						commit.hash,
						currentCommitHash
					);
					Object.assign(currentLocations, calculatedLocations);
				} else {
					myLogger.debug("No changes in current file from", commit.hash, "to", currentCommitHash);
				}
			}
		}

		return currentLocations;
	}

	async findLocationsForPendingChanges(currentCommitLocations) {
		const me = this;
		const myLogger = me._logger;
		myLogger.trace(".findLocationsForPendingChanges <=", currentCommitLocations);

		const filePath = me._context.currentFile;
		const repo = me._repo;
		const currentCommit = await repo.getCurrentCommit();
		const deltas = await repo.getDeltasForPendingChanges(filePath);
		const edits = this._getEdits(deltas);

		if (edits.length) {
			myLogger.debug("File has pending changes - recalculating locations");
			const calculatedLocations = await this._calculateLocations(
				currentCommitLocations,
				edits,
				currentCommit.hash
			);
			return calculatedLocations;
		} else {
			return currentCommitLocations;
		}
	}

	async _addMarkersFirstCommitToCommitHistory(commitHistory, markers) {
		const repo = this._repo;
		const commitsInHistory = {};

		for (const commit of commitHistory) {
			commitsInHistory[commit.hash] = 1;
		}

		for (const marker of markers) {
			const commitHashWhenCreated = marker.commitHashWhenCreated;
			if (!commitsInHistory[commitHashWhenCreated]) {
				const commitWhenCreated = await repo.getCommit(commitHashWhenCreated);
				if (commitWhenCreated) {
					commitHistory.push(commitWhenCreated);
				}
			}
		}
	}

	async _calculateLocations(locations, edits, originalCommitHash, newCommitHash) {
		try {
			const result = await this._http.put(
				"/calculate-locations?",
				{
					teamId: this._context.currentTeamId,
					streamId: this._streamId,
					originalCommitHash: originalCommitHash,
					newCommitHash: newCommitHash,
					edits: edits,
					locations: locations
				},
				this._session.accessToken
			);
			return result.markerLocations.locations;
		} catch (error) {
			Raven.captureException(error, {
				logger: "MarkerLocationFinder._calculateLocations"
			});
			return {};
		}
	}

	_getEdits(deltas) {
		const me = this;
		const myLogger = me._logger;
		const currentFile = me._context.currentFile;

		// the list of deltas should be already filtered for the current file
		// but we still filter it here as a safeguard in case something
		// goes wrong with our Git filtering
		let edits = deltas.filter(delta => delta.newFile === currentFile).map(delta => delta.edits);
		edits = [].concat.apply([], edits);

		myLogger.debug("Found", edits.length, "edits for file", currentFile);
		return edits;
	}

	async _getMarkerLocations(commitHash) {
		const me = this;
		const myLogger = me._logger;
		myLogger.trace("._getMarkerLocations <=", commitHash);

		const { markerLocations } = await this._http.get(
			`/marker-locations?` +
				`teamId=${this._context.currentTeamId}&` +
				`streamId=${this._streamId}&` +
				`commitHash=${commitHash}`,
			this._session.accessToken
		);
		const locations = markerLocations.locations || {};

		return locations;
	}
}
