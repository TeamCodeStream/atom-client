import { upsert } from "../local-cache";

export const saveRepo = attributes => (dispatch, getState, { db }) => {
	return upsert(db, "repos", attributes).then(repo =>
		dispatch({ type: "ADD_REPO", payload: repo })
	);
};

export const saveRepos = attributes => (dispatch, getState, { db }) => {
	return upsert(db, "repos", attributes).then(repos =>
		dispatch({ type: "ADD_REPOS", payload: repos })
	);
};
