import { toMapBy } from "./utils";

const initialState = {
	byRepo: {
		//[repoId]: { byFile: {} }
	}
};

const addStream = (state, stream) => {
	const existingStreamsForRepo = state.byRepo[stream.repoId] || { byFile: {} };
	return {
		byRepo: {
			...state.byRepo,
			[stream.repoId]: {
				byFile: {
					...existingStreamsForRepo.byFile,
					[stream.file]: stream
				}
			}
		}
	};
};

export default (state = initialState, { type, payload }) => {
	switch (type) {
		case "ADD_STREAMS":
		case "BOOTSTRAP_STREAMS":
			return payload.reduce(addStream, state);
		case "STREAMS-UPDATE_FROM_PUBNUB":
		case "ADD_STREAM":
			return addStream(state, payload);
		default:
			return state;
	}
};

// Selectors
export const getStreamForRepoAndFile = (state, repoId, file) => {
	const filesForRepo = (state.byRepo[repoId] || {}).byFile;
	if (filesForRepo) return filesForRepo[file];
};

export const getStreamsForRepo = (state, repoId) => {
	return (state.byRepo[repoId] || {}).byFile;
};
