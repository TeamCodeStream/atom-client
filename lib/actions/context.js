export const resetContext = data => ({ type: "RESET_CONTEXT" });
import { offline } from "./connectivity";
export const setContext = data => ({
	type: "SET_CONTEXT",
	payload: data
});
export const setRepoAttributes = data => ({
	type: "SET_REPO_ATTRIBUTES",
	payload: data
});
export const setCurrentTeam = id => ({
	type: "SET_CURRENT_TEAM",
	payload: id
});
export const setCurrentRepo = id => ({
	type: "SET_CURRENT_REPO",
	payload: id
});
export const setCurrentFile = file => ({
	type: "SET_CURRENT_FILE",
	payload: file
});
export const setCurrentCommit = hash => ({
	type: "SET_CURRENT_COMMIT",
	payload: hash
});
export const commitHashChanged = hash => ({
	type: "COMMIT_HASH_CHANGED",
	payload: hash
});
export const logout = () => dispatch => {
	dispatch({ type: "CLEAR_SESSION" });
	dispatch({ type: "RESET_ONBOARDING" });
	dispatch({ type: "RESET_UMI" });
};
export const noAccess = () => ({ type: "NO_ACCESS" });
export const noRemoteUrl = () => ({ type: "NO_ACCESS-MISSING_REMOTE_URL" });

export const fetchRepoInfo = ({ url, firstCommitHash }) => async (dispatch, getState, { http }) => {
	if (!url) return dispatch(noRemoteUrl());
	try {
		const { repo, usernames } = await http.get(
			`/no-auth/find-repo?url=${encodeURIComponent(url)}&firstCommitHash=${firstCommitHash}`
		);

		dispatch(setContext({ noAccess: false })); // reset access property in store

		if (repo) {
			return dispatch(
				setContext({
					usernamesInTeam: usernames,
					currentRepoId: repo._id,
					currentTeamId: repo.teamId
				})
			);
		} else {
			return dispatch(setContext({ usernamesInTeam: [], currentRepoId: "", currentTeamId: "" }));
		}
	} catch (error) {
		if (http.isApiRequestError(error)) {
			if (error.data.code === "REPO-1000") dispatch(noAccess());
			if (error.data.code === "UNKNOWN") dispatch(noAccess());
		} else if (http.isApiUnreachableError(error)) {
			/* swallow this for now? */
		} else console.error("encountered unexpected error while initializing CodeStream", error);
	}
};
