export const offline = () => ({ type: "OFFLINE" });
export const online = () => ({ type: "ONLINE" });

export const checkServerStatus = () => async (dispatch, getState, { http }) => {
	try {
		await http.get("/no-auth/status");
		return dispatch(online());
	} catch (error) {
		return false;
	}
};
