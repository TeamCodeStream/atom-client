const initialState = {
	currentFile: "",
	currentTeamId: "",
	currentRepoId: "",
	currentCommit: "",
	noAccess: false,
	usernamesInTeam: []
};

export default (state = initialState, { type, payload }) => {
	if (type === "RESET_CONTEXT") return initialState;
	if (type === "SET_CONTEXT") return { ...state, ...payload };
	if (type === "SET_CURRENT_FILE") return { ...state, currentFile: payload };
	if (type === "SET_CURRENT_TEAM") return { ...state, currentTeamId: payload };
	if (type === "SET_CURRENT_REPO") return { ...state, currentRepoId: payload };
	if (type === "SET_CURRENT_COMMIT") return { ...state, currentCommit: payload };
	if (type === "COMMIT_HASH_CHANGED") return { ...state, currentCommit: payload };
	if (type === "NO_ACCESS") return { ...state, noAccess: { noAccess: true } };
	if (type === "NO_ACCESS-MISSING_REMOTE_URL") return { ...state, noAccess: { noUrl: true } };
	return state;
};
