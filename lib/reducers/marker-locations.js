import { toMapBy } from "./utils";

const initialState = { byStream: {} };

const addLocation = (state, payload) => {
	const existingCommitsForStream = state.byStream[payload.streamId] || {};
	const existingLocationsForCommit = existingCommitsForStream[payload.commitHash] || {};
	return {
		byStream: {
			...state.byStream,
			[payload.streamId]: {
				...existingCommitsForStream,
				[payload.commitHash]: {
					...existingLocationsForCommit,
					...payload.locations,
					...payload.dirty
				}
			}
		}
	};
};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "BOOTSTRAP_MARKER_LOCATIONS": {
			return payload.reduce(
				(nextState, location) => addLocation(nextState, location),
				initialState
			);
		}
		case "MARKERLOCATIONS-UPDATE_FROM_PUBNUB":
		case "MARKER_DIRTIED":
		case "ADD_MARKER_LOCATIONS":
			return addLocation(state, payload);

		default:
			return state;
	}
};
