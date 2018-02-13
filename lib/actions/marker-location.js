import { upsert } from "../local-cache";
import { normalize } from "./utils";
import { saveMarkers } from "./marker";
import { getStreamsForRepo } from "../reducers/streams";
import MarkerLocationFinder from "../git/MarkerLocationFinder";
import { open as openRepo } from "../git/GitRepo";
import { areEqualLocations } from "../util/Marker";
import rootLogger from "../util/Logger";

const logger = rootLogger.forClass("actions/marker-location");

export const saveMarkerLocations = (attributes, isHistory = false) => (
	dispatch,
	getState,
	{ db }
) => {
	logger.trace(".saveMarkerLocations");
	const { streamId, teamId, commitHash, locations } = attributes;

	if (!(streamId && teamId && commitHash)) return;

	const primaryKey = Object.freeze({ streamId, teamId, commitHash });
	return db
		.transaction("rw", db.markerLocations, async () => {
			const record = await db.markerLocations.get(primaryKey);
			if (record) {
				await db.markerLocations.update(primaryKey, {
					...record,
					locations: { ...record.locations, ...locations },
					dirty: {}
				});
			} else {
				await db.markerLocations.add(attributes);
			}
			return db.markerLocations.get(primaryKey);
		})
		.then(record => dispatch({ type: "ADD_MARKER_LOCATIONS", payload: record, isHistory }));
};

export const markerDirtied = ({ markerId, streamId }, location) => (dispatch, getState, { db }) => {
	logger.trace(".markerDirtied");
	const { context } = getState();

	const primaryKey = Object.freeze({
		streamId,
		teamId: context.currentTeamId,
		commitHash: context.currentCommit
	});

	return db
		.transaction("rw", db.markerLocations, async () => {
			const record = await db.markerLocations.get(primaryKey);
			await db.markerLocations.update(primaryKey, {
				...record,
				dirty: { ...record.dirty, [markerId]: location }
			});
			return db.markerLocations.get(primaryKey);
		})
		.then(record =>
			dispatch({
				type: "MARKER_DIRTIED",
				payload: record
			})
		);
};

export const commitNewMarkerLocations = (oldCommitHash, newCommitHash) => (
	dispatch,
	getState,
	{ db, http }
) => {
	logger.trace(".commitNewMarkerLocations");
	const { context, session } = getState();
	return db.transaction("rw", db.streams, db.markerLocations, () => {
		db.streams.where({ repoId: context.currentRepoId }).each(async stream => {
			const record = await db.markerLocations.get({
				streamId: stream.id,
				teamId: stream.teamId,
				commitHash: oldCommitHash
			});

			if (record) {
				const newRecord = {
					...record,
					commitHash: newCommitHash,
					locations: { ...record.locations, ...record.dirty },
					dirty: undefined
				};
				await http.put("/marker-locations", newRecord, session.accessToken);

				return upsert(db, "markerLocations", newRecord);
			}
		});
	});
};

export const calculateLocations = ({ teamId, streamId }) => async (
	dispatch,
	getState,
	{ http }
) => {
	logger.trace(".calculateLocations");
	const { context, repoAttributes, session } = getState();
	const gitRepo = await openRepo(repoAttributes.workingDirectory);
	// TODO check if context.currentCommit is already updated at this point, so
	// we don't need to ask the repo
	const currentCommit = await gitRepo.getCurrentCommit();
	const commitHash = currentCommit.hash;
	const { markers, markerLocations } = await http.get(
		`/markers?teamId=${teamId}&streamId=${streamId}&commitHash=${commitHash}`,
		session.accessToken
	);
	logger.debug("Found", markers.length, "markers");

	const locations = markerLocations.locations || {};
	const markerLocationFinder = new MarkerLocationFinder(gitRepo, session, http, context, streamId);

	const missingMarkers = markers.filter(marker => !locations[marker._id]);
	if (missingMarkers.length) {
		logger.debug("Recalculating locations for", missingMarkers.length, "missing markers");
		const calculatedLocations = await markerLocationFinder.findLocationsForCurrentCommit(
			missingMarkers
		);
		Object.assign(locations, calculatedLocations);
	}

	await dispatch(saveMarkers(normalize(markers)));
	await dispatch(saveMarkerLocations({ teamId, streamId, commitHash, locations }));

	const dirtyLocations = await markerLocationFinder.findLocationsForPendingChanges(locations);
	for (const markerId of Object.keys(dirtyLocations)) {
		const dirtyLocation = dirtyLocations[markerId];
		const lastCommitLocation = locations[markerId];
		if (!areEqualLocations(dirtyLocation, lastCommitLocation)) {
			await dispatch(markerDirtied({ markerId, streamId }, dirtyLocation));
		}
	}

	return dirtyLocations;
};

export const fetchMarkersAndLocations = ({ teamId, streamId }) => async (dispatch, getState) => {
	logger.trace(".fetchMarkersAndLocations");
	const { context, session, repoAttributes } = getState();
	return await dispatch(calculateLocations({ teamId, streamId }));
};

export const refreshMarkersAndLocations = () => (dispatch, getState) => {
	logger.trace(".refreshMarkersAndLocations");
	const { context, streams } = getState();
	return Promise.all(
		Object.values(getStreamsForRepo(streams, context.currentRepoId) || {}).map(stream => {
			if (stream.teamId === context.currentTeamId)
				dispatch(calculateLocations({ streamId: stream.id, teamId: context.currentTeamId }));
		})
	);
};
